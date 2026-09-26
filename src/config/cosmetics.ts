import type { Cosmetic } from "@/domain/types";

/** Cosmetic catalog sold in the Armory. Pure data — extend freely. */
export const COSMETICS: Cosmetic[] = [
  // Frames
  { id: "frame-ashen", slot: "frame", name: "Ashen Ring", price: 120, hue: 24, flavor: "A simple band of cooled embers." },
  { id: "frame-gilded", slot: "frame", name: "Gilded Bough", price: 260, hue: 45, flavor: "Golden laurels for the consistent." },
  { id: "frame-runebound", slot: "frame", name: "Runebound Circle", price: 420, hue: 265, flavor: "Old script hums faintly at dawn." },
  { id: "frame-verdant", slot: "frame", name: "Verdant Wreath", price: 320, hue: 130, flavor: "Grown from kept promises." },
  // Auras
  { id: "aura-ember", slot: "aura", name: "Ember Glow", price: 180, hue: 24, flavor: "Warmth follows you softly." },
  { id: "aura-moonwell", slot: "aura", name: "Moonwell Shimmer", price: 300, hue: 210, flavor: "A tide of quiet silver light." },
  { id: "aura-verdant", slot: "aura", name: "Verdant Haze", price: 300, hue: 130, flavor: "Spring rides on your shoulder." },
  { id: "aura-dawnfire", slot: "aura", name: "Dawnfire Halo", price: 520, hue: 12, flavor: "Reserved for the truly relentless." },
  // Titles
  { id: "title-steadfast", slot: "title", name: "the Steadfast", price: 150, hue: 24, flavor: "For showing up, again." },
  { id: "title-dawnseeker", slot: "title", name: "Dawnseeker", price: 220, hue: 45, flavor: "Mornings bend to your will." },
  { id: "title-ironwill", slot: "title", name: "Ironwill", price: 340, hue: 210, flavor: "Unmoved by distraction." },
  { id: "title-flameheart", slot: "title", name: "Flameheart", price: 480, hue: 12, flavor: "The vale whispers your name." },
];

export function cosmeticById(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id);
}
