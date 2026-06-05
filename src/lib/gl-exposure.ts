import type { ExposureBasis, ExposureRow, IssueType, SourceLocation } from "@/data/gl-exposure";

export type GroupBy = "basis" | "state" | "class";
export type DetailFilter = "all" | "attention" | IssueType;
export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  dir: SortDirection;
}

export interface DetailScope {
  label: string;
  rowIds: string[];
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(Number(value || 0));

export const formatExposure = (value: number | null | undefined) =>
  value === null || value === undefined ? "--" : formatNumber(value);

export const basisLabel = (basis: string) =>
  basis === "Area-square Footage" ? "Area Sq Ft" : basis;

export const sourceFor = (row: ExposureRow, locations: SourceLocation[]) =>
  locations.find((item) => item.id === row.sourceId) || {
    id: row.sourceId,
    type: row.sourceType,
    state: row.state,
    location: "UW added exposure",
    building: row.sourceId,
    locationKey: row.sourceId,
    tiv: 0,
    units: 0,
    sqft: 0,
    pools: 0,
    playgrounds: 0,
    clubhouseSqft: 0,
    city: "Unknown"
  };

export function cityFor(row: ExposureRow, locations: SourceLocation[]) {
  const source = sourceFor(row, locations);
  if (source.city) return source.city;
  const cityBySource: Record<string, string> = {
    "ACORD-HAZ-001": "Dallas",
    "ACORD-HAZ-002": "Miami",
    "ACORD-HAZ-003": "Naples",
    "ACORD-HAZ-004": "Miami",
    "ACORD-HAZ-005": "Dallas",
    "ACORD-HAZ-006": "Orlando",
    "ACORD-HAZ-007": "Orlando",
    "ACORD-HAZ-008": "Unknown",
    "UW-ADJ-001": "Orlando",
    "EXTRACT-001": "Unknown",
    "EMAIL-002": "Unknown"
  };
  const cityByLocation: Record<string, string> = {
    "The Park at Queens Court": "Miami",
    "The Park at Carrigan": "Naples",
    "The Park at Castleton": "Orlando",
    "Community Clubhouse": "Orlando",
    "The Preserve at Ashton": "Atlanta",
    "The Grove at Mercer": "Suwanee",
    "Harbor Bend Apartments": "Biloxi",
    "Union Station Lofts": "St. Louis",
    "Cumberland Ridge": "Nashville",
    "Stonegate Landing": "Dallas"
  };
  return cityBySource[source.id] || cityByLocation[source.location] || "Unknown";
}

export const sumRows = (rows: ExposureRow[], basis?: ExposureBasis | string) =>
  rows
    .filter((row) => !basis || row.basis === basis)
    .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

export const needsAttention = (row: ExposureRow) =>
  row.status === "review" || row.status === "excluded" || Boolean(row.issueType);

export function issueText(row: ExposureRow) {
  if (row.status === "excluded") return "Excluded";
  if (row.issueType === "blank_exposure") {
    return "Blank exposure on ACORD Schedule of Hazards. Review whether this is flat-rated, if-any, or needs an exposure value.";
  }
  if (row.issueType === "missing_class") return "Missing class code";
  if (row.issueType === "unknown_state") return "Unknown state";
  if (row.issueType === "low_confidence") return "Low confidence";
  return row.issueLabel || "Needs attention";
}

export const issueLabel = (row: ExposureRow) => {
  if (row.status === "excluded") return "Excluded";
  if (row.issueType === "missing_class") return "Missing class";
  if (row.issueType === "blank_exposure") return "Blank exposure";
  if (row.issueType === "unknown_state" || row.state === "Unknown") return "Unknown state";
  if (row.issueType === "low_confidence") return "Low confidence";
  return row.issueLabel || "";
};

export const isCriticalIssue = (row: ExposureRow) =>
  row.issueType === "missing_class" ||
  row.issueType === "blank_exposure" ||
  row.issueType === "unknown_state" ||
  row.state === "Unknown";

export const classKey = (row: ExposureRow) =>
  `${row.classCode || "Missing class code"}|${
    row.classCode ? row.classDescription : "Missing class code"
  }|${row.classCode || "~~~~"}`;

export function classLabel(classCode: string, classDescription: string) {
  if (!classCode || classCode === "Missing class code") return "Missing class code";
  return `${classCode} ${classDescription}`;
}

export function stateBreakout(rows: ExposureRow[]) {
  const groups = new Map<string, ExposureRow[]>();
  rows.forEach((row) => {
    groups.set(row.state, [...(groups.get(row.state) || []), row]);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([state, stateRows]) => {
      const allMissing = stateRows.every((row) => row.amount === null || row.amount === undefined);
      return `${state} ${allMissing ? "--" : formatNumber(sumRows(stateRows))}`;
    })
    .join(", ");
}

export function sortRows<T extends Record<string, unknown>>(rows: T[], sort: SortState) {
  const dir = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    if (typeof av === "number" || typeof bv === "number") {
      return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
    }
    return String(av || "").localeCompare(String(bv || "")) * dir;
  });
}

export function nextSort(current: SortState, key: string, numericKeys: string[] = []) {
  if (current.key === key) {
    return { key, dir: current.dir === "asc" ? "desc" : "asc" } satisfies SortState;
  }
  return {
    key,
    dir: numericKeys.includes(key) ? "desc" : "asc"
  } satisfies SortState;
}

export function downloadRowsAsCsv(rows: ExposureRow[]) {
  const header = "exposure_id,source_id,state,class_code,basis,amount,status,issue";
  const body = rows
    .map((row) =>
      [
        row.id,
        row.sourceId,
        row.state,
        row.classCode,
        row.basis,
        row.amount ?? "",
        row.status,
        row.issueLabel || ""
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gl-exposures.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
