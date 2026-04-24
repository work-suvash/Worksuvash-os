/**
 * Global singleton App Installer service.
 *
 * Owns install progress + timers OUTSIDE of any React component so that
 * downloads/installs continue when the App Store window is closed.
 *
 * UI components subscribe to receive updates.
 */

type Listener = (progress: Record<string, number>) => void;

export interface StartOptions {
    appSize?: number;
    owner?: string;
    onComplete: (appId: string, owner?: string) => void;
    onNotify?: (kind: 'success' | 'info' | 'error', title: string, message: string) => void;
}

const progress: Record<string, number> = {};
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
const optsMap: Record<string, StartOptions> = {};
const listeners: Set<Listener> = new Set();

function emit() {
    const snapshot = { ...progress };
    listeners.forEach(l => {
        try { l(snapshot); } catch { /* ignore */ }
    });
}

function tick(appId: string) {
    const opts = optsMap[appId];
    if (!opts) return;

    const current = progress[appId] ?? 0;
    // Fast simulation: jump 10-20% per tick at 40ms intervals → finishes in ~250-500ms.
    const increment = 10 + Math.random() * 10;
    const next = Math.min(100, current + increment);
    progress[appId] = next;
    emit();

    if (next >= 100) {
        // Finalize on a short delay so the UI shows 100% briefly.
        timers[appId] = setTimeout(() => {
            try {
                opts.onComplete(appId, opts.owner);
            } finally {
                delete progress[appId];
                delete timers[appId];
                delete optsMap[appId];
                emit();
            }
        }, 150);
        return;
    }

    timers[appId] = setTimeout(() => tick(appId), 40);
}

export const appInstallerService = {
    isInstalling(appId: string): boolean {
        return progress[appId] !== undefined;
    },

    getProgress(): Record<string, number> {
        return { ...progress };
    },

    start(appId: string, opts: StartOptions) {
        if (progress[appId] !== undefined) return; // already in progress
        progress[appId] = 0;
        optsMap[appId] = opts;
        emit();
        timers[appId] = setTimeout(() => tick(appId), 40);
    },

    cancel(appId: string) {
        if (timers[appId]) {
            clearTimeout(timers[appId]);
            delete timers[appId];
        }
        delete progress[appId];
        delete optsMap[appId];
        emit();
    },

    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        // Push initial state immediately.
        listener({ ...progress });
        return () => listeners.delete(listener);
    },
};
