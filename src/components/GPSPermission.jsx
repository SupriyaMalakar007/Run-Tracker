import { Navigation, Radar } from "lucide-react";

export default function GPSPermission({ onAllowGPS, onSimulatedRun }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-7">
      <div className="w-24 h-24 rounded-full bg-[#17171B] flex items-center justify-center mb-8">
        <Navigation className="text-lime-400" size={40} />
      </div>

      <h1 className="text-white text-3xl font-bold text-center leading-tight">
        Find your
        <br />
        location
      </h1>

      <p className="text-gray-500 text-center mt-3 max-w-xs">
        We need GPS access to track your distance, pace, and route as you
        run.
      </p>

      <button
        onClick={onAllowGPS}
        className="mt-10 w-full h-16 rounded-3xl bg-lime-400 text-black font-bold text-lg flex justify-center items-center gap-3"
      >
        <Navigation size={20} fill="black" />
        Allow GPS & Run
      </button>

      <button
        onClick={onSimulatedRun}
        className="mt-4 w-full h-16 rounded-3xl bg-[#17171B] border border-gray-700 text-gray-300 font-semibold text-base flex justify-center items-center gap-2"
      >
        <Radar size={18} />
        No GPS here? Try a simulated run
      </button>
    </div>
  );
}