// Google Places API (new) client for lead discovery.
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
//
// We call Text Search (new) with a lat/lng bias + radius so results are
// constrained to Turlock + 25 miles. Each call is billed, so the cron runs
// once a week and we dedupe on `place_id`.

import { PLACES_KEYWORDS, PLACES_TYPES, RADIUS_METERS, TARGET_GEO } from "./config";

type PlacesTextSearchResponse = {
  places?: Array<{
    id: string;
    displayName?: { text?: string } | null;
    formattedAddress?: string | null;
    addressComponents?: Array<{ types: string[]; longText: string; shortText: string }> | null;
    nationalPhoneNumber?: string | null;
    internationalPhoneNumber?: string | null;
    websiteUri?: string | null;
    rating?: number | null;
    userRatingCount?: number | null;
    location?: { latitude: number; longitude: number } | null;
    types?: string[] | null;
    primaryType?: string | null;
  }>;
  nextPageToken?: string;
};

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

const FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.location",
  "places.types",
  "places.primaryType",
  "nextPageToken",
].join(",");

export type PlaceResult = {
  placeId: string;
  name: string;
  category: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  lat: number | null;
  lng: number | null;
  raw: unknown;
};

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

type AddrComponent = { types: string[]; longText: string; shortText: string };

function extractAddrPart(
  parts: AddrComponent[] | null | undefined,
  type: string
): string | null {
  if (!Array.isArray(parts)) return null;
  const hit = parts.find((c) => c.types.includes(type));
  return hit?.shortText ?? hit?.longText ?? null;
}

async function textSearch(textQuery: string): Promise<PlaceResult[]> {
  const results: PlaceResult[] = [];
  let pageToken: string | undefined;

  for (let i = 0; i < 3; i++) {
    // max 3 pages = 60 results per query
    const body: Record<string, unknown> = {
      textQuery,
      locationBias: {
        circle: {
          center: { latitude: TARGET_GEO.lat, longitude: TARGET_GEO.lng },
          radius: RADIUS_METERS,
        },
      },
      pageSize: 20,
    };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Goog-Api-Key": getApiKey(),
        "X-Goog-FieldMask": FIELDS,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Google Places ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as PlacesTextSearchResponse;
    for (const p of data.places ?? []) {
      results.push({
        placeId: p.id,
        name: p.displayName?.text ?? "Unknown",
        category: p.primaryType ?? p.types?.[0] ?? null,
        address: p.formattedAddress ?? null,
        city: extractAddrPart(p.addressComponents, "locality"),
        state: extractAddrPart(p.addressComponents, "administrative_area_level_1"),
        postalCode: extractAddrPart(p.addressComponents, "postal_code"),
        phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null,
        website: p.websiteUri ?? null,
        rating: p.rating ?? null,
        userRatingsTotal: p.userRatingCount ?? null,
        lat: p.location?.latitude ?? null,
        lng: p.location?.longitude ?? null,
        raw: p,
      });
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return results;
}

/**
 * Fetch leads across all configured types + keyword queries in the
 * target geography. De-duplicated by place_id.
 */
export async function fetchAllLeads(): Promise<PlaceResult[]> {
  const byId = new Map<string, PlaceResult>();

  for (const type of PLACES_TYPES) {
    const q = `${type.replace(/_/g, " ")} in ${TARGET_GEO.city}, ${TARGET_GEO.state}`;
    const hits = await textSearch(q);
    for (const h of hits) byId.set(h.placeId, h);
  }

  for (const kw of PLACES_KEYWORDS) {
    const q = `${kw} near ${TARGET_GEO.city}, ${TARGET_GEO.state}`;
    const hits = await textSearch(q);
    for (const h of hits) {
      if (!byId.has(h.placeId)) byId.set(h.placeId, h);
    }
  }

  return [...byId.values()];
}
