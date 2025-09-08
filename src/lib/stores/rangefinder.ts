import { writable } from 'svelte/store';
import type { RangefinderData } from './types';

export const rangefinderData = writable<RangefinderData>({
    hasPermission: false,
    lastAngle: 0,
    lastDistance: 0,
    lastTrueDistance: 0,
    error: null
});