# Procfiled [![Build Status](https://github.com/scaffoldly/procfiled/actions/workflows/ci.yml/badge.svg)](https://github.com/scaffoldly/procfiled/actions)

Procfiled is a Node.js process manager for Procfile-based applications, inspired by the popular [Foreman](http://ddollar.github.com/foreman/) tool and forked from [node-foreman](https://github.com/strongloop/node-foreman).

> Procfiled is a manager for Procfile-based applications.
> Its aim is to abstract away the details of the Procfile
> format, and allow you to either run your application
> directly or export it to some other process management format.

## Install

Install the command line tool

    npm install -g procfiled

Get usage

    procfiled --help

## Features

- Each worker has an additional automatic environment variable,
  `PROCFILED_WORKER_NAME`, that contains the process name and worker number.
  - example: `web.1`, `worker.1`

### How to Contribute

I encourage anyone and everyone to help.
If you have a specific change in mind, open an issue; we can talk about it there.

If you would like to make a code change, go ahead.
Fork the repository, open a pull request.
Do this early, and talk about the change you want to make.
Maybe we can work together on it.

Refactor Refactor Refactor!
You are free to add features, or just help clean things up.

## Usage

Procfiled can be run with as little as `procfiled start`, as long as `npm start` has been defined.
For more complicated applications you will want to define a `Procfile` for your various server
processes and an `.env` file to pre-load environmental variables.

Your module directory should end up looking like the following:

    .
    ├── Procfile
    ├── .env
    ├── package.json
    └── your-app-files...

Once your `Procfile` is defined, run your application with `procfiled start`:

    $ procfiled start
    18:51:12: web.1     |  Web Server started listening on 0.0.0.0:5000
    18:51:12: worker.1  |  Worker started

Procfiled _always_ starts in the foreground and expects your applications
to do the same. If your processes exit, Procfiled will assume an error
has occurred and shut your application down.

Instead of daemonizing, you should use `procfiled export` to ready your application
for production.

For more information try any of the following:

    $ procfiled --help
    $ procfiled start --help
    $ procfiled run --help
    $ procfiled export --help

### Procfile

The `Procfile` format is a simple `key : command` format:

    web: node web_server.js
    api: node api_server.js
    log: node log_server.js

Each line should contain a separate process.

### Environmental Variables

Create a `.env` file to pre-load environmental variables with the format:

    MYSQL_NAME=superman
    MYSQL_PASS=cryptonite

The equivalent `.env` file may alternatively be a valid JSON document:

    {
        "mysql":{
            "name": "superman",
            "pass": "cryptonite"
        }
    }

The above JSON document will be flattened into env variables by
concatenating the nested values with an underscore.
Environmental variables are passed in fully capitalized.

    {
        "mysql":{
            "name": "superman",     # => MYSQL_NAME=superman
            "pass": "cryptonite"    # => MYSQL_PASS=cryptonite
        }
    }

There is no need to specify which type of file you wish to use.

#### The PATH environment variable

The `PATH` variable is given special treatment and is always read
from the environment that the `procfiled` command has been executed from,
rather than your `.env` file. To set a different `PATH` execute
`procfiled` with the `PATH` variable set appropriately.

```bash
PATH=/opt/foo:/opt/bar:$PATH procfiled export
```

#### Best Practices

Generally you should not check your `.env` file into version control.
The `.env` file contain _only_ parameters that depend on where the application
gets deployed. It should not contain anything related to _how_ the application
is deployed.

For example, good candidates for the `.env` file are MySQL connection information,
port bindings, and other passwords.

### The Run Command

Tasks or commands that require the environment variables from the `.env` file
can be initiated by using `procfiled run <command>`.

### Advanced Usage

Procfiled lets you start multiple jobs of the same type:

    $ procfiled start web=5

    18:51:12: web.1     |  Web Server started listening on 0.0.0.0:5000
    18:51:12: web.2     |  Web Server started listening on 0.0.0.0:5001
    18:51:12: web.3     |  Web Server started listening on 0.0.0.0:5002
    18:51:12: web.4     |  Web Server started listening on 0.0.0.0:5003
    18:51:12: web.5     |  Web Server started listening on 0.0.0.0:5004

Each job will be started as its own process, receiving a different `PORT`
environmental variable.
The port number for processes of the same type will be offset by 1.
The port number for processes of different types will be offset by 100.

    $ procfiled start web=2,api=2

    18:51:12: web.1     |  Web Server started listening on 0.0.0.0:5000
    18:51:12: web.2     |  Web Server started listening on 0.0.0.0:5001
    18:51:12: api.1     |  Api Server started listening on 0.0.0.0:5100
    18:51:12: api.2     |  Api Server started listening on 0.0.0.0:5101

## Export to Production

Procfiled is designed to be in a development environment,
however it can export an Upstart job for use in production.
The Upstart file has _no_ dependency on Procfiled.

    $ procfiled export
    Loaded ENV .env File as JSON Format
    Wrote  :  ./procfiled-web-1.conf
    Wrote  :  ./procfiled-web.conf
    Wrote  :  ./procfiled-api-1.conf
    Wrote  :  ./procfiled-api.conf
    Wrote  :  ./procfiled-log-1.conf
    Wrote  :  ./procfiled-log.conf
    Wrote  :  ./procfiled.conf

You can inspect your upstart files before placing them in the right
directory, or have procfiled do it for you:

    $ sudo procfiled export -o /etc/init
    Loaded ENV .env File as JSON Format
    Wrote  :  /etc/init/procfiled-api-1.conf
    Wrote  :  /etc/init/procfiled-web.conf
    Wrote  :  /etc/init/procfiled-api.conf
    Wrote  :  /etc/init/procfiled-log.conf
    Wrote  :  /etc/init/procfiled-log-1.conf
    Wrote  :  /etc/init/procfiled-web-1.conf
    Wrote  :  /etc/init/procfiled.conf

Start and stop your jobs with

    $ sudo start procfiled
    Starting procfiled... ok
    $ sudo stop procfiled

The export will occur with whatever environmental variables are
listed in the .env file.

### systemd Support

_This section is beta_

Optionally specify a type `-t systemd` during export for [systemd](http://www.freedesktop.org/wiki/Software/systemd) support.

### Supervisord Support

You can also use a type `-t supervisord` during export for [supervisord](http://www.supervisord.org) support.

This will generate a `APP.conf` file grouping the application processes and a `APP-PROCESS-N.conf` file for each process.

    $ procfiled export --type supervisord
    Loaded ENV .env File as JSON Format
    Wrote  :  ./procfiled-web-1.conf
    Wrote  :  ./procfiled-api-1.conf
    Wrote  :  ./procfiled-log-1.conf
    Wrote  :  ./procfiled.conf

You can start / stop / restart individual processes.

    $ sudo supervisorctl start 'procfiled:procfiled-web-1'
    $ sudo supervisorctl stop 'procfiled:procfiled-web-1'
    $ sudo supervisorctl restart 'procfiled:procfiled-web-1'

Or the entire group of processes

    $ sudo supervisorctl start 'procfiled:*'
    $ sudo supervisorctl stop 'procfiled:*'
    $ sudo supervisorctl restart 'procfiled:*'

### Advanced Exports

You can specify the type and number of processes exported using
the `type=num` syntax:

    $ procfiled export web=2,api=2

Use `-u <USER>` to have the exported job run as `USER`.
Note that if you need to bind to privileged ports, you _must_
start as `root`. In such a case, we advise you to drop user
permissions after binding.

If you want to call your upstart job something other than procfiled,
use `-a <JOBNAME>` and manage your jobs with `sudo start <JOBNAME>`.

## Reverse Proxy

Node.js processes are supposed to be stateless.
Applications scale by starting multiple processes that either share a socket,
or sit behind a load balancer.
Procfiled can help you test the parallel capabilities of your application
by spawning multiple processes behind a round-robin proxy.

    $ procfiled start -x 8888 web=5
    [OKAY] Starting Proxy Server 8888 -> 5000-5004

Access your application from port `8888` and the connections will be balanced
across the servers started from ports `5000` - `5004`.

If your application gets its port number from `process.env.PORT` the proxy
setup will happen automatically.

### Multiple Reverse Proxies

If you have multiple processes in your `Procfile` you can start multiple proxies.

    $ procfiled start -x 8888,8080,9090

This will start 3 separate proxies and bind each to a separate process group.
Proxies are bound based on their order specified, their order in the Procfile,
or by their order on the command line.

    $ procfiled start -x 8888,9999 web,api

### Privileged Ports

Procfiled disallows applications from starting on privileged ports.
It does however allow proxies to be bound to lower ports, such as port 80.

If you require access to a privileged port, start Procfiled with `sudo`:

    $ sudo procfiled start -x 80 web=5
    [OKAY] Starting Proxy Server 80 -> 5000-5004

Your application will then be accessible via port 80, but it will be running as root.

## Forward Proxy

Local development and testing has huge advantages,
but sometimes one needs to test web applications against their real-world domain name.
Editing `/etc/hosts` is a pain however, and error prone.

Procfiled can start up an HTTP forward proxy which your browser can route requests through.
The forward proxy will intercept requests based on domain name, and route them to the local application.

    $ procfiled start -f 9999 -i nodefly.com
    [OKAY] Forward Proxy Started in Port 9999
    [OKAY] Intercepting requests to nodefly.com through forward proxy

A forward proxy is useful when testing OAuth, or other external services with application callbacks.

For users with Google Chrome, this can be paired with [FelisCatus SwitchyOmega](https://github.com/FelisCatus/SwitchyOmega) for great results.
