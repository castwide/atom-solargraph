'use babel';

//import AtomSolargraphView from './atom-solargraph-view';
import { CompositeDisposable } from 'atom';
//import SolargraphProvider from './SolargraphProvider';
//import SolargraphServer from './SolargraphServer';
import * as solargraph from 'solargraph-utils';
import RubyProvider from './RubyProvider';

const solargraphConfiguration = new solargraph.Configuration();
solargraphConfiguration.workspace = atom.project.getDirectories()[0].getPath();
const solargraphServer = new solargraph.Server(solargraphConfiguration);

export default {

  //atomSolargraphView: null,
  //modalPanel: null,
  subscriptions: null,

  config: {
    "useBundler": {
      "title": "Use Bundler",
      "description": "Start the server using `bundle exec` if available.",
      "type": "boolean",
      "default": false
    }
  },

  activate(state) {
    /*this.atomSolargraphView = new AtomSolargraphView(state.atomSolargraphViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomSolargraphView.getElement(),
      visible: false
    });*/

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    /*this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-solargraph:toggle': () => this.toggle()
    }));*/

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-solargraph:restart': () => this.restart()
    }));

    solargraphServer.start().then(() => {
      solargraphServer.prepare(atom.project.getPaths()[0]);
    });

    /*atom.workspace.observeTextEditors((editor) => {
      editor.element.addEventListener('mousemove', (event) => {
        var element = atom.views.getView(editor);
        console.log(editor.element.screenPositionForPixelPosition({left: event.x, top: event.y}));
      });
    });*/

    this.rubyProvider = new RubyProvider(solargraphServer);
    console.log('Solargraph package activated.');
  },

  deactivate() {
    console.log('Deactivating Solargraph');
    //this.modalPanel.destroy();
    this.subscriptions.dispose();
    //this.atomSolargraphView.destroy();
    solargraphServer.stop();
  },

  serialize() {
    return {
      //atomSolargraphViewState: this.atomSolargraphView.serialize()
    };
  },

  restart() {
    solargraphServer.restart();
    console.log('Solargraph server was restarted');
  },

  provide() {
    return this.rubyProvider;
  }
};
