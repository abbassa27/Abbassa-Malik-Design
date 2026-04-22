"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Reveal from "@/components/Reveal";

interface Project {
  id: number;
  name: string;
  url: string;
  covers?: Record<string, string | undefined>;
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

function coverFromProject(p: Project, idx: number): string {
  const c = p.covers;
  const url =
    (c?.["404"] as string | undefined) ||
    (c?.["230"] as string | undefined) ||
    (c?.original as string | undefined) ||
    (c?.["115"] as string | undefined);
  return url || PLACEHOLDER_COVERS[idx % PLACEHOLDER_COVERS.length];
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/behance/projects")
      .then((r) => r.json())
      .then((data: { projects?: Project[] }) => {
        const list = Array.isArray(data.projects) ? data.projects : [];
        setProjects(list);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const display = projects.length > 0 ? projects.slice(0, 12) : [];

  return (
    <section id="portfolio" className="py-24 lg:py-32 bg-ink relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal className="max-w-3xl mx-auto text-center mb-14 lg:mb-16">
          <span className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-4 block">
            Behance · Live gallery
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-5">
            Recent book cover designs
          </h2>
          <p className="text-white/55 text-base sm:text-lg leading-relaxed">
            Projects sync from your Behance profile when RSS or API data is available — always linking out to the full case study.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-white/5" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {(display.length > 0 ? display : [null, null, null, null, null, null]).map((p, i) => {
              const proj = p as Project | null;
              const coverUrl = proj ? coverFromProject(proj, i) : PLACEHOLDER_COVERS[i];
              const projectUrl = proj?.url || "https://www.behance.net/abbassamalik";
              const projectName = proj?.name || "Book design project";

              return (
                <motion.a
                  key={proj?.id ?? `ph-${i}`}
                  href={projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-gold/35 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={coverUrl}
                      alt={projectName}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                      <span className="text-xs text-white/80">View on Behance</span>
                      <ExternalLink className="w-4 h-4 text-gold" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-medium text-white mb-1 line-clamp-2">{projectName}</h3>
                    {proj?.fields?.[0] && (
                      <p className="text-[11px] text-gold/80 uppercase tracking-[0.15em]">{proj.fields[0]}</p>
                    )}
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

        <Reveal className="text-center mt-12 lg:mt-14">
          <a
            href="https://www.behance.net/abbassamalik"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-8 py-3.5 text-sm font-semibold text-gold hover:bg-gold/10 transition-colors"
          >
            View all work on Behance
            <ExternalLink className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
