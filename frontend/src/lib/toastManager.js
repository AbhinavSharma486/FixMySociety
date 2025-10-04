import toast from 'react-hot-toast';

// Simple toast dedupe manager: keeps keys for a short TTL to avoid duplicate toasts
const SHOWN = new Map(); // key -> timestamp
const TTL_MS = 5000; // 5s window to suppress duplicates

const cleanup = () => {
  const now = Date.now();
  for (const [k, t] of SHOWN.entries()) {
    if (now - t > TTL_MS) SHOWN.delete(k);
  }
};

setInterval(cleanup, 2000);

export const showSuccess = (key, message) => {
  if (!key) key = message;
  if (SHOWN.has(key)) return null;
  SHOWN.set(key, Date.now());
  return toast.success(message);
};

export const showError = (key, message) => {
  if (!key) key = message;
  if (SHOWN.has(key)) return null;
  SHOWN.set(key, Date.now());
  return toast.error(message);
};

export const showInfo = (key, message) => {
  if (!key) key = message;
  if (SHOWN.has(key)) return null;
  SHOWN.set(key, Date.now());
  return toast(message, { icon: 'ℹ️' });
};

export default { showSuccess, showError, showInfo };
