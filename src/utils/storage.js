const STORAGE_KEY = "run-tracker-runs";

// Get all runs
export function getRuns() {
  const runs = localStorage.getItem(STORAGE_KEY);

  if (!runs) {
    return [];
  }

  try {
    return JSON.parse(runs);
  } catch (error) {
    console.error("Failed to load runs:", error);
    return [];
  }
}

// Save all runs
export function saveRuns(runs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

// Save a single run
export function addRun(run) {
  const runs = getRuns();

  runs.unshift(run);

  saveRuns(runs);
}

// Delete one run
export function deleteRun(id) {
  const runs = getRuns().filter((run) => run.id !== id);

  saveRuns(runs);
}

// Get one run
export function getRun(id) {
  return getRuns().find((run) => run.id === id);
}

// Delete everything
export function clearRuns() {
  localStorage.removeItem(STORAGE_KEY);
}