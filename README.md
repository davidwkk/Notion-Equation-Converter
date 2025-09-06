# Notion Equation Converter

A Chrome extension that converts LaTeX block equations `\[ \]` to inline equations (unrendered) `$ $` in Notion pages.

![Demo](screenshots/demo.gif)

## 🚀 Features

- **One-click conversion** of all `\[equation\]` patterns to `$equation$`
- **Real-time auto-conversion** as you type
- **Works on all Notion pages** (notion.so and notion.site)
- **Simple and lightweight** - no permissions beyond active tab
- **Preserves equation content** - only changes the delimiters

## 📥 Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store page](link-when-published)
2. Click "Add to Chrome"
3. Confirm installation

### From Source (Development)

1. Clone this repository:

```bash
git clone https://github.com/davidwkk/notion-equation-converter.git
```

2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `src` folder

## 🎯 Usage

### Basic Usage

1. Open any Notion page
2. Type equations using `\[` and `\]`:

```
The quadratic formula is \[x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}\]
```

3. Click the extension icon in your toolbar
4. Click "Convert \[ \] to $ $"
5. Your equations are now in **inline syntax**:

```
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
```

6. Manually select the equation from and use shortcut to make it rendered.
   - Shortcut: `ctrl/cmd + shift + E`

### Before & After

**Before:**

```
\[E = mc^2\]
```

**After:**

```
$E = mc^2$
```

## 🛠️ Technical Details

- **Manifest Version:** 3
- **Permissions:** `activeTab`, `scripting`
- **Content Scripts:** Runs on `*.notion.so/*` and `*.notion.site/*`
- **Framework:** Vanilla JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/davidwkk/notion-equation-converter.git
cd notion-equation-converter

# Load in Chrome for testing
# Go to chrome://extensions/, enable Developer mode, click "Load unpacked"
```

## 🚀 Future Development Plan

### Auto-Rendering Feature

- **Goal**: Automatically render equations after conversion from `\[ \]` to `$ $`
- **Current State**: Users need to manually select and use `ctrl/cmd + shift + E` to render
- **Target**: Eliminate manual rendering step for seamless equation conversion
- **Technical Challenge**: Automatically trigger Notion's equation rendering after conversion

## 📝 Changelog

### Version 1.0 (2025-09-06)

- Initial release
- Basic equation conversion functionality
- Chrome extension popup interface

## 🐛 Issues & Support

- **Bug Reports:** [GitHub Issues](https://github.com/davidwkk/notion-equation-converter/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/davidwkk/notion-equation-converter/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Notion community
- Thanks to all contributors and users

---

**Made with ❤️ for Notion users who love math**
