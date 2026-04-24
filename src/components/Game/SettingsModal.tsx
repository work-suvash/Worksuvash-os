import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Monitor, RefreshCw, Trash2, X, Speaker, Laptop, Settings, Check, Waves, Cpu, Sparkles, Zap, Languages, AlertTriangle } from 'lucide-react';
import pkg from '@/../package.json';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { soundManager } from '@/services/sound';
import { useI18n } from '@/i18n/index';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useAppContext } from '@/components/AppContext';
import { SUPPORTED_LOCALES } from '@/i18n/translations';
import { factoryReset } from '@/utils/memory';

interface SettingsModalProps {
    onClose: () => void;
}

type Tab = 'display' | 'audio' | 'system';

const EASE = [0.22, 1, 0.36, 1] as const;

function SectionTitle({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
    return (
        <h3 className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em] pb-2 flex items-center gap-2 border-b",
            danger ? "text-red-400 border-red-500/20" : "text-white/40 border-white/10"
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", danger ? "bg-red-400" : "bg-white/40")} />
            {children}
        </h3>
    );
}

function Slider({ value, onChange, accent = 'white' }: { value: number; onChange: (v: number) => void; accent?: 'white' | 'muted' }) {
    return (
        <div className="relative h-2 w-full rounded-full bg-white/[0.06] overflow-hidden group">
            <div
                className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-[width] duration-100",
                    accent === 'white' ? "bg-white" : "bg-white/60 group-hover:bg-white"
                )}
                style={{ width: `${value}%` }}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-black shadow-[0_0_0_1px_rgba(255,255,255,0.4)] pointer-events-none transition-[left] duration-100"
                style={{ left: `calc(${value}% - 7px)` }}
            />
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
}

