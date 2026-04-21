"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface Project {
  id: number;
  name: string;
  url: string;
  covers: { "404"?: string; original?: string };
  fields?: string[];
}

const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
  "https://images.unsplash.com/photo-1495640452828-3df6795cf69b?w=600&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80",
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80",
  "https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=600&q=80",
];

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NEW FEATURE START
    const behanceRssUrl = process.env.NEXT_PUBLIC_BEHANCE_RSS_URL || "/api/behance";

    fetch(behanceRssUrl)
      .then((r) => r.text())
      .then((xmlText) => {
        if (!xmlText || xmlText.trim().startsWith("{")) {
          throw new Error("RSS feed not available");
        }

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const items = Array.from(xml.querySelectorAll("item")).slice(0, 12);

        const parsedProjects: Project[] = items.map((item, index) => {
          const title = item.querySelector("title")?.textContent?.trim() || `Project ${index + 1}`;
          const link = item.querySelector("link")?.textContent?.trim() || "https://www.behance.net/abbassamalik";
          const categoryNodes = Array.from(item.querySelectorAll("category"));
          const categories = categoryNodes
            .map((node) => node.textContent?.trim())
            .filter((value): value is string => Boolean(value));

          const description = item.querySelector("description")?.textContent || "";
          const imageMatch = description.match(/<img[^>]+src=[\"']([^\"']+)[\"']/i);
          const imageUrl = imageMatch?.[1] || PLACEHOLDER_COVERS[index % PLACEHOLDER_COVERS.length];

          return {
            id: index + 1,
            name: title,
            url: link,
            covers: { "404": imageUrl, original: imageUrl },
            fields: categories.length > 0 ? categories : ["Behance Project"],
          };
        });

        setProjects(parsedProjects);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // NEW FEATURE END
  }, []);

  const getCover = (p: Project, idx: number) =>
    p.covers?.["404"] || p.covers?.original || PLACEHOLDER_COVERS[idx % PLACEHOLDER_COVERS.length];

  return (
    <section id="portfolio" className="py-24 bg-charcoal text-ivory relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-gold text-sm tracking-[0.25em] uppercase font-light mb-4 block">My Work</span>
          <h2 className="text-4xl md:text-5xl font-light mb-6">Portfolio</h2>
          <p className="text-ivory/70 text-lg leading-relaxed">
            A selection of book covers and e-book projects crafted for authors and publishers worldwide.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-ivory/5 border border-gold/10 overflow-hidden">
                <div className="aspect-[4/3] bg-ivory/10" />
                <div className="p-6">
                  <div className="h-6 bg-ivory/10 rounded mb-4" />
                  <div className="h-4 bg-ivory/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(projects.length > 0 ? projects : [...Array(6)]).map((p, i) => {
              const proj = typeof p === "object" && p !== null && "name" in p ? (p as Project) : null;
              const coverUrl = proj ? getCover(proj, i) : PLACEHOLDER_COVERS[i];
              const projectUrl = proj?.url || "https://www.behance.net/abbassamalik";
              const projectName = proj?.name || "Book Design Project";

              return (
                <motion.a
                  key={proj?.id || i}
                  href={projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-3xl overflow-hidden border border-gold/10 bg-ivory/5 backdrop-blur-sm hover:border-gold/30 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={coverUrl}
                      alt={projectName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5">
                      <span className="text-sm text-ivory/80">View on Behance</span>
                      <ExternalLink className="w-5 h-5 text-gold" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-medium text-ivory mb-2 line-clamp-2">{projectName}</h3>
                    {proj?.fields?.[0] && (
                      <p className="text-sm text-gold/80 uppercase tracking-[0.15em]">{proj.fields[0]}</p>
                    )}
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-14"
        >
          <a
            href="https://www.behance.net/abbassamalik"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-gold/30 text-gold hover:bg-gold hover:text-charcoal transition-all duration-300"
          >
            View Full Portfolio on Behance
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
