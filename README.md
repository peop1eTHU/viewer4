# 再次到达的星空～新生之芽与抉择之歌，以希望之躯 (Viewer4)


这是一个使用 [Electron](https://www.electronjs.org/) 构建的高级桌面应用程序，旨在帮助您以强大而灵活的方式随机浏览本地文件夹中的图片和视频。它不仅仅是一个简单的查看器，更是一个通过自定义规则来创建和探索媒体集合的工具。

![alt text](image.png)

---

## ✨ 功能特性

*   **高级规则系统**:
    *   **指令列表**: 通过添加“包含”和“排除”文件夹的指令，精确控制您的媒体文件来源。指令按顺序执行，提供了强大的过滤能力。
    *   **示例**: 您可以先包含一个大的图片库，然后排除其中的 `RAW` 或 `Work-in-Progress` 子文件夹。

*   **灵活的浏览模式**:
    *   **全局随机 (`空格键`)**: 在所有规则生效后的最终文件列表中进行随机浏览。
    *   **局部随机 (`Tab` 键)**: 当您看到一个感兴趣的文件时，可以立即切换到只在该文件所在的文件夹（及其子文件夹）内进行随机浏览，深入探索。

*   **沉浸式体验**:
    *   **可收起侧边栏 (`T` 键)**: 一键隐藏所有设置面板，让媒体内容占据整个窗口，专注于浏览。
    *   **快捷键优先**: 设计了完整的快捷键支持，让您可以脱离鼠标进行高效操作。

*   **配置持久化**:
    *   **自动保存/加载**: 应用会自动保存您的规则列表，并在下次启动时加载，无需重复配置。

*   **媒体类型过滤**:
    *   在“混合”、“仅图片”、“仅视频”三种模式间自由切换，以适应不同的浏览需求。

*   **广泛的格式支持**: 支持所有常见的图片 (`.jpg`, `.png`, `.gif` 等) 和视频 (`.mp4`, `.mkv`, `.webm` 等) 格式。

---

## 🚀 安装与运行

确保您的电脑上已经安装了 [Node.js](https://nodejs.org/) (它会自动包含 npm)。

1.  **克隆或下载项目**
    将本项目下载或使用 Git 克隆到您的本地机器上。
    ```bash
    git clone https://github.com/peop1eTHU/viewer4.git
    ```

2.  **进入项目目录**
    ```bash
    cd viewer4
    ```

3.  **安装依赖**
    在项目根目录下打开终端，运行以下命令来安装所有必需的依赖项。
    ```bash
    npm install
    ```

4.  **启动应用**
    安装完成后，运行以下命令来启动应用程序。
    ```bash
    npm start
    ```

---

## 📖 使用指南

1.  **建立规则**:
    *   点击 **"添加包含文件夹"** 来选择一个或多个作为基础媒体库的文件夹。
    *   如果需要，点击 **"添加排除文件夹"** 来移除特定子文件夹中的内容。
    *   规则会按顺序显示在列表中。您可以随时点击 **"X"** 删除任意一条规则。

2.  **保存配置**:
    *   当您对规则列表满意后，点击 **"保存规则"**。您的配置将被保存，并在下次启动时自动加载。

3.  **开始浏览**:
    *   按下 **`空格键`** 或点击 **"下一张"** 按钮，开始在您的整个媒体库中随机探索。
    *   当您看到一个来自有趣文件夹的图片或视频时，按下 **`Tab`** 键或点击 **"下一张 (局部)"**，即可在该文件夹内进行深入探索。

4.  **切换视图**:
    *   按下 **`T`** 键或点击侧边栏边缘的切换按钮，可以隐藏或显示设置面板，进入沉浸式浏览模式。

5.  **过滤内容**:
    *   在左侧面板的“过滤模式”中选择您想看的内容类型。

---

## ⌨️ 快捷键列表

| 按键        | 功能                                     |
| ----------- | ---------------------------------------- |
| `空格 (Space)` | **全局随机**: 从最终文件列表中随机选择下一个。 |
| `Tab`       | **局部随机**: 在当前文件所在的文件夹内随机选择下一个。 |
| `T`         | **切换界面**: 显示或隐藏左侧的设置面板。       |

---

## 🛠️ 项目结构

```
random-media-viewer/
├── package.json     # 项目配置和依赖
├── main.js          # Electron 主进程 (处理窗口、文件系统、配置读写)
├── preload.js       # 预加载脚本 (主进程和渲染进程之间的安全桥梁)
├── index.html       # 应用的 HTML 结构 (UI 界面)
├── renderer.js      # 渲染进程的 JavaScript (处理用户交互和 UI 更新)
└── styles.css       # 应用的 CSS 样式
```

---

## 📄 许可证

本项目采用 MIT 许可证。