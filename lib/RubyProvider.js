'use babel';

import * as request from 'request';
import * as htmlToText from 'html-to-text';

export default class RubyProvider {
  constructor(server) {
    this.server = server;
    this.selector = ".source.ruby";
    this.inclusionPriority = 2;
    this.excludeLowerPriority = true;
    this.suggestionPriority = 2;
    this.filterSuggestions = false;
  }

  getSuggestions({editor, bufferPosition, scopeDescriptor, prefix, activatedManually}) {
    var that = this;
    return new Promise((resolve, reject) => {
      var workspace = atom.project.getPaths()[0];
      this.server.suggest(editor.getText(), bufferPosition.row, bufferPosition.column, editor.getPath(), workspace).then(function(response) {
        resolve(that.getCompletionItems(response, editor, bufferPosition, prefix));
      });
    });
  }

  getCompletionItems(data, document, position, prefix) {
		let items = [];
    var word = prefix.replace(/^[^a-z0-9_]/i, '')
		if (data.status == "ok") {
      var cmp = function(a,b) {
        if (a.label < b.label) {
          return -1;
        }
        if (b.label < a.label) {
          return 1;
        }
        return 0;
      }
			data.suggestions.sort(cmp).forEach((cd) => {
        if (cd['label'].startsWith(word)) {
  				//var item = new vscode.CompletionItem(cd['label'], kinds[cd['kind']]);
          var item = {};
          if (cd['label'].startsWith('@')) {
            item.text = cd['label'].substring(1);
          } else {
            item.text = cd['insert'];
          }
          item.displayText = cd['label'];
          if (cd['arguments']) {
            var args = cd['arguments'].join(', ')
            if (args) {
              item.displayText += ' (' + args + ')';
            }
          }
          item.type = (cd['kind'] ? cd['kind'].toLowerCase() : null);
          item.description = htmlToText.fromString(cd['documentation']);
          if (cd['return_type']) {
            var rt = cd['return_type'].split('::');
            item.leftLabel = rt[rt.length - 1];
          }
  				items.push(item);
        }
			});
		}
		return items;
	}
}
