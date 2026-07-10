import BottomNav from "../components/BottomNav";
import WeeklyChart from "../components/WeeklyChart";
import { useRuns } from "../Context/RunContext";

function formatDuration(totalSeconds = 0) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  return [hrs, mins, secs]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}

function paceToSeconds(pace) {
  if (!pace || pace === "--:--") return null;
  const [mins, secs] = pace.split(":").map(Number);
  if (Number.isNaN(mins) || Number.isNaN(secs)) return null;
  return mins * 60 + secs;
}

function getBestPace(runs) {
  const paceSeconds = runs
    .map((run) => paceToSeconds(run.pace))
    .filter((s) => s !== null && s > 0);

  if (paceSeconds.length === 0) return "--";

  const best = Math.min(...paceSeconds);
  const mins = Math.floor(best / 60);
  const secs = best % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Stats() {
  const { runs, totalDistance, totalTime, averagePace } = useRuns();

  const bestPace = getBestPace(runs);

  return (
    <>
      <div className="px-6 pt-14">

        <h1 className="text-white text-5xl font-bold">
          STATISTICS
        </h1>

        <div className="grid grid-cols-2 gap-4 mt-8">

          <div className="bg-[#17171B] rounded-3xl p-5">
            <p className="text-gray-500">TOTAL DISTANCE</p>
            <h2 className="text-white text-3xl font-bold mt-3">
              {totalDistance.toFixed(2)} KM
            </h2>
          </div>

          <div className="bg-[#17171B] rounded-3xl p-5">
            <p className="text-gray-500">TOTAL TIME</p>
            <h2 className="text-white text-3xl font-bold mt-3">
              {formatDuration(totalTime)}
            </h2>
          </div>

          <div className="bg-[#17171B] rounded-3xl p-5">
            <p className="text-gray-500">AVERAGE PACE</p>
            <h2 className="text-white text-3xl font-bold mt-3">
              {averagePace}
            </h2>
          </div>

          <div className="bg-[#17171B] rounded-3xl p-5">
            <p className="text-gray-500">BEST PACE</p>
            <h2 className="text-white text-3xl font-bold mt-3">
              {bestPace}
            </h2>
          </div>

        </div>

        {/* Weekly Chart */}
        <div className="mt-8">
          <WeeklyChart />
        </div>

      </div>

      <BottomNav />
    </>
  );
}