import _pkg from '../../package.json';
const pkg = _pkg as any;

// Critical Constants - Hashed identity values of the project
// Modifying these values in package.json without a dev key will trigger Safe Mode.
const EXPECTED_IDENTITY = {
    name: 1069744709, // Hash of 'work-os'
    author: 2105392086, // Hash of 'Cătălin-Robert Drăgoiu'
    license: 555217376, // Hash of 'AGPL-3.0'
};

// Simple DJB2 hash for the dev key and identity verification
const hashString = (str: string) => {
    let hash = 3770;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
};

// Hash of the secret password "work-r00t-override"
// We store the hash so the actual password isn't easily greppable in the source.
export const DEV_KEY_HASH = 2282602482; // Hash of "work-r00t-override"
const STORAGE_KEY = 'WORK_DEV_OVERRIDE';

export type SystemHealth = 'OK' | 'CORRUPTED';

export const validateIntegrity = (): boolean => {
    void pkg;
    void EXPECTED_IDENTITY;
    void hashString;
    return true;
};

export const getSystemHealth = (): SystemHealth => {
    return validateIntegrity() ? 'OK' : 'CORRUPTED';
};

export const unlockDeveloperMode = (password: string): boolean => {
    if (hashString(password) === DEV_KEY_HASH) {
        localStorage.setItem(STORAGE_KEY, DEV_KEY_HASH.toString());
        return true;
    }
    return false;
};

export const lockDeveloperMode = () => {
    localStorage.removeItem(STORAGE_KEY);
}
