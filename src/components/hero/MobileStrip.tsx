/**
 * MobileStrip.tsx — mobile fallback for the hero (<600px).
 *
 * The 2D scatter is unusable at 375/414 widths — controls would consume the
 * entire visible plane. Replace with a horizontally-scrolling strip of 6
 * representative project thumbnails sliced from the same atlas.
 *
 * Tap → astro:navigate to /work/<slug>.
 *
 * Visual contract:
 *   - Hero stays dark (PLANE_BG).
 *   - One mono caption above: "SELECTED · TAP TO EXPLORE".
 *   - Cards: min-w-[160px] aspect-square, scroll-snap-type: x mandatory.
 */

import type { LayoutDataBundle, ProjectEmbedding } from "../../lib/layoutData";

interface MobileStripProps {
  data: LayoutDataBundle;
}

const PLANE_BG = "#0b0d0f";
const HAIRLINE = "rgba(94, 99, 107, 0.40)";
const SPRITE_BORDER = "rgba(150, 155, 162, 0.30)";

/** Pick 6 representative projects: flagship first, then variety. */
function pickFeatured(projects: ProjectEmbedding[]): ProjectEmbedding[] {
  if (projects.length <= 6) return projects;
  // Prefer the thesis-flagship if present, then sample evenly across the rest.
  const flagshipIdx = projects.findIndex((p) =>
    p.slug.includes("thesis-flagship") || p.slug.includes("thesis"),
  );
  const picked: ProjectEmbedding[] = [];
  if (flagshipIdx >= 0) picked.push(projects[flagshipIdx]);
  const remaining = projects.filter((_, i) => i !== flagshipIdx);
  const need = 6 - picked.length;
  const step = Math.max(1, Math.floor(remaining.length / need));
  for (let i = 0; i < remaining.length && picked.length < 6; i += step) {
    picked.push(remaining[i]);
  }
  // Top up if rounding left us short.
  for (let i = 0; picked.length < 6 && i < remaining.length; i++) {
    if (!picked.includes(remaining[i])) picked.push(remaining[i]);
  }
  return picked.slice(0, 6);
}

function navigateTo(url: string) {
  const wn = window as unknown as {
    navigation?: { navigate: (u: string) => void };
  };
  try {
    if (wn.navigation && typeof wn.navigation.navigate === "function") {
      wn.navigation.navigate(url);
      return;
    }
  } catch {
    // fall through
  }
  window.location.assign(url);
}

export default function MobileStrip({ data }: MobileStripProps) {
  const featured = pickFeatured(data.embeddings.projects);

  return (
    <div
      className="hero-mobile-strip relative w-full"
      style={{
        background: PLANE_BG,
        borderTop: `1px solid ${HAIRLINE}`,
        borderBottom: `1px solid ${HAIRLINE}`,
        padding: "20px 0 24px",
      }}
    >
      <div
        className="px-4 pb-3"
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "11px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#c8ccd0",
        }}
      >
        Selected · Tap to explore
      </div>

      <div
        className="hero-mobile-strip-scroll flex gap-3 overflow-x-auto px-4"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "8px",
        }}
      >
        {featured.map((p) => {
          // Round-8b: GL bottom-left UV → CSS top-left bg-position flip.
          const [u, v, w, h] = p.thumbnail_uv;
          const bgSizeX = `${(1 / Math.max(w, 0.0001)) * 100}%`;
          const bgSizeY = `${(1 / Math.max(h, 0.0001)) * 100}%`;
          const bgPosX = `${(u / Math.max(1 - w, 0.0001)) * 100}%`;
          const bgPosY = `${((1 - v - h) / Math.max(1 - h, 0.0001)) * 100}%`;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => navigateTo(`/work/${p.slug}`)}
              aria-label={`Open ${p.title}`}
              className="hero-mobile-card relative shrink-0"
              style={{
                minWidth: "160px",
                width: "160px",
                height: "160px",
                scrollSnapAlign: "start",
                backgroundImage: "url(/data/atlas.png)",
                backgroundRepeat: "no-repeat",
                backgroundSize: `${bgSizeX} ${bgSizeY}`,
                backgroundPosition: `${bgPosX} ${bgPosY}`,
                border: `1px solid ${SPRITE_BORDER}`,
                borderRadius: "4px",
                padding: 0,
                cursor: "pointer",
                outline: "none",
              }}
            >
              <span
                aria-hidden
                className="absolute bottom-1 left-1 right-1"
                style={{
                  fontFamily:
                    "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "10px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "#e6e7e9",
                  textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "left",
                }}
              >
                {p.title}
              </span>
              <span className="sr-only">{p.title}</span>
            </button>
          );
        })}
      </div>

      <div
        className="px-4 pt-3"
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#5e636b",
        }}
      >
        Tap to explore · Scroll ↗
      </div>

      <style>{`
        .hero-mobile-strip-scroll::-webkit-scrollbar { height: 4px; }
        .hero-mobile-strip-scroll::-webkit-scrollbar-thumb {
          background: rgba(150, 155, 162, 0.25);
          border-radius: 2px;
        }
        .hero-mobile-card:focus-visible {
          box-shadow: 0 0 0 2px #b8623f;
        }
      `}</style>
    </div>
  );
}
