import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import RunMap from "../components/RunMap";
import GPSPermission from "../components/GPSPermission";

import {
  Play,
  Pause,
  Square,
  Save,
  Trash2,
} from "lucide-react";

import useLocation from "../hooks/useLocation";
import { haversineDistance } from "../utils/haversine";
import { useRuns } from "../Context/RunContext";

export default function Track() {
  const { addRun } = useRuns();
  const navigate = useNavigate();

  // screen: "permission" | "running" | "finished"
  const [screen, setScreen] = useState("permission");

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [isSimulated, setIsSimulated] = useState(false);

  const { location, error, startTracking, stopTracking } = useLocation();

  // ---------- Timer ----------
  useEffect(() => {
    let timer;

    if (running && !paused) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, paused]);

  // Below this, coordinate changes are almost certainly GPS drift/jitter
  // rather than real movement (phone GPS commonly wobbles 3-15m at rest;
  // laptops/indoor Wi-Fi positioning can be far worse).
  const MIN_MOVEMENT_KM = 0.005; // 5 meters, floor for the best-case accuracy

  // ---------- GPS tracking / distance calc ----------
  useEffect(() => {
    if (isSimulated || !location || paused || screen !== "running") return;

    if (!lastLocation) {
      setLastLocation(location);
      setRoute((prev) => [...prev, location]);
      return;
    }

    const d = haversineDistance(
      lastLocation.lat,
      lastLocation.lng,
      location.lat,
      location.lng
    );

    // Scale the "is this real movement" threshold to the device's own
    // reported accuracy, instead of throwing the fix away outright.
    // A fix with poor accuracy just needs a bigger jump to count as motion.
    const accuracyKm = (location.accuracy || 0) / 1000;
    const requiredMovement = Math.max(MIN_MOVEMENT_KM, accuracyKm * 0.75);

    if (d < requiredMovement) return;

    setDistance((prev) => prev + d);
    setLastLocation(location);
    setRoute((prev) => [...prev, location]);
  }, [location, paused, screen]);

  // ---------- Simulated run movement ----------
  useEffect(() => {
    if (!isSimulated || paused || screen !== "running") return;

    const interval = setInterval(() => {
      setLastLocation((prevLast) => {
        const base = prevLast || { lat: 22.5726, lng: 88.3639 }; // Kolkata fallback

        // Small random walk, roughly 5-12 meters per tick.
        const next = {
          lat: base.lat + (Math.random() - 0.3) * 0.0001,
          lng: base.lng + (Math.random() - 0.3) * 0.0001,
        };

        const d = haversineDistance(base.lat, base.lng, next.lat, next.lng);

        setDistance((prevDist) => prevDist + d);
        setRoute((prevRoute) => [...prevRoute, next]);

        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulated, paused, screen]);

  // ---------- Helpers ----------
  function formatTime(totalSeconds = seconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return [hrs, mins, secs]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":");
  }

  function getPace(dist = distance, secs = seconds) {
    if (dist <= 0) return "--:--";
    const paceMinPerKm = secs / 60 / dist;
    const mins = Math.floor(paceMinPerKm);
    const secsPart = Math.round((paceMinPerKm - mins) * 60);
    return `${mins}:${secsPart.toString().padStart(2, "0")}`;
  }

  function resetRunState() {
    setRunning(false);
    setPaused(false);
    setSeconds(0);
    setDistance(0);
    setLastLocation(null);
    setRoute([]);
    setIsSimulated(false);
  }

  // ---------- Screen transitions ----------
  function allowGPS() {
    setIsSimulated(false);
    startTracking();
    setRunning(true);
    setPaused(false);
    setScreen("running");
  }

  function startSimulation() {
    setIsSimulated(true);
    setRunning(true);
    setPaused(false);
    setScreen("running");
  }

  // Lets the person bail into a simulated run mid-session, without
  // losing the elapsed time, if real GPS never gets a fix.
  function switchToSimulated() {
    stopTracking();
    setLastLocation(null);
    setIsSimulated(true);
  }

  function finishRun() {
    stopTracking();
    setRunning(false);
    setPaused(false);
    setScreen("finished");
  }

  function saveRun() {
    const run = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      distance: Number(distance.toFixed(2)),
      seconds,
      duration: formatTime(seconds),
      pace: getPace(),
      route,
    };

    addRun(run);
    resetRunState();
    navigate("/history");
  }

  function discardRun() {
    stopTracking();
    resetRunState();
    setScreen("permission");
  }

  // ---------- Render ----------
  return (
    <>
      {screen === "permission" && (
        <GPSPermission
          onAllowGPS={allowGPS}
          onSimulatedRun={startSimulation}
        />
      )}

      {screen === "running" && (
        <div className="relative h-full">
          <div className="h-full overflow-y-auto px-6 pt-10 pb-40">
            <p className="text-center text-gray-400 uppercase tracking-widest">
              Live GPS
            </p>

            <h1 className="text-center text-white text-2xl font-bold mt-3">
              {formatTime()}
            </h1>

            <div className="mt-6">
              <RunMap route={route} />
            </div>

            {!isSimulated && route.length < 2 && (
              <div className="mt-4 bg-[#17171B] rounded-2xl p-4">
                {error ? (
                  <>
                    <p className="text-red-400 text-sm font-semibold">
                      {error}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Check that location access is allowed for this site,
                      or continue without GPS.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Waiting for a GPS signal
                    {seconds > 6 ? " — this is taking longer than usual." : "..."}
                    {location?.accuracy != null && (
                      <> (accuracy: ~{Math.round(location.accuracy)}m)</>
                    )}
                  </p>
                )}

                {seconds > 6 && (
                  <button
                    onClick={switchToSimulated}
                    className="mt-3 w-full h-11 rounded-2xl bg-[#232328] text-gray-200 font-semibold text-sm"
                  >
                    Continue without GPS
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-[#17171B] rounded-3xl p-5">
                <p className="text-gray-500 uppercase text-sm">Distance</p>
                <h2 className="text-white text-3xl font-bold mt-2">
                  {distance.toFixed(2)} km
                </h2>
              </div>

              <div className="bg-[#17171B] rounded-3xl p-5">
                <p className="text-gray-500 uppercase text-sm">Avg Pace</p>
                <h2 className="text-white text-3xl font-bold mt-2">
                  {distance > 0 ? `${getPace()} min/km` : "--:--"}
                </h2>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {!paused ? (
                <button
                  onClick={() => setPaused(true)}
                  className="flex-1 h-16 rounded-3xl bg-yellow-400 text-black font-bold flex justify-center items-center gap-2"
                >
                  <Pause size={20} />
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => setPaused(false)}
                  className="flex-1 h-16 rounded-3xl bg-lime-400 text-black font-bold flex justify-center items-center gap-2"
                >
                  <Play size={20} />
                  Resume
                </button>
              )}

              <button
                onClick={finishRun}
                className="flex-1 h-16 rounded-3xl bg-red-500 text-white font-bold flex justify-center items-center gap-2"
              >
                <Square size={20} />
                Finish
              </button>
            </div>
          </div>

          <BottomNav />
        </div>
      )}

      {screen === "finished" && (
        <div className="relative h-full bg-black">
          <div className="h-full overflow-y-auto px-6 pt-10 pb-32">
            <p className="text-center text-gray-400 uppercase tracking-widest">
              Run Complete
            </p>

            <h1 className="text-center text-white text-5xl font-bold mt-3">
              {formatTime()}
            </h1>

            <div className="mt-6">
              <RunMap route={route} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-[#17171B] rounded-3xl p-5">
                <p className="text-gray-500 uppercase text-sm">Distance</p>
                <h2 className="text-white text-3xl font-bold mt-2">
                  {distance.toFixed(2)} km
                </h2>
              </div>

              <div className="bg-[#17171B] rounded-3xl p-5">
                <p className="text-gray-500 uppercase text-sm">Avg Pace</p>
                <h2 className="text-white text-3xl font-bold mt-2">
                  {distance > 0 ? `${getPace()} min/km` : "--:--"}
                </h2>
              </div>

              <div className="bg-[#17171B] rounded-3xl p-5 col-span-2">
                <p className="text-gray-500 uppercase text-sm">Time</p>
                <h2 className="text-white text-3xl font-bold mt-2">
                  {formatTime()}
                </h2>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-black border-t border-gray-800 flex gap-3">
            <button
              onClick={discardRun}
              className="flex-1 h-16 rounded-3xl bg-[#17171B] border border-gray-700 text-gray-300 font-bold flex justify-center items-center gap-2"
            >
              <Trash2 size={20} />
              Discard
            </button>

            <button
              onClick={saveRun}
              className="flex-1 h-16 rounded-3xl bg-lime-400 text-black font-bold flex justify-center items-center gap-2"
            >
              <Save size={20} />
              Save Run
            </button>
          </div>
        </div>
      )}
    </>
  );
}