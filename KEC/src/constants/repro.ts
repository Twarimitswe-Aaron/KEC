export const RWANDA_LOCATIONS = {
  "Kigali City": {
    Gasabo: ["Bumbogo", "Gatsata"],
    Kicukiro: ["Gahanga", "Gatenga"],
  },
  "Eastern Province": {
    Bugesera: ["Gashora", "Juru"],
  },
} as const;

export type Province = keyof typeof RWANDA_LOCATIONS;
export type District<P extends Province> = P extends any
  ? keyof (typeof RWANDA_LOCATIONS)[P]
  : never;

export type Sector<P extends Province, D extends District<P>> = P extends any
  ? D extends keyof (typeof RWANDA_LOCATIONS)[P]
    ? (typeof RWANDA_LOCATIONS)[P][D] extends readonly (infer S)[]
      ? S
      : never
    : never
  : never;
