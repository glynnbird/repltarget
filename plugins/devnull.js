const incrementRev = require('./lib/rev.js').incrementRev;

const init = function(opts, callback) {
  console.log('Using the "devnull" checkpoint plugin');
  callback(null, null);
};

const read = function(dbname, id, callback) {
  callback(null, null);
};

const write = function(dbname, id, doc, callback) {
  doc._rev = incrementRev(doc._rev);
  callback(null, doc);
};

module.exports = {
  write: write,
  read: read,
  init: init
};