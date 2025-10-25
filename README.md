# Notion Equation Converter

A Chrome extension that converts LaTeX block equations `\[ \]` and `\( \)` to inline equations (unrendered) `$ $` in Notion pages.

## 🚀 Features

- **One-click conversion** of all `\[equation\]` and `\(equation\)` patterns to `$equation$`
- **Real-time auto-conversion** as you type
- **Smart filtering** - ignores empty brackets `\[\]` or `\( \)` and whitespace-only patterns
- **Works on all Notion pages** (notion.so and notion.site)
- **Simple and lightweight** - no permissions beyond active tab
- **Preserves equation content** - only changes the delimiters

## 📥 Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store page](https://chromewebstore.google.com/detail/notion-equation-converter/hbonknccbfmeogcdehnmichghfbmedjj)
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
2. Type equations using `\[` and `\]` or `\(` and `\)`:

```
The quadratic formula is \[x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}\]
Einstein's famous equation is \(E = mc^2\)
```

3. Click the extension icon in your toolbar
4. Click "Convert \[ \] and \( \) to $ $"
5. Your equations are now in **inline syntax**:

```
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
Einstein's famous equation is $E = mc^2$
```

6. Manually select the equation and use shortcut to make it rendered.
   - Shortcut: `ctrl/cmd + shift + E`

### Auto-Convert Mode

Toggle "Auto Convert" in the popup to automatically convert `\[ \]` and `\( \)` to `$ $` as you type. Empty brackets like `\[\]` or `\( \)` are ignored.

### Before & After

**Before:**

```
\[E = mc^2\]
\(F = ma\)
```

**After:**

```
$E = mc^2$
$F = ma$
```

## 🛠️ Technical Details

- **Manifest Version:** 3
- **Permissions:** `activeTab`, `storage`
- **Content Scripts:** Runs on `*.notion.so/*` and `*.notion.site/*`
- **Framework:** Vanilla JavaScript
- **Regex Pattern:** `/\\\[(\s*\S[\s\S]*?)\\\]/g` and `/\\\((\s*\S[\s\S]*?)\\\)/g` - captures content with at least one non-whitespace character

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

### Version 1.0

- Initial release
- Basic equation conversion functionality
- Chrome extension popup interface

### Auto-Convert Toggle (v1.1)

- New toggle in the popup for real-time auto-conversion
- Default: OFF (manual one-click conversion only)
- When enabled, any newly typed `\[ ... \]` is immediately changed to `$ ... $`
- **Enhanced regex**: Now ignores empty/whitespace-only brackets for better accuracy
- **Improved performance**: Better text node filtering and mutation handling

### Security Enhancement (v1.2)

- **Removed unnecessary `scripting` permission** to improve security and privacy
- **Minimal permissions** now only include `activeTab` and `storage`
- **Better extension hygiene** by following Chrome Web Store best practices

### Parentheses Support (v1.3)

- **Added support for `\( ... \)` delimiters** in addition to `\[ ... \]`
- **Updated UI** to reflect support for both delimiter types
- **Enhanced regex patterns** for both bracket and parentheses formats
- **Improved documentation** with examples for both delimiter types

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