"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Checkbox,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Popover,
  Tab,
  Tabs,
  Tag,
  Tooltip
} from "@blueprintjs/core";
import { basisOptions, classOptions, seedExposureRows, sourceLocations } from "@/data/gl-exposure";
import type { ExposureBasis, ExposureRow, IssueType, SourceLocation } from "@/data/gl-exposure";
import {
  basisLabel,
  cityFor,
  classKey,
  classLabel,
  downloadRowsAsCsv,
  formatExposure,
  formatNumber,
  isCriticalIssue,
  issueLabel,
  issueText,
  nextSort,
  sortRows,
  sourceFor,
  stateBreakout,
  sumRows
} from "@/lib/gl-exposure";
import type { DetailFilter, DetailScope, GroupBy, SortState } from "@/lib/gl-exposure";

type ActiveView = "analysis" | "detail";
type ColumnFilterKey = "state" | "city" | "classCode" | "basis";
type ColumnFilters = Record<ColumnFilterKey, string[]>;
type AddRowDraft = Pick<ExposureRow, "state" | "classCode" | "basis" | "amount">;
type ReviewIssueType = Exclude<IssueType, "" | "excluded">;
type FeedbackIntent = "primary" | "success" | "warning";
type StateFixture = "live" | "no_results" | "empty_schedule" | "source_unavailable";

interface FeedbackNotice {
  intent: FeedbackIntent;
  message: string;
}

interface Rollup {
  key: string;
  rows: ExposureRow[];
  total: number;
  allMissing: boolean;
  percent: number;
  units: number;
  sqft: number;
  each: number;
  other: number;
  classCount: number;
  sourceCount: number;
  attention: number;
}

const emptyColumnFilters: ColumnFilters = {
  state: [],
  city: [],
  classCode: [],
  basis: []
};

const sourceData = () => ({
  rows: [
    ...seedExposureRows.map((row) => deriveReviewState({ ...row })),
    deriveReviewState({
      id: "EXP-012",
      sourceId: "EMAIL-002",
      state: "Unknown",
      classCode: "60010",
      classDescription: classOptions["60010"],
      basis: "Units",
      amount: 8376,
      sourceType: "Extractor Draft",
      status: "excluded",
      issueType: "excluded",
      issueLabel: "Excluded"
    })
  ],
  locations: sourceLocations.map((location) => ({ ...location }))
});

const detailFilterOptions: Array<{ value: DetailFilter; label: string }> = [
  { value: "all", label: "All rows" },
  { value: "attention", label: "Needs attention" },
  { value: "missing_class", label: "Missing class" },
  { value: "blank_exposure", label: "Blank exposure" },
  { value: "unknown_state", label: "Unknown state" },
  { value: "low_confidence", label: "Low confidence" },
  { value: "excluded", label: "Excluded" }
];

const reviewIssueOrder: ReviewIssueType[] = [
  "missing_class",
  "blank_exposure",
  "unknown_state",
  "low_confidence"
];

const numericAnalysisSorts = [
  "total",
  "percent",
  "units",
  "sqft",
  "each",
  "other",
  "classCount",
  "sourceCount",
  "attention"
];

const numericDetailSorts = ["amount"];

const issueLabelByType: Record<ReviewIssueType, string> = {
  missing_class: "Missing class",
  blank_exposure: "Blank exposure",
  unknown_state: "Unknown state",
  low_confidence: "Low confidence"
};

const stateFixtureLabels: Record<StateFixture, string> = {
  live: "Live review",
  no_results: "Filtered no results",
  empty_schedule: "Empty schedule",
  source_unavailable: "Source unavailable"
};

function isUnknownState(state: string) {
  return !state.trim() || state.trim().toLowerCase() === "unknown";
}

function isLowConfidence(row: ExposureRow) {
  return row.issueType === "low_confidence" || row.sourceType === "Extractor Draft";
}

function reviewIssueTypesFor(row: ExposureRow): ReviewIssueType[] {
  const issues = new Set<ReviewIssueType>();
  if (!row.classCode) issues.add("missing_class");
  if (row.amount === null || row.amount === undefined) issues.add("blank_exposure");
  if (isUnknownState(row.state)) issues.add("unknown_state");
  if (isLowConfidence(row)) issues.add("low_confidence");
  return reviewIssueOrder.filter((issue) => issues.has(issue));
}

function deriveReviewState(row: ExposureRow): ExposureRow {
  const classDescription = classOptions[row.classCode] || "Select class code";
  if (row.status === "excluded") {
    return {
      ...row,
      classDescription,
      issueType: "excluded",
      issueLabel: "Excluded"
    };
  }

  const primaryIssue = reviewIssueTypesFor(row)[0] ?? "";
  return {
    ...row,
    classDescription,
    status: primaryIssue ? "review" : "included",
    issueType: primaryIssue,
    issueLabel: primaryIssue ? issueLabelByType[primaryIssue] : ""
  };
}

function needsPackAttention(row: ExposureRow) {
  return row.status === "review" && row.issueType !== "excluded";
}

function issueSummary(rows: ExposureRow[]) {
  return reviewIssueOrder
    .map((issue) => ({
      issue,
      label: issueLabelByType[issue],
      rows: rows.filter((row) => row.status === "review" && reviewIssueTypesFor(row).includes(issue))
    }))
    .filter((item) => item.rows.length > 0);
}

