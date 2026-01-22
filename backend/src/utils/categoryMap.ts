// backend/src/utils/categoryMap.ts
export const categories = [
  "education",
  "entertainment",
  "food & dining",
  "healthcare",
  "insurance",
  "miscellaneous",
  "rent",
  "savings/investments",
  "shopping",
  "subscriptions",
  "tax",
  "transfers",
  "transportation",
  "utilities"
];

export function idToLabel(id: number) {
  return categories[id] || "unknown";
}

export function labelToId(label: string) {
  return categories.indexOf(label);
}
