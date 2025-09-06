# Notion Equation Converter

A Chrome extension that converts LaTeX block equations `\[ \]` to inline equations `$ $` in Notion pages.

![Demo](screenshots/demo.gif)

## 🚀 Features

- **One-click conversion** of all `\[equation\]` patterns to `$equation$`
- **Real-time auto-conversion** as you type (optional)
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
 git clone https://github.com/yourusername/notion-equation-converter.git
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
5. Your equations are now inline:
 ```
 The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
 ```

### Before & After

**Before:**
```
\[E = mc^2\]
\[\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}\]
```

**After:**
```
$E = mc^2$
$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$
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
git clone https://github.com/yourusername/notion-equation-converter.git
cd notion-equation-converter

# Load in Chrome for testing
# Go to chrome://extensions/, enable Developer mode, click "Load unpacked"
```

## 📝 Changelog

### Version 1.0.0 (2024-XX-XX)
- Initial release
- Basic equation conversion functionality
- Chrome extension popup interface

## 🐛 Issues & Support

- **Bug Reports:** [GitHub Issues](https://github.com/yourusername/notion-equation-converter/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/yourusername/notion-equation-converter/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Notion community
- Inspired by LaTeX equation workflows
- Thanks to all contributors and users

---

**Made with ❤️ for Notion users who love math**