export function PackGuidedWorkbench() {
  const initialData = useMemo(sourceData, []);
  const [exposureRows, setExposureRows] = useState<ExposureRow[]>(initialData.rows);
  const [locations, setLocations] = useState<SourceLocation[]>(initialData.locations);
  const [activeView, setActiveView] = useState<ActiveView>("analysis");
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<{
    rows: ExposureRow[];
    locations: SourceLocation[];
  } | null>(null);
  const [detailScope, setDetailScope] = useState<DetailScope | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>("basis");
  const [measure, setMeasure] = useState<ExposureBasis>("Units");
  const [detailFilter, setDetailFilter] = useState<DetailFilter>("all");
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(emptyColumnFilters);
  const [filterSearch, setFilterSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [analysisSort, setAnalysisSort] = useState<SortState>({ key: "total", dir: "desc" });
  const [detailSort, setDetailSort] = useState<SortState>({ key: "state", dir: "asc" });
  const [feedbackNotice, setFeedbackNotice] = useState<FeedbackNotice | null>(null);
  const [stateFixture, setStateFixture] = useState<StateFixture>("live");
  const [showFixtureControls, setShowFixtureControls] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState<AddRowDraft>({
    state: "Unknown",
    classCode: "",
    basis: "Units",
    amount: null
  });
  const [deleteTarget, setDeleteTarget] = useState<ExposureRow | null>(null);

  const viewRows = useMemo(
    () => (stateFixture === "empty_schedule" ? [] : exposureRows),
    [exposureRows, stateFixture]
  );
  const includedRows = viewRows.filter((row) => row.status !== "excluded");
  const issueItems = issueSummary(includedRows);
  const detailRows = useMemo(
    () =>
      stateFixture === "no_results"
        ? []
        : getDetailRows(viewRows, locations, detailScope, detailFilter, columnFilters),
    [viewRows, locations, detailScope, detailFilter, columnFilters, stateFixture]
  );
  const sortedDetailRows = useMemo(
    () =>
      sortRows(
        detailRows.map((row) => ({
          ...row,
          city: cityFor(row, locations),
          sourceLabel: `${sourceFor(row, locations).location} ${sourceFor(row, locations).building}`,
          issueSort: issueLabel(row)
        })),
        detailSort
      ),
    [detailRows, detailSort, locations]
  );
  const rollups = useMemo(
    () => buildRollups(includedRows, locations, groupBy, measure, analysisSort),
    [includedRows, locations, groupBy, measure, analysisSort]
  );
  const metrics = useMemo(() => buildMetrics(includedRows, locations), [includedRows, locations]);
  const attentionCount = includedRows.filter(needsPackAttention).length;
  const excludedCount = viewRows.filter((row) => row.status === "excluded").length;
  const selectedColumnFilterCount = Object.values(columnFilters).reduce((sum, values) => sum + values.length, 0);
  const draftPreview = deriveReviewState({
    id: "DRAFT",
    sourceId: "DRAFT",
    state: draft.state || "Unknown",
    classCode: draft.classCode,
    classDescription: classOptions[draft.classCode] || "Select class code",
    basis: draft.basis,
    amount: draft.amount,
    sourceType: "UW Adjustment",
    status: "included",
    issueType: "",
    issueLabel: ""
  });
  const draftIssues = reviewIssueTypesFor(draftPreview);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fixturesParam = params.get("fixtures");
    const fixturesEnabled = fixturesParam === "1" || fixturesParam === "true";
    setShowFixtureControls(fixturesEnabled);
    if (!fixturesEnabled) setStateFixture("live");
  }, []);

  const showFeedback = (notice: FeedbackNotice) => {
    setFeedbackNotice(notice);
    window.setTimeout(() => setFeedbackNotice(null), 3600);
  };

  const activateFixture = (fixture: StateFixture) => {
    setStateFixture(fixture);
    setEditMode(false);
    setEditSnapshot(null);
    setDetailScope(null);
    setColumnFilters(emptyColumnFilters);
    if (fixture === "no_results") {
      setActiveView("detail");
      setDetailFilter("attention");
    } else if (fixture === "empty_schedule") {
      setActiveView("analysis");
      setDetailFilter("all");
    } else if (fixture === "source_unavailable") {
      setDetailFilter("all");
      showFeedback({
        intent: "warning",
        message: "Source sync unavailable. Cached synthetic rows remain visible for review."
      });
    } else {
      setDetailFilter("all");
    }
  };

  const updateRow = (rowId: string, patch: Partial<ExposureRow>) => {
    setExposureRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        return deriveReviewState({ ...row, ...patch });
      })
    );
  };

  const enterEditMode = () => {
    if (!editMode) {
      setEditSnapshot({
        rows: exposureRows.map((row) => ({ ...row })),
        locations: locations.map((location) => ({ ...location }))
      });
    }
    setActiveView("detail");
    setEditMode(true);
  };

  const exitEditMode = (save: boolean) => {
    if (!save && editSnapshot) {
      setExposureRows(editSnapshot.rows);
      setLocations(editSnapshot.locations);
      showFeedback({ intent: "primary", message: "Edit mode canceled. Local review state was restored." });
    } else if (save) {
      const derivedRows = exposureRows.map(deriveReviewState);
      const remaining = derivedRows.filter(needsPackAttention).length;
      setExposureRows(derivedRows);
      showFeedback({
        intent: remaining ? "warning" : "success",
        message: `Local changes saved. ${formatNumber(remaining)} review item${remaining === 1 ? "" : "s"} remain.`
      });
    }
    setEditSnapshot(null);
    setEditMode(false);
  };

  const drillToDetail = (rows: ExposureRow[], label: string, attentionOnly = false) => {
    const scopedRows = attentionOnly ? rows.filter(needsPackAttention) : rows;
    setDetailScope({ label, rowIds: scopedRows.map((row) => row.id) });
    setDetailFilter("all");
    setActiveView("detail");
    setStateFixture("live");
  };

  const drillToIssue = (issue: ReviewIssueType) => {
    const scopedRows = includedRows.filter((row) => row.status === "review" && reviewIssueTypesFor(row).includes(issue));
    setDetailFilter(issue);
    setActiveView("detail");
    setDetailScope({ label: `${issueLabelByType[issue]} review`, rowIds: scopedRows.map((row) => row.id) });
    setStateFixture("live");
  };

  const showExcludedRows = () => {
    setActiveView("detail");
    setDetailScope(null);
    setDetailFilter("excluded");
    setStateFixture("live");
  };

  const restoreRow = (rowId: string) => {
    let restoredId = rowId;
    setExposureRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        restoredId = row.id;
        return deriveReviewState({ ...row, status: "included", issueType: "", issueLabel: "" });
      })
    );
    setDetailFilter("attention");
    setActiveView("detail");
    showFeedback({
      intent: "warning",
      message: `${restoredId} restored to active rows. Review state was re-derived before returning to totals.`
    });
  };

  const addExposure = () => {
    const id = `UW-${Date.now()}`;
    const row = deriveReviewState({
      id,
      sourceId: id,
      state: draft.state || "Unknown",
      classCode: draft.classCode,
      classDescription: classOptions[draft.classCode] || "Select class code",
      basis: draft.basis,
      amount: draft.amount,
      sourceType: "UW Adjustment",
      status: "included",
      issueType: "",
      issueLabel: ""
    });
    setExposureRows((current) => [...current, row]);
    setLocations((current) => [
      ...current,
      {
        id,
        type: "UW Adjustment",
        state: row.state,
        location: "UW added row",
        building: id,
        locationKey: id,
        tiv: 0,
        units: 0,
        sqft: 0,
        pools: 0,
        playgrounds: 0,
        clubhouseSqft: 0,
        city: row.state === "Unknown" ? "Unknown" : "Manual"
      }
    ]);
    setAddOpen(false);
    setDraft({ state: "Unknown", classCode: "", basis: "Units", amount: null });
    setActiveView("detail");
    setStateFixture("live");
    setDetailFilter(row.issueType && row.issueType !== "excluded" ? row.issueType : "all");
    showFeedback({
      intent: row.status === "review" ? "warning" : "success",
      message:
        row.status === "review"
          ? `Exposure added as unresolved: ${row.issueLabel}.`
          : "Exposure added to active rows."
    });
  };

  const downloadCsv = () => {
    downloadRowsAsCsv(viewRows);
    showFeedback({
      intent: attentionCount ? "warning" : "success",
      message: `CSV download simulated. ${formatNumber(attentionCount)} review item${
        attentionCount === 1 ? "" : "s"
      } remain in the active schedule.`
    });
  };

  return (
    <main className="page-shell">
      <section
        className={`workbench pack-workbench ${collapsed ? "is-collapsed" : ""} ${
          editMode && activeView === "detail" ? "is-editing" : ""
        }`}
        aria-label="GL Exposures"
      >
        <header className="workbench-header">
          <div>
            <h1>GL Exposures</h1>
            <div className="header-subline">
              <Tag minimal>{formatNumber(includedRows.length)} active rows</Tag>
              <Tag minimal intent={attentionCount ? "warning" : "success"}>
                {formatNumber(attentionCount)} review items
              </Tag>
              {excludedCount > 0 && (
                <Button
                  className="header-chip-button"
                  minimal
                  small
                  text={`${formatNumber(excludedCount)} excluded`}
                  onClick={showExcludedRows}
                />
              )}
            </div>
          </div>
          <ButtonGroup className="header-actions">
            <Button minimal icon="download" text="Download data" onClick={downloadCsv} />
            <Button minimal icon="edit" text={editMode ? "Editing" : "Edit data"} onClick={enterEditMode} />
            <Tooltip content={collapsed ? "Expand" : "Collapse"}>
              <Button
                aria-label={collapsed ? "Expand GL Exposures" : "Collapse GL Exposures"}
                icon={collapsed ? "chevron-down" : "chevron-up"}
                onClick={() => setCollapsed((value) => !value)}
              />
            </Tooltip>
          </ButtonGroup>
        </header>

        {!collapsed && (
          <>
            <ReviewSummary items={issueItems} total={attentionCount} onIssueClick={drillToIssue} />

            {showFixtureControls && (
              <StateCoverageStrip
                activeFixture={stateFixture}
                excludedCount={excludedCount}
                onFixture={activateFixture}
                onShowExcluded={showExcludedRows}
              />
            )}

            {showFixtureControls && stateFixture === "source_unavailable" && (
              <Callout className="pack-system-callout" intent="warning" icon="warning-sign">
                Source sync is unavailable in this fixture. Cached synthetic rows stay visible, and download/save feedback
                continues to name remaining review items.
              </Callout>
            )}

            <MetricBar
              metrics={metrics}
              activeView={activeView}
              groupBy={groupBy}
              expanded={expanded}
              onBasisMetric={(basis) => {
                setStateFixture("live");
                setDetailScope(null);
                setActiveView("analysis");
                setGroupBy("basis");
                setExpanded((current) => [
                  ...current.filter((key) => !key.startsWith("basis|")),
                  `basis|${basis}`
                ]);
              }}
              onClassMetric={() => {
                setStateFixture("live");
                setDetailScope(null);
                setActiveView("analysis");
                setGroupBy("class");
              }}
              onLocationsMetric={() => {
                setStateFixture("live");
                setActiveView("detail");
                setDetailScope(null);
                setDetailFilter("all");
              }}
            />

            <div className="tabs-row" aria-label="View and table controls">
              <Tabs
                id="gl-exposure-tabs"
                selectedTabId={activeView}
                onChange={(tabId) => setActiveView(String(tabId) as ActiveView)}
              >
                <Tab id="analysis" title="Analysis" />
                <Tab id="detail" title="Detail" />
              </Tabs>

              {activeView === "analysis" ? (
                <div className="control-cluster">
                  <FormGroup label="Group by" labelFor="pack-group-by" className="compact-control">
                    <HTMLSelect
                      id="pack-group-by"
                      value={groupBy}
                      onChange={(event) => setGroupBy(event.currentTarget.value as GroupBy)}
                    >
                      <option value="basis">Exposure Basis</option>
                      <option value="state">State</option>
                      <option value="class">Class Code</option>
                    </HTMLSelect>
                  </FormGroup>
                  {groupBy === "state" && (
                    <FormGroup label="Measure" labelFor="pack-measure" className="compact-control">
                      <HTMLSelect
                        id="pack-measure"
                        value={measure}
                        onChange={(event) => setMeasure(event.currentTarget.value as ExposureBasis)}
                      >
                        {basisOptions.map((basis) => (
                          <option key={basis} value={basis}>
                            {basisLabel(basis)}
                          </option>
                        ))}
                      </HTMLSelect>
                    </FormGroup>
                  )}
                </div>
              ) : (
                <div className="control-cluster detail-control-cluster">
                  <FilterPopover
                    rows={detailFilter === "excluded" ? exposureRows : includedRows}
                    locations={locations}
                    filters={columnFilters}
                    search={filterSearch}
                    onSearch={setFilterSearch}
                    onToggle={(key, value) => {
                      setColumnFilters((current) => {
                        const selected = new Set(current[key]);
                        if (selected.has(value)) {
                          selected.delete(value);
                        } else {
                          selected.add(value);
                        }
                        return { ...current, [key]: [...selected] };
                      });
                    }}
                    onClear={() => setColumnFilters(emptyColumnFilters)}
                  />
                  {editMode && (
                    <Button intent="primary" icon="add" text="Add exposure" onClick={() => setAddOpen(true)} />
                  )}
                </div>
              )}
            </div>

            {activeView === "detail" && (
              <ActiveFilterBar
                detailScope={detailScope}
                detailFilter={detailFilter}
                columnFilterCount={selectedColumnFilterCount}
                resultCount={detailRows.length}
                stateFixture={stateFixture}
                onClearScope={() => setDetailScope(null)}
                onClearReviewStatus={() => setDetailFilter("all")}
                onClearColumnFilters={() => setColumnFilters(emptyColumnFilters)}
                onClearFixture={() => activateFixture("live")}
              />
            )}

            {feedbackNotice && (
              <Callout className="download-callout" intent={feedbackNotice.intent}>
                {feedbackNotice.message}
              </Callout>
            )}

            <section className="table-zone" aria-label={activeView === "analysis" ? "Analysis table" : "Detail table"}>
              {activeView === "analysis" ? (
                <AnalysisTable
                  groupBy={groupBy}
                  measure={measure}
                  rollups={rollups}
                  expanded={expanded}
                  sort={analysisSort}
                  locations={locations}
                  onSort={(key) => setAnalysisSort((current) => nextSort(current, key, numericAnalysisSorts))}
                  onToggleExpanded={(key) =>
                    setExpanded((current) =>
                      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
                    )
                  }
                  onDrill={drillToDetail}
                />
              ) : (
                <DetailTable
                  rows={sortedDetailRows}
                  editMode={editMode}
                  locations={locations}
                  sort={detailSort}
                  onSort={(key) => setDetailSort((current) => nextSort(current, key, numericDetailSorts))}
                  onUpdateRow={updateRow}
                  onRestoreRow={restoreRow}
                  onDeleteRow={(row) => setDeleteTarget(row)}
                  emptyLabel={detailEmptyLabel(detailFilter, detailScope, stateFixture, selectedColumnFilterCount)}
                />
              )}
            </section>

            {editMode && activeView === "detail" && (
              <footer className="edit-footer">
                <Button minimal text="Cancel" onClick={() => exitEditMode(false)} />
                <Button intent="primary" text="Save" onClick={() => exitEditMode(true)} />
              </footer>
            )}
          </>
        )}
      </section>

      <Dialog isOpen={addOpen} title="Add exposure" onClose={() => setAddOpen(false)}>
        <DialogBody>
          <div className="dialog-grid">
            <FormGroup label="State" labelFor="pack-add-state">
              <InputGroup
                id="pack-add-state"
                value={draft.state}
                onChange={(event) => setDraft((current) => ({ ...current, state: event.currentTarget.value }))}
              />
            </FormGroup>
            <FormGroup label="Class code" labelFor="pack-add-class-code">
              <HTMLSelect
                id="pack-add-class-code"
                value={draft.classCode}
                onChange={(event) => setDraft((current) => ({ ...current, classCode: event.currentTarget.value }))}
              >
                {Object.entries(classOptions).map(([code, label]) => (
                  <option key={code} value={code}>
                    {code ? `${code} - ${label}` : label}
                  </option>
                ))}
              </HTMLSelect>
            </FormGroup>
            <FormGroup label="Basis" labelFor="pack-add-basis">
              <HTMLSelect
                id="pack-add-basis"
                value={draft.basis}
                onChange={(event) => setDraft((current) => ({ ...current, basis: event.currentTarget.value as ExposureBasis }))}
              >
                {basisOptions.map((basis) => (
                  <option key={basis} value={basis}>
                    {basis}
                  </option>
                ))}
              </HTMLSelect>
            </FormGroup>
            <FormGroup label="Exposure" labelFor="pack-add-exposure">
              <InputGroup
                id="pack-add-exposure"
                type="number"
                min={0}
                placeholder="Blank means unresolved"
                value={draft.amount === null ? "" : String(draft.amount)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    amount: event.currentTarget.value === "" ? null : Number(event.currentTarget.value)
                  }))
                }
              />
            </FormGroup>
          </div>
          <Callout intent={draftIssues.length ? "warning" : "success"} className="dialog-callout">
            {draftIssues.length
              ? `This will save as unresolved: ${draftIssues.map((issue) => issueLabelByType[issue]).join(", ")}.`
              : "This exposure is complete enough to add to active rows."}{" "}
            Blank exposure values remain unresolved and display as --. Enter 0 only for a confirmed zero exposure.
          </Callout>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button text="Cancel" onClick={() => setAddOpen(false)} />
              <Button
                intent="primary"
                text={draftIssues.length ? "Add unresolved exposure" : "Add exposure"}
                onClick={addExposure}
              />
            </>
          }
        />
      </Dialog>

      <Alert
        isOpen={Boolean(deleteTarget)}
        icon="trash"
        intent="danger"
        cancelButtonText="Cancel"
        confirmButtonText="Delete row"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            setExposureRows((current) => current.filter((row) => row.id !== deleteTarget.id));
            showFeedback({ intent: "warning", message: `${deleteTarget.id} deleted from the local synthetic review state.` });
          }
          setDeleteTarget(null);
        }}
      >
        Delete {deleteTarget?.id}? This removes the synthetic row from the local review state.
      </Alert>
    </main>
  );
}

