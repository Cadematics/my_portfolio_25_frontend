import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject } from "../api";

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    getProject(slug).then(setProject);
  }, [slug]);

  if (!project) return <p>Loading…</p>;

  return (
    <article className="grid gap-4">
      {project.cover_image && <img src={project.cover_image} className="rounded aspect-video object-cover" />}
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-700">{project.summary}</p>
      <div className="prose max-w-none">
        <p>{project.description}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        {(project.tech_stack || []).map(t => (
          <span key={t} className="px-2 py-1 rounded bg-gray-200 text-xs">{t}</span>
        ))}
      </div>

      <div className="flex gap-3">
        {project.github_url && <a href={project.github_url} target="_blank" className="text-blue-600 underline">GitHub</a>}
        {project.demo_url && <a href={project.demo_url} target="_blank" className="text-blue-600 underline">Demo</a>}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Comments</h2>
        {!project.comments?.length && <p className="text-gray-500">No comments yet.</p>}
        <ul className="grid gap-2">
          {project.comments?.map(c => (
            <li key={c.id} className="bg-white rounded p-3 shadow">
              <div className="text-sm text-gray-500">{c.author_name} • {new Date(c.created_at).toLocaleString()}</div>
              <div>{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
