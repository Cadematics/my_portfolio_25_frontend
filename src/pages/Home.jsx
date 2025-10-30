import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api";
import ProjectCard from "../components/ProjectCard"; // 👈 import the component

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProjects();
        const list = data.results ?? data;
        setFeatured(list.filter((p) => p.is_featured));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="grid gap-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-b from-blue-50 to-white rounded-lg shadow-sm">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Building Intelligence in 3D
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A collection of AI, Machine Learning, and Computer Vision projects — blending engineering, art, and creativity.
        </p>
        <Link
          to="/projects"
          className="mt-8 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          View Projects
        </Link>
      </section>

      {/* Featured Projects */}
      <section className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Featured Projects
        </h2>

        {featured.length === 0 ? (
          <p className="text-gray-500 text-center">
            No featured projects yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProjectCard key={p.slug} p={p} /> // 👈 use ProjectCard here
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
