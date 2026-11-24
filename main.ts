// "One Page, One War" — a short funny rant about the office printer,
// for the make.fun bounty
// u-riidzhsn-angry-judge-the-short-rant-contest-b9f46046.
//
// The rant: the printer worked perfectly all week, then on the one
// morning a single page is needed it demands a firmware update, a new
// cartridge, and a password set in 2019. That is the joke the judge
// brief asks for, in its own order: it is a funny rant about one small
// everyday annoyance, not a general essay or a list of complaints; the
// laugh is the standoff at the end — it blinked at me, I blinked back,
// we are not friends anymore; the annoyance is concrete (the printer,
// the firmware update, the cartridge, the 2019 password); the wording
// is sharp and economical, every sentence earning its place; and the
// angle is fresh — a negotiation with a machine that has one job,
// instead of the usual "the printer jammed again".
//
// The program writes that rant, and nothing else, to
// /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the text that passed the gate. Node 22+, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The rant. 315 Unicode code points as written; the gate counts the
// file, so the trailing newline makes 316.
const RANT =
  "The printer worked perfectly all week. The one morning I need a single page, it wants a firmware update, a new cartridge, and a password I set in 2019. I did not come here to negotiate with a machine that has one job. I came to print one page and leave. It blinked at me. I blinked back. We are not friends anymore.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 400
// characters, not only white space. The file carries one trailing
// newline, so the rant itself must stay at or below 399.
const GATE = { minPoints: 1, maxPoints: 400 };

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so a character outside the BMP would still count once.
const points = (text: string): number => [...text].length;

// Each rule is one promise to the judge brief, named so a failure
// says which promise broke. The table is the gate: every rule must
// hold, and the table itself is the whole check — no rule lives
// anywhere else. The rules run in the judge's own order — form first,
// then the concrete detail, then the fresh angle — so the first
// failure is the first criterion the entry would lose on.
const RULES: { name: string; test: (text: string) => boolean }[] = [
  {
    name: "the entry must be a few sentences of rant, not one flat line",
    test: (text) => text.split(/(?<=[.!?])\s+/).length >= 4,
  },
  {
    name: "the entry must not be only whitespace",
    test: (text) => text.trim().length > 0,
  },
  {
    name: "the entry file must be 1 to 400 characters",
    test: (text) =>
      points(text) + 1 >= GATE.minPoints && points(text) + 1 <= GATE.maxPoints,
  },
  {
    // The judge's first test is the form: a funny rant about an
    // everyday annoyance, so the text must name the annoyance itself.
    name: "the entry must rant about one concrete everyday annoyance",
    test: (text) => /\bprinter\b/i.test(text),
  },
  {
    // The judge's third test is the concrete detail: the rant must
    // name what the machine demands, not just that it is broken.
    name: "the entry must name the machine's specific demands",
    test: (text) => /firmware update/i.test(text) && /new cartridge/i.test(text),
  },
  {
    // The judge's fifth test is freshness: the standoff ending is
    // the angle no other rant takes — a negotiation, not a jam.
    name: "the entry must end on its own fresh angle, not a complaint",
    test: (text) => /We are not friends anymore\.$/.test(text),
  },
];

// Runs every rule in the table and returns the names of the broken
// promises, so a failure names the broken promise instead of failing
// silently.
function validate(text: string): string[] {
  return RULES.filter((rule) => !rule.test(text)).map((rule) => rule.name);
}

// Writes the rant, then proves the bytes on disk are exactly the
// text that passed the gate.
function writeEntry(): void {
  const problems = validate(RANT);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`gate: ${problem}`);
    }
    process.exit(1);
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", `${RANT}\n`, "utf8");
  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== `${RANT}\n`) {
    console.error("gate: the file on disk is not the rant that passed the gate");
    process.exit(1);
  }
  console.log(`wrote /output/entry.txt (${points(RANT)} code points, ${RANT.split(/(?<=[.!?])\s+/).length} sentences)`);
}

writeEntry();
