/**
 * Anonymous Client Session & Device Profile Manager
 * Operates completely client-side in browser storage (localStorage + sessionStorage).
 * Enables personalized library, preferences, and session tracking without user accounts.
 */

const DEVICE_STORAGE_KEY = "mstream_device_id";
const SESSION_STORAGE_KEY = "mstream_session_id";
const SESSION_METADATA_KEY = "mstream_session_meta";

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get or create a persistent Device ID stored in localStorage.
 * Survives tab closes, reloads, and browser restarts.
 */
export const getDeviceId = () => {
  try {
    let deviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!deviceId) {
      deviceId = `dev_${generateUUID()}`;
      localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    }
    return deviceId;
  } catch (err) {
    console.warn("localStorage not accessible, using volatile ID:", err);
    return "volatile_device";
  }
};

/**
 * Get or create a transient Session ID stored in sessionStorage.
 * Unique to each tab/browsing session.
 */
export const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = `sess_${generateUUID()}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);

      // Record session start time
      const meta = {
        sessionId,
        deviceId: getDeviceId(),
        startedAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      sessionStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(meta));
    } else {
      touchSession();
    }
    return sessionId;
  } catch (err) {
    console.warn("sessionStorage not accessible:", err);
    return "volatile_session";
  }
};

/**
 * Update the last active timestamp of current session
 */
export const touchSession = () => {
  try {
    const metaStr = sessionStorage.getItem(SESSION_METADATA_KEY);
    if (metaStr) {
      const meta = JSON.parse(metaStr);
      meta.lastActiveAt = Date.now();
      sessionStorage.setItem(SESSION_METADATA_KEY, JSON.stringify(meta));
    }
  } catch (err) {
    // Ignore storage quota or access errors
  }
};

/**
 * Get session information summary
 */
export const getSessionInfo = () => {
  try {
    const metaStr = sessionStorage.getItem(SESSION_METADATA_KEY);
    if (metaStr) {
      return JSON.parse(metaStr);
    }
  } catch (err) {
    // Ignore
  }
  return {
    sessionId: getSessionId(),
    deviceId: getDeviceId(),
    startedAt: Date.now(),
    lastActiveAt: Date.now(),
  };
};
