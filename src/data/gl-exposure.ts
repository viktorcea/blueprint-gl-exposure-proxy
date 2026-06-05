export type ExposureStatus = "included" | "review" | "excluded";

export type IssueType =
  | ""
  | "blank_exposure"
  | "missing_class"
  | "unknown_state"
  | "low_confidence"
  | "excluded";

export type ExposureBasis =
  | "Units"
  | "Area-square Footage"
  | "Each"
  | "Attendance"
  | "Payroll"
  | "Receipts"
  | "Sales";

export interface SourceLocation {
  id: string;
  type: string;
  state: string;
  location: string;
  building: string;
  locationKey: string;
  tiv: number;
  units: number;
  sqft: number;
  pools: number;
  playgrounds: number;
  clubhouseSqft: number;
  retailSqft?: number;
  city?: string;
}

export interface ExposureRow {
  id: string;
  sourceId: string;
  state: string;
  classCode: string;
  classDescription: string;
  basis: ExposureBasis;
  amount: number | null;
  sourceType: string;
  status: ExposureStatus;
  issueType: IssueType;
  issueLabel: string;
}

export const classOptions: Record<string, string> = {
  "": "Select class code",
  "60010": "Apartment Buildings: NOC",
  "60011": "Apartment Buildings: Garden",
  "60012": "Apartment Buildings or Hotels: Time-Sharing - Less than 4 Stories",
  "60013": "Apartment Buildings or Hotels: Time-Sharing - 4 Stories or More",
  "60015": "Apartment Hotels - Less than 4 Stories",
  "60016": "Apartment Hotels - 4 Stories or More",
  "62003": "Condominiums: Residential Association Risk Only",
  "64500": "Housing Projects",
  "41668": "Clubs - Civic Service or Social",
  "16651": "Playgrounds",
  "41670": "Lakes or Reservoirs",
  "46671": "Parks or Playgrounds",
  "46622": "Parking: Public Open Lots",
  "48925": "Swimming Pools",
  "61212": "Lessor's Risk Only: Bank or Office",
  "65132": "Lessor's Risk Only: Mercantile or Retail",
  "92100": "Employee Benefits Liability",
  "98430": "Pipelines - Operation - Slurry - Nonflammable Mixtures"
};

