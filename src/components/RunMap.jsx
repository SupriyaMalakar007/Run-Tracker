import { MapPin } from "lucide-react";

const SIZE = 300;
const PADDING = 24;

export default function RunMap({ route = [] }) {
  const hasRoute = route.length >= 2;

  if (!hasRoute) {
    return (
      <div className="w-full h-72 rounded-3xl border-2 border-dashed border-gray-700 bg-[#111114] flex flex-col items-center justify-center">
        <MapPin className="text-gray-600" size={28} />
        <p className="text-gray-500 mt-3">Route will appear here</p>
      </div>
    );
  }

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Guard against a run with (almost) no movement.
  const latRange = maxLat - minLat || 0.0001;
  const lngRange = maxLng - minLng || 0.0001;

  const drawable = SIZE - PADDING * 2;

  const toPoint = ({ lat, lng }) => {
    const x = PADDING + ((lng - minLng) / lngRange) * drawable;
    // Flip Y: latitude increases going up, SVG y increases going down.
    const y = PADDING + (1 - (lat - minLat) / latRange) * drawable;
    return [x, y];
  };

  const points = route.map(toPoint);
  const pathD = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");

  const [startX, startY] = points[0];
  const [endX, endY] = points[points.length - 1];

  return (
    <div className="w-full h-72 rounded-3xl bg-[#111114] overflow-hidden">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={pathD}
          fill="none"
          stroke="#a3e635"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={startX} cy={startY} r="6" fill="#a3e635" />
        <circle cx={endX} cy={endY} r="6" fill="#ffffff" />
      </svg>
    </div>
  );
}