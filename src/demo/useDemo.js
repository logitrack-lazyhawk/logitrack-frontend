import { useSyncExternalStore } from 'react';
import { demoActiva, suscribirDemo } from './runtime.js';

export function useDemo() {
    return useSyncExternalStore(suscribirDemo, demoActiva, demoActiva);
}
