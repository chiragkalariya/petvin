import { Badge } from "@/components/ui/Card";
import { formatEnumLabel } from "@/lib/utils";

const TONE_MAP: Record<string, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  NEW: "accent",
  IN_PROGRESS: "warning",
  CLOSED: "neutral",
  INTERESTED: "accent",
  NOT_INTERESTED: "danger",
  CONVERTED: "success",
  ON_HOLD: "warning",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONE_MAP[status] ?? "neutral"}>{formatEnumLabel(status)}</Badge>;
}
