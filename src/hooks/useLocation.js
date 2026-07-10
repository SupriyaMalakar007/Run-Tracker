import { useState, useRef } from "react";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const watchId = useRef(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this browser");
      return;
    }

    // Geolocation only works on HTTPS or localhost. On a plain http://
    // LAN address (e.g. testing on your phone via http://192.168.x.x:5173)
    // the browser silently refuses to ever fire success or error callbacks.
    if (!window.isSecureContext) {
      setError(
        "This page isn't secure (not https:// or localhost), so the browser is blocking GPS access."
      );
      return;
    }

    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setError(null);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy, // meters; used to filter noisy fixes
        });
      },
      (err) => {
        // err.code: 1 = permission denied, 2 = position unavailable, 3 = timeout
        if (err.code === 1) {
          setError("Location permission was denied.");
        } else if (err.code === 3) {
          setError("Timed out waiting for a GPS signal.");
        } else {
          setError(err.message || "Could not get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  return {
    location,
    error,
    startTracking,
    stopTracking,
  };
}