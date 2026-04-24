import { useState, useEffect, useCallback } from 'react';
import { useFileSystem } from '@/components/FileSystemContext';
import { notify } from '@/services/notifications';
import { useI18n } from '@/i18n';
import { useNetworkContext } from '@/components/NetworkContext';
import { appInstallerService } from '@/services/appInstaller';

interface UseAppInstallerProps {
    owner?: string;
}

export function useAppInstaller({ owner }: UseAppInstallerProps) {
    const { t } = useI18n();
    const { installApp, uninstallApp, installedApps, users, getNodeAtPath, createFile } = useFileSystem();
    const { wifiEnabled, currentNetwork, availableNetworks } = useNetworkContext();

    // Subscribe to the global installer so progress survives unmount and is shared
    // across windows (e.g. App Store can be closed while a download continues).
    const [installingApps, setInstallingApps] = useState<Record<string, number>>(
        () => appInstallerService.getProgress()
    );

    useEffect(() => {
        return appInstallerService.subscribe(setInstallingApps);
    }, []);

    const handleInstall = useCallback((appId: string, _appSize: number = 50) => {
        // 0. Network Check
        const activeConnection = availableNetworks.find(n => n.ssid === currentNetwork);
        if (!wifiEnabled || !currentNetwork || !activeConnection) {
            notify.system('error', 'App Store', 'No Internet Connection - Please connect to a network to install apps.');
            return;
        }

        // 1. Permission Check
        const usrBin = getNodeAtPath('/usr/bin');
        if (usrBin) {
            const effectiveUser = owner || 'guest';
            const userObj = users.find(u => u.username === effectiveUser);
            if (userObj) {
                const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
                if (!isAdmin) {
                    // Fail via standard installApp call (which handles error notification)
                    installApp(appId, owner);
                    return;
                }
            }
        }

        // Already installing (possibly from another surface like Terminal)
        if (appInstallerService.isInstalling(appId)) return;

        appInstallerService.start(appId, {
            owner,
            onComplete: (id, asUser) => installApp(id, asUser),
        });
    }, [owner, users, getNodeAtPath, installApp, wifiEnabled, currentNetwork, availableNetworks]);

    const handleUninstall = useCallback((appId: string) => {
        const effectiveUser = owner || 'guest';
        const userObj = users.find(u => u.username === effectiveUser);
        if (userObj) {
            const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
            if (!isAdmin) {
                uninstallApp(appId, owner);
                return;
            }
        }
        uninstallApp(appId, owner);
    }, [uninstallApp, owner, users]);

    const cancelInstall = useCallback((appId: string) => {
        appInstallerService.cancel(appId);
    }, []);

    const isAppBroken = useCallback((appId: string) => {
        if (!installedApps.has(appId)) return false;
        const binaryPath = `/usr/bin/${appId}`;
        const binaryNode = getNodeAtPath(binaryPath);
        return !binaryNode;
    }, [installedApps, getNodeAtPath]);

    const handleRestore = useCallback((appId: string) => {
        const effectiveUser = owner || 'guest';
        const userObj = users.find(u => u.username === effectiveUser);
        if (userObj) {
            const isAdmin = userObj.groups?.includes('admin') || userObj.username === 'root';
            if (!isAdmin) {
                notify.system('error', t('notifications.titles.permissionDenied'), t('appStore.restorePermissionDenied'));
                return;
            }
        }

        const binaryContent = `#!app ${appId}`;
        const success = createFile('/usr/bin', appId, binaryContent, 'root', '-rwxr-xr-x');

        if (success) {
            notify.system('success', 'App Store', t('appStore.restoreSuccess', { app: appId }));
        } else {
            notify.system('error', 'App Store', t('appStore.restoreError', { app: appId }));
        }
    }, [owner, users, createFile, t]);

    return {
        installingApps,
        handleInstall,
        cancelInstall,
        handleUninstall,
        installedApps,
        isAppInstalled: (id: string) => installedApps.has(id),
        isAppBroken,
        handleRestore
    };
}
