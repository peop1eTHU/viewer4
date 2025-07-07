// --- 常量与状态 ---
const IMAGE_EXTS = window.electronAPI.getImageExtensions();
const VIDEO_EXTS = window.electronAPI.getVideoExtensions();
let commandList = []; // 从文件夹列表变为指令列表
let allFiles = [];
let currentFilter = 'all';
let currentFilePath = null; // 新增: 存储当前显示文件的路径

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
const saveRulesBtn = document.getElementById('save-rules-btn');
const configStatus = document.getElementById('config-status');
const container = document.querySelector('.container');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const nextLocalBtn = document.getElementById('next-local-btn');

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

// showRandomFile 函数需要修改，以保存当前文件路径并更新按钮状态
function showRandomFile(fileList = null, sourceDescription = '全局') {
    // 如果没有提供文件列表，则使用全局过滤后的列表
    const filesToShowFrom = fileList || getFilteredFiles();

    if (filesToShowFrom.length === 0) {
        infoText.style.display = 'block';
        imageViewer.style.display = 'none';
        videoViewer.style.display = 'none';
        infoText.textContent = `在 "${sourceDescription}" 范围内没有可显示的文件。`;
        filePathEl.textContent = '';
        currentFilePath = null; // 清空当前文件路径
        nextLocalBtn.disabled = true; // 禁用局部随机按钮
        return;
    }

    // 从提供的列表中随机选择一个文件
    // 为了防止连续显示同一个文件，可以加一个简单的判断
    let randomIndex;
    let randomFile;
    do {
        randomIndex = Math.floor(Math.random() * filesToShowFrom.length);
        randomFile = filesToShowFrom[randomIndex];
    } while (filesToShowFrom.length > 1 && randomFile === currentFilePath);
    
    currentFilePath = randomFile; // *** 核心: 保存当前文件路径 ***
    nextLocalBtn.disabled = false; // 启用局部随机按钮

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

// --- 新增: 处理局部随机的函数 ---
async function showRandomFileLocal() {
    if (!currentFilePath) {
        // 如果还没有显示任何文件，则此功能不可用
        // 可以在这里给用户一个提示，或者直接忽略
        console.warn('No current file to determine the local folder.');
        return;
    }

    const localFiles = await window.electronAPI.scanFolderOfFile(currentFilePath);

    // 使用 showRandomFile 函数来显示，传入局部文件列表
    showRandomFile(localFiles, '当前文件夹');
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

// 全局随机按钮
nextBtn.addEventListener('click', () => showRandomFile()); // 确保不带参数调用，使用全局列表

// 局部随机按钮
nextLocalBtn.addEventListener('click', showRandomFileLocal);

filterRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentFilter = event.target.value;
        updateFilterCount(); // 切换模式时更新计数
    });
});

async function initializeApp() {
    // 1. 自动加载上次保存的配置
    const loadedCommands = await window.electronAPI.loadConfig();
    if (loadedCommands && loadedCommands.length > 0) {
        commandList = loadedCommands;
        updateCommandListUI();
        configStatus.textContent = '已加载上次的规则。';
        setTimeout(() => configStatus.textContent = '', 3000);
    }

    nextLocalBtn.disabled = true; // 初始时禁用
    // 2. 根据加载的配置（或空配置）刷新文件列表
    await rescanAndRefresh();
}

// --- 新增: 保存按钮的事件监听器 ---
saveRulesBtn.addEventListener('click', async () => {
    configStatus.textContent = '正在保存...';
    const result = await window.electronAPI.saveConfig(commandList);
    
    if (result.success) {
        configStatus.style.color = '#98c379'; // 成功-绿色
        configStatus.textContent = '规则已成功保存！';
    } else {
        configStatus.style.color = '#e06c75'; // 失败-红色
        configStatus.textContent = `保存失败: ${result.error}`;
    }

    // 3秒后清除状态消息
    setTimeout(() => {
        configStatus.textContent = '';
    }, 3000);
});

function toggleSidebar() {
    container.classList.toggle('sidebar-hidden');
    container.classList.toggle('sidebar-visible');
}

// **新增**: 侧边栏切换按钮的点击事件
sidebarToggleBtn.addEventListener('click', toggleSidebar);

// 键盘事件监听器需要更新
window.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    switch (event.code) {
        case 'Space':
            event.preventDefault(); 
            showRandomFile(); // 全局随机
            break;
        
        case 'Tab':
            event.preventDefault(); // 阻止 Tab 的默认行为 (切换焦点)
            if (!nextLocalBtn.disabled) {
                showRandomFileLocal(); // 局部随机
            }
            break;

        case 'KeyT':
            toggleSidebar();
            break;
    }
});



// --- 启动应用 ---
// 在脚本末尾调用初始化函数
initializeApp();