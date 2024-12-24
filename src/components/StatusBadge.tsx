import { memo } from "react";
import { BADGE_BASE_STYLES, STATUS_STYLES } from "../constants";

interface StatusBadgeProps {
  state: string;
}

export const StatusBadge = memo(({ state }: StatusBadgeProps) => {
  const styles = STATUS_STYLES[state as keyof typeof STATUS_STYLES] || STATUS_STYLES.missing;

  return <span className={`${BADGE_BASE_STYLES} ${styles.bg} ${styles.text}`}>{state}</span>;
});
