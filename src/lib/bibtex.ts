// Tiny BibTeX builder. Produces a @misc entry with whatever fields
// the project frontmatter has available. Output is plain text.

interface BibInput {
  slug: string;
  title: string;
  role?: string;
  team?: string[];
  year?: number;
  course?: string;
  institution?: string;
  url?: string;
}

function escapeBib(value: string): string {
  return value.replace(/[{}\\]/g, "");
}

function pickAuthor(input: BibInput): string {
  // Prefer team list if present, otherwise the role text, else default.
  if (input.team && input.team.length > 0) {
    return input.team.join(" and ");
  }
  if (input.role && input.role !== "individual" && input.role !== "Individual") {
    return input.role;
  }
  return "David Chen";
}

export function toBibTeX(data: any, baseUrl = "https://tianle-chen.com", entrySlug?: string): string {
  const slug: string = entrySlug ?? data.slug ?? "untitled";
  const url = `${baseUrl}/work/${slug}`;
  const note = [data.course, data.institution].filter(Boolean).join(", ");

  const entry: BibInput = {
    slug,
    title: data.title,
    role: data.role,
    team: data.team,
    year: data.year,
    course: data.course,
    institution: data.institution,
    url,
  };

  const lines = [
    `@misc{${slug},`,
    `  title  = {${escapeBib(entry.title)}},`,
    `  author = {${escapeBib(pickAuthor(entry))}},`,
  ];
  if (entry.year) lines.push(`  year   = {${entry.year}},`);
  if (note) lines.push(`  note   = {${escapeBib(note)}},`);
  lines.push(`  url    = {${url}}`);
  lines.push(`}`);
  return lines.join("\n");
}
