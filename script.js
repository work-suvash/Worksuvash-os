class WebOS {
    constructor() {
        this.windows = [];
        this.zIndex = 100;
        this.fileSystem = {
            '/': {
                'Documents': {
                    'welcome.txt': 'Welcome to Worksuvash OS!\n\nThis is a basic web-based operating system with:\n- File Manager\n- Terminal\n- Notepad\n- Calculator\n- Web Browser\n- Settings\n\nEnjoy exploring!',
                    'readme.md': '# Worksuvash OS\n\nA modern web-based operating system.'
                },
                'Pictures': {},
                'Downloads': {}
            }
        };
        this.currentPath = '/';
        this.init();
    }

    init() {
        this.bootSequence();
        this.setupEventListeners();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    bootSequence() {
        setTimeout(() => {
            document.getElementById('boot-screen').classList.add('hidden');
            document.getElementById('desktop').classList.remove('hidden');
        }, 3000);
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const startMenu = document.getElementById('startMenu');
        const shutdownBtn = document.getElementById('shutdownBtn');
        
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startBtn) {
                startMenu.classList.add('hidden');
            }
        });

        shutdownBtn.addEventListener('click', () => {
            this.shutdown();
        });

        document.querySelectorAll('.app-item').forEach(item => {
            item.addEventListener('click', () => {
                const appName = item.dataset.app;
                this.openApp(appName);
                startMenu.classList.add('hidden');
            });
        });

        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const appName = icon.dataset.app;
                this.openApp(appName);
            });
        });
    }

    updateClock() {
        const clock = document.getElementById('clock');
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clock.textContent = `${hours}:${minutes}`;
    }

    openApp(appName) {
        let windowData;
        
        switch(appName) {
            case 'file-manager':
                windowData = {
                    title: '📁 File Manager',
                    content: this.createFileManagerContent(),
                    width: 600,
                    height: 400
                };
                break;
            case 'terminal':
                windowData = {
                    title: '💻 Terminal',
                    content: this.createTerminalContent(),
                    width: 600,
                    height: 400
                };
                break;
            case 'notepad':
                windowData = {
                    title: '📝 Notepad',
                    content: this.createNotepadContent(),
                    width: 500,
                    height: 400
                };
                break;
            case 'calculator':
                windowData = {
                    title: '🔢 Calculator',
                    content: this.createCalculatorContent(),
                    width: 350,
                    height: 450
                };
                break;
            case 'browser':
                windowData = {
                    title: '🌐 Web Browser',
                    content: this.createBrowserContent(),
                    width: 700,
                    height: 500
                };
                break;
            case 'settings':
                windowData = {
                    title: '⚙️ Settings',
                    content: this.createSettingsContent(),
                    width: 500,
                    height: 400
                };
                break;
            default:
                return;
        }

        const windowId = this.createWindow(windowData);
        
        if (appName === 'terminal') {
            setTimeout(() => {
                const input = document.getElementById('terminalInput');
                if (input) {
                    input.focus();
                    this.setupTerminal(windowId);
                }
            }, 100);
        } else if (appName === 'calculator') {
            setTimeout(() => {
                this.setupCalculator(windowId);
            }, 100);
        }
    }

    createWindow({ title, content, width, height }) {
        const windowId = `window-${Date.now()}`;
        const windowsContainer = document.getElementById('windows-container');
        
        const windowEl = document.createElement('div');
        windowEl.className = 'window active';
        windowEl.id = windowId;
        windowEl.style.width = `${width}px`;
        windowEl.style.height = `${height}px`;
        windowEl.style.left = `${50 + this.windows.length * 30}px`;
        windowEl.style.top = `${50 + this.windows.length * 30}px`;
        windowEl.style.zIndex = ++this.zIndex;

        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <button class="window-control minimize">−</button>
                    <button class="window-control maximize">□</button>
                    <button class="window-control close">×</button>
                </div>
            </div>
            <div class="window-content">${content}</div>
        `;

        windowsContainer.appendChild(windowEl);
        this.windows.push(windowId);

        this.setupWindowEvents(windowId);
        this.updateTaskbar();

        return windowId;
    }

    setupWindowEvents(windowId) {
        const windowEl = document.getElementById(windowId);
        const header = windowEl.querySelector('.window-header');
        const closeBtn = windowEl.querySelector('.close');
        const minimizeBtn = windowEl.querySelector('.minimize');
        const maximizeBtn = windowEl.querySelector('.maximize');

        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            
            isDragging = true;
            this.bringToFront(windowId);
            
            const rect = windowEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            windowEl.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            windowEl.style.left = `${Math.max(0, x)}px`;
            windowEl.style.top = `${Math.max(0, y)}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                windowEl.style.cursor = 'default';
            }
        });

        windowEl.addEventListener('mousedown', () => {
            this.bringToFront(windowId);
        });

        closeBtn.addEventListener('click', () => {
            this.closeWindow(windowId);
        });

        minimizeBtn.addEventListener('click', () => {
            windowEl.style.display = 'none';
        });

        maximizeBtn.addEventListener('click', () => {
            if (windowEl.style.width === '100%') {
                windowEl.style.width = '600px';
                windowEl.style.height = '400px';
                windowEl.style.left = '50px';
                windowEl.style.top = '50px';
            } else {
                windowEl.style.width = '100%';
                windowEl.style.height = 'calc(100% - 58px)';
                windowEl.style.left = '0';
                windowEl.style.top = '0';
            }
        });
    }

    bringToFront(windowId) {
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        const windowEl = document.getElementById(windowId);
        windowEl.classList.add('active');
        windowEl.style.zIndex = ++this.zIndex;
    }

    closeWindow(windowId) {
        const windowEl = document.getElementById(windowId);
        windowEl.remove();
        this.windows = this.windows.filter(id => id !== windowId);
        this.updateTaskbar();
    }

    updateTaskbar() {
        const taskbarApps = document.getElementById('taskbarApps');
        taskbarApps.innerHTML = '';

        this.windows.forEach(windowId => {
            const windowEl = document.getElementById(windowId);
            if (!windowEl) return;

            const title = windowEl.querySelector('.window-title').textContent;
            const isActive = windowEl.classList.contains('active');
            const isVisible = windowEl.style.display !== 'none';

            const taskbarApp = document.createElement('div');
            taskbarApp.className = `taskbar-app ${isActive ? 'active' : ''}`;
            taskbarApp.textContent = title;
            
            taskbarApp.addEventListener('click', () => {
                if (isVisible && isActive) {
                    windowEl.style.display = 'none';
                } else {
                    windowEl.style.display = 'flex';
                    this.bringToFront(windowId);
                }
            });

            taskbarApps.appendChild(taskbarApp);
        });
    }

    createFileManagerContent() {
        const files = this.fileSystem[this.currentPath];
        let fileListHtml = '';

        for (const [name, content] of Object.entries(files)) {
            const isFolder = typeof content === 'object' && !Array.isArray(content);
            const icon = isFolder ? '📁' : '📄';
            fileListHtml += `
                <div class="file-item" data-name="${name}" data-type="${isFolder ? 'folder' : 'file'}">
                    <span>${icon}</span>
                    <span>${name}</span>
                </div>
            `;
        }

        return `
            <div class="file-manager-toolbar">
                <button class="toolbar-btn">⬅️ Back</button>
                <button class="toolbar-btn">🏠 Home</button>
                <button class="toolbar-btn">➕ New Folder</button>
            </div>
            <div class="file-list">
                ${fileListHtml}
            </div>
        `;
    }

    createTerminalContent() {
        return `
            <div class="terminal-output" id="terminalOutput">Worksuvash OS Terminal v1.0
Type 'help' for available commands.

</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">$</span>
                <input type="text" id="terminalInput" autocomplete="off">
            </div>
        `;
    }

    setupTerminal(windowId) {
        const input = document.getElementById('terminalInput');
        const output = document.getElementById('terminalOutput');

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                const result = this.executeCommand(command);
                
                output.textContent += `$ ${command}\n${result}\n\n`;
                input.value = '';
                
                const windowEl = document.getElementById(windowId);
                const content = windowEl.querySelector('.window-content');
                content.scrollTop = content.scrollHeight;
            }
        });
    }

    executeCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];

        switch(cmd) {
            case 'help':
                return 'Available commands:\n  help - Show this help\n  echo - Print text\n  date - Show current date\n  clear - Clear terminal\n  ls - List files\n  whoami - Display current user';
            case 'echo':
                return parts.slice(1).join(' ');
            case 'date':
                return new Date().toString();
            case 'clear':
                setTimeout(() => {
                    document.getElementById('terminalOutput').textContent = '';
                }, 10);
                return '';
            case 'ls':
                const files = Object.keys(this.fileSystem[this.currentPath]);
                return files.join('  ');
            case 'whoami':
                return 'user@worksuvash-os';
            default:
                return `Command not found: ${cmd}`;
        }
    }

    createNotepadContent() {
        return `
            <textarea class="notepad-textarea" placeholder="Start typing..."></textarea>
        `;
    }

    createCalculatorContent() {
        return `
            <div class="calculator-display" id="calcDisplay">0</div>
            <div class="calculator-buttons">
                <button class="calc-btn" data-value="7">7</button>
                <button class="calc-btn" data-value="8">8</button>
                <button class="calc-btn" data-value="9">9</button>
                <button class="calc-btn operator" data-value="/">÷</button>
                
                <button class="calc-btn" data-value="4">4</button>
                <button class="calc-btn" data-value="5">5</button>
                <button class="calc-btn" data-value="6">6</button>
                <button class="calc-btn operator" data-value="*">×</button>
                
                <button class="calc-btn" data-value="1">1</button>
                <button class="calc-btn" data-value="2">2</button>
                <button class="calc-btn" data-value="3">3</button>
                <button class="calc-btn operator" data-value="-">−</button>
                
                <button class="calc-btn" data-value="0">0</button>
                <button class="calc-btn" data-value=".">.</button>
                <button class="calc-btn operator" data-value="=">=</button>
                <button class="calc-btn operator" data-value="+">+</button>
                
                <button class="calc-btn operator" data-value="C" style="grid-column: span 4;">Clear</button>
            </div>
        `;
    }

    setupCalculator(windowId) {
        let currentValue = '0';
        let previousValue = '';
        let operation = '';

        const display = document.getElementById('calcDisplay');
        const buttons = document.querySelectorAll(`#${windowId} .calc-btn`);

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;

                if (value === 'C') {
                    currentValue = '0';
                    previousValue = '';
                    operation = '';
                    display.textContent = '0';
                } else if (['+', '-', '*', '/'].includes(value)) {
                    previousValue = currentValue;
                    operation = value;
                    currentValue = '0';
                } else if (value === '=') {
                    if (previousValue && operation) {
                        const prev = parseFloat(previousValue);
                        const curr = parseFloat(currentValue);
                        let result;

                        switch(operation) {
                            case '+': result = prev + curr; break;
                            case '-': result = prev - curr; break;
                            case '*': result = prev * curr; break;
                            case '/': result = prev / curr; break;
                        }

                        currentValue = result.toString();
                        display.textContent = currentValue;
                        previousValue = '';
                        operation = '';
                    }
                } else {
                    if (currentValue === '0') {
                        currentValue = value;
                    } else {
                        currentValue += value;
                    }
                    display.textContent = currentValue;
                }
            });
        });
    }

    createBrowserContent() {
        return `
            <div class="browser-toolbar">
                <button class="toolbar-btn">⬅️</button>
                <button class="toolbar-btn">➡️</button>
                <button class="toolbar-btn">🔄</button>
                <input type="text" class="browser-input" placeholder="Enter URL..." value="about:blank">
                <button class="toolbar-btn">Go</button>
            </div>
            <div style="padding: 20px; color: #888; text-align: center;">
                <h2>Web Browser</h2>
                <p>Enter a URL to browse the web</p>
                <p style="margin-top: 20px; font-size: 0.9rem;">Note: This is a demo browser interface</p>
            </div>
        `;
    }

    createSettingsContent() {
        return `
            <div class="settings-section">
                <h3>Appearance</h3>
                <div class="setting-item">
                    <span>Theme</span>
                    <select class="setting-input">
                        <option>Dark (Default)</option>
                        <option>Light</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h3>System</h3>
                <div class="setting-item">
                    <span>OS Name</span>
                    <input type="text" class="setting-input" value="Worksuvash OS" readonly>
                </div>
                <div class="setting-item">
                    <span>Version</span>
                    <input type="text" class="setting-input" value="1.0.0" readonly>
                </div>
            </div>
            <div class="settings-section">
                <h3>About</h3>
                <div class="setting-item">
                    <p>Worksuvash OS is a web-based operating system built with modern web technologies.</p>
                </div>
            </div>
        `;
    }

    shutdown() {
        document.getElementById('desktop').classList.add('hidden');
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.classList.remove('hidden');
        
        const bootText = bootScreen.querySelector('.boot-text');
        bootText.textContent = 'Shutting down...';
        
        setTimeout(() => {
            bootText.textContent = 'System halted. You can close this window.';
            document.querySelector('.boot-bar').style.animation = 'none';
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WebOS();
});
