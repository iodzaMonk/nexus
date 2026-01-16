export function formatLastSeen(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = new Date(date);
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  // If less than 1 minute
  if (diff < 60000) return "Just now";

  // If less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }

  // If less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // If less than 7 days
  if (diff < 604800000) {
     const days = Math.floor(diff / 86400000);
     return `${days}d ago`;
  }

  return dateObj.toLocaleDateString();
}

export function formatMessageTime(date: Date | string): string {
    const dateObj = new Date(date);
    const now = new Date();
    const isToday =
        dateObj.getDate() === now.getDate() &&
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear();

    return isToday
        ? dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
        : dateObj.toLocaleDateString(undefined, {
            month: "numeric",
            day: "numeric",
        });
}
