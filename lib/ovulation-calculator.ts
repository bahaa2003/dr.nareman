export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type OvulationEstimate = {
  fertileWindowStart: CalendarDate;
  fertileWindowEnd: CalendarDate;
  estimatedOvulation: CalendarDate;
  estimatedNextPeriod: CalendarDate;
};

export type RegularCycleInputErrors = {
  lastPeriod?: "missing" | "invalid" | "future" | "stale";
  cycleLength?: "missing" | "integer" | "range";
};

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function toUtcDate({ year, month, day }: CalendarDate): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function fromUtcDate(date: Date): CalendarDate {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

export function parseCalendarDate(value: string): CalendarDate | null {
  const match = isoDatePattern.exec(value);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const candidate = toUtcDate({ year, month, day });
  const parsed = fromUtcDate(candidate);

  return parsed.year === year && parsed.month === month && parsed.day === day ? parsed : null;
}

export function toIsoCalendarDate(date: CalendarDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function getLocalToday(): CalendarDate {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  };
}

export function compareCalendarDates(first: CalendarDate, second: CalendarDate): number {
  const difference = toUtcDate(first).getTime() - toUtcDate(second).getTime();
  return difference === 0 ? 0 : difference > 0 ? 1 : -1;
}

export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  if (!Number.isSafeInteger(days)) {
    throw new RangeError("Calendar day offset must be an integer");
  }

  const next = toUtcDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return fromUtcDate(next);
}

export function calculateOvulationEstimate(lastPeriodDate: CalendarDate, cycleLength: number): OvulationEstimate {
  if (!Number.isInteger(cycleLength) || cycleLength < 1) {
    throw new RangeError("Cycle length must be a positive integer");
  }

  const estimatedNextPeriod = addCalendarDays(lastPeriodDate, cycleLength);
  const estimatedOvulation = addCalendarDays(estimatedNextPeriod, -14);

  return {
    fertileWindowStart: addCalendarDays(estimatedOvulation, -5),
    fertileWindowEnd: estimatedOvulation,
    estimatedOvulation,
    estimatedNextPeriod
  };
}

export function validateRegularCycleInput(
  lastPeriod: string,
  cycleLength: number | null,
  today: CalendarDate
): { errors: RegularCycleInputErrors; estimate: OvulationEstimate | null } {
  const errors: RegularCycleInputErrors = {};
  const parsedLastPeriod = parseCalendarDate(lastPeriod);

  if (!lastPeriod) {
    errors.lastPeriod = "missing";
  } else if (!parsedLastPeriod) {
    errors.lastPeriod = "invalid";
  } else if (compareCalendarDates(parsedLastPeriod, today) > 0) {
    errors.lastPeriod = "future";
  }

  let parsedCycleLength: number | null = null;
  if (cycleLength === null) {
    errors.cycleLength = "missing";
  } else if (!Number.isSafeInteger(cycleLength)) {
    errors.cycleLength = "integer";
  } else if (cycleLength < 21 || cycleLength > 35) {
    errors.cycleLength = "range";
  } else {
    parsedCycleLength = cycleLength;
  }

  if (Object.keys(errors).length > 0 || !parsedLastPeriod || parsedCycleLength === null) {
    return { errors, estimate: null };
  }

  const estimate = calculateOvulationEstimate(parsedLastPeriod, parsedCycleLength);
  if (compareCalendarDates(estimate.estimatedNextPeriod, today) < 0) {
    return { errors: { lastPeriod: "stale" }, estimate: null };
  }

  return { errors: {}, estimate };
}

const arabicGregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric"
});

export function formatArabicGregorianDate(date: CalendarDate): string {
  return arabicGregorianFormatter.format(toUtcDate(date));
}
