/**
 * HeroDescriptionPanel.tsx — Round-7 strip below the scatter that always
 * shows a project description. Updates on hover; falls back to the flagship
 * project when nothing is hovered, so the panel is never empty.
 *
 * Rendered as a sibling AFTER <SemanticPlane> in HeroNavigator (not as an
 * overlay) — keeps the scatter clear of additional chrome and avoids
 * conflicts with ModePanel / AxisInputs which already occupy the corners.
 */

import { useMemo } from "react";

import type { LayoutDataBundle, ProjectEmbedding } from "../../lib/layoutData";
import { useNavStore } from "../../lib/nav-store";

interface Props {
  data: LayoutDataBundle;
}

const HAIRLINE = "rgba(94, 99, 107, 0.40)";
const TEXT_PRIMARY = "#e6e7e9";
const TEXT_SECONDARY = "#b2b6bb";
const TEXT_MUTED = "#888c92";
const ACCENT = "#cf7f54";

function findProject(
  data: LayoutDataBundle,
  slug: string | null,
): ProjectEmbedding | null {
  if (!slug) return null;
  return data.embeddings.projects.find((p) => p.slug === slug) ?? null;
}

function flagship(data: LayoutDataBundle): ProjectEmbedding | null {
  return (
    data.embeddings.projects.find(
      (p) => (p as ProjectEmbedding & { priority?: string }).priority ===
        "flagship",
    ) ?? data.embeddings.projects[0] ?? null
  );
}

export default function HeroDescriptionPanel({ data }: Props) {
  const hoveredSlug = useNavStore((s) => s.hoveredSlug);

  const fallback = useMemo(() => flagship(data), [data]);
  const hovered = findProject(data, hoveredSlug);
  const project = hovered ?? fallback;

  if (!project) return null;

  const isHovered = !!hovered;
  const summary = project.summary ?? "Hover any tile in the scatter to read its summary, or click to open the case study.";

  return (
    <div
      className="hero-description-strip"
      style={{
        background: "#0b0d0f",
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "20px 24px 22px",
          display: "grid",
          gridTemplateColumns: "minmax(140px, max-content) 1fr auto",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left: kicker (state + year) */}
        <div
          style={{
            fontFamily:
              "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isHovered ? ACCENT : TEXT_MUTED,
            paddingTop: 4,
            whiteSpace: "nowrap",
          }}
        >
          {isHovered ? "INSPECTING" : "FLAGSHIP"}
          {project.year ? ` · ${project.year}` : ""}
        </div>

        {/* Middle: title + summary */}
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontFamily:
                "'Domaine Display', 'Source Serif Pro', Georgia, serif",
              fontSize: 18,
              fontWeight: 380,
              lineHeight: 1.2,
              letterSpacing: "-0.005em",
              color: TEXT_PRIMARY,
              margin: 0,
              marginBottom: 6,
            }}
          >
            {project.title}
          </h3>
          <p
            style={{
              fontFamily:
                "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: TEXT_SECONDARY,
              margin: 0,
              maxWidth: "72ch",
            }}
          >
            {summary}
          </p>
        </div>

        {/* Right: tags + open link */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 10,
            paddingTop: 4,
          }}
        >
          {project.categories && project.categories.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                justifyContent: "flex-end",
                maxWidth: 220,
              }}
            >
              {project.categories.slice(0, 3).map((c) => (
                <span
                  key={c}
                  style={{
                    fontFamily:
                      "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 9,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    padding: "2px 7px",
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 3,
                    color: TEXT_SECONDARY,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          <a
            href={`/work/${project.slug}`}
            style={{
              fontFamily:
                "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: ACCENT,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Open project →
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .hero-description-strip > div {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .hero-description-strip > div > div:last-child {
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
