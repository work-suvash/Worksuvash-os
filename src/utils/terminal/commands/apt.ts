import { TerminalCommand } from '../types';
import { appInstallerService } from '../../../services/appInstaller';
import { getApp, APP_REGISTRY } from '../../../config/appRegistry';

function isAdminUser(fileSystem: any, username: string): boolean {
    if (username === 'root') return true;
    const user = fileSystem.users.find((u: any) => u.username === username);
    if (!user) return false;
    const adminGroups = ['admin', 'sudo', 'wheel', 'root'];
    if (user.groups && user.groups.some((g: string) => adminGroups.includes(g))) return true;
    const primaryGroup = fileSystem.groups.find((g: any) => g.gid === user.gid);
    if (primaryGroup && adminGroups.includes(primaryGroup.groupName)) return true;
    return fileSystem.groups
        .filter((g: any) => adminGroups.includes(g.groupName))
        .some((g: any) => g.members.includes(username));
}

export const apt: TerminalCommand = {
    name: 'apt',
    description: 'Install or remove applications from the Store',
    usage: 'apt install <app> | apt remove <app> | apt list',
    execute: async (context) => {
        const { args, fileSystem, terminalUser } = context;

        if (args.length === 0) {
            return {
                output: [
                    'apt - application package manager',
                    '',
                    'Usage:',
                    '  apt install <app>   Install an application',
                    '  apt remove  <app>   Uninstall an application',
                    '  apt list            List available applications',
                ],
            };
        }

        const sub = args[0];

        if (sub === 'list') {
            const all = (fileSystem as any).installedApps as Set<string> | undefined;
            const lines: string[] = ['Available applications:', ''];
            Object.values(APP_REGISTRY).forEach((app: any) => {
                if (app.isCore) return;
                const installed = all?.has(app.id) ? '[installed]' : '';
                lines.push(`  ${app.id.padEnd(14)} ${app.name.padEnd(16)} ${installed}`);
            });
            return { output: lines };
        }

        if (sub !== 'install' && sub !== 'remove') {
            return { output: [`apt: unknown subcommand '${sub}'`], error: true };
        }

        const appId = args[1];
        if (!appId) {
            return { output: [`apt: ${sub} requires an application name`], error: true };
        }

        const meta = getApp(appId);
        if (!meta) {
            return { output: [`E: Unable to locate package ${appId}`], error: true };
        }
        if (meta.isCore) {
            return { output: [`apt: '${appId}' is a core system app and cannot be modified`], error: true };
        }

        if (!isAdminUser(fileSystem, terminalUser)) {
            return {
                output: [`E: Could not open lock file - permission denied (try 'sudo apt ${sub} ${appId}')`],
                error: true,
            };
        }

        if (sub === 'remove') {
            const ok = (fileSystem as any).uninstallApp(appId, terminalUser);
            return ok
                ? { output: [`Removing ${appId}...`, `${appId} removed.`] }
                : { output: [`apt: failed to remove ${appId}`], error: true };
        }

        // install
        const installedApps = (fileSystem as any).installedApps as Set<string> | undefined;
        if (installedApps?.has(appId)) {
            return { output: [`${appId} is already the newest version.`] };
        }

        if (appInstallerService.isInstalling(appId)) {
            return { output: [`${appId} is already being installed (running in background).`] };
        }

        appInstallerService.start(appId, {
            owner: terminalUser,
            onComplete: (id, asUser) => (fileSystem as any).installApp(id, asUser),
        });

        return {
            output: [
                `Reading package lists... Done`,
                `Get:1 store ${appId} ${meta.size ?? 50}MB`,
                `Fetched in 0s`,
                `Installing ${appId} in background... (use the Store to track progress)`,
            ],
        };
    },
};
