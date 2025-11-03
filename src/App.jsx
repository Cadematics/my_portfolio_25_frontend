import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearToken } from "./auth";
import Navbar from "./components/Navbar";

export default function App() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // detect fullscreen page
  const isFullScreen = location.pathname.includes("model-visualizer");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function handleLogout() {
    clearToken();
    navigate("/");
  }

  return (
    <div
      className={`min-h-screen ${
        dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Navbar stays fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar dark={dark} setDark={setDark} onLogout={handleLogout} />
      </div>

      {/* Content area — fullscreen route gets zero padding */}
      <main
        className={
          isFullScreen
            ? "pt-14 w-screen h-[calc(100vh-3.5rem)] overflow-hidden"
            : "max-w-5xl mx-auto px-4 py-6 pt-20"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
