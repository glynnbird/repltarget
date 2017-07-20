const incrementRev = require('./lib/rev.js').incrementRev;
const path = require('path');
var cache = {
};

const init = function(opts, callback) {
  console.log('Using the "ram" checkpoint plugin');
  callback(null, null);
};

const read = function(dbname, id, callback) {
  const key = path.join(dbname, id);
  callback(null, cache[key])
};

const write = function(dbname, id, doc, callback) {
  const key = path.join(dbname, id);
  doc._rev = incrementRev(doc._rev);
  cache[key] = doc;
  callback(null, doc);
};

module.exports = {
  write: write,
  read: read,
  init: init
};