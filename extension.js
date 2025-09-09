
const { workspace, window, commands } = require('vscode');
const shell = require('node-powershell');

function activate(context) {

    const config = () => workspace.getConfiguration('glassit');
    let previousAlpha = null; // For toggle functionality

    // Theme detection function (for future use with separate light/dark alpha)
    function getCurrentTheme() {
        const colorTheme = workspace.getConfiguration('workbench').get('colorTheme');
        // Simple heuristic: if theme name contains 'light' it's light theme, otherwise assume dark
        return (colorTheme && colorTheme.toLowerCase().includes('light')) ? 'light' : 'dark';
    }

    // Get the appropriate alpha value based on theme
    function getThemeAlpha() {
        const theme = getCurrentTheme();
        const lightAlpha = config().get('alpha_light');
        const darkAlpha = config().get('alpha_dark');
        const defaultAlpha = config().get('alpha');
        
        // If theme-specific alphas are different from default, use them
        if (theme === 'light' && lightAlpha !== 220) {
            return lightAlpha;
        } else if (theme === 'dark' && darkAlpha !== 220) {
            return darkAlpha;
        }
        
        // Otherwise use the main alpha setting
        return defaultAlpha;
    }

    console.log('GlassIt: Activating extension on platform:', process.platform);
    console.log('GlassIt: VS Code process path:', process.execPath);
    console.log('GlassIt: Current theme:', getCurrentTheme());
    
    if (process.platform == 'win32') {
        const path = context.asAbsolutePath('./SetTransparency.cs');
        console.log('GlassIt: Windows detected, initializing PowerShell with path:', path);
        
        const ps = new shell({
            executionPolicy: 'RemoteSigned',
            noProfile: true,
        });
        context.subscriptions.push(ps);
        
        try {
            ps.addCommand('[Console]::OutputEncoding = [Text.Encoding]::UTF8');
            ps.addCommand(`Add-Type -Path '${path}'`);
            console.log('GlassIt: PowerShell commands added successfully');
        } catch (error) {
            console.error('GlassIt: Failed to setup PowerShell commands:', error);
            window.showErrorMessage(`GlassIt: Failed to initialize PowerShell: ${error.message}`);
            return;
        }

        function setAlpha(alpha) {
            if (alpha < 1) {
                alpha = 1;
            } else if (alpha > 255) {
                alpha = 255;
            }

            console.log(`GlassIt: Setting alpha to ${alpha} for process ${process.pid}`);
            ps.addCommand(`[GlassIt.SetTransParency]::SetTransParency(${process.pid}, ${alpha})`);
            ps.invoke().then(res => {
                console.log('GlassIt: PowerShell result:', res);
                console.log(`GlassIt: Successfully set alpha to ${alpha}`);
                config().update('alpha', alpha, true);
            }).catch(err => {
                console.error('GlassIt: PowerShell execution error:', err);
                window.showErrorMessage(`GlassIt Error: ${err.message || err}`);
            });
        }
    } else if (process.platform == 'linux') {

        const cp = require('child_process');
        const codeWindowIds = [];

        console.log('GlassIt: Linux detected, force_sway setting:', config().get('force_sway'));

        // Auto-detect Wayland compositors that need special handling
        let needsCompositorMode = config().get('force_sway');
        let detectedCompositor = 'unknown';
        
        if (!needsCompositorMode) {
            try {
                // Check for Sway
                const swayCheck = cp.spawnSync('pgrep', ['sway'], { encoding: 'utf8' });
                if (swayCheck.status === 0) {
                    needsCompositorMode = true;
                    detectedCompositor = 'sway';
                }
                
                // Check for Hyprland
                if (!needsCompositorMode) {
                    const hyprlandCheck = cp.spawnSync('pgrep', ['Hyprland'], { encoding: 'utf8' });
                    if (hyprlandCheck.status === 0) {
                        needsCompositorMode = true;
                        detectedCompositor = 'hyprland';
                    }
                }
                
                // Check if we're running under Wayland
                if (!needsCompositorMode && (process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland')) {
                    console.log('GlassIt: Wayland session detected but no supported compositor found');
                    console.log('GlassIt: You may need to enable force_sway option or use compositor-specific transparency settings');
                }
                
                if (needsCompositorMode) {
                    console.log(`GlassIt: Detected ${detectedCompositor} compositor, using compositor commands for transparency`);
                }
                
            } catch (error) {
                console.log('GlassIt: Failed to detect compositor:', error.message);
            }
        }

        if (!needsCompositorMode) {
            // Checking if xprop is installed
            try {
                const whichResult = cp.spawnSync('which', ['xprop'], { encoding: 'utf8' });
                if (whichResult.status !== 0) {
                    const errorMsg = 'GlassIt Error: xprop package is required but not found. Please install xprop package or enable force_sway option for Wayland/Sway.';
                    console.error(errorMsg);
                    window.showErrorMessage(errorMsg);
                    return;
                }
                console.log('GlassIt: xprop found at:', whichResult.stdout.trim());
            } catch (error) {
                const errorMsg = `GlassIt Error: Failed to check for xprop: ${error.message}`;
                console.error(errorMsg);
                window.showErrorMessage(errorMsg);
                return;
            }

            // Retrieve the process name for the current VS Code instance (Solution for using forks of VS Code)
            const execPath = process.execPath;
            const process_name = execPath.substring(execPath.lastIndexOf('/') + 1);
            console.log('GlassIt: Detected process name:', process_name);
            console.log('GlassIt: Full exec path:', execPath);

            // Support common VS Code variants
            const supportedProcessNames = [process_name];
            if (process_name === 'code') {
                supportedProcessNames.push('code-oss', 'codium', 'vscodium');
            } else if (process_name === 'codium' || process_name === 'vscodium') {
                supportedProcessNames.push('code', 'code-oss');
            } else if (process_name === 'code-oss') {
                supportedProcessNames.push('code', 'codium', 'vscodium');
            }
            
            console.log('GlassIt: Looking for processes:', supportedProcessNames);

            try {
                // Retrieve process ids for all supported VS Code variants
                const processIds = [];
                for (const name of supportedProcessNames) {
                    try {
                        const pgrepResult = cp.execSync(`pgrep ${name}`, { encoding: 'utf8' });
                        const ids = pgrepResult.trim().split('\n').filter(id => id);
                        processIds.push(...ids);
                        console.log(`GlassIt: Found ${ids.length} processes for ${name}:`, ids);
                    } catch (error) {
                        // Process not found, continue with next variant
                        console.log(`GlassIt: No processes found for ${name}`);
                    }
                }

                if (processIds.length === 0) {
                    const errorMsg = `GlassIt: No VS Code processes found for any variant: ${supportedProcessNames.join(', ')}`;
                    console.error(errorMsg);
                    window.showErrorMessage(errorMsg);
                    return;
                }

                console.log('GlassIt: Total VS Code processes found:', processIds.length);

                // Retrieving all window ids
                const allWindowIdsOutput = cp.execSync(
                    `xprop -root | grep '_NET_CLIENT_LIST(WINDOW)'`, { encoding: 'utf8' }
                );

                const allWindowIds = allWindowIdsOutput.match(/0x[\da-f]+/ig);
                console.log('GlassIt: Found', allWindowIds ? allWindowIds.length : 0, 'windows');

                if (!allWindowIds) {
                    const errorMsg = 'GlassIt: No windows found via xprop';
                    console.error(errorMsg);
                    window.showErrorMessage(errorMsg);
                    return;
                }

                for (const windowId of allWindowIds) {
                    try {
                        // Checking if the window has an associated process
                        const hasProcessId = cp.execSync(`xprop -id ${windowId} _NET_WM_PID`, { encoding: 'utf8' });

                        if (!(hasProcessId.search('not found') + 1)) {
                            // Extract process id from the result
                            const winProcessId = hasProcessId.replace(/([a-zA-Z_\(\)\s\=])/g, '');
                            if (processIds.includes(winProcessId)) {
                                codeWindowIds.push(windowId);
                                console.log(`GlassIt: Found VS Code window: ${windowId} (PID: ${winProcessId})`);
                            }
                        }
                    } catch (error) {
                        // Window might have been closed, continue
                        console.log(`GlassIt: Failed to check window ${windowId}:`, error.message);
                    }
                }

                console.log('GlassIt: Found', codeWindowIds.length, 'VS Code windows');
                
                if (codeWindowIds.length === 0) {
                    const errorMsg = 'GlassIt: No VS Code windows found that match running processes';
                    console.error(errorMsg);
                    window.showErrorMessage(errorMsg);
                    return;
                }
            } catch (error) {
                const errorMsg = `GlassIt Error: Failed to enumerate windows: ${error.message}`;
                console.error(errorMsg);
                window.showErrorMessage(errorMsg);
                return;
            }
        }

        function setAlpha(alpha) {
            if (alpha < 1) {
                alpha = 1;
            } else if (alpha > 255) {
                alpha = 255;
            }

            console.log(`GlassIt: Setting alpha to ${alpha}`);

            if (needsCompositorMode || config().get('force_sway') === true){
                console.log(`GlassIt: Using compositor commands for transparency (${detectedCompositor})`);
                const opacityValue = (alpha / 255).toFixed(2);
                console.log(`GlassIt: Calculated opacity value: ${opacityValue}`);
                
                let command;
                if (detectedCompositor === 'hyprland') {
                    command = `hyprctl setprop address:$(hyprctl activewindow | grep -E "^window.*" | awk '{print $2}') alpha ${opacityValue}`;
                    console.log('GlassIt: Using Hyprland hyprctl command');
                } else {
                    // Default to swaymsg for Sway and unknown compositors
                    command = `swaymsg opacity ${opacityValue}`;
                    console.log('GlassIt: Using swaymsg command');
                }
                
                cp.exec(command, function (error, stdout, stderr) {
                    if (error) {
                        console.error(`GlassIt compositor error: ${error.message}`);
                        if (stderr) console.error(`GlassIt compositor stderr: ${stderr}`);
                        
                        // For Hyprland, try fallback to general opacity command if specific command fails
                        if (detectedCompositor === 'hyprland' && command.includes('setprop')) {
                            console.log('GlassIt: Hyprland setprop failed, trying global opacity');
                            cp.exec(`hyprctl keyword decoration:active_opacity ${opacityValue}; hyprctl keyword decoration:inactive_opacity ${opacityValue}`, function (fallbackError, fallbackStdout, fallbackStderr) {
                                if (fallbackError) {
                                    window.showErrorMessage(`GlassIt Hyprland Error: ${fallbackError.message}`);
                                } else {
                                    console.log('GlassIt: Hyprland fallback command succeeded');
                                    config().update('alpha', alpha, true);
                                }
                            });
                        } else {
                            window.showErrorMessage(`GlassIt Compositor Error: ${error.message}`);
                        }
                        return;
                    }
    
                    console.log('GlassIt: Compositor output:', stdout.toString().trim());
                    console.log(`GlassIt: Successfully set alpha to ${alpha} via ${detectedCompositor || 'compositor'}`);
                    config().update('alpha', alpha, true);
                });
            } else {
                console.log(`GlassIt: Using xprop for transparency on ${codeWindowIds.length} windows`);
                
                if (codeWindowIds.length === 0) {
                    const errorMsg = 'GlassIt: No windows available for transparency';
                    console.error(errorMsg);
                    window.showErrorMessage(errorMsg);
                    return;
                }
                
                let successCount = 0;
                let errorCount = 0;
                
                for (const codeWindowId of codeWindowIds) {
                    const opacityHex = `$(printf 0x%x $((0xffffffff * ${alpha} / 255)))`;
                    const command = `xprop -id ${codeWindowId} -f _NET_WM_WINDOW_OPACITY 32c -set _NET_WM_WINDOW_OPACITY ${opacityHex}`;
                    
                    cp.exec(command, function (error, stdout, stderr) {
                        if (error) {
                            console.error(`GlassIt xprop error for window ${codeWindowId}: ${error.message}`);
                            errorCount++;
                        } else {
                            console.log(`GlassIt: Successfully set transparency for window ${codeWindowId}`);
                            successCount++;
                        }
                        
                        // Update config only after processing all windows
                        if (successCount + errorCount === codeWindowIds.length) {
                            if (successCount > 0) {
                                console.log(`GlassIt: Successfully updated ${successCount}/${codeWindowIds.length} windows`);
                                config().update('alpha', alpha, true);
                            } else {
                                const errorMsg = `GlassIt: Failed to update any windows (${errorCount} errors)`;
                                console.error(errorMsg);
                                window.showErrorMessage(errorMsg);
                            }
                        }
                    });
                }
            }
        }
    } else {
        const errorMsg = `GlassIt: Platform '${process.platform}' is not supported. Currently supported: Windows (win32) and Linux.`;
        console.error(errorMsg);
        window.showErrorMessage(errorMsg);
        return;
    }

    console.log('GlassIt: Extension initialized successfully, registering commands...');

    try {
        context.subscriptions.push(commands.registerCommand('glassit.increase', () => {
            console.log('GlassIt: Increase transparency command triggered');
            const alpha = config().get('alpha') - config().get('step');
            setAlpha(alpha);
        }));

        context.subscriptions.push(commands.registerCommand('glassit.decrease', () => {
            console.log('GlassIt: Decrease transparency command triggered');
            const alpha = config().get('alpha') + config().get('step');
            setAlpha(alpha);
        }));

        context.subscriptions.push(commands.registerCommand('glassit.maximize', () => {
            console.log('GlassIt: Maximize transparency command triggered');
            setAlpha(1);
        }));

        context.subscriptions.push(commands.registerCommand('glassit.minimize', () => {
            console.log('GlassIt: Minimize transparency command triggered');
            setAlpha(255);
        }));

        // New preset commands
        context.subscriptions.push(commands.registerCommand('glassit.toggle_preset', () => {
            console.log('GlassIt: Toggle preset transparency command triggered');
            const currentAlpha = config().get('alpha');
            const presetAlpha = Math.round(255 * 0.1); // 10% transparency (90% opacity)
            
            if (currentAlpha === presetAlpha) {
                // If already at preset, restore previous or default
                const restoreAlpha = previousAlpha || 220;
                setAlpha(restoreAlpha);
            } else {
                // Store current alpha and switch to preset
                previousAlpha = currentAlpha;
                setAlpha(presetAlpha);
            }
        }));

        context.subscriptions.push(commands.registerCommand('glassit.set_25', () => {
            console.log('GlassIt: Set 25% transparency command triggered');
            setAlpha(Math.round(255 * 0.75)); // 25% transparency = 75% opacity
        }));

        context.subscriptions.push(commands.registerCommand('glassit.set_50', () => {
            console.log('GlassIt: Set 50% transparency command triggered');
            setAlpha(Math.round(255 * 0.5)); // 50% transparency = 50% opacity
        }));

        context.subscriptions.push(commands.registerCommand('glassit.set_75', () => {
            console.log('GlassIt: Set 75% transparency command triggered');
            setAlpha(Math.round(255 * 0.25)); // 75% transparency = 25% opacity
        }));

        console.log('GlassIt: All commands registered successfully');
        
        // Apply initial transparency (use theme-specific if configured)
        const alpha = getThemeAlpha();
        console.log('GlassIt: Applying initial transparency:', alpha);
        setAlpha(alpha);
        
        console.log('GlassIt: Extension "GlassIt VSC" is now active and ready!');
    } catch (error) {
        console.error('GlassIt: Failed to register commands:', error);
        window.showErrorMessage(`GlassIt: Failed to register commands: ${error.message}`);
    }
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;