function buildMetrics(rows: ExposureRow[], locations: SourceLocation[]) {
  const basisPriority = ["Units", "Area-square Footage", "Each", "Payroll", "Receipts", "Sales", "Attendance"];
  const basisTotals = [...new Set(rows.map((row) => row.basis).filter(Boolean))]
    .map((basis) => ({ basis, total: sumRows(rows, basis) }))
    .filter((item) => item.total > 0)
    .sort((a, b) => {
      const ai = basisPriority.includes(a.basis) ? basisPriority.indexOf(a.basis) : 99;
      const bi = basisPriority.includes(b.basis) ? basisPriority.indexOf(b.basis) : 99;
      return ai === bi ? b.total - a.total : ai - bi;
    })
    .slice(0, 3);

  return {
    basisTotals,
    classCodes: new Set(rows.map((row) => row.classCode).filter(Boolean)).size,
    locations: new Set(rows.map((row) => sourceFor(row, locations).locationKey || row.sourceId)).size
  };
}

function ReviewSummary({
  items,
  total,
  onIssueClick
}: {
  items: ReturnType<typeof issueSummary>;
  total: number;
  onIssueClick: (issue: ReviewIssueType) => void;
}) {
  return (
    <section className="review-summary-row" aria-label="Review issue summary">
      <div>
        <div className="review-summary-title">
          {total
            ? `${formatNumber(total)} active row${total === 1 ? "" : "s"} need review`
            : "No active review items"}
        </div>
        <div className="review-summary-copy">
          {total
            ? "Issue flags open scoped Detail rows and keep missing, blank, unknown, and low-confidence states visible."
            : "Active rows are ready for review, edit, or download."}
        </div>
      </div>
      <div className="review-issue-actions">
        {items.length ? (
          items.map((item) => (
            <Button
              key={item.issue}
              small
              icon={item.issue === "low_confidence" ? "help" : "warning-sign"}
              intent={item.issue === "low_confidence" ? "warning" : "primary"}
              text={`${item.label} (${formatNumber(item.rows.length)})`}
              onClick={() => onIssueClick(item.issue)}
            />
          ))
        ) : (
          <Tag minimal intent="success">
            No unresolved blanks or missing classes
          </Tag>
        )}
      </div>
    </section>
  );
}

