import { createContext, useContext, useEffect, useState } from "react";
import { getRuns, addRun as saveRunToStorage } from "../utils/storage";

const RunContext = createContext();

export function RunProvider({ children }) {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    setRuns(getRuns());
  }, []);

  function addRun(run) {
    saveRunToStorage(run);
    setRuns(getRuns());
  }

  function deleteRun(id) {
    const updatedRuns = runs.filter((run) => run.id !== id);

    localStorage.setItem(
      "run-tracker-runs",
      JSON.stringify(updatedRuns)
    );

    setRuns(updatedRuns);
  }

  function clearAllRuns() {
    localStorage.removeItem("run-tracker-runs");
    setRuns([]);
  }

  const totalDistance = runs.reduce(
    (sum, run) => sum + Number(run.distance || 0),
    0
  );

  const totalTime = runs.reduce(
    (sum, run) => sum + Number(run.seconds || 0),
    0
  );

  const totalRuns = runs.length;

  const averagePace =
    totalRuns === 0 || totalDistance === 0
      ? "--:--"
      : (() => {
          const paceMinPerKm = totalTime / 60 / totalDistance;
          const mins = Math.floor(paceMinPerKm);
          const secs = Math.round((paceMinPerKm - mins) * 60);
          return `${mins}:${secs.toString().padStart(2, "0")}`;
        })();

  return (
    <RunContext.Provider
      value={{
        runs,
        addRun,
        deleteRun,
        clearAllRuns,
        totalDistance,
        totalTime,
        totalRuns,
        averagePace,
      }}
    >
      {children}
    </RunContext.Provider>
  );
}

export function useRuns() {
  return useContext(RunContext);
}