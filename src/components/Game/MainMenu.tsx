import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Power, Play, Disc } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { feedback } from '@/services/soundFeedback';
import { GameScreenLayout } from '@/components/Game/GameScreenLayout';
import { SettingsModal } from '@/components/Game/SettingsModal';
import { useI18n } from '@/i18n/index';
import { useFileSystem } from '@/components/FileSystemContext';
import { soundManager } from '@/services/sound';

interface MainMenuProps {
    onNewGame: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    disabled: boolean;
    action: () => void;
    desc: string;
}

export function MainMenu({ onNewGame, onContinue, canContinue }: MainMenuProps) {
    const { t } = useI18n();
    // Default select index: if can continue 0, else 1 (New Game)
    const [selected, setSelected] = useState(canContinue ? 0 : 1);
    const [showSettings, setShowSettings] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [exitSelection, setExitSelection] = useState(0); // 0: Cancel, 1: Confirm
    const { saveFileSystem } = useFileSystem();

    const menuItems = useMemo<MenuItem[]>(() => [
        {
            id: 'continue',
            label: t('game.mainMenu.continue.label'),
            icon: Disc,
            disabled: !canContinue,
            action: onContinue,
            desc: canContinue
                ? t('game.mainMenu.continue.desc.canContinue')
                : t('game.mainMenu.continue.desc.noData')
        },
        {
            id: 'new-game',
            label: t('game.mainMenu.newGame.label'),
            icon: Play,
            disabled: false,
            action: onNewGame,
            desc: t('game.mainMenu.newGame.desc')
        },
        {
            id: 'settings',
            label: t('game.mainMenu.settings.label'),
            icon: Settings,
            disabled: false,
            action: () => setShowSettings(true),
            desc: t('game.mainMenu.settings.desc')
        },
        {
            id: 'exit',
            label: t('game.mainMenu.exit.label'),
            icon: Power,
            disabled: false,
            action: () => {
                setShowExitConfirm(true);
                setExitSelection(0); // Reset to Cancel by default
            },
            desc: t('game.mainMenu.exit.desc')
        }
    ], [canContinue, onContinue, onNewGame, t]);

    useEffect(() => {
        // Start ambiance when entering Main Menu
        soundManager.startAmbiance();
    }, []);

    // Keyboard Navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showSettings) return;

        if (showExitConfirm) {
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowExitConfirm(false);
                setExitSelection(0); // Reset
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setExitSelection(prev => prev === 0 ? 1 : 0);
                feedback.hover();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                feedback.click();
                if (exitSelection === 1) {
                    saveFileSystem();
                    window.close();
                } else {
                    setShowExitConfirm(false);
                    setExitSelection(0);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setSelected(prev => {
                    const next = (prev - 1 + menuItems.length) % menuItems.length;
                    // Skip disabled items going up
                    if (menuItems[next].disabled) {
                        return (next - 1 + menuItems.length) % menuItems.length;
                    }
                    feedback.hover();
                    return next;
                });
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelected(prev => {
                    const next = (prev + 1) % menuItems.length;
                    // Skip disabled items going down
                    if (menuItems[next].disabled) {
                        return (next + 1) % menuItems.length;
                    }
                    feedback.hover();
                    return next;
                });
                break;
            case 'Enter':
            case ' ': {
                e.preventDefault();
                const item = menuItems[selected];
                if (item && !item.disabled) {
                    feedback.click();
                    item.action();
                }
                break;
            }
        }
    }, [menuItems, selected, showSettings, showExitConfirm, exitSelection, saveFileSystem]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <GameScreenLayout zIndex={40000}>
            {/* Menu Options Container */}
            <div className="flex flex-col justify-center w-full max-w-[min(92vw,72rem)] shrink min-h-0 mx-auto px-4">
                <div
                    className="grid items-stretch w-full"
                    style={{
                        gap: 'clamp(0.6rem, 1.4vh, 1.25rem)',
                        gridTemplateColumns: `repeat(${menuItems.length}, minmax(0, 1fr))`,
                    }}
                >
                    {menuItems.map((item, index) => {
                        const isSelected = selected === index && !item.disabled;
                        return (
                            <motion.button
                                key={item.id}
                                initial={{ y: 14, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.32, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                                disabled={item.disabled}
                                onClick={() => {
                                    if (item.disabled) return;
                                    item.action();
                                }}
                                className={cn(
                                    "group relative outline-none text-left font-mono rounded-2xl overflow-hidden",
                                    "border transition-[background-color,border-color,color,box-shadow] duration-200 ease-out",
                                    "transform-gpu will-change-transform",
                                    !item.disabled
                                        ? (isSelected
                                            ? "bg-white text-black border-white shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_18px_48px_-18px_rgba(255,255,255,0.35)]"
                                            : "bg-white/[0.03] text-white border-white/15 cursor-pointer")
                                        : "opacity-40 grayscale cursor-not-allowed border-white/10 bg-white/[0.02] text-white/40"
                                )}
                                style={{
                                    padding: 'clamp(0.85rem, 2vh, 1.5rem)',
                                }}
                            >

                                <div className="flex items-center relative z-10" style={{ gap: 'clamp(0.75rem, 1.8vh, 1.1rem)' }}>
                                    {/* Icon Box */}
                                    <div className={cn(
                                        "flex items-center justify-center shrink-0 rounded-xl border transition-colors duration-200",
                                        item.disabled
                                            ? "border-white/10 bg-white/[0.02]"
                                            : (isSelected
                                                ? "border-black/15 bg-black/[0.06]"
                                                : "border-white/15 bg-white/[0.04]")
                                    )}
                                        style={{
                                            width: 'clamp(2.25rem, 3.6vh, 3.25rem)',
                                            height: 'clamp(2.25rem, 3.6vh, 3.25rem)',
                                        }}
                                    >
                                        <item.icon className={cn(
                                            "transition-colors duration-200",
                                            item.disabled ? "text-white/30" : (isSelected ? "text-black" : "text-white")
                                        )}
                                            style={{ width: '50%', height: '50%' }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className={cn(
                                            "font-bold tracking-wider uppercase mb-0.5 truncate leading-none transition-colors duration-200",
                                            item.disabled ? "text-white/40" : (isSelected ? "text-black" : "text-white")
                                        )}
                                            style={{ fontSize: 'clamp(0.95rem, 1.9vh, 1.35rem)' }}
                                        >
                                            {item.label}
                                        </div>
                                        <div className={cn(
                                            "tracking-widest truncate hidden sm:block transition-colors duration-200",
                                            item.disabled ? "text-white/30" : (isSelected ? "text-black/60" : "text-white/45")
                                        )}
                                            style={{ fontSize: 'clamp(0.6rem, 1vh, 0.78rem)' }}
                                        >
                                            {item.desc}
                                        </div>
                                    </div>

                                    {/* Chevron / Indicator */}
                                    {isSelected && (
                                        <motion.div
                                            layoutId="cursor"
                                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                            className="hidden sm:flex items-center justify-center font-bold text-black/80"
                                            style={{ fontSize: 'clamp(1rem, 2vh, 1.5rem)' }}
                                        >
                                            &rsaquo;
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

            </div >

            {/* Settings Modal */}
            <AnimatePresence>
                {
                    showSettings && (
                        <SettingsModal onClose={() => setShowSettings(false)} />
                    )
                }
            </AnimatePresence >

            {/* Exit Confirmation Modal (Terminal Style) */}
            <AnimatePresence>
                {
                    showExitConfirm && (
                        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="terminal-card max-w-md w-full relative text-center font-mono p-8"
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <div className="p-4 bg-white text-black border-2 border-white">
                                        <Power className="w-10 h-10" />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{t('game.mainMenu.exit.confirm.title')}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed border-t border-b border-white/10 py-4">
                                            {t('game.mainMenu.exit.confirm.message')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full mt-2">
                                        <button
                                            onClick={() => {
                                                feedback.click();
                                                setShowExitConfirm(false);
                                                setExitSelection(0);
                                            }}
                                            className={cn(
                                                "px-6 py-4 border-2 transition-all font-bold uppercase tracking-wide text-sm",
                                                exitSelection === 0
                                                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                                    : "border-white/20 text-white hover:border-white hover:bg-white hover:text-black"
                                            )}
                                        >
                                            {t('game.mainMenu.exit.confirm.cancel')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                feedback.click();
                                                saveFileSystem();
                                                window.close();
                                            }}
                                            className={cn(
                                                "px-6 py-4 border-2 transition-all font-bold uppercase tracking-wide text-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]",
                                                exitSelection === 1
                                                    ? "bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                                                    : "bg-red-600 text-white border-red-600 hover:bg-red-500"
                                            )}
                                        >
                                            {t('game.mainMenu.exit.confirm.confirm')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </GameScreenLayout >
    );
}