function StateCoverageStrip({
  activeFixture,
  excludedCount,
  onFixture,
  onShowExcluded
}: {
  activeFixture: StateFixture;
  excludedCount: number;
  onFixture: (fixture: StateFixture) => void;
  onShowExcluded: () => void;
}) {
  return (
    <section className="state-coverage-row" aria-label="Pack-guided state coverage">
      <div className="state-coverage-copy">
        <span className="state-coverage-label">State coverage</span>
        <span>Low confidence, excluded rows, no-results, empty schedule, and source-unavailable fixtures.</span>
      </div>
      <ButtonGroup className="state-coverage-actions">
        <Button
          small
          minimal={activeFixture !== "live"}
          intent={activeFixture === "live" ? "primary" : undefined}
          text="Live review"
          onClick={() => onFixture("live")}
        />
        <Button small minimal text={`${formatNumber(excludedCount)} excluded`} onClick={onShowExcluded} />
        <Button
          small
          minimal={activeFixture !== "no_results"}
          intent={activeFixture === "no_results" ? "primary" : undefined}
          text="No results"
          onClick={() => onFixture("no_results")}
        />
        <Button
          small
          minimal={activeFixture !== "empty_schedule"}
          intent={activeFixture === "empty_schedule" ? "primary" : undefined}
          text="Empty schedule"
          onClick={() => onFixture("empty_schedule")}
        />
        <Button
          small
          minimal={activeFixture !== "source_unavailable"}
          intent={activeFixture === "source_unavailable" ? "primary" : undefined}
          text="Unavailable"
          onClick={() => onFixture("source_unavailable")}
        />
      </ButtonGroup>
    </section>
  );
}

function ActiveFilterBar({
  detailScope,
  detailFilter,
  columnFilterCount,
  resultCount,
  stateFixture,
  onClearScope,
  onClearReviewStatus,
  onClearColumnFilters,
  onClearFixture
}: {
  detailScope: DetailScope | null;
  detailFilter: DetailFilter;
  columnFilterCount: number;
  resultCount: number;
  stateFixture: StateFixture;
  onClearScope: () => void;
  onClearReviewStatus: () => void;
  onClearColumnFilters: () => void;
  onClearFixture: () => void;
}) {
  const reviewStatusLabel = detailFilterOptions.find((option) => option.value === detailFilter)?.label ?? detailFilter;
  const hasReviewFilter = detailFilter !== "all";
  const hasStateFixture = stateFixture !== "live";
  const hasAnyFilter = Boolean(detailScope || hasReviewFilter || columnFilterCount || hasStateFixture);

  return (
    <section className="active-filter-row" aria-label="Active detail filters">
      <span className="active-filter-count">{formatNumber(resultCount)} detail rows shown</span>
      {hasAnyFilter ? (
        <div className="active-filter-tags">
          {detailScope && (
            <Tag minimal onRemove={onClearScope}>
              Scope: {detailScope.label}
            </Tag>
          )}
          {hasReviewFilter && (
            <Tag minimal intent="primary" onRemove={onClearReviewStatus}>
              Review status: {reviewStatusLabel}
            </Tag>
          )}
          {columnFilterCount > 0 && (
            <Tag minimal onRemove={onClearColumnFilters}>
              Column filters: {formatNumber(columnFilterCount)}
            </Tag>
          )}
          {hasStateFixture && (
            <Tag minimal intent="warning" onRemove={onClearFixture}>
              Scenario: {stateFixtureLabels[stateFixture]}
            </Tag>
          )}
        </div>
      ) : (
        <span className="active-filter-empty">Full Detail scope</span>
      )}
    </section>
  );
}

