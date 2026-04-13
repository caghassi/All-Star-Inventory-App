// Central place for tunable constants. Keep logic in sync with the README.

/** The single geography we're targeting for new-lead generation. */
export const TARGET_GEO = {
  city: "Turlock",
  state: "CA",
  postalCode: "95380",
  // Center point used for Google Places Nearby Search.
  lat: 37.4947,
  lng: -120.8466,
  radiusMiles: 25,
} as const;

export const RADIUS_METERS = Math.round(TARGET_GEO.radiusMiles * 1609.34);

/** Minimum order total to qualify for the reorder-call queue ($200). */
export const REORDER_MIN_TOTAL_CENTS = 20_000;

/**
 * Keywords that flag a Printavo job name as an "event" order worth chasing
 * for a re-order next year. Match is case-insensitive, whole-word-ish.
 */
export const EVENT_KEYWORDS = [
  "tournament",
  "tourney",
  "camp",
  "league",
  "season",
  "classic",
  "invitational",
  "championship",
  "showcase",
  "meet",
  "relay",
] as const;

/**
 * Window (in days from today) during which we want to surface a reorder call.
 * 21-45 days ahead of last year's due date gives ~3 weeks of lead time.
 */
export const REORDER_LEAD_DAYS_MIN = 21;
export const REORDER_LEAD_DAYS_MAX = 45;

/**
 * How many leads to queue up each week by default. Rotated weekly by the
 * /api/leads/sync cron.
 */
export const WEEKLY_LEAD_QUOTA = 25;

/** Place types we'll ask Google Places for. */
export const PLACES_TYPES = [
  "school",
  "primary_school",
  "secondary_school",
  "university",
  "gym",
  "stadium",
] as const;

/** Keywords passed to Places text search to find teams/leagues. */
export const PLACES_KEYWORDS = [
  "youth sports",
  "little league",
  "soccer club",
  "booster club",
  "athletic association",
] as const;
