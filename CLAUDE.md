# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Notion Equation Converter** is a Chrome extension that converts LaTeX block equations `\[ \]` to inline equations `$ $` in Notion pages. It's a lightweight vanilla JavaScript extension with Manifest V3.

## Architecture

### Core Components

- **content.js**: Content script that runs on Notion pages, handles equation conversion and auto-convert functionality
- **popup.html/js**: Extension popup interface for manual conversion and auto-convert toggle
- **manifest.json**: Chrome extension configuration with minimal permissions (`activeTab`, `storage`)

### Key Features

1. **Manual Conversion**: One-click conversion via popup button
2. **Auto-Convert**: Real-time conversion as user types (toggleable)
3. **Smart Filtering**: Ignores empty brackets `\[\]` or whitespace-only patterns
4. **DOM Integration**: Uses MutationObserver for auto-convert mode

## Development Commands

### Setup & Installation

```bash
# Load extension for development
1. Open Chrome → chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked" → select project root folder

# Test extension
1. Open any Notion page (notion.so or notion.site)
2. Type equations with \[ ... \] syntax
3. Click extension icon or enable auto-convert
```

### Testing

```bash
# Manual testing
- Use demo.html for visual testing of Notion-like interface
- Test both manual conversion and auto-convert modes
- Verify empty brackets are properly ignored
- Test across different Notion page types

# Chrome DevTools
- Right-click extension icon → "Inspect popup" for popup debugging
- Use DevTools on Notion pages for content script debugging
```

### Code Structure

```
├── content.js          # Content script - equation conversion logic
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── manifest.json       # Extension configuration
├── demo.html           # Test interface (Notion-like)
├── icon.png            # Extension icon
├── README.md           # User documentation
└── PRIVACY_POLICY.md   # Privacy policy
```

## Key Code Patterns

### Equation Detection
- **Regex**: `/\\\[(\s*\S[\s\S]*?)\\\]/g` - captures content with at least one non-whitespace character
- **Smart Filtering**: Empty/whitespace-only brackets are ignored

### DOM Manipulation
- **Text Node Processing**: Uses TreeWalker for efficient text node traversal
- **MutationObserver**: Monitors DOM changes for auto-convert mode
- **Input Events**: Dispatches synthetic input events to trigger Notion updates

### State Management
- **Chrome Storage**: Uses `chrome.storage.local` for auto-convert toggle persistence
- **Message Passing**: Popup ↔ Content script communication via `chrome.runtime.onMessage`

## Common Development Tasks

### Adding New Features
1. Update manifest.json if new permissions needed
2. Modify content.js for DOM interaction changes
3. Update popup.html/js for UI changes
4. Test thoroughly on actual Notion pages

### Debugging
- **Content Script**: Use DevTools → Sources → Content scripts tab
- **Popup**: Right-click extension icon → "Inspect popup"
- **Storage**: Check Application → Storage → Local Storage in DevTools

### Performance Considerations
- **MutationObserver**: Efficiently filters text nodes to minimize performance impact
- **Debouncing**: 50ms timeout prevents excessive conversions during rapid typing
- **Regex Optimization**: Single-pass regex replacement for batch conversions

## Extension Lifecycle

1. **Installation**: Extension loads content script on Notion domains
2. **Activation**: User clicks extension icon or enables auto-convert
3. **Conversion**: Content script processes text nodes and updates DOM
4. **Persistence**: Auto-convert state saved to chrome.storage

## Browser Compatibility

- **Chrome**: Primary target (Manifest V3)
- **Edge**: Compatible (Chromium-based)
- **Other**: May work but not tested

## Security Notes

- **Minimal Permissions**: Only `activeTab` and `storage` permissions
- **No External Scripts**: All code is self-contained
- **Content Security Policy**: Follows Chrome Web Store best practices