function MetricBar({
  metrics,
  activeView,
  groupBy,
  expanded,
  onBasisMetric,
  onClassMetric,
  onLocationsMetric
}: {
  metrics: ReturnType<typeof buildMetrics>;
  activeView: ActiveView;
  groupBy: GroupBy;
  expanded: string[];
  onBasisMetric: (basis: string) => void;
  onClassMetric: () => void;
  onLocationsMetric: () => void;
}) {
  return (
    <section className="metric-bar" aria-label="Exposure summary">
      {metrics.basisTotals.map((item) => {
        const active = activeView === "analysis" && groupBy === "basis" && expanded.includes(`basis|${item.basis}`);
        return (
          <Card
            key={item.basis}
            className={`metric-card ${active ? "is-active" : ""}`}
            interactive
            role="button"
            tabIndex={0}
            onClick={() => onBasisMetric(item.basis)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onBasisMetric(item.basis);
            }}
          >
            <div className="metric-label">{basisLabel(item.basis)}</div>
            <div className="metric-value">{formatNumber(item.total)}</div>
            <div className="metric-sub">Exposure</div>
          </Card>
        );
      })}
      <Card
        className={`metric-card ${activeView === "analysis" && groupBy === "class" ? "is-active" : ""}`}
        interactive
        role="button"
        tabIndex={0}
        onClick={onClassMetric}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onClassMetric();
        }}
      >
        <div className="metric-label">Class Codes</div>
        <div className="metric-value">{formatNumber(metrics.classCodes)}</div>
        <div className="metric-sub">Distinct</div>
      </Card>
      <Card
        className={`metric-card ${activeView === "detail" ? "is-active" : ""}`}
        interactive
        role="button"
        tabIndex={0}
        onClick={onLocationsMetric}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onLocationsMetric();
        }}
      >
        <div className="metric-label">Locations</div>
        <div className="metric-value">{formatNumber(metrics.locations)}</div>
        <div className="metric-sub">Mapped</div>
      </Card>
    </section>
  );
}

function getDetailRows(
  rows: ExposureRow[],
  locations: SourceLocation[],
  detailScope: DetailScope | null,
  detailFilter: DetailFilter,
  columnFilters: ColumnFilters
) {
  return rows.filter((row) => {
    if (detailScope && !detailScope.rowIds.includes(row.id)) return false;
    if (!passesColumnFilters(row, locations, columnFilters)) return false;
    if (detailFilter === "attention") return needsPackAttention(row);
    if (detailFilter === "excluded") return row.status === "excluded";
    if (detailFilter === "unknown_state") return reviewIssueTypesFor(row).includes("unknown_state");
    if (detailFilter === "low_confidence") return reviewIssueTypesFor(row).includes("low_confidence");
    if (detailFilter !== "all") return row.issueType === detailFilter;
    return row.status !== "excluded";
  });
}

function passesColumnFilters(row: ExposureRow, locations: SourceLocation[], columnFilters: ColumnFilters) {
  const checks: Record<ColumnFilterKey, string> = {
    state: row.state,
    city: cityFor(row, locations),
    classCode: row.classCode || "Missing class code",
    basis: row.basis
  };
  return (Object.keys(checks) as ColumnFilterKey[]).every((key) => {
    const selected = columnFilters[key];
    return selected.length === 0 || selected.includes(checks[key]);
  });
}

function buildRollups(
  rows: ExposureRow[],
  locations: SourceLocation[],
  groupBy: GroupBy,
  measure: ExposureBasis,
  sort: { key: string; dir: "asc" | "desc" }
) {
  const groups = new Map<string, ExposureRow[]>();
  rows.forEach((row) => {
    if (groupBy === "state" && row.basis !== measure) return;
    const key = groupBy === "state" ? row.state : groupBy === "class" ? classKey(row) : row.basis;
    groups.set(key, [...(groups.get(key) || []), row]);
  });

  const measureTotal = groupBy === "state" ? sumRows(rows, measure) : 0;
  const rollups: Rollup[] = [...groups.entries()].map(([key, group]) => {
    const total = sumRows(group);
    return {
      key,
      rows: group,
      total,
      allMissing: group.every((row) => row.amount === null || row.amount === undefined),
      percent: measureTotal ? total / measureTotal : 0,
      units: sumRows(group, "Units"),
      sqft: sumRows(group, "Area-square Footage"),
      each: sumRows(group, "Each"),
      other: sumRows(group) - sumRows(group, "Units") - sumRows(group, "Area-square Footage") - sumRows(group, "Each"),
      classCount: new Set(group.map((row) => row.classCode || "Missing class code")).size,
      sourceCount: new Set(group.map((row) => sourceFor(row, locations).locationKey || row.sourceId)).size,
      attention: group.filter(needsPackAttention).length
    };
  });
  return sortRows(rollups as unknown as Record<string, unknown>[], sort) as unknown as Rollup[];
}

function SortButton({
  label,
  keyName,
  align = "left",
  activeSort,
  onSort
}: {
  label: string;
  keyName: string;
  align?: "left" | "right" | "center";
  activeSort: { key: string; dir: "asc" | "desc" };
  onSort: (key: string) => void;
}) {
  const active = activeSort.key === keyName;
  return (
    <Button
      minimal
      small
      alignText={align}
      className="sort-button"
      aria-label={`Sort by ${label || "review status"}`}
      icon={active ? (activeSort.dir === "asc" ? "chevron-up" : "chevron-down") : "double-caret-vertical"}
      text={label}
      onClick={() => onSort(keyName)}
    />
  );
}

