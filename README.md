# Tore

一个现代化的多编辑器桌面应用，专为开发者和文本工作者设计。基于 Electron + Vue 3 构建，提供强大的 JSON 编辑、文本编辑、代码编辑和历史记录管理功能。

<p align="center">
  <a href="README.md">简体中文</a> | <a href="README.EN.md">English</a>
</p>

## ✨ 核心功能

### 🏠 统一工作台

- **快速启动** - 一键启动各种编辑器
- **最近文件** - 快速访问最近编辑的文件
- **个性化配置** - 自定义工作台布局和主题
- **拖拽排序** - 支持标签页拖拽排序

### 🔧 JSON 编辑器

- **智能格式化** - 自动格式化和压缩 JSON 数据
- **语法验证** - 实时检测 JSON 语法错误
- **差异对比** - 直观对比两个 JSON 文件的差异
- **历史记录** - 保存编辑历史，支持版本恢复

### 📝 文本编辑器

- **多格式支持** - 支持 Markdown、纯文本等多种格式
- **语法高亮** - 根据文件类型自动高亮显示
- **实时预览** - Markdown 实时预览功能
- **快捷操作** - 常用文本操作工具栏

### 💻 代码编辑器

- **多语言支持** - 支持 JavaScript、Python、Java 等多种编程语言
- **代码补全** - 智能代码提示和自动补全
- **语法检查** - 实时代码语法检查
- **主题切换** - 多种编辑器主题可选

### 📊 历史记录管理

- **操作追踪** - 记录所有编辑操作
- **版本对比** - 对比不同版本的变化
- **时间线视图** - 直观的时间线展示
- **数据恢复** - 一键恢复到历史版本

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Windows / macOS / Linux

### 安装依赖

```bash
# 安装主项目依赖
npm install

# 安装前端依赖
cd frontend && npm install
```

### 开发模式

```bash
# 启动完整开发环境
npm run dev

# 仅启动前端开发服务器
npm run dev-frontend

# 仅启动 Electron 主进程
npm run dev-electron
```

### 构建应用

```bash
# 完整构建流程
npm run build

# 分别构建各个部分
npm run build-frontend    # 构建前端
npm run build-electron    # 构建 Electron
npm run encrypt           # 代码加密
```

### 打包发布

```bash
# Windows 64位
npm run build-w

# macOS
npm run build-m

# macOS ARM64 (Apple Silicon)
npm run build-m-arm64

# Linux
npm run build-l
```

## 📖 使用指南

### JSON 编辑器使用

1. **打开 JSON 编辑器**

   - 从首页工作台点击"JSON 格式化工具"
   - 或通过菜单导航到 JSON 编辑器

2. **基本操作**

   - 粘贴或导入 JSON 数据到编辑器
   - 点击"格式化"按钮美化 JSON 格式
   - 使用"压缩"按钮压缩 JSON 数据
   - 开启"双面板"模式进行对比

3. **高级功能**
   - 使用差异对比功能查看 JSON 变化
   - 查看历史记录恢复之前的版本
   - 设置自动保存间隔避免数据丢失

### 文本编辑器使用

1. **打开文本编辑器**

   - 从首页选择"文本编辑器"
   - 或直接拖拽文本文件到应用中

2. **文件操作**

   - 支持新建、打开、保存文本文件
   - 支持多种文本格式导入导出
   - 自动识别文件类型和编码

3. **编辑功能**
   - 丰富的文本编辑工具
   - 查找替换功能
   - Markdown 实时预览

### 代码编辑器使用

1. **打开代码编辑器**

   - 从首页启动"代码编辑器"
   - 支持多种编程语言文件

2. **代码编辑**

   - 智能代码补全和语法高亮
   - 代码折叠和缩进控制
   - 多光标编辑支持

3. **代码工具**
   - 代码格式化和美化
   - 语法错误检查
   - 代码片段管理

### 历史记录使用

1. **查看历史**

   - 在各编辑器中查看操作历史
   - 时间线视图展示所有版本

2. **版本对比**

   - 选择不同版本进行对比
   - 高亮显示变化内容

3. **恢复版本**
   - 一键恢复到任意历史版本
   - 支持选择性恢复部分内容

## 🎯 系统要求

### 支持的操作系统

- **Windows**: Windows 10/11 (64 位)
- **macOS**: macOS 10.15+ (Intel & Apple Silicon)
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 32+

## ❓ 常见问题

### Q: 如何切换应用语言？

A: 应用支持中文和英文，可以在设置中切换界面语言。

### Q: 编辑的数据会自动保存吗？

A: JSON 编辑器支持自动保存功能，可在设置中调整保存间隔。建议定期手动保存重要数据。

### Q: 如何同时编辑多个文件？

A: 应用支持多标签页模式，可以同时打开多个编辑器实例，右键标签页选择"复制标签页"即可。

### Q: 支持哪些文件格式？

A:

- JSON 编辑器：.json, .jsonc
- 文本编辑器：.txt, .md, .markdown, .log
- 代码编辑器：.js, .ts, .py, .java, .cpp, .html, .css 等

### Q: 如何自定义主题？

A: 应用内置多种主题，可在设置中切换。也支持自定义主题颜色配置。

### Q: 构建失败怎么办？

A:

1. 确保 Node.js 版本符合要求
2. 删除 `node_modules` 和 `package-lock.json` 重新安装依赖
3. 清理构建缓存：删除 `out` 和 `dist` 目录
4. 检查系统是否有足够的磁盘空间

### Q: 应用数据存储在哪里？

A: 应用数据存储在本地 SQLite 数据库中，位置因操作系统而异：

- Windows: `%APPDATA%/Tore/`
- macOS: `~/Library/Application Support/Tore/`
- Linux: `~/.config/Tore/`

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 Apache License 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Ant Design Vue](https://antdv.com/) - 企业级 UI 组件库
- [CodeMirror](https://codemirror.net/) - 代码编辑器组件
- [ee-core](https://github.com/dromara/electron-egg) - Electron 应用开发框架