function ToggleChip({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-3 py-2.5 rounded-md border transition-colors duration-150 flex items-center gap-2",
                disabled && "opacity-40 cursor-not-allowed",
                active
                    ? "border-white/80 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-white/50 hover:text-white hover:border-white/30"
            )}
        >
            <span className={cn(
                "w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                active ? "border-white bg-white" : "border-white/30"
            )}>
                {active && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
            </span>
            <span className="truncate">{children}</span>
        </button>
    );
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<Tab>('display');

    const tabs = useMemo(() => [
        { id: 'display', icon: Monitor, label: t('game.bios.tabs.display') },
        { id: 'audio', icon: Speaker, label: t('game.bios.tabs.audio') },
        { id: 'system', icon: Laptop, label: t('game.bios.tabs.system') },
    ] as const, [t]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveTab(prev => {
                    const currentIndex = tabs.findIndex(t => t.id === prev);
                    let nextIndex;
                    if (e.key === 'ArrowUp') {
                        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                    } else {
                        nextIndex = (currentIndex + 1) % tabs.length;
                    }
                    feedback.hover();
                    return tabs[nextIndex].id as Tab;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, tabs]);

    const {
        reduceMotion, setReduceMotion,
        disableGradients, setDisableGradients,
        blurEnabled, setBlurEnabled,
        disableShadows, setDisableShadows,
        gpuEnabled, setGpuEnabled,
        locale, setLocale
    } = useAppContext();

    const [volumes, setVolumes] = useState({
        master: soundManager.getVolume('master') * 100,
        music: soundManager.getVolume('music') * 100,
        sfx: soundManager.getVolume('ui') * 100,
        ambiance: soundManager.getVolume('ambiance') * 100,
    });

    const { isFullscreen, isElectron, displaySettings, setDisplaySettings } = useFullscreen();

    const RESOLUTIONS = useMemo(() => {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        const allResolutions = [
            { label: '5120x1440', width: 5120, height: 1440 },
            { label: '3840x2160', width: 3840, height: 2160 },
            { label: '3440x1440', width: 3440, height: 1440 },
            { label: '2880x1800', width: 2880, height: 1800 },
            { label: '2560x1600', width: 2560, height: 1600 },
            { label: '2560x1440', width: 2560, height: 1440 },
            { label: '2560x1080', width: 2560, height: 1080 },
            { label: '1920x1200', width: 1920, height: 1200 },
            { label: '1920x1080', width: 1920, height: 1080 },
            { label: '1680x1050', width: 1680, height: 1050 },
            { label: '1600x900', width: 1600, height: 900 },
            { label: '1512x982', width: 1512, height: 982 },
            { label: '1470x956', width: 1470, height: 956 },
            { label: '1440x900', width: 1440, height: 900 },
            { label: '1366x768', width: 1366, height: 768 },
        ];

        return allResolutions.filter(res => res.width <= screenWidth && res.height <= screenHeight);
    }, []);

    const handleModeChange = (mode: 'fullscreen' | 'borderless' | 'windowed') => {
        feedback.click();
        const electron = (window as any).electron;
        const actualIsElectron = isElectron || !!electron;

        if (actualIsElectron) {
            setDisplaySettings({
                mode,
                width: displaySettings?.width || 1366,
                height: displaySettings?.height || 768,
                frame: displaySettings?.frame ?? false,
            });
        } else {
            if (mode === 'fullscreen' && !document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (mode === 'windowed' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    };

    const handleResolutionChange = (width: number, height: number) => {
        feedback.click();
        setDisplaySettings({
            mode: displaySettings?.mode || 'windowed',
            width,
            height,
            frame: displaySettings?.frame ?? false,
        });
    };

    const handleFrameToggle = () => {
        feedback.click();
        setDisplaySettings({
            mode: displaySettings?.mode || 'windowed',
            width: displaySettings?.width || 1920,
            height: displaySettings?.height || 1080,
            frame: displaySettings ? !displaySettings.frame : true,
        });
    };

    const getPreset = () => {
        if (gpuEnabled && blurEnabled && !disableShadows && !disableGradients && !reduceMotion) return 'ultra';
        if (!gpuEnabled && !blurEnabled && disableShadows && disableGradients && reduceMotion) return 'performance';
        return 'custom';
    };

    const applyPreset = (preset: 'ultra' | 'performance') => {
        feedback.click();
        if (preset === 'ultra') {
            setGpuEnabled(true);
            setBlurEnabled(true);
            setDisableShadows(false);
            setDisableGradients(false);
            setReduceMotion(false);
        } else {
            setGpuEnabled(false);
            setBlurEnabled(false);
            setDisableShadows(true);
            setDisableGradients(true);
            setReduceMotion(true);
        }
    };

    const updateVolume = (category: 'master' | 'music' | 'sfx' | 'ambiance', val: number) => {
        setVolumes(prev => ({ ...prev, [category]: val }));
        if (category === 'master') soundManager.setVolume('master', val / 100);
        else if (category === 'music') soundManager.setVolume('music', val / 100);
        else if (category === 'ambiance') soundManager.setVolume('ambiance', val / 100);
        else {
            soundManager.setVolume('ui', val / 100);
            soundManager.setVolume('system', val / 100);
            soundManager.setVolume('feedback', val / 100);
        }
    };

    const handleSoftReset = () => {
        if (confirm(t('game.bios.softResetConfirm'))) {
            window.location.reload();
        }
    };

    const handleFactoryReset = () => {
        if (confirm(t('game.bios.factoryResetConfirm'))) {
            feedback.click();
            factoryReset();
            setTimeout(() => window.location.reload(), 500);
        }
    };

    const preset = getPreset();

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="relative flex flex-col w-full max-w-3xl max-h-[88vh] rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl shadow-black/60 overflow-hidden font-mono text-white"
            >
                {/* Subtle ambient glow */}
                <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-white/[0.04] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-white/[0.03] blur-3xl" />

                {/* Header */}
                <div className="relative flex justify-between items-center px-6 py-4 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
                            <Settings className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold tracking-[0.25em] uppercase">{t('game.bios.title')}</h2>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-0.5">{t('game.bios.configurationUtility')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { feedback.click(); onClose(); }}
                        aria-label="Close"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-44 shrink-0 border-r border-white/10 p-3 space-y-1 bg-black/40">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => { feedback.click(); setActiveTab(tab.id as Tab); }}
                                    className={cn(
                                        "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors duration-150",
                                        isActive
                                            ? "text-white"
                                            : "text-white/45 hover:text-white hover:bg-white/[0.04]"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="bios-tab-active"
                                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                            className="absolute inset-0 rounded-md bg-white/[0.08] border border-white/15"
                                        />
                                    )}
                                    <tab.icon className={cn("relative z-10 w-4 h-4", isActive ? "text-white" : "text-white/40")} />
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18, ease: EASE }}
                                className="p-6 space-y-7"
                            >
                                {activeTab === 'display' && (
                                    <>
                                        {/* Display Mode */}
                                        <div className="space-y-3">
                                            <SectionTitle>{t('game.bios.displayMode')}</SectionTitle>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['fullscreen', 'borderless', 'windowed'] as const).map((mode) => {
                                                    const electronAPI = (window as any).electron;
                                                    const actualIsElectron = isElectron || !!electronAPI;
                                                    let activeMode: string = isFullscreen ? 'fullscreen' : 'windowed';
                                                    if (actualIsElectron && displaySettings) {
                                                        activeMode = displaySettings.mode;
                                                    }
                                                    const isActive = activeMode === mode;

                                                    return (
                                                        <button
                                                            key={mode}
                                                            onClick={() => handleModeChange(mode)}
                                                            className={cn(
                                                                "relative px-3 py-3 rounded-lg border text-center transition-colors duration-150 overflow-hidden",
                                                                isActive
                                                                    ? "bg-white/[0.08] border-white/40 text-white"
                                                                    : "bg-white/[0.02] border-white/10 hover:border-white/25 text-white/55 hover:text-white"
                                                            )}
                                                        >
                                                            <div className="font-bold uppercase text-[10px] tracking-[0.18em]">{t(`game.bios.${mode}`)}</div>
                                                            {isActive && (
                                                                <motion.div layoutId="display-mode-indicator" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-white" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Resolution & Window settings (Electron) */}
                                        {(isElectron || !!(window as any).electron) && (displaySettings?.mode === 'windowed' || (!displaySettings && !isFullscreen)) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, ease: EASE }}
                                                className="grid grid-cols-2 gap-6"
                                            >
                                                <div className="space-y-3">
                                                    <SectionTitle>{t('game.bios.resolution')}</SectionTitle>
                                                    <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                                                        {RESOLUTIONS.map((res) => {
                                                            const isActive = displaySettings?.width === res.width && displaySettings?.height === res.height;
                                                            return (
                                                                <button
                                                                    key={res.label}
                                                                    onClick={() => handleResolutionChange(res.width, res.height)}
                                                                    className={cn(
                                                                        "w-full px-3 py-2 rounded-md border text-left text-[10px] font-bold uppercase tracking-wider transition-colors",
                                                                        isActive
                                                                            ? "bg-white text-black border-white"
                                                                            : "bg-white/[0.02] text-white/55 border-white/10 hover:border-white/25 hover:text-white"
                                                                    )}
                                                                >
                                                                    {res.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <SectionTitle>{t('game.bios.windowSettings')}</SectionTitle>
                                                    <button
                                                        onClick={handleFrameToggle}
                                                        className={cn(
                                                            "w-full p-3 rounded-lg border text-left flex justify-between items-center transition-colors",
                                                            displaySettings?.frame
                                                                ? "bg-white/[0.06] border-white/40"
                                                                : "bg-white/[0.02] border-white/10 hover:border-white/25"
                                                        )}
                                                    >
                                                        <div>
                                                            <div className="font-bold uppercase text-[11px] tracking-wider">{t('game.bios.windowFrame')}</div>
                                                            <div className="text-[9px] text-white/40 mt-1">{t('game.bios.windowFrameHint')}</div>
                                                        </div>
                                                        <div className={cn("w-5 h-5 rounded-md border flex items-center justify-center transition-colors", displaySettings?.frame ? "border-white bg-white" : "border-white/30")}>
                                                            {displaySettings?.frame && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                                                        </div>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Graphics quality */}
                                        <div className="space-y-3">
                                            <SectionTitle>{t('game.bios.graphicsQuality')}</SectionTitle>
                                            <div className="grid grid-cols-2 gap-3">
                                                {([
                                                    { key: 'ultra', icon: Sparkles, label: t('game.bios.presets.highFidelity.label'), desc: t('game.bios.presets.highFidelity.desc') },
                                                    { key: 'performance', icon: Zap, label: t('game.bios.presets.performance.label'), desc: t('game.bios.presets.performance.desc') },
                                                ] as const).map(({ key, icon: Icon, label, desc }) => {
                                                    const isActive = preset === key;
                                                    return (
                                                        <button
                                                            key={key}
                                                            onClick={() => applyPreset(key)}
                                                            className={cn(
                                                                "relative p-4 rounded-lg border text-left transition-colors overflow-hidden",
                                                                isActive
                                                                    ? "bg-white/[0.08] border-white/40 text-white"
                                                                    : "bg-white/[0.02] border-white/10 hover:border-white/25 text-white/60 hover:text-white"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="w-4 h-4" />
                                                                    <div className="font-bold uppercase text-[12px] tracking-wider">{label}</div>
                                                                </div>
                                                                {isActive && (
                                                                    <span className={cn("w-1.5 h-1.5 rounded-full bg-white", !reduceMotion && "animate-pulse")} />
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] opacity-60 leading-relaxed">{desc}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <ToggleChip
                                                    active={gpuEnabled}
                                                    onClick={() => {
                                                        const newState = !gpuEnabled;
                                                        setGpuEnabled(newState);
                                                        if (!newState) {
                                                            setBlurEnabled(false);
                                                            setDisableShadows(true);
                                                            setReduceMotion(true);
                                                        }
                                                    }}
                                                >
                                                    <Cpu className="w-3 h-3 inline mr-1" />{t('game.bios.hardwareAcceleration')}
                                                </ToggleChip>
                                                <ToggleChip active={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)}>
                                                    {t('game.bios.reduceMotion')}
                                                </ToggleChip>
                                                <ToggleChip active={disableGradients} onClick={() => setDisableGradients(!disableGradients)}>
                                                    {t('game.bios.simpleColors')}
                                                </ToggleChip>
                                                <ToggleChip active={!blurEnabled} disabled={!gpuEnabled} onClick={() => setBlurEnabled(!blurEnabled)}>
                                                    {t('game.bios.solidBackgrounds')}
                                                </ToggleChip>
                                                <ToggleChip active={disableShadows} disabled={!gpuEnabled} onClick={() => setDisableShadows(!disableShadows)}>
                                                    {t('game.bios.noShadows')}
                                                </ToggleChip>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'audio' && (
                                    <>
                                        <div className="space-y-3">
                                            <SectionTitle>{t('audio.mixerLabels.masterOutput')}</SectionTitle>
                                            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-5">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider">
                                                            <Volume2 className="w-4 h-4" /> {t('audio.mixerLabels.masterOutput')}
                                                        </span>
                                                        <span className="font-mono text-xs tabular-nums text-white">{Math.round(volumes.master).toString().padStart(3, '0')}%</span>
                                                    </div>
                                                    <Slider value={volumes.master} onChange={(v) => updateVolume('master', v)} accent="white" />
                                                </div>

                                                <div className="pt-4 border-t border-white/10 space-y-5">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center text-white/60">
                                                            <span className="font-bold text-[10px] uppercase tracking-wider">{t('audio.mixerLabels.musicAppLevel')}</span>
                                                            <span className="font-mono text-[10px] tabular-nums">{Math.round(volumes.music).toString().padStart(3, '0')}%</span>
                                                        </div>
                                                        <Slider value={volumes.music} onChange={(v) => updateVolume('music', v)} accent="muted" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center text-white/60">
                                                            <span className="font-bold text-[10px] uppercase tracking-wider">{t('audio.mixerLabels.sfxInterface')}</span>
                                                            <span className="font-mono text-[10px] tabular-nums">{Math.round(volumes.sfx).toString().padStart(3, '0')}%</span>
                                                        </div>
                                                        <Slider value={volumes.sfx} onChange={(v) => updateVolume('sfx', v)} accent="muted" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <SectionTitle>{t('audio.categories.ambiance')}</SectionTitle>
                                            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                                                <button
                                                    onClick={() => updateVolume('ambiance', volumes.ambiance === 0 ? 50 : 0)}
                                                    className={cn(
                                                        "w-11 h-11 rounded-lg border flex items-center justify-center transition-colors",
                                                        volumes.ambiance > 0
                                                            ? "bg-white/10 border-white/30 text-white"
                                                            : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white hover:border-white/25"
                                                    )}
                                                >
                                                    <Waves className="w-5 h-5" />
                                                </button>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-white/60">
                                                        <span>{t('audio.mixerLabels.backgroundLoop')}</span>
                                                        <span className="font-mono tabular-nums">{Math.round(volumes.ambiance).toString().padStart(3, '0')}%</span>
                                                    </div>
                                                    <Slider value={volumes.ambiance} onChange={(v) => updateVolume('ambiance', v)} accent="muted" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'system' && (
                                    <>
                                        <div className="space-y-3">
                                            <SectionTitle>
                                                <Languages className="w-3 h-3" /> {t('settings.appearance.languageTitle')}
                                            </SectionTitle>
                                            <div className="grid grid-cols-2 gap-2">
                                                {SUPPORTED_LOCALES.map((l) => {
                                                    const isActive = locale === l.locale;
                                                    return (
                                                        <button
                                                            key={l.locale}
                                                            onClick={() => { feedback.click(); setLocale(l.locale); }}
                                                            className={cn(
                                                                "flex justify-between items-center px-3 py-2.5 rounded-md border transition-colors",
                                                                isActive
                                                                    ? "border-white/40 bg-white/[0.08] text-white"
                                                                    : "border-white/10 bg-white/[0.02] text-white/55 hover:text-white hover:border-white/25"
                                                            )}
                                                        >
                                                            <span className="text-[11px] font-bold uppercase tracking-wider">{l.label}</span>
                                                            {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <SectionTitle danger>
                                                <AlertTriangle className="w-3 h-3" /> {t('game.bios.dangerZone')}
                                            </SectionTitle>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={handleSoftReset}
                                                    className="group flex flex-col items-center justify-center gap-2 p-5 rounded-lg border border-blue-500/20 bg-blue-500/[0.04] hover:bg-blue-500/10 hover:border-blue-400/60 transition-colors"
                                                >
                                                    <RefreshCw className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
                                                    <span className="text-[12px] font-bold uppercase text-blue-300 tracking-wider">{t('game.bios.softReset')}</span>
                                                    <span className="text-[10px] text-white/40 text-center leading-relaxed">{t('game.bios.softResetHint')}</span>
                                                </button>

                                                <button
                                                    onClick={handleFactoryReset}
                                                    className="group flex flex-col items-center justify-center gap-2 p-5 rounded-lg border border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/10 hover:border-red-400/60 transition-colors"
                                                >
                                                    <Trash2 className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform duration-200" />
                                                    <span className="text-[12px] font-bold uppercase text-red-300 tracking-wider">{t('game.bios.factoryReset')}</span>
                                                    <span className="text-[10px] text-white/40 text-center leading-relaxed">{t('game.bios.factoryResetHint')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative px-5 py-3 border-t border-white/10 bg-black/40 text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] flex justify-between items-center">
                    <span>{pkg.build.productName} v{pkg.version}</span>
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
                        {activeTab.toUpperCase()} {t('game.bios.configFooter')}
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
