// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: procfiled
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var colors = require("./colors");
var ppath = require("path");
var mu = require("mustache");
var fs = require("fs");

var display = require("./console").Console;

// Procfile to System Service Export //

function render(filename, conf, callback) {
  fs.readFile(filename, { encoding: "utf8" }, function (err, template) {
    if (err) {
      throw err;
    }
    callback(mu.render(template, conf));
  });
}

function templatePath(conf, type, file) {
  if (conf.template) {
    return ppath.resolve(conf.template, file);
  } else {
    return ppath.resolve(__dirname, type, file);
  }
}

function writeout(path) {
  return function (data) {
    if (fs.existsSync(path)) {
      display.Warn(colors.bright_yellow("Replacing: %s"), path);
    }

    fs.writeFileSync(path, data);
    display.Alert("Wrote  :", ppath.normalize(path));
  };
}

function upstart(conf, outdir) {
  var path = outdir + "/" + conf.application + ".conf";
  render(templatePath(conf, "upstart", "procfiled.conf"), conf, writeout(path));
}

function upstart_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
  render(
    templatePath(conf, "upstart", "procfiled-APP.conf"),
    conf,
    writeout(path)
  );
}

function upstart_app_n(conf, outdir) {
  var path =
    outdir +
    "/" +
    conf.application +
    "-" +
    conf.process +
    "-" +
    conf.number +
    ".conf";
  render(
    templatePath(conf, "upstart", "procfiled-APP-N.conf"),
    conf,
    writeout(path)
  );
}

function upstart_single(conf, outdir) {
  var path = outdir + "/" + conf.application + ".conf";
  render(
    templatePath(conf, "upstart-single", "procfiled.conf"),
    conf,
    writeout(path)
  );
  display.Warn(
    "upstart-single jobs attempt to raise limits and will fail " +
      "to  start if the limits cannot be raised to the desired " +
      "levels.  Some manual editing may be required."
  );
}

function upstart_single_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".conf";
  render(
    templatePath(conf, "upstart-single", "procfiled-APP.conf"),
    conf,
    writeout(path)
  );
}

function systemd(conf, outdir) {
  var path = outdir + "/" + conf.application + ".target";
  render(
    templatePath(conf, "systemd", "procfiled.target"),
    conf,
    writeout(path)
  );
}

function systemd_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".target";
  render(
    templatePath(conf, "systemd", "procfiled-APP.target"),
    conf,
    writeout(path)
  );
}

function systemd_app_n(conf, outdir) {
  var path =
    outdir +
    "/" +
    conf.application +
    "-" +
    conf.process +
    "-" +
    conf.number +
    ".service";
  render(
    templatePath(conf, "systemd", "procfiled-APP-N.service"),
    conf,
    writeout(path)
  );
}

function supervisord(conf, outdir) {
  var path = outdir + "/" + conf.application + ".conf";
  var programs = [];

  // Supervisord requires comma separated lists and they are
  // quite ugly to handle in Moustache.
  for (var i = 0; i < conf.processes.length; i++) {
    var process = conf.processes[i].process;
    var n = conf.processes[i].n;

    for (var j = 1; j <= n; j++) {
      programs.push(conf.application + "-" + process + "-" + j);
    }
  }

  conf.programs = programs.join(",");

  render(
    templatePath(conf, "supervisord", "procfiled.conf"),
    conf,
    writeout(path)
  );
}

function supervisord_app_n(conf, outdir) {
  var path =
    outdir +
    "/" +
    conf.application +
    "-" +
    conf.process +
    "-" +
    conf.number +
    ".conf";
  var envs = [];

  // We have to do the same thing for env variables.
  for (var i in conf.envs) {
    var key = conf.envs[i].key;
    var value = conf.envs[i].value;

    // Some variables like 'web.1' breaks supervisor confg so we
    // escape quotes and wrap values in quotes.
    if (typeof value === "string") {
      value = value.replace(/"/, '\\"');
    }

    envs.push(key + "=" + '"' + value + '"');
  }

  conf.envs = envs.join(",");

  render(
    templatePath(conf, "supervisord", "procfiled-APP-N.conf"),
    conf,
    writeout(path)
  );
}

function smf_app(conf, outdir) {
  var path = outdir + "/" + conf.application + "-" + conf.process + ".xml";
  render(templatePath(conf, "smf", "procfiled-APP.xml"), conf, writeout(path));
}

var export_formats = {
  upstart: {
    procfiled: upstart,
    procfiled_app: upstart_app,
    procfiled_app_n: upstart_app_n,
  },
  "upstart-single": {
    procfiled: upstart_single,
    procfiled_app: upstart_single_app,
    procfiled_app_n: function noop() {},
  },
  systemd: {
    procfiled: systemd,
    procfiled_app: systemd_app,
    procfiled_app_n: systemd_app_n,
  },
  supervisord: {
    procfiled: supervisord,
    procfiled_app: function noop() {},
    procfiled_app_n: supervisord_app_n,
  },
  smf: {
    procfiled: function noop() {},
    procfiled_app: smf_app,
    procfiled_app_n: function noop() {},
  },
};

module.exports = export_formats;
