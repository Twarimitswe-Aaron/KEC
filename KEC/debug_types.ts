const RWANDA_LOCATIONS = {
  "Province A": { "District 1": ["S1"] },
  "Province B": { "District 2": ["S2"] },
} as const;

type Locations = typeof RWANDA_LOCATIONS;
type Province = keyof Locations;

// This should be "District 1" | "District 2" if it works as intended,
// but might be "never" if P is generic.
// Because Province is a union ("Province A" | "Province B"), direct keyof Locations[P]
// evaluates to the intersection of keys (never). We must distribute over P.
type District<P extends Province> = P extends Province
  ? keyof Locations[P]
  : never;

// Let's test what typescript thinks District<Province> is.
// If it is 'never', then we have our answer.
type AllDistricts = District<Province>;

type Sector<P extends Province, D extends District<P>> = P extends Province
  ? D extends keyof Locations[P]
    ? Locations[P][D] extends readonly (infer U)[]
      ? U
      : never
    : never
  : never;

// Proposed fix using distributive conditional type
type SectorFixed<P extends Province, D extends District<P>> = P extends any
  ? D extends keyof Locations[P]
    ? Locations[P][D] extends readonly (infer U)[]
      ? U
      : never
    : never
  : never;

// Test assignments to check types (if we can run tsc)
// Or just let the user see this file.
const test1: AllDistricts = "District 1"; // valid?
