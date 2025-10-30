
import './App.css'
import { Outlet, Link, NavLink } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link to="/" className="font-bold">AI Portfolio</Link>
          <NavLink to="/projects" className="text-gray-700" end>Projects</NavLink>
          <div className="ml-auto">
            <NavLink to="/login" className="text-gray-700">Login</NavLink>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
