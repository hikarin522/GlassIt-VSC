# GlassIt-VSC

[![VSMV]][VSM]
[![VSMI]][VSM]
[![VSMR]][VSM]

VS Code Extension to set window to transparent on Windows and Linux platforms.

This extension is the VS Code version of [GlassIt] of Sublime Text plugin.

## Features

* With this extension, you can change the window transparency by key pressing.
* Supports Windows (Win32) and Linux (X11 and Wayland with Sway/Hyprland).
* Automatic detection of VS Code variants (Code, Code-OSS, VSCodium).
* Separate transparency settings for light and dark themes.
* Preset transparency levels with keyboard shortcuts.
* Optional keyboard shortcut disable.

## Requirements

### Windows
  - Windows 7 or higher
  - PowerShell with appropriate execution policy
### Linux
  - **X11 (Traditional)**: [xprop] package
  - **Wayland**: Sway or Hyprland compositor (auto-detected)

## Usage

Change the transparency level by:
* Press "Ctrl+Alt+Z" to increase transparency, "Ctrl+Alt+C" to decrease
* Press "Ctrl+Alt+X" to minimize transparency (opaque)
* Press "Ctrl+Alt+T" to toggle preset transparency (10%)
* Use Command Palette: "GlassIt: [command name]"

## Extension Settings

* `glassit.alpha` (`integer`): Default transparency level [1-255]. (255 = opaque, 1 = nearly transparent)
* `glassit.step` (`integer`): Increment of alpha when using increase/decrease commands.
* `glassit.force_sway` (`boolean`): Force using compositor commands instead of X11 (auto-detected).
* `glassit.alpha_light` (`integer`): Transparency level for light themes [1-255].
* `glassit.alpha_dark` (`integer`): Transparency level for dark themes [1-255].
* `glassit.enable_keybindings` (`boolean`): Enable/disable keyboard shortcuts.

## Troubleshooting

### Commands not found
1. Check VS Code Developer Console (Help → Toggle Developer Tools → Console) for error messages
2. Ensure the extension is enabled and activated
3. On Windows: Check PowerShell execution policy
4. On Linux: Install `xprop` package or enable `force_sway` for Wayland

### Linux Compatibility
- **X11**: Requires `xprop` package (`sudo apt install x11-utils` on Ubuntu/Debian)
- **Wayland**: Automatically detected for Sway and Hyprland
- **Other compositors**: May require manual configuration of compositor-specific transparency

### VSCodium Support
The extension now automatically detects VSCodium and other VS Code forks.

## LINK

* <https://marketplace.visualstudio.com/items?itemName=s-nlf-fh.glassit>
* <https://github.com/hikarin522/GlassIt-VSC>
* <https://packagecontrol.io/packages/GlassIt>
* <https://github.com/ivellioscolin/sublime-plugin-glassit>

## Changelog

See CHANGELOG.md

[VSM]:https://marketplace.visualstudio.com/items?itemName=s-nlf-fh.glassit
[VSMV]:https://img.shields.io/visual-studio-marketplace/v/s-nlf-fh.glassit
[VSMI]:https://img.shields.io/visual-studio-marketplace/i/s-nlf-fh.glassit
[VSMR]:https://img.shields.io/visual-studio-marketplace/r/s-nlf-fh.glassit
[GlassIt]:https://packagecontrol.io/packages/GlassIt
[xprop]:https://www.x.org/releases/X11R7.5/doc/man/man1/xprop.1.html
