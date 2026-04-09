export const stateToRegion: Record<string, string> = {
  // Northeast
  CT: "Northeast", DE: "Northeast", ME: "Northeast", MD: "Northeast",
  MA: "Northeast", NH: "Northeast", NJ: "Northeast", NY: "Northeast",
  PA: "Northeast", RI: "Northeast", VT: "Northeast", DC: "Northeast",
  // Southeast
  AL: "Southeast", FL: "Southeast", GA: "Southeast", KY: "Southeast",
  MS: "Southeast", NC: "Southeast", SC: "Southeast", TN: "Southeast",
  VA: "Southeast", WV: "Southeast",
  // Midwest
  IL: "Midwest", IN: "Midwest", IA: "Midwest", KS: "Midwest",
  MI: "Midwest", MN: "Midwest", MO: "Midwest", NE: "Midwest",
  ND: "Midwest", OH: "Midwest", SD: "Midwest", WI: "Midwest",
  // South Central
  AR: "South Central", LA: "South Central", OK: "South Central", TX: "South Central",
  // Mountain
  AZ: "Mountain", CO: "Mountain", ID: "Mountain", MT: "Mountain",
  NV: "Mountain", NM: "Mountain", UT: "Mountain", WY: "Mountain",
  // Pacific
  CA: "Pacific", OR: "Pacific", WA: "Pacific", HI: "Pacific", AK: "Pacific",
  // Southwest (overlap with Mountain for produce purposes)
  // AZ and NM are also Southwest but mapped to Mountain above
};

export const DEFAULT_REGION = "Pacific";
export const DEFAULT_LOCATION = "San Francisco, CA";

export function getRegionFromState(stateCode: string): string {
  return stateToRegion[stateCode.toUpperCase()] || DEFAULT_REGION;
}
