import { ComponentType, LazyExoticComponent, lazy } from 'react';
import { LucideIcon, FolderOpen, Settings, Calendar, Image, Music, Terminal, Globe, MessageSquare, FileText, Code, Store, Calculator as CalculatorIcon, Braces, Regex, Pipette, Clipboard as ClipboardIcon, Activity, Send, Trello, PlayCircle, GitBranch, Image as PaintIcon, Sparkles, Gauge } from 'lucide-react';
import { AppMenuConfig, ContextMenuConfig } from '../types';

// Menu Configurations
import {
  finderMenuConfig, finderContextMenuConfig,
  settingsMenuConfig,
  photosMenuConfig,
  musicMenuConfig,
  messagesMenuConfig,
  browserMenuConfig,
  terminalMenuConfig, terminalContextMenuConfig,
  devCenterMenuConfig,
  notepadMenuConfig,
  calendarMenuConfig,
  appStoreMenuConfig
} from './app-menus';

// Lazy Load Components
const FileManager = lazy(() => import('@/components/FileManager').then(module => ({ default: module.FileManager })));
const SettingsApp = lazy(() => import('@/components/Settings').then(module => ({ default: module.Settings })));
const Photos = lazy(() => import('@/components/apps/Photos').then(module => ({ default: module.Photos })));
const MusicApp = lazy(() => import('@/components/apps/Music').then(module => ({ default: module.Music })));
const Messages = lazy(() => import('@/components/apps/Messages').then(module => ({ default: module.Messages })));
const Browser = lazy(() => import('@/components/apps/Browser').then(module => ({ default: module.Browser })));
const TerminalApp = lazy(() => import('@/components/apps/Terminal').then(module => ({ default: module.Terminal })));
const DevCenter = lazy(() => import('@/components/apps/DevCenter').then(module => ({ default: module.DevCenter })));
const Notepad = lazy(() => import('@/components/apps/Notepad').then(module => ({ default: module.Notepad })));
const CalendarApp = lazy(() => import('@/components/apps/Calendar').then(module => ({ default: module.Calendar })));
const AppStoreComponent = lazy(() => import('@/components/apps/AppStore').then(module => ({ default: module.AppStore })));
const Calculator = lazy(() => import('@/components/apps/Calculator').then(m => ({ default: m.Calculator })));
const JsonViewer = lazy(() => import('@/components/apps/JsonViewer').then(m => ({ default: m.JsonViewer })));
const RegexTester = lazy(() => import('@/components/apps/RegexTester').then(m => ({ default: m.RegexTester })));
const ColorPicker = lazy(() => import('@/components/apps/ColorPicker').then(m => ({ default: m.ColorPicker })));
const ClipboardManager = lazy(() => import('@/components/apps/ClipboardManager').then(m => ({ default: m.ClipboardManager })));
const SystemMonitor = lazy(() => import('@/components/apps/SystemMonitor').then(m => ({ default: m.SystemMonitor })));
const ApiTester = lazy(() => import('@/components/apps/ApiTester').then(m => ({ default: m.ApiTester })));
const TaskManager = lazy(() => import('@/components/apps/TaskManager').then(m => ({ default: m.TaskManager })));
const MediaPlayer = lazy(() => import('@/components/apps/MediaPlayer').then(m => ({ default: m.MediaPlayer })));
const GitClient = lazy(() => import('@/components/apps/GitClient').then(m => ({ default: m.GitClient })));
const ImageEditor = lazy(() => import('@/components/apps/ImageEditor').then(m => ({ default: m.ImageEditor })));
const AiAssistant = lazy(() => import('@/components/apps/AiAssistant').then(m => ({ default: m.AiAssistant })));
const NetworkSpeed = lazy(() => import('@/components/apps/NetworkSpeed').then(m => ({ default: m.NetworkSpeed })));

