
const { workspace, window, commands } = require('vscode');
const shell = require('node-powershell');

function activate(context) {
    if (process.platform !== 'win32') {
        return;
    }

    console.log('Congratulations, your extension "GlassIt VSC" is now active!');

    const config = workspace.getConfiguration('glassit');

    const path = context.asAbsolutePath('./SetTransparency.cs');
    const ps = new shell();
    context.subscriptions.push(ps);
    ps.addCommand('[Console]::OutputEncoding = [Text.Encoding]::UTF8');
    ps.addCommand(`Add-Type -Path '${path}'`);

    function setAlpha(alpha) {
        if (alpha < 1) {
            alpha = 1;
        } else if (alpha > 255) {
            alpha = 255;
        }

        ps.addCommand(`[GlassIt.SetTransParency]::SetTransParency(${process.pid}, ${alpha})`);
        ps.invoke().then(res => {
            console.log(res);
            console.log(`GlassIt: set alpha ${alpha}`);
            config.update('alpha', alpha, true);
        }).catch(err => {
            console.error(err);
            window.showErrorMessage(`GlassIt Error: ${err}`);
        });
    }

    context.subscriptions.push(commands.registerCommand('glassit.increase', () => {
        const alpha = config.get('alpha') - config.get('step');
        setAlpha(alpha);
    }));

    context.subscriptions.push(commands.registerCommand('glassit.decrease', () => {
        const alpha = config.get('alpha') + config.get('step');
        setAlpha(alpha);
    }));

    const alpha = config.get('alpha');
    setAlpha(alpha);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;
