# GlassIt-VSC

[![VSMV]][VSM]
[![VSMI]][VSM]
[![VSMR]][VSM]

VS Code Extension to set window to transparent on Windows and Linux platforms.

This extension is the VS Code version of [GlassIt] of Sublime Text plugin.

## Features

* With this extension, you can change the window transparency by key pressing.

## Requirements

### Windows
  - Windows 7 or higher
### Linux
  - Xorg display server
  - [xprop] package.

## Usage

Change the transparency level by:
* Press "ctrl+alt+z" to increase the transparency, "ctrl+alt+c" to decrease.

## Extension Settings

* `glassit.alpha` (`integer`): Transparency level [1-255].
* `glassit.step` (`integer`): Increment of alpha.

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
