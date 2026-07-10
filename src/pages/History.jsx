import BottomNav from "../components/BottomNav";
import { useRuns } from "../Context/RunContext";
import { Trash2 } from "lucide-react";

export default function History() {
  const { runs, deleteRun } = useRuns();

  return (
    <>
      <div className="px-6 pt-14 pb-32">
        <h1 className="text-white text-5xl font-bold">HISTORY</h1>

        {runs.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <h2 className="text-white text-2xl font-semibold">
              No runs yet
            </h2>

            <p className="text-gray-500 mt-3">
              Start your first run to see your history.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-8">
            {runs.map((run) => (
              <div
                key={run.id}
                className="bg-[#17171B] rounded-3xl p-5 relative"
              >
                <button
                  onClick={() => deleteRun(run.id)}
                  className="absolute top-5 right-5 text-gray-600"
                  aria-label="Delete run"
                >
                  <Trash2 size={18} />
                </button>

                <p className="text-gray-500">
                  {new Date(run.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <h2 className="text-white text-4xl font-bold mt-2">
                  {run.distance} <span className="text-lg text-gray-500">km</span>
                </h2>

                <p className="text-gray-500 mt-2">
                  {run.duration} • {run.pace} /km
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </>
  );
}