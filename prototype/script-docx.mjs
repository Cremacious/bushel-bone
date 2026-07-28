// script-docx.mjs — export content/script.yaml as a hand-editable screenplay
// .docx (#46). Each line is shown as readable prose (names resolved, HTML
// flattened) under a small [id] label; edit the prose, keep the labels, and the
// companion importer (script-import.mjs) matches your edits back by id.
//
//   node script-docx.mjs        writes docs/script.docx

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadNames, loadScript, displayText } from "./script-lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "docs", "script.docx");

const names = loadNames();
const doc = loadScript();

// A readable order for a scene's own fields; anything unlisted follows in file order.
const FIELD_ORDER = [
  "eyebrow", "title", "title_harvest", "title_cotton", "dir", "body", "advance", "advance_sub",
  "headline", "epi", "lost_none", "lost_some",
  "ground_whispers", "ground_warnings", "ground_walkers", "codex", "again", "again_sub",
];

const label = (id) => new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: `[${id}]`, color: "999999", size: 15 })] });
const textParas = (t) => t.split(/\n\n+/).map((p) => new Paragraph({ children: [new TextRun({ text: p })] }));

const children = [
  new Paragraph({ text: "Bushel & Bone — Year One Script", heading: HeadingLevel.TITLE }),
  new Paragraph({ spacing: { after: 160 }, children: [new TextRun({
    text: "Edit the prose under each [id] label. Do not change the labels themselves — they are how your edits are matched back into the game. When you are done, hand this file back and say “update the script from my docx.” Names in brackets like [your line] and any {slot} are filled in by the game at run time.",
    italics: true, color: "666666",
  })] }),
];

for (const [sid, scene] of Object.entries(doc.scenes)) {
  children.push(new Paragraph({ text: sid, heading: HeadingLevel.HEADING_1, spacing: { before: 260 } }));
  if (scene.speaker) children.push(new Paragraph({ children: [new TextRun({ text: `speaker: ${scene.speaker}`, italics: true, color: "888888", size: 18 })] }));

  const scalarKeys = Object.keys(scene).filter((k) => k !== "choices" && k !== "speaker" && k !== "setting");
  const ordered = [...FIELD_ORDER.filter((k) => scalarKeys.includes(k)), ...scalarKeys.filter((k) => !FIELD_ORDER.includes(k))];
  for (const k of ordered) {
    children.push(label(`${sid}.${k}`));
    children.push(...textParas(displayText(scene[k], names)));
  }
  if (scene.choices) {
    for (const [cid, ch] of Object.entries(scene.choices)) {
      children.push(new Paragraph({ spacing: { before: 140 }, children: [new TextRun({ text: `Choice — ${cid}`, bold: true })] }));
      for (const [ck, cv] of Object.entries(ch)) {
        children.push(label(`${sid}.${cid}.${ck}`));
        children.push(...textParas(displayText(cv, names)));
      }
    }
  }
}

const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
writeFileSync(outPath, buf);
console.log(`script: wrote ${outPath} (${Object.keys(doc.scenes).length} scenes).`);