function AnalysisTable({
  groupBy,
  measure,
  rollups,
  expanded,
  sort,
  locations,
  onSort,
  onToggleExpanded,
  onDrill
}: {
  groupBy: GroupBy;
  measure: ExposureBasis;
  rollups: Rollup[];
  expanded: string[];
  sort: { key: string; dir: "asc" | "desc" };
  locations: SourceLocation[];
  onSort: (key: string) => void;
  onToggleExpanded: (key: string) => void;
  onDrill: (rows: ExposureRow[], label: string, attentionOnly?: boolean) => void;
}) {
  if (groupBy === "state") {
    return (
      <table className={`work-table ${Classes.HTML_TABLE} ${Classes.HTML_TABLE_STRIPED}`}>
        <thead>
          <tr>
            <th className="expander-col" />
            <th><SortButton label="State" keyName="key" activeSort={sort} onSort={onSort} /></th>
            <th className="amount"><SortButton label="Exposure %" keyName="percent" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="amount"><SortButton label={`Exposure (${basisLabel(measure)})`} keyName="total" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="status-col"><SortButton label="Review status" keyName="attention" align="center" activeSort={sort} onSort={onSort} /></th>
          </tr>
        </thead>
        <tbody>
          {rollups.length ? (
            rollups.map((rollup) => (
              <StateRollupRow
                key={rollup.key}
                rollup={rollup}
                measure={measure}
                locations={locations}
                expanded={expanded.includes(`state|${measure}|${rollup.key}`)}
                onToggle={() => onToggleExpanded(`state|${measure}|${rollup.key}`)}
                onDrill={onDrill}
              />
            ))
          ) : (
            <EmptyRow span={5} label="No rows found" />
          )}
        </tbody>
      </table>
    );
  }

  if (groupBy === "class") {
    return (
      <table className={`work-table ${Classes.HTML_TABLE} ${Classes.HTML_TABLE_STRIPED}`}>
        <thead>
          <tr>
            <th className="expander-col" />
            <th><SortButton label="Class Code" keyName="key" activeSort={sort} onSort={onSort} /></th>
            <th className="amount optional"><SortButton label="Units" keyName="units" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="amount optional"><SortButton label="Sq Ft" keyName="sqft" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="amount optional"><SortButton label="Each" keyName="each" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="amount optional"><SortButton label="Other" keyName="other" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="amount"><SortButton label="Locations" keyName="sourceCount" align="right" activeSort={sort} onSort={onSort} /></th>
            <th className="status-col"><SortButton label="Review status" keyName="attention" align="center" activeSort={sort} onSort={onSort} /></th>
          </tr>
        </thead>
        <tbody>
          {rollups.length ? (
            rollups.map((rollup) => (
              <ClassRollupRow
                key={rollup.key}
                rollup={rollup}
                locations={locations}
                expanded={expanded.includes(`class|${rollup.key}`)}
                onToggle={() => onToggleExpanded(`class|${rollup.key}`)}
                onDrill={onDrill}
              />
            ))
          ) : (
            <EmptyRow span={8} label="No rows found" />
          )}
        </tbody>
      </table>
    );
  }

  return (
    <table className={`work-table ${Classes.HTML_TABLE} ${Classes.HTML_TABLE_STRIPED}`}>
      <thead>
        <tr>
          <th className="expander-col" />
          <th><SortButton label="Exposure Basis" keyName="key" activeSort={sort} onSort={onSort} /></th>
          <th className="amount"><SortButton label="Total Exposure" keyName="total" align="right" activeSort={sort} onSort={onSort} /></th>
          <th className="amount"><SortButton label="Class Codes" keyName="classCount" align="right" activeSort={sort} onSort={onSort} /></th>
          <th className="status-col"><SortButton label="Review status" keyName="attention" align="center" activeSort={sort} onSort={onSort} /></th>
        </tr>
      </thead>
      <tbody>
        {rollups.length ? (
          rollups.map((rollup) => (
            <BasisRollupRow
              key={rollup.key}
              rollup={rollup}
              locations={locations}
              expanded={expanded.includes(`basis|${rollup.key}`)}
              onToggle={() => onToggleExpanded(`basis|${rollup.key}`)}
              onDrill={onDrill}
            />
          ))
        ) : (
          <EmptyRow span={5} label="No rows found" />
        )}
      </tbody>
    </table>
  );
}

function RollupIssueButton({
  rows,
  label,
  onDrill
}: {
  rows: ExposureRow[];
  label: string;
  onDrill: (rows: ExposureRow[], label: string, attentionOnly?: boolean) => void;
}) {
  const attentionRows = rows.filter(needsPackAttention);
  if (!attentionRows.length) return null;
  const critical = attentionRows.some(isCriticalIssue);
  const groupedIssues = issueSummary(attentionRows);
  const issueParts = groupedIssues.map((item) => `${item.label} ${item.rows.length}`);
  const fullIssueText = issueParts.join(", ");
  const issueTextValue =
    issueParts.length > 1
      ? `${issueParts[0]} +${issueParts.length - 1} flag${issueParts.length === 2 ? "" : "s"}`
      : issueParts[0];
  const title = `${attentionRows.length} row${attentionRows.length === 1 ? "" : "s"} need review: ${fullIssueText}`;
  return (
    <Tooltip content={title}>
      <Button
        aria-label={title}
        small
        minimal
        className={`rollup-issue-button ${critical ? "is-critical" : "is-advisory"}`}
        icon="warning-sign"
        text={issueTextValue}
        onClick={() => onDrill(rows, `${label}: needs review`, true)}
      />
    </Tooltip>
  );
}

