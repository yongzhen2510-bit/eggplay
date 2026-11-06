import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Browsers offer the install prompt once, often before the first render, so catch it at load.
let deferred = null;
let installed = false;
const listeners = new Set();
const notify = () => listeners.forEach(fn => fn());

const WEB = Platform.OS === 'web' && typeof window !== 'undefined';

if (WEB) {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener('appinstalled', () => { installed = true; deferred = null; notify(); });
}

const runningInstalled = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
// iPads report themselves as Macs, so touch support tells them apart.
const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

// 'prompt': the browser can show its install dialog. 'ios': Apple allows no dialog, so show the steps.
// 'menu': some other browser, where any install option is in its own menu. 'none': nothing to offer.
function currentMode() {
  if (!WEB || installed || runningInstalled()) return 'none';
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return window.isSecureContext ? 'menu' : 'none';
}

export function useInstall() {
  const [mode, setMode] = useState(currentMode);
  useEffect(() => {
    const update = () => setMode(currentMode());
    update();
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);
  const install = async () => {
    if (!deferred) return;
    const event = deferred;
    await event.prompt();
    await event.userChoice.catch(() => null);
    // A prompt only works once. The browser fires a new event if the visitor can still install.
    deferred = null;
    notify();
  };
  return { mode, install };
}
