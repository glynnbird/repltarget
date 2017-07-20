const mkdirp = require('mkdirp');
const os = require('os');
const fs = require('fs');
const path = require('path');
const incrementRev = require('./lib/rev.js').incrementRev;
var datadir = os.tmpdir();

const init = function(opts, callback) {
  console.log('Using the "file" checkpoint plugin');
  if (opts.datadir) {
    datadir = opts.datadir;
  }
  console.log('  datadir =', datadir);
  callback(null, null);
};

const read = function(dbname, id, callback) {
  const filename = path.join(datadir, dbname, id + '.json');
  fs.readFile(filename, 'utf8', function(err, data) {
    if (err) return callback('file not found', null);
    const obj = JSON.parse(data);
    callback(null, obj);
  });
};

const write = function(dbname, id, doc, callback) {
  const dir = path.join(datadir, dbname);
  doc._rev = incrementRev(doc._rev);
  mkdirp(dir, function(err, data) {
    if (err) return callback('cannot create directory', null);
    const filename = path.join(dir, id + '.json');
    fs.writeFile(filename, JSON.stringify(doc), { encoding: 'utf8'}, function(err, data) {
      if (err) return callback('cannot write file', null);
      callback(null, doc);
    });
  });
};

module.exports = {
  write: write,
  read: read,
  init: init
};