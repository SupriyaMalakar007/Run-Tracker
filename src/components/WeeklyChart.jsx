import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";
import { useRuns } from "../Context/RunContext";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7; // days since Monday
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildWeeklyData(runs) {
  const startOfWeek = getStartOfWeek();

  return DAY_LABELS.map((day, i) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(startOfWeek.getDate() + i);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const km = runs
      .filter((run) => {
        const runDate = new Date(run.date);
        return runDate >= dayStart && runDate < dayEnd;
      })
      .reduce((sum, run) => sum + Number(run.distance || 0), 0);

    return { day, km: Number(km.toFixed(2)) };
  });
}

export default function WeeklyChart() {
  const { runs } = useRuns();
  const data = buildWeeklyData(runs);

  return (
    <div className="bg-[#17171B] rounded-3xl p-5 mt-8">
      <h2 className="text-white text-xl font-semibold mb-4">
        Weekly Activity
      </h2>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
            />

            <Tooltip />

            <Bar
              dataKey="km"
              fill="#A3E635"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}