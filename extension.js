
const { workspace, window, commands } = require('vscode');
const shell = require('node-powershell');

function activate(context) {

    const config = () => workspace.getConfiguration('glassit');

    console.log('ctx', process.platform);
    if (process.platform == 'win32') {
        const path = context.asAbsolutePath('./SetTransparency.cs');
        const ps = new shell({
            executionPolicy: 'RemoteSigned',
            noProfile: true,
        });
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
                config().update('alpha', alpha, true);
            }).catch(err => {
                console.error(err);
                window.showErrorMessage(`GlassIt Error: ${err}`);
            });
        }
    } else if (process.platform == 'linux') {

        const cp = require('child_process');
        const codeWindowIds = [];

        if (config().get('force_sway') === false) {
            // Checking the weather xprop has installed
            try {
                cp.spawnSync('which xprop').toString();
            } catch (error) {
                console.error(`GlassIt Error: Please install xprop package to use GlassIt.`);
                return;
            }

            // Retrieve the process name for the current VS Code instance (Solution for using forks of VS Code)
            const process_name = process.execPath.substring(process.execPath.lastIndexOf('/') + 1);

            // Retrieving the process ids of VS code
            const processIds = cp.execSync(`pgrep ${process_name}`).toString().split('\n');
            processIds.pop();

            // Retrieving all window ids
            const allWindowIdsOutput = cp.execSync(
                `xprop -root | grep '_NET_CLIENT_LIST(WINDOW)'`
            ).toString();

            const allWindowIds = allWindowIdsOutput.match(/0x[\da-f]+/ig);

            for (const windowId of allWindowIds) {

                // Checking the weather the window has a associated process
                const hasProcessId = cp.execSync(`xprop -id ${windowId} _NET_WM_PID`).toString();

                if (!(hasProcessId.search('not found') + 1)) {
                    // Extract process id from the result
                    const winProcessId = hasProcessId.replace(/([a-zA-Z_\(\)\s\=])/g, '');
                    if (processIds.includes(winProcessId)) {
                        codeWindowIds.push(windowId);
                    }
                }
            }
        }

        function setAlpha(alpha) {
            if (alpha < 1) {
                alpha = 1;
            } else if (alpha > 255) {
                alpha = 255;
            }

            if (config().get('force_sway') === true){
                console.log(`In force_sway mode...`);
                cp.exec(`swaymsg opacity ${(alpha / 255).toFixed(2)}`, function (error, stdout, stderr) {
                    if (error) {
                        console.error(`GlassIt error: ${error}`);
                        return;
                    }
    
                    console.log(stdout.toString());
                    console.log(`GlassIt: set alpha ${alpha}`);
                    config().update('alpha', alpha, true);
                })
            } else {
                for (const codeWindowId of codeWindowIds) {
                    cp.exec(`xprop  -id ${codeWindowId} -f _NET_WM_WINDOW_OPACITY 32c -set _NET_WM_WINDOW_OPACITY $(printf 0x%x $((0xffffffff * ${alpha} / 255)))`, function (error, stdout, stderr) {
                        if (error) {
                            console.error(`GlassIt error: ${error}`);
                            return;
                        }
    
                        console.log(stdout.toString());
                        console.log(`GlassIt: set alpha ${alpha}`);
                        config().update('alpha', alpha, true);
                    });
                }
            }
        }
    } else {
        return;
    }

    console.log('Congratulations, your extension "GlassIt VSC" is now active!');

    context.subscriptions.push(commands.registerCommand('glassit.increase', () => {
        const alpha = config().get('alpha') - config().get('step');
        setAlpha(alpha);
    }));

    context.subscriptions.push(commands.registerCommand('glassit.decrease', () => {
        const alpha = config().get('alpha') + config().get('step');
        setAlpha(alpha);
    }));

    context.subscriptions.push(commands.registerCommand('glassit.maximize', () => {
        setAlpha(1);
    }));

    context.subscriptions.push(commands.registerCommand('glassit.minimize', () => {
        setAlpha(255);
    }));

    const alpha = config().get('alpha');
    setAlpha(alpha);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;
