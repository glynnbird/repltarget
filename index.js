module.exports = function(port, username, password) {

  // express app
  const app = require('express')();

  // debug output
  const debug = require('debug')('repltarget');

  // event emitter
  const EventEmitter = new require('events');
  class ReplEmitter extends EventEmitter {}
  const ee = new ReplEmitter();

  // parse document bodies
  app.use(require('body-parser').json({limit: '64mb'}))

  // logging middleware
  const logger = function() {
    return function (req, res, next) {
      var numdocs = '';
      if (req.body && req.body.docs) {
        numdocs = req.body.docs.length;
      }
      debug(req.method, req.path, numdocs);
      next();
    };
  };
  app.use(logger());

  // confirm that the database exists 
  app.get('/:dbname', function (req, res) {
    const obj = {
      committed_update_seq: 0,
      compact_running: false,
      data_size: 0,
      db_name: req.params.dbname,
      disk_format_version: 6,
      disk_size: 0,
      doc_count: 0,
      doc_del_count: 0,
      instance_start_time: '0',
      purge_seq: 0,
      update_seq: 0
    };
    res.send(obj);
  });

  // tell CouchDB that you have no checkpoint documents
  app.get('/:dbname/_local/:id', function(req, res) {
    res.status(404).send({ error: 'not_found', reason: 'missing'});
  });

  // gladly accept checkpoint documents, then quietly discard them
  app.put('/:dbname/_local/:id', function(req, res) {
    res.send({ ok: true, id: '_local/' + req.params.id, rev: '0-1' });
  });

  // if asked for "revs diff" analysis, reply that you need all the docs
  app.post('/:dbname/_revs_diff', function(req, res) {
    // for each document asked about
    for(var i in req.body) {
      // reply that you are missing that revision
      var arr = req.body[i];
      req.body[i] = { missing: arr };
    }
    res.send(req.body);
  });

  // accept incoming bulk document writes
  app.post('/:dbname/_bulk_docs', function(req, res) {
    var retval = [];
    for (var i in req.body.docs) {
      retval.push({ ok: true, id: req.body.docs[i]._id, rev: req.body.docs[i]._rev });
      delete req.body.docs[i]._revisions;
      ee.emit('doc', req.body.docs[i]);
    }
    ee.emit('batch', req.body.docs);
    res.status(201).send(retval);
  });

  // and single document writes
  app.put('/:dbname/:id', function(req, res) {
    delete req.body._revisions;
    ee.emit('doc', req.body);
    ee.emit('batch', [req.body]);
    res.status(201).send({ok: true, id: req.body._id, rev: req.body._rev });
  });

  // reply back when asked to flush to disk
  app.post('/:dbname/_ensure_full_commit', function(req, res) {;
    res.status(201).send({ok: true, instance_start_time: '0'});
  });

  // listen on port 3000
  app.listen(port, function () {
    debug('repltarget running on port ' + port)
    ee.emit('startup', { port: port });
  });

  return ee;
};
