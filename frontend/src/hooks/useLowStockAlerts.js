import { useCallback, useEffect, useRef, useState } from "react";

const CHANNEL = "stock-sense-low-stock";

export default function useLowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const seen = useRef(new Set());

  const addAlert = useCallback((alert) => {
    const normalized = { ...alert, id: alert.id || `alert-${Date.now()}` };
    if (seen.current.has(normalized.id)) return;
    seen.current.add(normalized.id);
    setAlerts((current) => [normalized, ...current].slice(0, 3));
  }, []);

  const injectAlert = useCallback((alert) => {
    const payload = { ...alert, id: `alert-${Date.now()}` };
    addAlert(payload);
    localStorage.setItem(CHANNEL, JSON.stringify(payload));
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL);
      channel.postMessage(payload);
      channel.close();
    }
  }, [addAlert]);

  useEffect(() => {
    let channel;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (event) => addAlert(event.data);
    }
    const onStorage = (event) => {
      if (event.key === CHANNEL && event.newValue) addAlert(JSON.parse(event.newValue));
    };
    window.addEventListener("storage", onStorage);

    const poll = async () => {
      try {
        const response = await fetch("/api/alerts");
        if (!response.ok) return;
        const data = await response.json();
        (Array.isArray(data) ? data : data.alerts || []).forEach(addAlert);
      } catch {
        // The UI remains fully functional with local cross-tab events until the API is connected.
      }
    };
    poll();
    const interval = window.setInterval(poll, 4000);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, [addAlert]);

  const dismissAlert = useCallback((id) => setAlerts((current) => current.filter((alert) => alert.id !== id)), []);
  return { alerts, dismissAlert, injectAlert };
}