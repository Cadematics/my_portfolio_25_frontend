import { useState } from "react";
import { login } from "../api";

export default function Login() {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [token, setToken] = useState(""); const [error, setError] = useState("");

  async function onSubmit(e){
    e.preventDefault(); setError("");
    try {
      const { access } = await login(u, p);
      setToken(access);
      localStorage.setItem("token", access);
    } catch (e) { setError(e.message); }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow max-w-md">
      <h1 className="text-xl font-semibold mb-3">Login</h1>
      <input className="border rounded p-2 w-full mb-2" placeholder="username" value={u} onChange={e=>setU(e.target.value)} />
      <input className="border rounded p-2 w-full mb-2" placeholder="password" type="password" value={p} onChange={e=>setP(e.target.value)} />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button className="bg-blue-600 text-white rounded px-4 py-2">Get Token</button>
      {token && <p className="mt-3 text-xs break-all">Token: {token}</p>}
    </form>
  );
}
