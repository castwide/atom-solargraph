'use babel';

import * as child_process from 'child_process';

export function solargraphCommand(args) {
	let cmd = [];
	//if (vscode.workspace.getConfiguration('solargraph').useBundler) {
		// TODO: pathToBundler configuration
	//	cmd.push('bundle', 'exec', 'solargraph');
	//} else {
	//	cmd.push(vscode.workspace.getConfiguration('solargraph').commandPath);
	//}
  cmd.push('solargraph');
	var env = { shell: true };
	//if (vscode.workspace.rootPath) env['cwd'] = vscode.workspace.rootPath;
	return child_process.spawn(cmd.shift(), cmd.concat(args), env);
}
