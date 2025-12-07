const RWANDA_LOCATIONS = {
  "Kigali City": {
    Gasabo: ["Bumbogo", "Gatsata"],
    Kicukiro: ["Gahanga", "Gatenga"],
  },
  "Eastern Province": {
    Bugesera: ["Gashora", "Juru"],
  },
} as const;

type Province = keyof typeof RWANDA_LOCATIONS;
type District<P extends Province> = keyof (typeof RWANDA_LOCATIONS)[P];
type Sector<
  P extends Province,
  D extends District<P>
> = (typeof RWANDA_LOCATIONS)[P][D][number];

// Test usage
const p: Province = "Kigali City";
const d: District<"Kigali City"> = "Gasabo";
const s: Sector<"Kigali City", "Gasabo"> = "Bumbogo";
