"use client";

import { useEffect, useState } from "react";

type Post = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: string;
};

export default function MediumProjects() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/medium")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-24">

      {/* TITLE */}
      <h2 className="text-3xl md:text-4xl font-serif text-white mb-12">
        Projects & Case Studies
      </h2>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-8">

        {posts.slice(0, 6).map((post) => {
          // 🔥 استخراج الصورة من description
          const imageFromDesc =
            post.description?.match(/<img.*?src="(.*?)"/)?.[1];

          // 🔥 fallback system
          const image =
            post.thumbnail ||
            imageFromDesc ||
            "/placeholder.jpg";

          // تنظيف النص
          const cleanText = post.description
            ?.replace(/<[^>]+>/g, "")
            ?.slice(0, 120);

          return (
            <a
              key={post.link}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/10 rounded-xl overflow-hidden hover:border-gold transition-all duration-300"
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden">
                <img
                  src={image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />

                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-6">

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gold transition">
                  {post.title}
                </h3>

                <p className="text-white/60 text-sm leading-relaxed">
                  {cleanText}...
                </p>

                <span className="text-xs text-white/40 mt-4 block">
                  {new Date(post.pubDate).toLocaleDateString()}
                </span>

              </div>
            </a>
          );
        })}

      </div>
    </section>
  );
}