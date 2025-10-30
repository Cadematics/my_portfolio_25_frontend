import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearToken } from "./auth";
import Navbar from "./components/Navbar";

export default function App() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

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
      <Navbar dark={dark} setDark={setDark} onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}


