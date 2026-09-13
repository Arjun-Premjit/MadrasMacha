export function formatDuration(minutes: number): string {
  if (!minutes) return '--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} hr ${mins > 0 ? `${mins} min` : ''}`;
  }
  return `${mins} mins`;
}

export function formatFare(min?: number, max?: number): string {
  if (min === undefined && max === undefined) return 'Standard';
  if (min === max || !max) return `₹${min}`;
  return `₹${min} – ₹${max}`;
}

export function getRouteTypeBadge(type: number, category?: string) {
  if (type === 1) {
    return {
      label: 'Chennai Metro',
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dot: 'bg-sky-500',
    };
  }
  if (category === 'mtc_ac') {
    return {
      label: 'MTC Volvo AC',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-500',
    };
  }
  if (category === 'mtc_deluxe') {
    return {
      label: 'MTC Deluxe',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
    };
  }
  if (category === 'mtc_express') {
    return {
      label: 'MTC Express',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    };
  }
  return {
    label: 'MTC Regular',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  };
}
