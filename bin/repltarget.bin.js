#!/usr/bin/env node

const repltarget = require('../index.js');

repltarget(3000).on('doc', function(d) {
  console.log(d);
}).on('startup', function(config) {
  console.log('repltarget started on port ' + config.port);
});