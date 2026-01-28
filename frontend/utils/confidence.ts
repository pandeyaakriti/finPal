export function confidenceClass(confidence: number | null): string {
  if (confidence === null) return "";
  if (confidence >= 0.8) return "bg-emerald-950/20";
  if (confidence >= 0.6) return "bg-yellow-950/20";
  return "bg-red-950/20";
}

export function confidenceColor(confidence: number | null): string {
  if (confidence === null) return "text-zinc-500";
  if (confidence >= 0.8) return "text-emerald-500";
  if (confidence >= 0.6) return "text-yellow-500";
  return "text-red-500";
}