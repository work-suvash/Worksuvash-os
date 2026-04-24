import { useState, useRef, useEffect, memo } from 'react';
import pkg from '../../package.json';
import { Orbit } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { CreditsDrawer } from '@/components/Credits/CreditsDrawer';
import { cn } from '@/components/ui/utils';
import { useAppContext } from '@/components/AppContext';
import { useFileSystem } from '@/components/FileSystemContext';
import { AudioApplet } from '@/components/AudioApplet';
import { NotificationsApplet } from '@/components/NotificationsApplet';
import { BatteryApplet } from '@/components/BatteryApplet';
import { MemoryApplet } from '@/components/MemoryApplet';
import { InternetApplet } from '@/components/InternetApplet';
import { hardReset, clearSession } from '@/utils/memory';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '@/components/ui/menubar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useI18n } from '@/i18n/index';

interface MenuBarProps {
  focusedApp?: string | null;
  onOpenApp?: (type: string, data?: any, owner?: string) => void;
}

function MenuBarComponent({ onOpenApp }: MenuBarProps) {
  const { menuBarBackground, blurStyle, getBackgroundColor } = useThemeColors();
  const { disableShadows, setIsLocked, locale, timeMode, setTimeMode } = useAppContext();
  const { logout, suspendSession, currentUser } = useFileSystem();
  const { t } = useI18n();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Hidden Credits Trigger
  const [showCredits, setShowCredits] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  // Panic Confirmation State
  const [panicConfirm, setPanicConfirm] = useState(false);

  const handleSystemClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current > 2000) {
      // Reset if too slow
      clickCountRef.current = 0;
    }

    lastClickTimeRef.current = now;
    clickCountRef.current++;

    if (clickCountRef.current >= 6) {
      setShowCredits(true);
      clickCountRef.current = 0;
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timeMode === 'server' ? 'UTC' : undefined
      };

      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: timeMode === 'server' ? 'UTC' : undefined
      };

      setCurrentTime(now.toLocaleTimeString(locale, options) + (timeMode === 'server' ? ' UTC' : ''));
      setCurrentDate(now.toLocaleDateString(locale, dateOptions));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locale, timeMode]);

  return (
    <div
      className={cn("absolute top-0 left-0 right-0 h-7 border-b border-white/10 flex items-center justify-between px-2 z-9999 select-none")}
      style={{ background: menuBarBackground, ...blurStyle }}
    >
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Menubar className="border-none bg-transparent h-auto p-0 space-x-1">
          <MenubarMenu>
            <MenubarTrigger
              className="bg-transparent focus:bg-white/10 data-[state=open]:bg-white/10 px-2 py-0.5 h-7 rounded-sm cursor-default"
              onClick={handleSystemClick}
            >
              <Orbit className="w-4 h-4 text-white/90" />
            </MenubarTrigger>

            {/* Hidden Credits Drawer */}
            <CreditsDrawer isOpen={showCredits} onClose={() => setShowCredits(false)} />

            <MenubarContent
              className={cn("border-white/10 text-white min-w-56 p-1 z-10000", !disableShadows ? "shadow-xl" : "shadow-none")}
              style={{ background: getBackgroundColor(0.8), ...blurStyle }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Direct link to About section
                    sessionStorage.setItem('settings-pending-section', 'about');
                    window.dispatchEvent(new CustomEvent('work-open-settings-section', { detail: 'about' }));
                    onOpenApp?.('settings');
                  }}>
                    {t('menubar.system.aboutThisComputer')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.viewSystemInfo')}</p>
                </TooltipContent>
              </Tooltip>
              <MenubarSeparator className="bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => onOpenApp?.('settings')}>
                    {t('menubar.system.systemSettings')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.viewSystemSettings')}</p>
                </TooltipContent>
              </Tooltip>
              <MenubarItem onClick={() => onOpenApp?.('appstore')}>
                {t('menubar.system.appStore')}
              </MenubarItem>
              <MenubarSeparator className="bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Lock Screen -> Overlay LoginScreen but KEEP session
                    setIsLocked(true);
                  }}>
                    {t('menubar.system.lockScreen')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.returnToLoginWhile')} <b>{t('menubar.system.keepingSession')}</b></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Switch User -> Suspend session (keep RAM/Storage)
                    suspendSession();
                  }}>
                    {t('menubar.system.switchUser')}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.returnToUserSelectionWhile')} <b>{t('menubar.system.keepingSession')}</b></p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem onClick={() => {
                    // Log Out -> Clear windows session
                    if (currentUser) {
                      clearSession(currentUser);
                    }
                    logout();
                  }}>
                    {t('menubar.system.logOutAs', { username: currentUser ? currentUser : t('menubar.system.user') })}
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>{t('menubar.system.returnToUserSelectionWhile')} <b>{t('menubar.system.clearingSession')}</b></p>
                </TooltipContent>
              </Tooltip>
              <MenubarSeparator className="bg-white/10" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <MenubarItem
                    onSelect={(e) => {
                      if (!panicConfirm) {
                        e.preventDefault();
                      }
                    }}
                    onClick={() => {
                      if (!panicConfirm) {
                        setPanicConfirm(true);
                        setTimeout(() => setPanicConfirm(false), 3000);
                      } else {
                        // Hard Reset -> PANIC
                        hardReset();
                        window.location.reload();
                      }
                    }}
                    className={cn(
                      "text-red-500 focus:text-red-500 focus:bg-red-500/10",
                      panicConfirm && "bg-red-500/10"
                    )}
                  >
                    <span className="flex-1 text-left">
                      {panicConfirm ? "Are you sure?" : t('menubar.system.panic')}
                    </span>
                    <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5">
                      {panicConfirm ? "CONFIRM" : t('menubar.system.hardReset')}
                    </Badge>
                  </MenubarItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p><b>{t('menubar.system.warning')}:</b> {t('menubar.system.panicWarningBody', { productName: pkg.build.productName })}</p>
                </TooltipContent>
              </Tooltip>
            </MenubarContent>
          </MenubarMenu>

        </Menubar>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 px-2">
        <MemoryApplet />
        <BatteryApplet key={currentUser} />
        <InternetApplet onOpenApp={onOpenApp} />
        <AudioApplet />
        <NotificationsApplet onOpenApp={onOpenApp} />

        <button
          onClick={() => setTimeMode(timeMode === 'server' ? 'local' : 'server')}
          className="text-white/90 text-xs font-medium flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors"
          title={timeMode === 'server' ? t('menubar.system.serverTime') : t('menubar.system.localTime')}
        >
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </button>
      </div>
    </div >
  );
}

export const MenuBar = memo(MenuBarComponent);