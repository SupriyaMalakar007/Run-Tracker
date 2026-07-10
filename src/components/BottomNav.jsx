import { Home, MapPin, BarChart3, History } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  const items = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Track", icon: MapPin, path: "/track" },
    { name: "Stats", icon: BarChart3, path: "/stats" },
    { name: "History", icon: History, path: "/history" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#17171B] border-t border-zinc-800 flex justify-around items-center">
      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.path;

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center ${
              active ? "text-lime-400" : "text-zinc-500"
            }`}
          >
            <Icon size={22} />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}