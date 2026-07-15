import { useEffect, useState } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";

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
  const routerLocation = useRouterLocation();
  // screen: "permission" | "running" | "finished"
  const [screen, setScreen] = useState("running");

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const { location, error, startTracking, stopTracking } = useLocation();

  useEffect(() => {
    let timer;

    if (running && !paused) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, paused]);

  const MIN_MOVEMENT_KM = 0.005; // 5 meters, floor for the best-case accuracy

  useEffect(() => {
  if (routerLocation.state?.autoStart) {
    allowGPS();
  }
}, []);

  useEffect(() => {
    console.log("New GPS location:", location);
    if (!location || paused || screen !== "running") return;

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
    const accuracyKm = (location.accuracy || 0) / 1000;
    const requiredMovement = Math.max(MIN_MOVEMENT_KM, accuracyKm * 0.75);

    if (d < requiredMovement) return;

    setDistance((prev) => prev + d);
    setLastLocation(location);
    setRoute((prev) => [...prev, location]);
  }, [location, paused, screen]);

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
  }

  function allowGPS() {
  startTracking();
  setRunning(true);
  setPaused(false);
  setScreen("running");
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
    navigate("/");
  }
  return (
    <>
      {screen === "running" && (
        <div className="relative h-full">
          <div className="h-full overflow-y-auto px-6 pt-10 pb-40">
            <p className="text-center text-gray-400 uppercase tracking-widest">
              Live GPS
            </p>

            <h1 className="text-center text-white text-2xl font-bold mt-3">
              {formatTime()}
            </h1>

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