function BasisRollupRow({
  rollup,
  locations,
  expanded,
  onToggle,
  onDrill
}: {
  rollup: Rollup;
  locations: SourceLocation[];
  expanded: boolean;
  onToggle: () => void;
  onDrill: (rows: ExposureRow[], label: string, attentionOnly?: boolean) => void;
}) {
  const classGroups = groupByKey(rollup.rows, classKey);
  return (
    <>
      <tr className="rollup-row">
        <td><Button small minimal icon={expanded ? "minus" : "plus"} aria-label={expanded ? "Collapse" : "Expand"} onClick={onToggle} /></td>
        <td><strong>{rollup.key}</strong></td>
        <td className="amount"><strong>{rollup.allMissing ? "--" : formatExposure(rollup.total)}</strong></td>
        <td className="amount">{rollup.classCount}</td>
        <td className="status-col"><RollupIssueButton rows={rollup.rows} label={rollup.key} onDrill={onDrill} /></td>
      </tr>
      {expanded && (
        <tr className="expanded-panel">
          <td colSpan={5}>
            <NestedTable
              headers={["Class Code", `Exposure (${basisLabel(rollup.key)})`, "State Breakout", "Locations", ""]}
              rows={[...classGroups.entries()].map(([key, rows]) => {
                const [classCode, classDescription] = key.split("|");
                const label = classLabel(classCode, classDescription);
                return (
                  <tr key={key}>
                    <td><Button minimal className="drill-link" text={label} onClick={() => onDrill(rows, `${label} / ${rollup.key}`)} /></td>
                    <td className="amount">{allMissing(rows) ? "--" : formatExposure(sumRows(rows))}</td>
                    <td>{stateBreakout(rows)}</td>
                    <td className="amount">{new Set(rows.map((row) => sourceFor(row, locations).locationKey || row.sourceId)).size}</td>
                    <td className="status-col"><RollupIssueButton rows={rows} label={label} onDrill={onDrill} /></td>
                  </tr>
                );
              })}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function StateRollupRow({
  rollup,
  measure,
  locations,
  expanded,
  onToggle,
  onDrill
}: {
  rollup: Rollup;
  measure: ExposureBasis;
  locations: SourceLocation[];
  expanded: boolean;
  onToggle: () => void;
  onDrill: (rows: ExposureRow[], label: string, attentionOnly?: boolean) => void;
}) {
  const childGroups = groupByKey(rollup.rows, (row) => `${classKey(row)}|${row.basis}`);
  return (
    <>
      <tr className="rollup-row">
        <td><Button small minimal icon={expanded ? "minus" : "plus"} aria-label={expanded ? "Collapse" : "Expand"} onClick={onToggle} /></td>
        <td><strong>{rollup.key}</strong></td>
        <td className="amount"><strong>{Math.round(rollup.percent * 100)}%</strong></td>
        <td className="amount"><strong>{rollup.allMissing ? "--" : formatExposure(rollup.total)}</strong></td>
        <td className="status-col"><RollupIssueButton rows={rollup.rows} label={rollup.key} onDrill={onDrill} /></td>
      </tr>
      {expanded && (
        <tr className="expanded-panel">
          <td colSpan={5}>
            <NestedTable
              headers={["Class Code", "Exposure Basis", "Exposure", "Locations", ""]}
              rows={[...childGroups.entries()].map(([key, rows]) => {
                const [classCode, classDescription, , basis] = key.split("|");
                const label = classLabel(classCode, classDescription);
                return (
                  <tr key={key}>
                    <td><Button minimal className="drill-link" text={label} onClick={() => onDrill(rows, `${rollup.key} / ${label} / ${basis}`)} /></td>
                    <td>{basis || measure}</td>
                    <td className="amount">{allMissing(rows) ? "--" : formatExposure(sumRows(rows))}</td>
                    <td className="amount">{new Set(rows.map((row) => sourceFor(row, locations).locationKey || row.sourceId)).size}</td>
                    <td className="status-col"><RollupIssueButton rows={rows} label={`${rollup.key} / ${label}`} onDrill={onDrill} /></td>
                  </tr>
                );
              })}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function ClassRollupRow({
  rollup,
  locations,
  expanded,
  onToggle,
  onDrill
}: {
  rollup: Rollup;
  locations: SourceLocation[];
  expanded: boolean;
  onToggle: () => void;
  onDrill: (rows: ExposureRow[], label: string, attentionOnly?: boolean) => void;
}) {
  const [classCode, classDescription] = rollup.key.split("|");
  const label = classLabel(classCode, classDescription);
  const childGroups = groupByKey(rollup.rows, (row) => `${row.state}|${row.basis}`);
  return (
    <>
      <tr className="rollup-row">
        <td><Button small minimal icon={expanded ? "minus" : "plus"} aria-label={expanded ? "Collapse" : "Expand"} onClick={onToggle} /></td>
        <td><Button minimal className="drill-link" text={label} onClick={() => onDrill(rollup.rows, label)} /></td>
        <td className="amount optional">{basisAmountCell(rollup.rows, "Units")}</td>
        <td className="amount optional">{basisAmountCell(rollup.rows, "Area-square Footage")}</td>
        <td className="amount optional">{basisAmountCell(rollup.rows, "Each")}</td>
        <td className="amount optional">{otherAmountCell(rollup.rows)}</td>
        <td className="amount">{rollup.sourceCount}</td>
        <td className="status-col"><RollupIssueButton rows={rollup.rows} label={label} onDrill={onDrill} /></td>
      </tr>
      {expanded && (
        <tr className="expanded-panel">
          <td colSpan={8}>
            <NestedTable
              headers={["State", "Exposure Basis", "Exposure", "Locations", ""]}
              rows={[...childGroups.entries()].map(([key, rows]) => {
                const [state, basis] = key.split("|");
                return (
                  <tr key={key}>
                    <td>{state}</td>
                    <td>{basis}</td>
                    <td className="amount">{allMissing(rows) ? "--" : formatExposure(sumRows(rows))}</td>
                    <td className="amount">{new Set(rows.map((row) => sourceFor(row, locations).locationKey || row.sourceId)).size}</td>
                    <td className="status-col"><RollupIssueButton rows={rows} label={label} onDrill={onDrill} /></td>
                  </tr>
                );
              })}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function DetailTable({
  rows,
  editMode,
  locations,
  sort,
  onSort,
  onUpdateRow,
  onRestoreRow,
  onDeleteRow,
  emptyLabel
}: {
  rows: Array<ExposureRow & { city: string; sourceLabel: string; issueSort: string }>;
  editMode: boolean;
  locations: SourceLocation[];
  sort: { key: string; dir: "asc" | "desc" };
  onSort: (key: string) => void;
  onUpdateRow: (rowId: string, patch: Partial<ExposureRow>) => void;
  onRestoreRow: (rowId: string) => void;
  onDeleteRow: (row: ExposureRow) => void;
  emptyLabel: string;
}) {
  const showActions = editMode || rows.some((row) => row.status === "excluded");
  return (
    <table className={`work-table detail-table ${Classes.HTML_TABLE} ${Classes.HTML_TABLE_STRIPED}`}>
      <thead>
        <tr>
          <th><SortButton label="State" keyName="state" activeSort={sort} onSort={onSort} /></th>
          <th><SortButton label="City" keyName="city" activeSort={sort} onSort={onSort} /></th>
          <th><SortButton label="Class Code" keyName="classCode" activeSort={sort} onSort={onSort} /></th>
          <th><SortButton label="Basis" keyName="basis" activeSort={sort} onSort={onSort} /></th>
          <th className="amount"><SortButton label="Exposure" keyName="amount" align="right" activeSort={sort} onSort={onSort} /></th>
          <th className="optional"><SortButton label="Source / Location" keyName="sourceLabel" activeSort={sort} onSort={onSort} /></th>
          <th className="status-col"><SortButton label="Review status" keyName="issueSort" align="center" activeSort={sort} onSort={onSort} /></th>
          {showActions && <th className="actions-col">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row) => {
            const source = sourceFor(row, locations);
            return (
              <tr key={row.id} className={row.status === "excluded" ? "excluded-row" : ""}>
                <td>
                  {editMode ? (
                    <InputGroup
                      small
                      aria-label={`State for ${row.id}`}
                      value={row.state}
                      onChange={(event) => onUpdateRow(row.id, { state: event.currentTarget.value || "Unknown" })}
                    />
                  ) : (
                    row.state
                  )}
                </td>
                <td>{row.city}</td>
                <td>
                  {editMode ? (
                    <HTMLSelect
                      aria-label={`Class code for ${row.id}`}
                      value={row.classCode}
                      onChange={(event) => onUpdateRow(row.id, { classCode: event.currentTarget.value })}
                    >
                      {Object.entries(classOptions).map(([code, label]) => (
                        <option key={code} value={code}>
                          {code ? `${code} - ${label}` : label}
                        </option>
                      ))}
                    </HTMLSelect>
                  ) : row.classCode ? (
                    <>
                      {row.classCode}
                      <div className="subline">{row.classDescription}</div>
                    </>
                  ) : (
                    "Missing class code"
                  )}
                </td>
                <td>
                  {editMode ? (
                    <HTMLSelect
                      aria-label={`Exposure basis for ${row.id}`}
                      value={row.basis}
                      onChange={(event) => onUpdateRow(row.id, { basis: event.currentTarget.value as ExposureBasis })}
                    >
                      {basisOptions.map((basis) => (
                        <option key={basis} value={basis}>
                          {basis}
                        </option>
                      ))}
                    </HTMLSelect>
                  ) : (
                    row.basis
                  )}
                </td>
                <td className="amount">
                  {editMode ? (
                    <InputGroup
                      small
                      type="number"
                      min={0}
                      aria-label={`Exposure amount for ${row.id}. Blank means unresolved.`}
                      value={row.amount === null ? "" : String(row.amount)}
                      onChange={(event) =>
                        onUpdateRow(row.id, {
                          amount: event.currentTarget.value === "" ? null : Number(event.currentTarget.value)
                        })
                      }
                    />
                  ) : (
                    <span className={row.amount === null ? "dash-value" : ""}>{formatExposure(row.amount)}</span>
                  )}
                </td>
                <td className="optional">
                  {source.location}
                  <div className="subline">
                    {source.id} / {source.building} / {confidenceForRow(row)}
                  </div>
                </td>
                <td className="status-col"><IssueTag row={row} /></td>
                {showActions && (
                  <td className="actions-col">
                    {row.status === "excluded" ? (
                      <ButtonGroup>
                        <Tooltip content="Restore row to active totals">
                          <Button
                            small
                            icon="undo"
                            aria-label={`Restore ${row.id}`}
                            onClick={() => onRestoreRow(row.id)}
                          />
                        </Tooltip>
                        {editMode && (
                          <Tooltip content="Delete row">
                            <Button
                              small
                              icon="trash"
                              intent="danger"
                              aria-label={`Delete ${row.id}`}
                              onClick={() => onDeleteRow(row)}
                            />
                          </Tooltip>
                        )}
                      </ButtonGroup>
                    ) : (
                      <Tooltip content="Delete row">
                        <Button
                          small
                          icon="trash"
                          intent="danger"
                          aria-label={`Delete ${row.id}`}
                          onClick={() => onDeleteRow(row)}
                        />
                      </Tooltip>
                    )}
                  </td>
                )}
              </tr>
            );
          })
        ) : (
          <EmptyRow span={showActions ? 8 : 7} label={emptyLabel} />
        )}
      </tbody>
    </table>
  );
}

function detailEmptyLabel(
  detailFilter: DetailFilter,
  detailScope: DetailScope | null,
  stateFixture: StateFixture,
  columnFilterCount: number
) {
  if (stateFixture === "empty_schedule") return "The empty-schedule fixture has no active exposure rows.";
  if (stateFixture === "no_results") {
    return "No rows match this filtered no-results fixture. Clear the scenario to return to live review rows.";
  }
  if (detailFilter === "excluded") return "No excluded rows. Excluded rows appear here with a restore action.";
  if (detailScope) return `No rows remain in ${detailScope.label}. Clear the active scope to return to the full Detail table.`;
  if (columnFilterCount) return "No rows match the selected column filters. Clear filters to return to Detail rows.";
  return "No Detail rows match the active review status.";
}

function FilterPopover({
  rows,
  locations,
  filters,
  search,
  onSearch,
  onToggle,
  onClear
}: {
  rows: ExposureRow[];
  locations: SourceLocation[];
  filters: ColumnFilters;
  search: string;
  onSearch: (search: string) => void;
  onToggle: (key: ColumnFilterKey, value: string) => void;
  onClear: () => void;
}) {
  const config: Array<{
    key: ColumnFilterKey;
    label: string;
    value: (row: ExposureRow) => string;
    display?: (row: ExposureRow) => string;
  }> = [
    { key: "state", label: "State", value: (row) => row.state },
    { key: "city", label: "City", value: (row) => cityFor(row, locations) },
    {
      key: "classCode",
      label: "Class Code",
      value: (row) => row.classCode || "Missing class code",
      display: (row) => (row.classCode ? `${row.classCode} ${row.classDescription}` : "Missing class code")
    },
    { key: "basis", label: "Basis", value: (row) => row.basis }
  ];
  const selectedCount = Object.values(filters).reduce((sum, values) => sum + values.length, 0);
  const term = search.trim().toLowerCase();

  return (
    <Popover
      placement="bottom-end"
      content={
        <div className="filter-panel">
          <InputGroup
            leftIcon="search"
            aria-label="Search column filters"
            placeholder="Enter text to search..."
            value={search}
            onChange={(event) => onSearch(event.currentTarget.value)}
          />
          <div className="filter-panel-header">
            <strong>Column filters</strong>
            <Button small minimal text="Clear All" onClick={onClear} />
          </div>
          {config.map((section) => {
            const seen = new Map<string, string>();
            rows.forEach((row) => {
              const value = section.value(row);
              if (!seen.has(value)) seen.set(value, section.display ? section.display(row) : value);
            });
            const values = [...seen.entries()]
              .filter(([, label]) => !term || label.toLowerCase().includes(term))
              .sort((a, b) => a[1].localeCompare(b[1]));
            return (
              <div className="filter-section" key={section.key}>
                <div className="filter-section-title">{section.label}</div>
                {values.map(([value, label]) => (
                  <Checkbox
                    key={value}
                    checked={filters[section.key].includes(value)}
                    label={label}
                    onChange={() => onToggle(section.key, value)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      }
    >
      <Button
        icon="filter"
        text={selectedCount ? `Column filters ${selectedCount}` : "Column filters"}
        aria-label="Open column filters"
      />
    </Popover>
  );
}

function IssueTag({ row }: { row: ExposureRow }) {
  if (row.status === "excluded") {
    return (
      <Tag minimal className="issue-tag excluded-issue-tag" icon="disable" aria-label="Excluded row">
        Excluded
      </Tag>
    );
  }
  const issues = reviewIssueTypesFor(row);
  if (!issues.length) return null;
  const title = issues.map((issue) => issueLabelByType[issue]).join(", ");
  return (
    <div className="issue-tag-group" aria-label={`Review states: ${title}`}>
      {issues.map((issue) => (
        <Tooltip key={issue} content={issue === row.issueType ? issueText(row) : issueLabelByType[issue]}>
          <Tag
            minimal
            intent="warning"
            className={`issue-tag issue-${issue}`}
            icon={issue === "low_confidence" ? "help" : "warning-sign"}
          >
            {issueLabelByType[issue]}
          </Tag>
        </Tooltip>
      ))}
    </div>
  );
}

function NestedTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[] }) {
  return (
    <div className="nested-table">
      <table className={Classes.HTML_TABLE}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} className={index > 0 && header !== "State Breakout" ? "amount" : undefined}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.length ? rows : <EmptyRow span={headers.length} label="No rows found" />}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ span, label }: { span: number; label: string }) {
  return (
    <tr>
      <td colSpan={span}>
        <Callout className="empty-state" icon="search">
          {label}
        </Callout>
      </td>
    </tr>
  );
}

function groupByKey(rows: ExposureRow[], keyFn: (row: ExposureRow) => string) {
  const groups = new Map<string, ExposureRow[]>();
  rows.forEach((row) => groups.set(keyFn(row), [...(groups.get(keyFn(row)) || []), row]));
  return groups;
}

function allMissing(rows: ExposureRow[]) {
  return rows.every((row) => row.amount === null || row.amount === undefined);
}

function basisAmountCell(rows: ExposureRow[], basis: ExposureBasis) {
  const matching = rows.filter((row) => row.basis === basis);
  if (!matching.length || allMissing(matching)) return "--";
  return formatNumber(sumRows(matching));
}

function otherAmountCell(rows: ExposureRow[]) {
  const matching = rows.filter((row) => !["Units", "Area-square Footage", "Each"].includes(row.basis));
  if (!matching.length || allMissing(matching)) return "--";
  return formatNumber(sumRows(matching));
}

function confidenceForRow(row: ExposureRow) {
  if (row.status === "excluded") return "Excluded";
  if (row.issueType === "low_confidence" || row.sourceType === "Extractor Draft") return "Low confidence";
  if (row.sourceType === "UW Adjustment") return "User adjusted";
  return "High confidence";
}
