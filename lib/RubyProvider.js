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
  }

  getSuggestions({editor, bufferPosition, scopeDescriptor, prefix}) {
    console.log('Looking for suggestions');
    var that = this;
    return new Promise((resolve, reject) => {
      var workspace = null;
      var withSnippets = false;
      this.server.suggest(editor.getText(), bufferPosition.row, bufferPosition.column, editor.getPath(), workspace, withSnippets).then(function(response) {
        console.log('Got suggestions ' + JSON.stringify(response));
        return resolve(that.getCompletionItems(response, editor, bufferPosition, prefix));
      });
    });
  }

  getCompletionItems(data, document, position, prefix) {
		let items = [];
    var word = prefix.replace(/^[^a-z0-9_]/i, '')
		if (data.status == "ok") {
			/*var range = document.getWordRangeAtPosition(position);
			if (range) {
				var repl = document.getText(range);
				if (range.start.character > 0) {
					if (repl.substr(0, 1) == ':') {
						var prevChar = document.getText(new vscode.Range(range.start.line, range.start.character - 1, range.start.line, range.start.character));
						if (prevChar == ':') {
							// Replacement range starts with a colon, but there's
							// a previous colon. That means we're in a namespace,
							// not a symbol. Get rid of the colon in the namespace
							// range.
							range = new vscode.Range(range.start.line, range.start.character + 1, range.end.line, range.end.character);
						}
					}
				}
			}*/
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
  				// Treat instance variables slightly differently
  				/*if (cd['insert'].substring(0, 1) == '@') {
  					item.insertText = cd['insert'].substring(1);
  					item.filterText = cd['insert'].substring(1);
  					item.sortText = cd['insert'].substring(1);
  					item.label = cd['insert'].substring(1);
  				} else {
  					if (cd['kind'] == 'Snippet') {
  						item.insertText = new SnippetString(cd['insert']);
  					} else {
  						item.insertText = cd['insert'];
  					}
  				}
  				if (range) {
  					// HACK: Unrecognized property
  					item['range'] = range;
  				}
  				if (cd['kind'] == 'Method' && cd['arguments'].length > 0) {
  					item.detail = '(' + cd['arguments'].join(', ') + ') ' + cd['detail'];
  				} else {
  					item.detail = cd['detail'];
  				}
  				item.documentation = cd['documentation'];*/
  				items.push(item);
        }
			});
		}
		return items;
	}
}
