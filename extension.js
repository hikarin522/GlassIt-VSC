// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const shell = require('node-powershell');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "GlassIt VSC" is now active!');

    function setAlpha(alpha) {
        if (alpha < 1) alpha = 1;
        if (alpha > 255) alpha = 255;

        const path = context.asAbsolutePath('./SetTransparency.cs');
        const ps = new shell();
        ps.addCommand(`Add-Type  -Path '${path}'`)
        ps.addCommand(`[CS]::SetTransParency(${process.pid}, ${alpha})`);
        ps.invoke().then(res => {
            console.log(res);
            console.log(`GlassIt: set alpha ${alpha}`);
            config.update('alpha', alpha, true);
        }).catch(err => {
            console.error(err);
            vscode.window.showErrorMessage(`GlassIt Error: ${err}`);
        }).then(() => {
            ps.dispose();
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
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
