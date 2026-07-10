import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Track from "./pages/Track";
import Stats from "./pages/Stats";
import History from "./pages/History";

export default function App() {
  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="relative w-[390px] h-[844px] bg-[#09090B] overflow-hidden border border-zinc-800">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<Track />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </div>
  );
}