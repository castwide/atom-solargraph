'use babel';

import * as request from 'request';
import * as htmlToText from 'html-to-text';

export default class SolargraphProvider {
  constructor(server) {
    this.server = server;
    this.selector = ".source.ruby";
    this.inclusionPriority = 1;
    this.excludeLowerPriority = true;
    this.suggestionPriority = 2;
  }

  getSuggestions({editor, bufferPosition, scopeDescriptor, prefix}) {
    return new Promise((resolve, reject) => {
      if (this.server.isRunning()) {
        var that = this;
				request.post({url:'http://localhost:' + this.server.getPort() + '/suggest', form: {
					text: editor.getText(),
					filename: null,
					line: bufferPosition.row,
					column: bufferPosition.column,
					workspace: null,
					with_snippets: false}
				}, function(err,httpResponse,body) {
					if (err) {
						console.log(err);
					} else {
						if (httpResponse.statusCode == 200) {
              //console.log(body);
							return resolve(that.getCompletionItems(JSON.parse(body), editor, bufferPosition, prefix));
						} else {
							// TODO: Handle error
						}
					}
				});
			} else {
				return reject();
			}
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
          item.leftLabel = cd['return_type'];
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
