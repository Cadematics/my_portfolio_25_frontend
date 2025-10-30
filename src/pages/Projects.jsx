import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api";

export default function Projects() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(params={}) {
    setLoading(true);
    const data = await getProjects(params);
    setItems(data.results ?? data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="grid gap-4">
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Search projects…" className="border rounded p-2 flex-1"/>
        <button onClick={()=>load({q})} className="bg-blue-600 text-white px-4 rounded">Search</button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(p => (
            <Link key={p.slug} to={`/projects/${p.slug}`} className="bg-white rounded shadow p-4 hover:shadow-md transition">
              {p.cover_image && <img src={p.cover_image} alt="" className="rounded mb-3 aspect-video object-cover" />}
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{p.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
