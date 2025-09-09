# Future Improvements for GlassIt-VSC

This document outlines remaining issues and potential improvements that could be implemented in future versions.

## High Priority Issues (Require Further Investigation)

### Issue #51: Transparency affecting text instead of just background
- **Problem**: Extension makes everything transparent, including text
- **Root Cause**: Compositor-specific behavior on some Linux systems
- **Potential Solutions**:
  - Investigate different X11 properties for background-only transparency
  - Add compositor-specific handling for i3, GNOME, KDE
  - Provide option to use different transparency methods

### Issue #50: VS Code minimizes after changing alpha
- **Problem**: IDE minimizes to taskbar when transparency changes
- **Status**: Partially addressed with throttling, may need further investigation
- **Potential Solutions**:
  - Investigate window focus handling on Windows
  - Add delay or different PowerShell execution method
  - Research alternative Windows transparency APIs

### Issue #23: Open-VSX Distribution
- **Problem**: Extension not available for VSCodium users on open-vsx.org
- **Solution**: Publish extension to Open VSX Registry
- **Steps**: Create account, configure CI/CD, maintain dual publishing

## Medium Priority Features

### Issue #65: Blur effects for transparent background
- **Description**: Add background blur/frosted glass effect
- **Complexity**: High - requires compositor-specific implementation
- **Platforms**: 
  - Windows: Use Windows 10+ Acrylic APIs
  - Linux: Compositor-dependent (limited support)

### Issue #42: Acrylic effect like Windows Terminal
- **Description**: Windows-specific acrylic/frosted glass effect
- **Requirements**: Windows 10+ with compatible hardware
- **Implementation**: Requires native Windows API calls

### Issue #49: Panel transparency (Terminal, etc.)
- **Description**: Extend transparency to VS Code panels
- **Complexity**: Medium - requires different window targeting
- **Implementation**: Target panel-specific windows or elements

## Platform Support

### Issue #57, #40: macOS Support
- **Challenge**: No native transparency APIs accessible from Electron
- **Complexity**: Very High
- **Requirements**:
  - Native module development
  - macOS-specific APIs
  - Code signing for distribution
- **Alternative**: Suggest users use third-party window managers

## Quality of Life Improvements

### Enhanced Status Bar Features
- Add transparency percentage slider
- Add quick preset buttons
- Show theme-specific transparency info

### Configuration Improvements
- Import/export transparency profiles
- Workspace-specific transparency settings
- Time-based transparency scheduling

### Advanced Features
- Transparency animation/transitions
- Per-monitor transparency settings
- Integration with VS Code themes

## Technical Debt

### Code Organization
- Split platform-specific code into modules
- Add TypeScript for better type safety
- Implement proper error recovery

### Testing
- Add unit tests for configuration handling
- Create integration tests for platform detection
- Add CI/CD pipeline for testing

### Documentation
- Create video tutorials
- Add troubleshooting flowchart
- Document internal APIs

## Implementation Notes

Most remaining issues require platform-specific solutions and deeper integration with system APIs. The current improvements address the majority of user-reported issues and provide a solid foundation for future enhancements.

Priority should be given to:
1. Open-VSX publishing (easy win for VSCodium users)
2. Investigation of text transparency issue on Linux
3. Further Windows minimizing investigation
4. Enhanced documentation and tutorials