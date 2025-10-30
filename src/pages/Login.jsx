import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";         // expects { access, refresh }
import { setToken, clearToken } from "../auth"; // from src/auth.js

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access } = await login(username.trim(), password);
      setToken(access);            // save JWT
      navigate("/projects");       // go to projects
    } catch (e) {
      clearToken();
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Username</span>
          <input
            className="border rounded p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="your_username"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Password</span>
          <div className="flex">
            <input
              className="border rounded-l p-2 flex-1"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="border border-l-0 rounded-r px-3 text-sm text-gray-600"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          className="bg-blue-600 text-white rounded py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
