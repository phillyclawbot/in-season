export interface Fruit {
  id: string;
  name: string;
  variety: string;
  imageUrl: string;
  seasonMonths: number[];
  peakMonth: number;
  regions: string[];
  flavorProfile: string[];
  colorPalette: {
    primary: string;
    accent: string;
  };
  description: string;
  storageTips: string;
  funFact: string;
}

export const fruits: Fruit[] = [
  {
    id: "strawberry",
    name: "Strawberry",
    variety: "Chandler",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=90&fit=crop",
    seasonMonths: [3, 4, 5, 6],
    peakMonth: 5,
    regions: ["Pacific", "Southeast", "Northeast", "Midwest"],
    flavorProfile: ["sweet", "tart", "bright"],
    colorPalette: { primary: "#FFF0F3", accent: "#E8334A" },
    description: "Spring strawberries are the first sign of fruit season. The smaller ones pack the most intense flavor.",
    storageTips: "Don't wash until ready to eat. Refrigerate unwashed.",
    funFact: "Strawberries are the only fruit with seeds on the outside.",
  },
  {
    id: "mango",
    name: "Mango",
    variety: "Ataulfo (Honey)",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=90&fit=crop",
    seasonMonths: [3, 4, 5, 6, 7],
    peakMonth: 5,
    regions: ["Pacific", "Southwest", "South Central", "Southeast"],
    flavorProfile: ["sweet", "tropical", "creamy"],
    colorPalette: { primary: "#FFFBEB", accent: "#F59E0B" },
    description: "Ataulfo mangos are buttery, fiber-free, and deeply sweet. The skin wrinkles slightly when perfectly ripe.",
    storageTips: "Ripen at room temperature. Refrigerate once soft.",
    funFact: "Mangos are related to cashews and pistachios.",
  },
  {
    id: "blood-orange",
    name: "Blood Orange",
    variety: "Moro",
    imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=90&fit=crop",
    seasonMonths: [12, 1, 2, 3, 4],
    peakMonth: 2,
    regions: ["Pacific", "Southwest"],
    flavorProfile: ["tart", "berry-like", "complex"],
    colorPalette: { primary: "#FFF1F2", accent: "#BE123C" },
    description: "The crimson flesh comes from anthocyanins, the same pigment in berries. Flavor is a unique mix of orange and raspberry.",
    storageTips: "Refrigerate for up to two weeks. Best at room temp.",
    funFact: "The red color deepens with cold night temperatures.",
  },
  {
    id: "peach",
    name: "Peach",
    variety: "Yellow Freestone",
    imageUrl: "https://images.unsplash.com/photo-1629828874514-c1e5103f8358?w=800&q=90&fit=crop",
    seasonMonths: [5, 6, 7, 8, 9],
    peakMonth: 7,
    regions: ["Southeast", "Pacific", "Southwest", "South Central"],
    flavorProfile: ["sweet", "juicy", "fragrant"],
    colorPalette: { primary: "#FFF7ED", accent: "#EA580C" },
    description: "Peak season brings the sweetest, most fragrant peaches. Look for firm fruit with a sweet fragrance at the stem.",
    storageTips: "Store at room temperature until ripe, then refrigerate.",
    funFact: "China produces more peaches than any other country.",
  },
  {
    id: "blueberry",
    name: "Blueberry",
    variety: "Highbush",
    imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=90&fit=crop",
    seasonMonths: [5, 6, 7, 8],
    peakMonth: 7,
    regions: ["Northeast", "Pacific", "Southeast", "Midwest"],
    flavorProfile: ["sweet", "mild", "earthy"],
    colorPalette: { primary: "#EEF2FF", accent: "#4F46E5" },
    description: "The silvery bloom on the skin is a sign of freshness. Plump, firm berries with deep indigo color are perfect.",
    storageTips: "Refrigerate dry and unwashed. Rinse just before eating.",
    funFact: "Blueberries are one of the only naturally blue foods.",
  },
];

export function getInSeasonFruits(month: number, region: string): Fruit[] {
  return fruits.filter(
    (f) => f.seasonMonths.includes(month) && f.regions.includes(region)
  );
}

export function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Fall";
  return "Winter";
}

export function getSeasonEmoji(month: number): string {
  if (month >= 3 && month <= 5) return "\uD83C\uDF38";
  if (month >= 6 && month <= 8) return "\u2600\uFE0F";
  if (month >= 9 && month <= 11) return "\uD83C\uDF42";
  return "\u2744\uFE0F";
}

export function formatSeasonMonths(months: number[]): string {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sorted = [...months].sort((a, b) => a - b);
  const hasGap = sorted.some((m, i) => i > 0 && sorted[i] - sorted[i - 1] > 1);
  if (hasGap) {
    const gapIdx = sorted.findIndex((m, i) => i > 0 && sorted[i] - sorted[i - 1] > 1);
    return `${names[sorted[gapIdx] - 1]} \u2013 ${names[sorted[gapIdx - 1] - 1]}`;
  }
  return `${names[sorted[0] - 1]} \u2013 ${names[sorted[sorted.length - 1] - 1]}`;
}
