const solargraph = require('solargraph-utils');
const {AutoLanguageClient} = require('atom-languageclient');
const net = require('net');

class RubyLanguageClient extends AutoLanguageClient {
  getGrammarScopes() { return ['source.ruby'] }
  getLanguageName() { return 'Ruby' }
  getServerName() { return 'Ruby Solargraph Language Server' }
  getConnectionType() { return 'socket' }

  startServerProcess() {
    return new Promise((resolve) => {
      let configuration = new solargraph.Configuration();
      if (atom.project.getDirectories().length > 0) {
        configuration.workspace = atom.project.getDirectories()[0].getPath();
      }
      let provider = new solargraph.SocketProvider(configuration);
      let that = this;
      provider.start().then(() => {
        var socket = net.createConnection(provider.port, () => {
          that.socket = socket;
          resolve(provider.process);
        });
      });
    });
  }

  provideAutocomplete() {
    const provide = super.provideAutocomplete();
    provide.inclusionPriority = 2;
    provide.suggestionPriority = 2;
    // provide.excludeLowerPriority = true;
    provide.filterSuggestions = false;
    return provide;
  }
}

module.exports = new RubyLanguageClient()
