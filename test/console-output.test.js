// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: procfiled
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('chai').assert;
var util = require('util');
var Console = require('../lib/console');

var logs = { log: [], warn: [], error: [] };
var logger = {
  log: makeLogger(logs.log),
  warn: makeLogger(logs.warn),
  error: makeLogger(logs.error)
};

var c = new Console(logger);
resetLogs();

assert.equal(logs.log.length, 0);
assert.equal(logs.warn.length, 0);
assert.equal(logs.error.length, 0);

resetLogs();
c.Alert('ze message');
assertLogged('log', /\[OKAY\]/);
assertLogged('log', /ze message/);

resetLogs();
c.Done('ze message');
assertLogged('log', /\[DONE\]/);
assertLogged('log', /ze message/);

resetLogs();
c.Warn('ze warning');
assertLogged('warn', /\[WARN\]/);
assertLogged('warn', /ze warning/);

resetLogs();
c.Error('such an error');
assertLogged('error', /\[FAIL\]/);
assertLogged('error', /such an error/);

resetLogs();
c.raw = true;
c.log('a key', null, 'a log message');
assertLogged('log', /^a log message$/);
c.raw = false;

assert.equal(c.trim('a very long string this is!', 5).length, 6);

function makeLogger(collector) {
  return function() {
    collector.push(util.format.apply(util, arguments));
  };
}

function resetLogs() {
  logs.log.splice(0, logs.log.length);
  logs.warn.splice(0, logs.warn.length);
  logs.error.splice(0, logs.error.length);
}

function assertLogged(logName, pattern) {
  var actual = logs[logName][logs[logName].length - 1];

  Object.keys(logs).forEach(function (log) {
    assert.equal(logs[log].length, logName === log ? 1 : 0);
  });

  assert.match(actual, pattern);
}
