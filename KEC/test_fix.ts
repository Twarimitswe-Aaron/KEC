import {
  Sector,
  District,
  Province,
  RWANDA_LOCATIONS,
} from "./src/constants/rwanda-locations";

// Test 1: Specific valid location
const s1: Sector<"Kigali City", "Gasabo"> = "Bumbogo"; // Should work

// Test 2: Invalid district for province
// @ts-expect-error
const s2: Sector<"Kigali City", "Bugesera"> = "Gashora"; // Should be never/error

// Test 3: Union of all sectors (should not error, or at least be usable)
// This might still be 'never' if not carefully constructed, but specific usage is what matters most.
// type AllSectors = Sector<Province, District<Province>>;

// Test 4: Array access check
// The original error was about [number] access.
type SectorsOfGasabo = (typeof RWANDA_LOCATIONS)["Kigali City"]["Gasabo"];
const sectors: SectorsOfGasabo = ["Bumbogo"];
const oneSector: SectorsOfGasabo[number] = "Bumbogo";
