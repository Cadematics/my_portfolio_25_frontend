import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "../auth";

export default function Navbar({ dark, toggleDark }) {
  const [isAuthed, setIsAuthed] = useState(!!getToken());
  const navigate = useNavigate();

  // Keep auth state synced
  useEffect(() => {
    const syncAuth = () => setIsAuthed(!!getToken());
    window.addEventListener("storage", syncAuth);
    const id = setInterval(syncAuth, 500);
    return () => {
      window.removeEventListener("storage", syncAuth);
      clearInterval(id);
    };
  }, []);

  function handleLogout() {
    clearToken();
    setIsAuthed(false);
    navigate("/");
  }

  return (
    <nav className={`${dark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-700"} border-b shadow-sm`}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/" className="font-bold text-lg">AI Portfolio</Link>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `hover:text-blue-600 ${isActive ? "font-semibold border-b-2 border-blue-600" : ""}`
          }
          end
        >
          Projects
        </NavLink>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>

          {!isAuthed ? (
            <NavLink to="/login" className="hover:text-blue-600">Login</NavLink>
          ) : (
            <button onClick={handleLogout} className="hover:text-red-500 transition">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
