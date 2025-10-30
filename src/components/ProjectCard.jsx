import { Link } from "react-router-dom";

export default function ProjectCard({ p }) {
  return (
    <Link
      to={`/projects/${p.slug}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition overflow-hidden"
    >
      {p.cover_image && (
        <img
          src={p.cover_image}
          alt=""
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
          {p.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{p.summary}</p>
      </div>
    </Link>
  );
}
