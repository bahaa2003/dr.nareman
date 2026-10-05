const riyadhTimezone = "Asia/Riyadh";

function partsFor(date: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: riyadhTimezone,
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
}

export function formatRiyadhDateTime(value: string, timezoneLabel = "بتوقيت الرياض"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: riyadhTimezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date) + ` ${timezoneLabel}`;
}

export function isoToRiyadhLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = partsFor(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function riyadhLocalInputToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const numeric = [Number(year), Number(month), Number(day), Number(hour), Number(minute)];
  const wallTime = Date.UTC(numeric[0], numeric[1] - 1, numeric[2], numeric[3], numeric[4]);
  const check = new Date(wallTime);
  if (check.getUTCFullYear() !== numeric[0] || check.getUTCMonth() !== numeric[1] - 1 || check.getUTCDate() !== numeric[2] || check.getUTCHours() !== numeric[3] || check.getUTCMinutes() !== numeric[4]) return null;
  const zoneParts = partsFor(new Date(wallTime));
  const zoneWallTime = Date.UTC(Number(zoneParts.year), Number(zoneParts.month) - 1, Number(zoneParts.day), Number(zoneParts.hour), Number(zoneParts.minute));
  return new Date(wallTime - (zoneWallTime - wallTime)).toISOString();
}
