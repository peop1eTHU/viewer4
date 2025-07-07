// 支持的文件扩展名 (通过 preload 获取)
const IMAGE_EXTS = window.electronAPI.getImageExtensions();
const VIDEO_EXTS = window.electronAPI.getVideoExtensions();

// --- 状态管理 ---
let sourceFolders = [];
let allFiles = [];
let currentFilter = 'all';

// --- DOM 元素引用 ---
const addFolderBtn = document.getElementById('add-folder-btn');
const folderList = document.getElementById('folder-list');
const nextBtn = document.getElementById('next-btn');
const fileCountEl = document.getElementById('file-count');
const imageViewer = document.getElementById('image-viewer');
const videoViewer = document.getElementById('video-viewer');
const infoText = document.getElementById('info-text');
const filePathEl = document.getElementById('file-path');
const filterRadios = document.querySelectorAll('input[name="filter"]');

// --- 函数 ---

// 更新UI上的文件夹列表
function updateFolderListUI() {
    folderList.innerHTML = '';
    sourceFolders.forEach(folder => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = folder;
        li.appendChild(span);
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-folder-btn');
        removeBtn.dataset.folder = folder; // 将路径存储在data属性中
        li.appendChild(removeBtn);

        folderList.appendChild(li);
    });
}

// 重新扫描所有文件夹并更新文件列表
async function rescanAndRefresh() {
    infoText.textContent = '正在扫描文件夹...';
    allFiles = await window.electronAPI.scanFolders(sourceFolders);
    fileCountEl.textContent = `文件总数: ${allFiles.length}`;
    if (allFiles.length > 0) {
        infoText.textContent = '准备就绪！点击“下一张”开始。';
    } else {
        infoText.textContent = '未找到媒体文件。请添加包含图片或视频的文件夹。';
    }
}

// 显示一个随机文件
function showRandomFile() {
    let filteredFiles = allFiles;

    // 根据当前过滤器筛选文件
    if (currentFilter === 'images') {
        filteredFiles = allFiles.filter(file => IMAGE_EXTS.some(ext => file.toLowerCase().endsWith(ext)));
    } else if (currentFilter === 'videos') {
        filteredFiles = allFiles.filter(file => VIDEO_EXTS.some(ext => file.toLowerCase().endsWith(ext)));
    }

    if (filteredFiles.length === 0) {
        infoText.style.display = 'block';
        imageViewer.style.display = 'none';
        videoViewer.style.display = 'none';
        infoText.textContent = '当前过滤模式下没有文件。';
        filePathEl.textContent = '';
        return;
    }

    // 随机选择一个文件
    const randomIndex = Math.floor(Math.random() * filteredFiles.length);
    const randomFile = filteredFiles[randomIndex];

    // 隐藏提示信息
    infoText.style.display = 'none';

    // 检查文件类型并显示
    const extension = '.' + randomFile.split('.').pop().toLowerCase();
    if (IMAGE_EXTS.includes(extension)) {
        imageViewer.src = `file://${randomFile}`; // 本地文件需要 'file://' 协议
        imageViewer.style.display = 'block';
        videoViewer.style.display = 'none';
        videoViewer.pause();
        videoViewer.src = '';
    } else if (VIDEO_EXTS.includes(extension)) {
        videoViewer.src = `file://${randomFile}`;
        videoViewer.style.display = 'block';
        imageViewer.style.display = 'none';
        imageViewer.src = '';
    }

    filePathEl.textContent = randomFile;
}

// --- 事件监听器 ---

// 添加文件夹按钮
addFolderBtn.addEventListener('click', async () => {
    const folders = await window.electronAPI.selectFolders();
    if (folders.length > 0) {
        // 防止重复添加
        sourceFolders = [...new Set([...sourceFolders, ...folders])];
        updateFolderListUI();
        await rescanAndRefresh();
    }
});

// 移除文件夹（使用事件委托）
folderList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('remove-folder-btn')) {
        const folderToRemove = event.target.dataset.folder;
        sourceFolders = sourceFolders.filter(f => f !== folderToRemove);
        updateFolderListUI();
        await rescanAndRefresh();
    }
});

// 下一张/下一个 按钮
nextBtn.addEventListener('click', showRandomFile);

// 过滤模式单选按钮
filterRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentFilter = event.target.value;
        // 切换模式后可以立即显示一个，或者等待用户点击“下一张”
        // 这里我们选择让用户自己点击
        let count = 0;
        if (currentFilter === 'images') count = allFiles.filter(file => IMAGE_EXTS.some(ext => file.toLowerCase().endsWith(ext))).length;
        else if(currentFilter === 'videos') count = allFiles.filter(file => VIDEO_EXTS.some(ext => file.toLowerCase().endsWith(ext))).length;
        else count = allFiles.length;

        fileCountEl.textContent = `当前模式文件数: ${count}`;

    });
});