export const sourceLocations: SourceLocation[] = [
  { id: "ACORD-HAZ-001", type: "ACORD Schedule of Hazards", state: "TX", location: "LOC 1 / HAZ 1", building: "Apartment Buildings - 60010", locationKey: "LOC-1", tiv: 0, units: 3282, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "ACORD-HAZ-002", type: "ACORD Schedule of Hazards", state: "FL", location: "LOC 2 / HAZ 1", building: "Apartment Buildings - 60010", locationKey: "LOC-2", tiv: 0, units: 2886, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "ACORD-HAZ-003", type: "ACORD Schedule of Hazards", state: "FL", location: "LOC 4 / HAZ 4", building: "Apartment Buildings - 60010", locationKey: "LOC-4", tiv: 0, units: 2172, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "ACORD-HAZ-004", type: "ACORD Schedule of Hazards", state: "FL", location: "LOC 0 / HAZ 1", building: "Swimming Pools", locationKey: "LOC-0", tiv: 0, units: 0, sqft: 0, pools: 11, playgrounds: 0, clubhouseSqft: 0 },
  { id: "ACORD-HAZ-005", type: "ACORD Schedule of Hazards", state: "TX", location: "LOC 3 / HAZ 3", building: "Swimming Pools", locationKey: "LOC-3", tiv: 0, units: 0, sqft: 0, pools: 9, playgrounds: 0, clubhouseSqft: 0 },
  { id: "ACORD-HAZ-006", type: "ACORD Schedule of Hazards", state: "FL", location: "LOC 0 / HAZ 2", building: "Parks or Playgrounds", locationKey: "LOC-0", tiv: 0, units: 0, sqft: 0, pools: 0, playgrounds: 8, clubhouseSqft: 0 },
  { id: "ACORD-HAZ-007", type: "ACORD Schedule of Hazards", state: "FL", location: "LOC 0 / HAZ 1", building: "Clubs - Civic Service or Social", locationKey: "LOC-0", tiv: 0, units: 0, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 5 },
  { id: "ACORD-HAZ-008", type: "ACORD Schedule of Hazards", state: "Unknown", location: "LOC 1 / HAZ 2", building: "Employee Benefits Liability", locationKey: "LOC-1", tiv: 0, units: 0, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-001", type: "SOV", state: "FL", location: "The Park at Queens Court", building: "BLDG-01", locationKey: "LOC-SOV-001", tiv: 18200000, units: 329, sqft: 28500, pools: 1, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-002", type: "SOV", state: "FL", location: "The Park at Queens Court", building: "BLDG-02", locationKey: "LOC-SOV-002", tiv: 17100000, units: 312, sqft: 27600, pools: 1, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-003", type: "SOV", state: "FL", location: "The Park at Carrigan", building: "BLDG-01", locationKey: "LOC-SOV-003", tiv: 22600000, units: 418, sqft: 35200, pools: 1, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-004", type: "SOV", state: "FL", location: "The Park at Carrigan", building: "BLDG-02", locationKey: "LOC-SOV-004", tiv: 21300000, units: 397, sqft: 33800, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-005", type: "SOV", state: "FL", location: "The Park at Castleton", building: "BLDG-01", locationKey: "LOC-SOV-005", tiv: 27900000, units: 521, sqft: 42900, pools: 0, playgrounds: 2, clubhouseSqft: 0 },
  { id: "SOV-006", type: "SOV", state: "FL", location: "Community Clubhouse", building: "CLUB-01", locationKey: "LOC-SOV-006", tiv: 6900000, units: 0, sqft: 0, pools: 0, playgrounds: 1, clubhouseSqft: 125000 },
  { id: "SOV-007", type: "SOV", state: "GA", location: "The Preserve at Ashton", building: "BLDG-01", locationKey: "LOC-SOV-007", tiv: 29100000, units: 540, sqft: 44200, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-008", type: "SOV", state: "GA", location: "The Preserve at Ashton", building: "BLDG-02", locationKey: "LOC-SOV-008", tiv: 33100000, units: 612, sqft: 50100, pools: 1, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-009", type: "SOV", state: "GA", location: "The Grove at Mercer", building: "BLDG-01", locationKey: "LOC-SOV-009", tiv: 33700000, units: 625, sqft: 51200, pools: 1, playgrounds: 1, clubhouseSqft: 0 },
  { id: "SOV-010", type: "SOV", state: "GA", location: "The Grove at Mercer", building: "BLDG-02", locationKey: "LOC-SOV-010", tiv: 37400000, units: 700, sqft: 57900, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-011", type: "SOV", state: "MS", location: "Harbor Bend Apartments", building: "BLDG-01", locationKey: "LOC-SOV-011", tiv: 26300000, units: 488, sqft: 39900, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-012", type: "SOV", state: "MS", location: "Harbor Bend Apartments", building: "BLDG-02", locationKey: "LOC-SOV-012", tiv: 26700000, units: 496, sqft: 40500, pools: 1, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-013", type: "SOV", state: "MS", location: "Harbor Bend Apartments", building: "BLDG-03", locationKey: "LOC-SOV-013", tiv: 24200000, units: 451, sqft: 36900, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-014", type: "SOV", state: "MS", location: "Harbor Bend Apartments", building: "BLDG-04", locationKey: "LOC-SOV-014", tiv: 25500000, units: 474, sqft: 38700, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-015", type: "SOV", state: "MO", location: "Union Station Lofts", building: "BLDG-01", locationKey: "LOC-SOV-015", tiv: 20800000, units: 386, sqft: 31600, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-016", type: "SOV", state: "MO", location: "Union Station Lofts", building: "BLDG-02", locationKey: "LOC-SOV-016", tiv: 20600000, units: 383, sqft: 31300, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-017", type: "SOV", state: "TN", location: "Cumberland Ridge", building: "BLDG-01", locationKey: "LOC-SOV-017", tiv: 13600000, units: 252, sqft: 20600, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-018", type: "SOV", state: "TN", location: "Cumberland Ridge", building: "BLDG-02", locationKey: "LOC-SOV-018", tiv: 13700000, units: 255, sqft: 20900, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-019", type: "SOV", state: "TX", location: "Stonegate Landing", building: "BLDG-01", locationKey: "LOC-SOV-019", tiv: 42000000, units: 780, sqft: 63900, pools: 0, playgrounds: 0, clubhouseSqft: 0, retailSqft: 12000 },
  { id: "SOV-020", type: "SOV", state: "TX", location: "Stonegate Landing", building: "BLDG-02", locationKey: "LOC-SOV-020", tiv: 44100000, units: 818, sqft: 67000, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-021", type: "SOV", state: "TX", location: "Stonegate Landing", building: "BLDG-03", locationKey: "LOC-SOV-021", tiv: 44400000, units: 824, sqft: 67500, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "SOV-022", type: "SOV", state: "TX", location: "Stonegate Landing", building: "BLDG-04", locationKey: "LOC-SOV-022", tiv: 46300000, units: 860, sqft: 70400, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "UW-ADJ-001", type: "UW Adjustment", state: "FL", location: "UW Added Exposure", building: "ADJ-01", locationKey: "UW-ADJ-001", tiv: 0, units: 1900, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "EMAIL-002", type: "Extractor Draft", state: "Unknown", location: "Unmapped SOV Rows", building: "UNK-02", locationKey: "EMAIL-002", tiv: 0, units: 8376, sqft: 0, pools: 0, playgrounds: 0, clubhouseSqft: 0 },
  { id: "EXTRACT-001", type: "Extractor Draft", state: "Unknown", location: "Unmapped SOV Rows", building: "UNK-01", locationKey: "EXTRACT-001", tiv: 0, units: 329, sqft: 145000, pools: 0, playgrounds: 0, clubhouseSqft: 0 }
];

const rawExposureRows: Array<
  [string, string, string, string, ExposureBasis, number | null, string, ExposureStatus, IssueType, string]
> = [
  ["EXP-001", "ACORD-HAZ-001", "TX", "60010", "Units", 3282, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-002", "ACORD-HAZ-002", "FL", "60010", "Units", 2886, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-003", "ACORD-HAZ-003", "FL", "60010", "Units", 2172, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-004", "ACORD-HAZ-004", "FL", "48925", "Each", 11, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-005", "ACORD-HAZ-005", "TX", "48925", "Each", 9, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-006", "ACORD-HAZ-006", "FL", "46671", "Each", 8, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-007", "ACORD-HAZ-007", "FL", "41668", "Each", 5, "ACORD Schedule of Hazards", "included", "", ""],
  ["EXP-008", "SOV-019", "TX", "65132", "Area-square Footage", 12000, "SOV", "included", "", ""],
  ["EXP-009", "UW-ADJ-001", "FL", "60010", "Units", 1900, "UW Adjustment", "included", "", ""],
  ["EXP-010", "ACORD-HAZ-008", "Unknown", "92100", "Attendance", null, "ACORD Schedule of Hazards", "review", "blank_exposure", "Blank exposure"],
  ["EXP-011", "EXTRACT-001", "Unknown", "", "Area-square Footage", 145000, "Extractor Draft", "review", "missing_class", "Missing class"]
];

export const seedExposureRows: ExposureRow[] = rawExposureRows.map(
  ([id, sourceId, state, classCode, basis, amount, sourceType, status, issueType, issueLabel]) => ({
    id,
    sourceId,
    state,
    classCode,
    classDescription: classOptions[classCode] || "Select class code",
    basis,
    amount,
    sourceType,
    status,
    issueType,
    issueLabel
  })
);

export const basisOptions: ExposureBasis[] = [
  "Units",
  "Area-square Footage",
  "Each",
  "Attendance",
  "Payroll"
];
