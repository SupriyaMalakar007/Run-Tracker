import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { useRuns } from "../Context/RunContext";

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7; // days since Monday
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { runs, totalRuns } = useRuns();

  const startOfWeek = getStartOfWeek();

  const weeklyDistance = runs
    .filter((run) => new Date(run.date) >= startOfWeek)
    .reduce((sum, run) => sum + Number(run.distance || 0), 0);

  const lastRun = runs[0];

  return (
    <>
      <div className="px-7 pt-14">

        <p className="text-gray-500 text-lg">
          Good evening
        </p>

        <h1 className="uppercase text-white text-6xl leading-none mt-2 font-bold tracking-tight">
          Ready
          <br />
          to Run?
        </h1>

        <button
          onClick={() => navigate("/track")}
          className="mt-10 w-full h-16 rounded-3xl bg-lime-400 text-black font-bold text-xl flex justify-center items-center gap-3"
        >
          <Play fill="black" size={22} />
          Start a run
        </button>

        <div className="grid grid-cols-2 gap-4 mt-8">

          <div className="bg-[#17171B] rounded-3xl p-5">
            <p className="text-gray-500 uppercase text-sm">
              This Week
            </p>

            <h2 className="text-white text-4xl font-bold mt-3">
              {weeklyDistance.toFixed(2)}
              <span className="text-lg text-gray-500 ml-1">
                km
              </span>
            </h2>
          </div>

          <div className="bg-[#17171B] rounded-3xl p-5">
            <p className="text-gray-500 uppercase text-sm">
              Total Runs
            </p>

            <h2 className="text-white text-4xl font-bold mt-3">
              {totalRuns}
            </h2>
          </div>

        </div>

        {lastRun && (
          <>
            <div className="flex justify-between items-center mt-10">

              <h2 className="text-white text-2xl font-semibold">
                Last Run
              </h2>

              <button
                onClick={() => navigate("/history")}
                className="text-lime-400 font-medium"
              >
                See all →
              </button>

            </div>

            <div className="bg-[#17171B] rounded-3xl mt-5 p-5">

              <p className="text-gray-500">
                {new Date(lastRun.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <h2 className="text-white text-4xl font-bold mt-2">
                {lastRun.distance} KM
              </h2>

              <p className="text-gray-500 mt-2">
                {lastRun.duration} • {lastRun.pace} /km
              </p>

            </div>
          </>
        )}

      </div>

      <BottomNav />
    </>
  );
}