# Development Setup Guide

This guide helps contributors set up a development environment for GlassIt-VSC.

## Prerequisites

- **Node.js** 14 or higher
- **VS Code** 1.40.0 or higher
- **Git**

### Platform-specific requirements:

#### Windows
- PowerShell with appropriate execution policy
- Windows 7 or higher

#### Linux
- X11: `xprop` package (`sudo apt install x11-utils` on Ubuntu/Debian)
- Wayland: Sway or Hyprland compositor

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hikarin522/GlassIt-VSC.git
   cd GlassIt-VSC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Open in VS Code**
   ```bash
   code .
   ```

## Development Workflow

### Running the Extension

1. **Start Extension Development Host**
   - Press `F5` in VS Code
   - Or use `Run and Debug` view → `Run Extension`

2. **Test functionality**
   - Open Command Palette (`Ctrl+Shift+P`)
   - Type "GlassIt" to see available commands
   - Check status bar for transparency indicator
   - Test keyboard shortcuts (if enabled)

### Debugging

1. **View Console Output**
   - In Extension Development Host: `Help` → `Toggle Developer Tools`
   - Check Console tab for GlassIt log messages

2. **Debug Extension Code**
   - Set breakpoints in `extension.js`
   - Use VS Code debugger in main window

### Testing Changes

1. **Syntax Check**
   ```bash
   node -c extension.js
   ```

2. **Manual Testing**
   - Test on both supported platforms if possible
   - Verify commands work correctly
   - Check error handling with invalid configurations

## Project Structure

```
GlassIt-VSC/
├── extension.js          # Main extension code
├── package.json          # Extension manifest and dependencies
├── SetTransparency.cs    # Windows PowerShell transparency script
├── README.md            # User documentation
├── CHANGELOG.md         # Version history
├── FUTURE_IMPROVEMENTS.md # Planned enhancements
└── .vscode/             # VS Code configuration
    └── launch.json      # Debug configuration
```

## Key Files

- **`extension.js`**: Main extension logic, platform detection, command registration
- **`package.json`**: Extension metadata, commands, configuration, keybindings
- **`SetTransparency.cs`**: C# script for Windows transparency via PowerShell

## Configuration Options

The extension supports these configuration options (defined in `package.json`):

- `glassit.alpha`: Default transparency level [1-255]
- `glassit.step`: Increment for increase/decrease commands
- `glassit.force_sway`: Force compositor mode on Linux
- `glassit.alpha_light`: Light theme transparency
- `glassit.alpha_dark`: Dark theme transparency
- `glassit.enable_keybindings`: Enable/disable shortcuts
- `glassit.show_status`: Show status bar indicator

## Adding New Features

### Adding a Command

1. **Define in package.json**
   ```json
   {
     "command": "glassit.mycommand",
     "title": "GlassIt: My New Command"
   }
   ```

2. **Register in extension.js**
   ```javascript
   context.subscriptions.push(commands.registerCommand('glassit.mycommand', () => {
       console.log('GlassIt: My command triggered');
       // Command logic here
   }));
   ```

### Adding Configuration

1. **Define in package.json**
   ```json
   "glassit.my_setting": {
     "type": "boolean",
     "default": true,
     "description": "My new setting description"
   }
   ```

2. **Use in extension.js**
   ```javascript
   const myValue = config().get('my_setting');
   ```

## Platform-Specific Development

### Windows Development
- Test PowerShell execution policies
- Verify C# script compilation
- Test with different Windows versions

### Linux Development
- Test with X11 and Wayland
- Verify xprop availability
- Test compositor auto-detection

## Common Issues

### Extension Not Loading
1. Check VS Code developer console for errors
2. Verify package.json syntax
3. Check activation events configuration

### Commands Not Found
1. Ensure commands are registered in activate function
2. Check command names match package.json
3. Verify extension activation completed

### Platform Detection Issues
1. Check process.platform detection logic
2. Verify platform-specific dependencies
3. Test fallback behavior

## Contribution Guidelines

1. **Code Style**
   - Use consistent indentation (spaces)
   - Add console.log statements for debugging
   - Include error handling for all async operations

2. **Testing**
   - Test on target platforms
   - Verify backward compatibility
   - Check configuration edge cases

3. **Documentation**
   - Update README.md for user-facing changes
   - Update CHANGELOG.md with version changes
   - Add inline comments for complex logic

4. **Pull Requests**
   - Include clear description of changes
   - Reference related issue numbers
   - Test thoroughly before submitting

## Useful VS Code Commands for Development

- `Developer: Reload Window` - Reload extension after changes
- `Developer: Show Running Extensions` - Check extension status
- `Developer: Toggle Developer Tools` - Access browser dev tools

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)