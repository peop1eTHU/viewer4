// --- 常量与状态 ---
const IMAGE_EXTS = window.electronAPI.getImageExtensions();
const VIDEO_EXTS = window.electronAPI.getVideoExtensions();
let commandList = []; // 从文件夹列表变为指令列表
let allFiles = [];
let currentFilter = 'all';

// --- DOM 元素 ---
const addIncludeBtn = document.getElementById('add-include-btn');
const addExcludeBtn = document.getElementById('add-exclude-btn');
const commandListEl = document.getElementById('command-list');
const nextBtn = document.getElementById('next-btn');
const fileCountEl = document.getElementById('file-count');
const imageViewer = document.getElementById('image-viewer');
const videoViewer = document.getElementById('video-viewer');
const infoText = document.getElementById('info-text');
const filePathEl = document.getElementById('file-path');
const filterRadios = document.querySelectorAll('input[name="filter"]');

// --- 函数 ---

// 更新UI上的指令列表
function updateCommandListUI() {
    commandListEl.innerHTML = '';
    commandList.forEach((command, index) => {
        const li = document.createElement('li');
        li.classList.add(`command-type-${command.type}`);

        const typeText = command.type === 'include' ? '包含' : '排除';
        const typeColor = command.type === 'include' ? '#98c379' : '#e06c75';
        
        const pathSpan = document.createElement('span');
        pathSpan.className = 'command-path';
        pathSpan.textContent = command.path;
        pathSpan.title = command.path; // 鼠标悬停显示完整路径

        const typeSpan = document.createElement('span');
        typeSpan.textContent = `[${typeText}]`;
        typeSpan.style.color = typeColor;
        typeSpan.style.fontWeight = 'bold';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'X';
        removeBtn.classList.add('remove-btn');
        removeBtn.dataset.index = index; // 使用索引来定位要删除的指令

        li.appendChild(typeSpan);
        li.appendChild(pathSpan);
        li.appendChild(removeBtn);
        commandListEl.appendChild(li);
    });
}

// 根据指令列表重新计算最终文件列表
async function rescanAndRefresh() {
    infoText.textContent = '正在执行规则并扫描文件...';
    // 调用新的API
    allFiles = await window.electronAPI.scanByCommands(commandList);
    
    fileCountEl.textContent = `最终文件数: ${allFiles.length}`;
    if (allFiles.length > 0) {
        infoText.textContent = '准备就绪！点击“下一张”开始。';
    } else if (commandList.length === 0) {
        infoText.textContent = '请先添加包含规则。';
    } else {
        infoText.textContent = '根据当前规则，没有找到任何媒体文件。';
    }
    // 更新过滤模式下的文件计数
    updateFilterCount();
}

// 更新过滤模式下的文件计数
function updateFilterCount() {
    let count = 0;
    const currentFiles = getFilteredFiles();
    count = currentFiles.length;
    fileCountEl.textContent = `当前模式文件数: ${count} / 总计: ${allFiles.length}`;
}

// 根据当前过滤器获取文件列表
function getFilteredFiles() {
    if (currentFilter === 'images') {
        return allFiles.filter(file => IMAGE_EXTS.some(ext => file.toLowerCase().endsWith(ext)));
    } else if (currentFilter === 'videos') {
        return allFiles.filter(file => VIDEO_EXTS.some(ext => file.toLowerCase().endsWith(ext)));
    }
    return allFiles; // 'all' 模式
}

// 显示一个随机文件
function showRandomFile() {
    const filteredFiles = getFilteredFiles();

    if (filteredFiles.length === 0) {
        infoText.style.display = 'block';
        imageViewer.style.display = 'none';
        videoViewer.style.display = 'none';
        infoText.textContent = '当前模式下没有可显示的文件。';
        filePathEl.textContent = '';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredFiles.length);
    const randomFile = filteredFiles[randomIndex];

    infoText.style.display = 'none';
    const extension = '.' + randomFile.split('.').pop().toLowerCase();
    
    if (IMAGE_EXTS.includes(extension)) {
        imageViewer.src = `file://${randomFile}`;
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

// 通用的添加指令函数
async function addCommand(type) {
    const folders = await window.electronAPI.selectFolders();
    if (folders.length > 0) {
        folders.forEach(path => {
            commandList.push({ type, path });
        });
        updateCommandListUI();
        await rescanAndRefresh();
    }
}

// --- 事件监听器 ---

addIncludeBtn.addEventListener('click', () => addCommand('include'));
addExcludeBtn.addEventListener('click', () => addCommand('exclude'));

// 移除指令（使用事件委托）
commandListEl.addEventListener('click', async (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const indexToRemove = parseInt(event.target.dataset.index, 10);
        if (!isNaN(indexToRemove)) {
            commandList.splice(indexToRemove, 1); // 按索引移除
            updateCommandListUI();
            await rescanAndRefresh();
        }
    }
});

nextBtn.addEventListener('click', showRandomFile);

filterRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentFilter = event.target.value;
        updateFilterCount(); // 切换模式时更新计数
    });
});