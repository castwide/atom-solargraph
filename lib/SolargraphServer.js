'use babel';

//const child_process = require('child_process');
import * as child_process from 'child_process';
import * as cmd from './commands';
import * as request from 'request';

export default function SolargraphServer() {
  var child = null;
  var port = null;
  var pid = null;

  this.isRunning = function() {
    return (child != null && port != null && pid != null);
  }

  this.getPort = function() {
    return port;
  }

  this.start = function(callback) {
    if (child) {
      console.warn('There is already a process running for the Solargraph server.');
    } else {
      var ranCallback = false;
      child = cmd.solargraphCommand([
        'server',
        '--port', '0'
      ]);
      child.stderr.on('data', (data) => {
        var out = data.toString();
        console.log(out);
        if (!port) {
          var match = out.match(/port=([0-9]*)/);
          if (match) {
            port = match[1];
          }
          match = out.match(/pid=([0-9]*)/);
          if (match) {
            pid = parseInt(match[1]);
          }
        }
        if (this.isRunning() && callback && !ranCallback) {
          ranCallback = true;
          callback();
        }
      });
      child.on('exit', () => {
        this.port = null;
      });
    }
  }

  this.restart = function() {
		this.stop();
		this.start();
	}

  this.stop = function() {
		if (!child) {
			console.warn('The server is not running.');
		} else {
			child.kill();
      if (pid) {
        process.kill(pid);
      }
			child = null;
			port = null;
      pid = null;
		}
	}

  this.prepare = function(workspace) {
		request.post({url:'http://localhost:' + port + '/prepare', form: {
			workspace: workspace
		}}, function(err, response, body) {
			/*setTimeout(function() {
			prepareStatus.dispose();
				if (err) {
					vscode.window.setStatusBarMessage('There was an error analyzing the Ruby code.', 3000);
				}
			}, 500);*/
		});
	}

}