export interface AppMetadata {
    id: string;
    name: string;
    nameKey?: string;
    description: string;
    descriptionKey?: string;
    icon: LucideIcon;
    iconColor: string;           // Gradient class for dock
    iconSolid: string;           // Solid color fallback
    category: 'productivity' | 'media' | 'utilities' | 'development' | 'system';
    isCore: boolean;             // Cannot be uninstalled
    component: ComponentType<any> | LazyExoticComponent<any>;
    dockOrder?: number;          // Order in dock (lower = earlier)
    menu?: AppMenuConfig;        // App-specific menu configuration
    contextMenu?: ContextMenuConfig; // Context menu configuration
    size?: number;               // Size in MB (approximate/simulated)
    ramUsage?: number;           // Base RAM usage in MB (gamified)
}

// Centralized App Registry
export const APP_REGISTRY: Record<string, AppMetadata> = {
    // Core Apps (cannot be uninstalled)
    finder: {
        id: 'finder',
        name: 'Finder',
        description: 'File Manager',
        descriptionKey: 'appDescriptions.finder',
        icon: FolderOpen,
        iconColor: 'from-blue-500 to-blue-600',
        iconSolid: '#3b82f6',
        category: 'system',
        isCore: true,
        component: FileManager,
        dockOrder: 1,
        menu: finderMenuConfig,
        contextMenu: finderContextMenuConfig,
        size: 50,
        ramUsage: 300,
    },
    browser: {
        id: 'browser',
        name: 'Browser',
        description: 'Access the web',
        descriptionKey: 'appDescriptions.browser',
        icon: Globe,
        iconColor: 'from-blue-400 to-indigo-500',
        iconSolid: '#6366f1',
        category: 'utilities',
        isCore: true,
        component: Browser,
        dockOrder: 2,
        menu: browserMenuConfig,
        size: 280,
        ramUsage: 450,
    },
    appstore: {
        id: 'appstore',
        name: 'Store',
        description: 'Download and manage apps',
        descriptionKey: 'appDescriptions.appStore',
        icon: Store,
        iconColor: 'from-sky-500 to-blue-500',
        iconSolid: '#0ea5e9',
        category: 'system',
        isCore: true,
        component: AppStoreComponent,
        dockOrder: 4,
        menu: appStoreMenuConfig,
        size: 90,
        ramUsage: 200,
    },
    terminal: {
        id: 'terminal',
        name: 'Terminal',
        description: 'Command line interface',
        descriptionKey: 'appDescriptions.terminal',
        icon: Terminal,
        iconColor: 'from-gray-700 to-gray-800',
        iconSolid: '#374151',
        category: 'development',
        isCore: true,
        component: TerminalApp,
        dockOrder: 9,
        menu: terminalMenuConfig,
        contextMenu: terminalContextMenuConfig,
        size: 15,
        ramUsage: 100,
    },
    settings: {
        id: 'settings',
        name: 'System Settings',
        description: 'Configure your system',
        descriptionKey: 'appDescriptions.systemSettings',
        icon: Settings,
        iconColor: 'from-slate-500 to-zinc-600',
        iconSolid: '#71717a',
        category: 'system',
        isCore: true,
        component: SettingsApp,
        dockOrder: 10,
        menu: settingsMenuConfig,
        size: 85,
        ramUsage: 150,
    },

    // Optional Apps (can be installed/uninstalled)
    notepad: {
        id: 'notepad',
        name: 'Notepad',
        description: 'Edit text files',
        descriptionKey: 'appDescriptions.notepad',
        icon: FileText,
        iconColor: 'from-yellow-400 to-amber-500',
        iconSolid: '#f59e0b',
        category: 'productivity',
        isCore: false,
        component: Notepad,
        dockOrder: 4,
        menu: notepadMenuConfig,
        size: 35,
        ramUsage: 150,
    },
    messages: {
        id: 'messages',
        name: 'Messages',
        description: 'Chat with friends',
        descriptionKey: 'appDescriptions.messages',
        icon: MessageSquare,
        iconColor: 'from-green-500 to-emerald-600',
        iconSolid: '#10b981',
        category: 'productivity',
        isCore: false,
        component: Messages,
        dockOrder: 5,
        menu: messagesMenuConfig,
        size: 140,
        ramUsage: 250,
    },
    calendar: {
        id: 'calendar',
        name: 'Calendar',
        description: 'Manage your schedule',
        descriptionKey: 'appDescriptions.calendar',
        icon: Calendar,
        iconColor: 'from-red-500 to-red-600',
        iconSolid: '#ef4444',
        category: 'productivity',
        isCore: false,
        component: CalendarApp,
        dockOrder: 6,
        menu: calendarMenuConfig,
        size: 50,
        ramUsage: 250,
    },
    photos: {
        id: 'photos',
        name: 'Photos',
        description: 'View and manage photos',
        descriptionKey: 'appDescriptions.photos',
        icon: Image,
        iconColor: 'from-pink-500 to-rose-600',
        iconSolid: '#e11d48',
        category: 'media',
        isCore: false,
        component: Photos,
        dockOrder: 7,
        menu: photosMenuConfig,
        size: 180,
        ramUsage: 350,
    },
    music: {
        id: 'music',
        name: 'Music',
        description: 'Play your favorite music',
        descriptionKey: 'appDescriptions.music',
        icon: Music,
        iconColor: 'from-purple-500 to-purple-600',
        iconSolid: '#a855f7',
        category: 'media',
        isCore: false,
        component: MusicApp,
        dockOrder: 8,
        menu: musicMenuConfig,
        size: 210,
        ramUsage: 300,
    },

    'dev-center': {
        id: 'dev-center',
        name: 'DevCenter',
        description: 'Developer Tools',
        descriptionKey: 'appDescriptions.devCenter',
        icon: Code,
        iconColor: 'from-indigo-500 to-purple-600',
        iconSolid: '#6366f1',
        category: 'development',
        isCore: false,
        component: DevCenter,
        dockOrder: 12,
        menu: devCenterMenuConfig,
        size: 550,
        ramUsage: 1000,
    },

    calculator: {
        id: 'calculator', name: 'Calculator', description: 'Standard + dev (hex/bin/oct) calculator',
        icon: CalculatorIcon, iconColor: 'from-slate-500 to-slate-700', iconSolid: '#64748b',
        category: 'utilities', isCore: false, component: Calculator, dockOrder: 30,
        size: 12, ramUsage: 30,
    },
    'json-viewer': {
        id: 'json-viewer', name: 'JSON Viewer', description: 'Format, validate and minify JSON',
        icon: Braces, iconColor: 'from-amber-500 to-orange-600', iconSolid: '#f59e0b',
        category: 'development', isCore: false, component: JsonViewer, dockOrder: 31,
        size: 14, ramUsage: 40,
    },
    'regex-tester': {
        id: 'regex-tester', name: 'Regex Tester', description: 'Test regex patterns with live highlight',
        icon: Regex, iconColor: 'from-pink-500 to-rose-600', iconSolid: '#ec4899',
        category: 'development', isCore: false, component: RegexTester, dockOrder: 32,
        size: 16, ramUsage: 40,
    },
    'color-picker': {
        id: 'color-picker', name: 'Color Picker', description: 'HEX/RGB picker and gradient builder',
        icon: Pipette, iconColor: 'from-fuchsia-500 to-purple-600', iconSolid: '#d946ef',
        category: 'utilities', isCore: false, component: ColorPicker, dockOrder: 33,
        size: 12, ramUsage: 30,
    },
    'clipboard-manager': {
        id: 'clipboard-manager', name: 'Clipboard', description: 'History of copied text',
        icon: ClipboardIcon, iconColor: 'from-cyan-500 to-blue-600', iconSolid: '#06b6d4',
        category: 'utilities', isCore: false, component: ClipboardManager, dockOrder: 34,
        size: 14, ramUsage: 35,
    },
    'system-monitor': {
        id: 'system-monitor', name: 'System Monitor', description: 'Live CPU, RAM and network usage',
        icon: Activity, iconColor: 'from-emerald-500 to-teal-600', iconSolid: '#10b981',
        category: 'system', isCore: false, component: SystemMonitor, dockOrder: 35,
        size: 18, ramUsage: 50,
    },
    'api-tester': {
        id: 'api-tester', name: 'API Tester', description: 'Send HTTP requests and inspect responses',
        icon: Send, iconColor: 'from-orange-500 to-red-600', iconSolid: '#f97316',
        category: 'development', isCore: false, component: ApiTester, dockOrder: 36,
        size: 22, ramUsage: 60,
    },
    'task-manager': {
        id: 'task-manager', name: 'Tasks', description: 'Drag-and-drop Kanban board',
        icon: Trello, iconColor: 'from-blue-500 to-indigo-600', iconSolid: '#3b82f6',
        category: 'productivity', isCore: false, component: TaskManager, dockOrder: 37,
        size: 20, ramUsage: 45,
    },
    'media-player': {
        id: 'media-player', name: 'Media Player', description: 'Play local video and audio files',
        icon: PlayCircle, iconColor: 'from-rose-500 to-red-600', iconSolid: '#f43f5e',
        category: 'media', isCore: false, component: MediaPlayer, dockOrder: 38,
        size: 28, ramUsage: 80,
    },
    'git-client': {
        id: 'git-client', name: 'Git Client', description: 'Simulated GitHub Desktop-style commits',
        icon: GitBranch, iconColor: 'from-orange-600 to-amber-700', iconSolid: '#ea580c',
        category: 'development', isCore: false, component: GitClient, dockOrder: 39,
        size: 60, ramUsage: 120,
    },
    'image-editor': {
        id: 'image-editor', name: 'Image Editor', description: 'Shapes, text and PNG export',
        icon: PaintIcon, iconColor: 'from-violet-500 to-purple-700', iconSolid: '#8b5cf6',
        category: 'media', isCore: false, component: ImageEditor, dockOrder: 40,
        size: 80, ramUsage: 160,
    },
    'ai-assistant': {
        id: 'ai-assistant', name: 'AI Assistant', description: 'Offline assistant chat',
        icon: Sparkles, iconColor: 'from-amber-400 to-yellow-600', iconSolid: '#facc15',
        category: 'productivity', isCore: false, component: AiAssistant, dockOrder: 41,
        size: 24, ramUsage: 70,
    },
    'network-speed': {
        id: 'network-speed', name: 'Speed Test', description: 'Network speed tester',
        icon: Gauge, iconColor: 'from-green-500 to-emerald-600', iconSolid: '#22c55e',
        category: 'utilities', isCore: false, component: NetworkSpeed, dockOrder: 42,
        size: 16, ramUsage: 40,
    },
};

// Helper functions
export function getApp(appId: string): AppMetadata | undefined {
    return APP_REGISTRY[appId];
}

export function getAllApps(): AppMetadata[] {
    return Object.values(APP_REGISTRY);
}

export function getCoreApps(): AppMetadata[] {
    return getAllApps().filter(app => app.isCore);
}

export function getOptionalApps(): AppMetadata[] {
    return getAllApps().filter(app => !app.isCore);
}

export function getDockApps(installedAppIds: Set<string>): AppMetadata[] {
    return getAllApps()
        .filter(app => app.isCore || installedAppIds.has(app.id))
        .filter(app => app.dockOrder !== undefined)
        .sort((a, b) => (a.dockOrder || 999) - (b.dockOrder || 999));
}

export function getAppsByCategory(category: AppMetadata['category']): AppMetadata[] {
    return getAllApps().filter(app => app.category === category);
}

