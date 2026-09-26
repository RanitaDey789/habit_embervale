import type { ClassId } from "@/domain/types";

export interface ClassDef {
  id: ClassId;
  name: string;
  title: string;
  creed: string;
  description: string;
  /** Primary / secondary palette for the avatar renderer */
  primary: string;
  secondary: string;
  emblem: "blade" | "rune" | "arrow" | "book" | "flask";
}

export const CLASSES: ClassDef[] = [
  {
    id: "vanguard",
    name: "Vanguard",
    title: "Shield of the Vale",
    creed: "Discipline is armor.",
    description: "Frontline finisher. Charges at the hardest task first.",
    primary: "#e0703a",
    secondary: "#8a4a2b",
    emblem: "blade",
  },
  {
    id: "arcanist",
    name: "Arcanist",
    title: "Keeper of Focus",
    creed: "Attention is power.",
    description: "Weaves deep work sessions into raw concentration.",
    primary: "#8f7fe8",
    secondary: "#4a3f8a",
    emblem: "rune",
  },
  {
    id: "pathstrider",
    name: "Pathstrider",
    title: "Warden of Trails",
    creed: "Motion before motivation.",
    description: "Builds momentum with movement, walks and small steps.",
    primary: "#6fae6a",
    secondary: "#3c6a44",
    emblem: "arrow",
  },
  {
    id: "loreweaver",
    name: "Loreweaver",
    title: "Scribe of Days",
    creed: "Every page compounds.",
    description: "Studies, reads and journals their way to mastery.",
    primary: "#d9a83f",
    secondary: "#8a6a24",
    emblem: "book",
  },
  {
    id: "emberwright",
    name: "Emberwright",
    title: "Forger of Habits",
    creed: "Slow heat shapes steel.",
    description: "Crafts routines and lets compound fire do the work.",
    primary: "#d4636f",
    secondary: "#87353f",
    emblem: "flask",
  },
];

export function classById(id: ClassId): ClassDef {
  return CLASSES.find((c) => c.id === id) ?? CLASSES[0];
}
