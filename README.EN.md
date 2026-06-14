# Tore

A completely offline modern multi-editor desktop application designed for developers and text workers. Built with Electron + Vue 3, requires no internet connection, providing powerful JSON editing, text editing, code editing, and history management features — all data stays on your machine.

<p align="center">
  <a href="README.md">简体中文</a> | <a href="README.EN.md">English</a>
</p>

> ## 🔒 100% Offline · Your Data Stays Yours
>
> **Tore is a completely offline desktop application.**
>
> - 🚫 **No network required** — all features run locally, works perfectly without internet
> - 💾 **Local storage only** — uses local SQLite database, files saved wherever you choose
> - 🛡️ **Zero data collection** — no telemetry, no usage tracking, nothing leaves your machine
> - 🔑 **You own your data** — no accounts, no cloud sync, everything under your control
>
> In an era where more and more tools upload your data to unknown servers, Tore keeps you in full control.

## ✨ Core Features

### 🏠 Unified Workspace

- **Quick Launch** - One-click launch of various editors
- **Recent Files** - Quick access to recently edited files
- **Personalized Configuration** - Customize workspace layout and themes
- **Drag & Drop Sorting** - Support tab drag-and-drop sorting

### 🔧 JSON Editor

- **Smart Formatting** - Automatically format and compress JSON data
- **Syntax Validation** - Real-time JSON syntax error detection
- **Diff Comparison** - Visually compare differences between two JSON files
- **History Records** - Save edit history with version recovery support

### 📝 Text Editor

- **Multi-format Support** - Support for Markdown, plain text, and more
- **Syntax Highlighting** - Automatic highlighting based on file type
- **Live Preview** - Real-time Markdown preview functionality
- **Quick Actions** - Common text operation toolbar

### 💻 Code Editor

- **Multi-language Support** - Support for JavaScript, Python, Java, and more
- **Code Completion** - Intelligent code suggestions and auto-completion
- **Syntax Checking** - Real-time code syntax validation
- **Theme Switching** - Multiple editor themes available

### 📊 History Management

- **Operation Tracking** - Record all editing operations
- **Version Comparison** - Compare changes between different versions
- **Timeline View** - Intuitive timeline display
- **Data Recovery** - One-click restore to historical versions

## 🚀 Quick Start

### Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0
- Windows / macOS / Linux

### Install Dependencies

```bash
# Install main project dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

### Development Mode

```bash
# Start complete development environment
npm run dev

# Start frontend development server only
npm run dev-frontend

# Start Electron main process only
npm run dev-electron
```

### Build Application

```bash
# Complete build process
npm run build

# Build individual components
npm run build-frontend    # Build frontend
npm run build-electron    # Build Electron
npm run encrypt           # Code encryption
```

### Package Release

```bash
# Windows 64-bit
npm run build-w

# macOS
npm run build-m

# macOS ARM64 (Apple Silicon)
npm run build-m-arm64

# Linux
npm run build-l
```

## 📖 User Guide

### JSON Editor Usage

1. **Open JSON Editor**

   - Click "JSON Formatting Tool" from the home workspace
   - Or navigate to JSON Editor via menu

2. **Basic Operations**

   - Paste or import JSON data into the editor
   - Click "Format" button to beautify JSON format
   - Use "Compress" button to compress JSON data
   - Enable "Dual Panel" mode for comparison

3. **Advanced Features**
   - Use diff comparison to view JSON changes
   - View history to restore previous versions
   - Set auto-save interval to prevent data loss

### Text Editor Usage

1. **Open Text Editor**

   - Select "Text Editor" from home page
   - Or drag and drop text files directly into the app

2. **File Operations**

   - Support creating, opening, saving text files
   - Support multiple text format import/export
   - Auto-detect file type and encoding

3. **Editing Features**
   - Rich text editing tools
   - Find and replace functionality
   - Markdown live preview

### Code Editor Usage

1. **Open Code Editor**

   - Launch "Code Editor" from home page
   - Support multiple programming language files

2. **Code Editing**

   - Intelligent code completion and syntax highlighting
   - Code folding and indentation control
   - Multi-cursor editing support

3. **Code Tools**
   - Code formatting and beautification
   - Syntax error checking
   - Code snippet management

### History Management Usage

1. **View History**

   - View operation history in each editor
   - Timeline view displays all versions

2. **Version Comparison**

   - Select different versions for comparison
   - Highlight changed content

3. **Restore Version**
   - One-click restore to any historical version
   - Support selective partial content recovery

## 🎯 System Requirements

### Supported Operating Systems

- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15+ (Intel & Apple Silicon)
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 32+

## ❓ FAQ

### Q: How to switch application language?

A: The application supports Chinese and English. You can switch the interface language in settings.

### Q: Is edited data automatically saved?

A: JSON Editor supports auto-save functionality. You can adjust the save interval in settings. We recommend manually saving important data regularly.

### Q: How to edit multiple files simultaneously?

A: The application supports multi-tab mode. You can open multiple editor instances at the same time. Right-click on a tab and select "Copy Tab" to create a new instance.

### Q: What file formats are supported?

A:

- JSON Editor: .json, .jsonc
- Text Editor: .txt, .md, .markdown
- Code Editor: .js, .ts, .py, .java, .cpp, .go, .rb, .sql, .xml, .yaml, .toml, .ini, .sh, .dockerfile, etc.

### Q: How to customize themes?

A: The application includes multiple themes that can be switched in settings. Custom theme color configuration is also supported.

### Q: What to do if build fails?

A:

1. Ensure Node.js version meets requirements
2. Delete `node_modules` and `package-lock.json`, then reinstall dependencies
3. Clear build cache: delete `out` and `dist` directories
4. Check if system has sufficient disk space

### Q: Where is application data stored?

A: Application data is stored in local SQLite database. Location varies by operating system:

- Windows: `%APPDATA%/Tore/`
- macOS: `~/Library/Application Support/Tore/`
- Linux: `~/.config/Tore/`

## 🤝 Contributing

Contributions are welcome! Feel free to submit code, report issues, or suggest improvements.

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Ant Design Vue](https://antdv.com/) - Enterprise UI component library
- [CodeMirror](https://codemirror.net/) - Code editor component
- [ee-core](https://github.com/dromara/electron-egg) - Electron application development framework
