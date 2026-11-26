// Reusable utility from the lesson: calculate the distance between now and a saved timestamp.
function calculateTimeDifference(pastTime) {
  const now = new Date();
  const past = new Date(pastTime);
  const differenceInSeconds = Math.max(0, Math.floor((now - past) / 1000));

  if (Number.isNaN(past.getTime())) return 'Just now';
  if (differenceInSeconds < 60) return 'Just now';

  const minutes = Math.floor(differenceInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(past);
}
