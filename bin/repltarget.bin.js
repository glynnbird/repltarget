#!/usr/bin/env node

const repltarget = require('../index.js');

repltarget().on('doc', function(d) {
  console.log(d);
}).on('startup', function(config) {
  console.log('repltarget started on port ' + config.port);
});