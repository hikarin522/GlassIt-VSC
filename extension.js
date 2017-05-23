// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const execFile = require('child_process').execFile;
const shell = require('node-powershell');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "GlassIt VSC" is now active!');

    const ps = new shell();
    ps.addCommand('(Get-Process -Name Code | where {$_.MainWindowHandle -ne 0}).Id');
    ps.invoke().then(res => {
        console.log(res);
        const pid = Number(res);
        if (!pid) throw res;

        function setAlpha(alpha) {
            if (alpha < 1) alpha = 1;
            if (alpha > 255) alpha = 255;
            const config = vscode.workspace.getConfiguration('glassit');
            const path = config.get('path');
            execFile(path, [pid, alpha, 'Code'], (err, stdout, stderr) => {
                if (err) console.error(err);
                if (stderr) console.error(stderr);
                if (stdout) console.log(stdout);
                if (!err && !stderr) {
                    console.log(`GlassIt: set alpha ${alpha}`);
                    config.update('alpha', alpha, true);
                } else {
                    vscode.window.showErrorMessage('GlassIt: Error');
                }
            });
        }

        // The command has been defined in the package.json file
        // Now provide the implementation of the command with  registerCommand
        // The commandId parameter must match the command field in package.json
        context.subscriptions.push(vscode.commands.registerCommand('glassit.increase', () => {
            // The code you place here will be executed every time your command is executed
            const config = vscode.workspace.getConfiguration('glassit');
            const alpha = config.get('alpha') - config.get('step');
            setAlpha(alpha);
        }));

        context.subscriptions.push(vscode.commands.registerCommand('glassit.decrease', () => {
            // The code you place here will be executed every time your command is executed
            const config = vscode.workspace.getConfiguration('glassit');
            const alpha = config.get('alpha') + config.get('step');
            setAlpha(alpha);
        }));

        const config = vscode.workspace.getConfiguration('glassit');
        const alpha = config.get('alpha');
        setAlpha(alpha);
    }).catch(err => {
        console.error(err);
        vscode.window.showErrorMessage('GlassIt: Error');
    }).then(() => {
        ps.dispose();
    });
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
