import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, postComment } from "../api";
import { getToken } from "../auth";

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [err, setErr] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const token = getToken();

  async function load() {
    setErr("");
    try {
      const p = await getProject(slug);
      setProject(p);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { load(); }, [slug]);

  async function onPost(e) {
    e.preventDefault();
    if (!token) return setErr("Please login to comment.");
    if (!content.trim()) return;
    setPosting(true);
    try {
      await postComment(slug, content.trim(), token);
      setContent("");
      await load(); // refresh to show new comment
    } catch (e) {
      setErr(e.message);
    } finally {
      setPosting(false);
    }
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!project) return <p>Loading…</p>;

  return (
    <article className="grid gap-4">
      {project.cover_image && (
        <img src={project.cover_image} className="rounded aspect-video object-cover" />
      )}
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-700">{project.summary}</p>
      <div className="prose max-w-none">
        <p>{project.description}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(project.tech_stack || []).map(t => (
          <span key={t} className="px-2 py-1 rounded bg-gray-200 text-xs">{t}</span>
        ))}
      </div>

{project.slug === "object-detection" && (
  <a
    href="/projects/object-detection"
    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded mt-3"
  >
    Launch Object Detection Demo
  </a>
)}




      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Comments</h2>

        {/* comment form */}
        <form onSubmit={onPost} className="bg-white p-3 rounded shadow grid gap-2">
          {!token && <p className="text-sm text-gray-600">
            You must be logged in to comment.
          </p>}
          <textarea
            className="border rounded p-2 min-h-[90px]"
            placeholder={token ? "Write a comment…" : "Login first to comment."}
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={!token || posting}
          />
          <div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={!token || posting || !content.trim()}
            >
              {posting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>

        {/* comment list */}
        {!project.comments?.length && <p className="text-gray-500">No comments yet.</p>}
        <ul className="grid gap-2">
          {project.comments?.map(c => (
            <li key={c.id} className="bg-white rounded p-3 shadow">
              <div className="text-xs text-gray-500 mb-1">
                {c.author_name} • {new Date(c.created_at).toLocaleString()}
              </div>
              <div className="text-sm">{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
