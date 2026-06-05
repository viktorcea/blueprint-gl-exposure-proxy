"use client";

import type { ReactNode } from "react";
import { AnchorButton, ButtonGroup, Callout, Card, Tag } from "@blueprintjs/core";

const criticReportPath =
  "/Users/viktorcea/vault/Agent-System/01-Project-Rooms/Design-MD-Research/Outputs/experiments/blueprint-gl-exposure-proxy/critic-review-blueprint-base.md";

const auditReportPath =
  "/Users/viktorcea/vault/Agent-System/01-Project-Rooms/Design-MD-Research/Outputs/experiments/blueprint-gl-exposure-proxy/technical-audit-blueprint-base.md";

const navRoutes = [
  { href: "/", label: "Overview" },
  { href: "/blueprint-base", label: "Blueprint base" },
  { href: "/review-method", label: "Review method" },
  { href: "/critic-report", label: "Critic report" },
  { href: "/audit-report", label: "Audit report" },
  { href: "/pack-guided", label: "Pack guided" },
  { href: "/comparison", label: "Comparison" }
];

type DemoRoute = {
  title: string;
  status: "Available" | "Pending" | "Not built";
  body: string;
  href?: string;
  action?: string;
  sourcePath?: string;
};

type Severity = "P0" | "P1" | "P2" | "P3";

type ReportFinding = {
  severity: Severity;
  title: string;
  body: string;
};

const criticFindings: ReportFinding[] = [
  {
    severity: "P1",
    title: "First-viewport review summary is passive",
    body: "The header count says risk exists, but does not name Missing class or Blank exposure or route directly to affected rows."
  },
  {
    severity: "P1",
    title: "Rollup review indicators are too compact",
    body: "Issue drilldown works, but the visible rollup state is a small far-right icon instead of an inline issue label/count."
  },
  {
    severity: "P1",
    title: "Active scope and filter state are easy to misread",
    body: "A scoped Detail tag, a Show select, and a separate Filter popover force the user to infer which filters are active."
  },
  {
    severity: "P2",
    title: "Excluded-row workflow is traceable but under-communicated",
    body: "Exclusion is preserved and reversible, but the transition is quiet enough that users may confuse exclusion with deletion."
  },
  {
    severity: "P2",
    title: "Detail issue semantics are diluted into long table text",
    body: "Missing, blank, unknown, and low-confidence meanings are present, but users must scan several ordinary cells to diagnose a row."
  },
  {
    severity: "P2",
    title: "Edit mode turns the whole table into a form",
    body: "Full-table edit is powerful, but it does not prioritize the small set of rows that actually need correction."
  },
  {
    severity: "P2",
    title: "Add exposure allows unresolved defaults",
    body: "Adding unresolved data can be valid, but the baseline needs stronger validation or explicit unresolved confirmation."
  },
  {
    severity: "P2",
    title: "Save provides no closure after correction",
    body: "Save exits edit mode without stating whether changes were accepted or whether review items remain."
  },
  {
    severity: "P2",
    title: "Narrow viewport pressure hides key affordances",
    body: "At 390px, important review and correction targets can fall offscreen or become too compressed."
  },
  {
    severity: "P3",
    title: "No-results state is too generic",
    body: "The empty state says No rows found instead of naming the active filter and next available action."
  },
  {
    severity: "P3",
    title: "Active summary tile behavior is useful but under-signaled",
    body: "Metric tiles navigate and expand rollups, but the selected state is subtle enough to need narration."
  }
];

const auditFindings: ReportFinding[] = [
  {
    severity: "P0",
    title: "Edit/save can create an unflagged blank exposure",
    body: "Clearing an included exposure and saving can show -- without Blank exposure treatment or attention-count changes."
  },
  {
    severity: "P1",
    title: "Programmatic labels are incomplete",
    body: "Some selects, status sort controls, and compact status tags lack useful accessible names."
  },
  {
    severity: "P1",
    title: "Narrow viewport clips primary actions",
    body: "At 390px, Edit and collapse actions can fall offscreen and table review targets become too compressed."
  },
  {
    severity: "P1",
    title: "Required component and workflow states are partial",
    body: "Loading, unavailable/error, empty schedule, low confidence, validation, selected/focused, and restore states need better coverage."
  },
  {
    severity: "P2",
    title: "Review status communication is too compact",
    body: "Detail status relies too heavily on compact tags, color, icon, or tooltip treatment."
  },
  {
    severity: "P2",
    title: "Filter and provenance behavior loses nuance",
    body: "Low-confidence filtering, excluded-row filter options, and narrow viewport source trace need stronger treatment."
  },
  {
    severity: "P2",
    title: "Theming and state styling are not yet system-clean",
    body: "State colors and structure are still concentrated in hard-coded CSS rather than reusable semantic roles."
  }
];

const criticAcceptanceCriteria = [
  "First load identifies active issue types and routes directly to affected Detail rows.",
  "Rollup review indicators show visible issue labels/counts, not icon-only warnings.",
  "Detail rows expose review-state tags for Missing class, Unknown state, Blank exposure, and Low confidence.",
  "Blank exposure displays as -- while confirmed zero displays as 0.",
  "Active Detail scopes, review-status filters, column filters, and result counts use one visible grammar.",
  "Add, save, download, exclude, restore, and delete moments provide clear local-state feedback.",
  "Narrow viewport behavior keeps review summary and primary correction actions reachable.",
  "No-results states describe the active filter and next available action."
];

const auditAcceptanceCriteria = [
  "Editing any exposure re-derives review state before save.",
  "Clearing exposure increases the attention count and appears in Blank exposure filtering.",
  "Resolving missing class, unknown state, or blank exposure clears issues only when required fields are valid.",
  "Every select/input, icon-only action, and compact status has a programmatic label.",
  "At 390px, Download, Edit/Add, Save/Cancel, and collapse/expand remain visible and clickable.",
  "Fixture states cover loaded, collapsed, expanded, filtered no-results, excluded, low-confidence, validation, cancel, save, delete confirmation, and restore.",
  "Styling uses semantic roles for action, text, borders, review attention, destructive, confirmed/resolved, selected, excluded, and surfaces."
];

const criticPackRecommendations = [
  "Require an actionable first-viewport review summary in the design-system contract.",
  "Add active scope plus review-status plus column-filter combinations to the component-state checklist.",
  "Document visible reversible excluded-row state and excluded filter fixture coverage.",
  "Add content patterns for Review status, Column filters, No excluded rows, save-with-review-items, and download-with-unresolved-items.",
  "Update the magic-trick language so review risk must become visible in the first viewport."
];

const auditPackRecommendations = [
  "Centralize review-state derivation instead of patching row fields directly.",
  "Promote status badges, rollup review states, action clusters, and filter chips into reusable role components.",
  "Define a mobile workbench pattern with reachable primary actions and deliberate table overflow.",
  "Add deterministic fixtures for no-results, low-confidence, excluded/restore, source unavailable, and empty schedule states.",
  "Move hard-coded colors into semantic proxy operational tokens."
];

function DemoSiteShell({
  title,
  description,
  activeRoute,
  children
}: {
  title: string;
  description: string;
  activeRoute: string;
  children: ReactNode;
}) {
  return (
    <main className="demo-shell">
      <header className="demo-topbar">
        <div className="demo-topbar-inner">
          <div className="demo-heading-block">
            <div className="demo-product-name">FDE demo</div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <nav className="demo-nav" aria-label="Demo routes">
            <ButtonGroup>
              {navRoutes.map((route) => (
                <AnchorButton
                  key={route.href}
                  href={route.href}
                  minimal
                  small
                  active={activeRoute === route.href}
                  aria-current={activeRoute === route.href ? "page" : undefined}
                  text={route.label}
                />
              ))}
            </ButtonGroup>
          </nav>
        </div>
      </header>
      <div className="demo-main">{children}</div>
    </main>
  );
}

function StatusTag({ status }: { status: DemoRoute["status"] }) {
  if (status === "Available") return <Tag intent="success">{status}</Tag>;
  if (status === "Pending") return <Tag intent="warning">{status}</Tag>;
  return <Tag minimal>{status}</Tag>;
}

function RouteCard({ route }: { route: DemoRoute }) {
  return (
    <Card className={`demo-route-card ${route.href ? "" : "is-disabled"}`}>
      <div className="demo-card-header">
        <h3>{route.title}</h3>
        <StatusTag status={route.status} />
      </div>
      <p>{route.body}</p>
      {route.sourcePath && <SourcePath path={route.sourcePath} />}
      {route.href ? (
        <AnchorButton href={route.href} minimal icon="arrow-right" text={route.action ?? "Open"} />
      ) : (
        <span className="demo-disabled-action">Waiting on completed review files</span>
      )}
    </Card>
  );
}

function SourcePath({ path }: { path: string }) {
  return (
    <div className="demo-source-block">
      <div className="demo-source-label">Source file</div>
      <code>{path}</code>
    </div>
  );
}

export function DemoOverviewPage() {
  const routes: DemoRoute[] = [
    {
      title: "Blueprint baseline",
      status: "Available",
      body: "The current out-of-box Blueprint.js GL Exposure workbench, preserved with synthetic/proxy data and the existing interactions.",
      href: "/blueprint-base",
      action: "Open baseline"
    },
    {
      title: "Review method",
      status: "Available",
      body: "A compact explanation of the design critique and technical/system audit gates that run before the pack-guided build.",
      href: "/review-method",
      action: "Read method"
    },
    {
      title: "Critic report",
      status: "Available",
      body: "Completed design critique of the Blueprint baseline: pass with concerns, 24 / 40.",
      href: "/critic-report",
      action: "Read critique",
      sourcePath: criticReportPath
    },
    {
      title: "Audit report",
      status: "Available",
      body: "Completed technical/system audit of the Blueprint baseline: pass with concerns, 12 / 20.",
      href: "/audit-report",
      action: "Read audit",
      sourcePath: auditReportPath
    },
    {
      title: "Pack-guided workbench",
      status: "Available",
      body: "The same GL Exposure workflow revised with review-state derivation, actionable issue summary, clearer filters, and proxy operational theme roles.",
      href: "/pack-guided",
      action: "Open revision"
    },
    {
      title: "Comparison",
      status: "Available",
      body: "A concise before/after summary of what Blueprint solved, what review caught, and what the pack-guided revision changes.",
      href: "/comparison",
      action: "Compare versions"
    }
  ];

  return (
    <DemoSiteShell
      title="Blueprint.js GL Exposure Proxy Experiment"
      description="A small working demo comparing a fair Blueprint.js baseline with a UX pack-guided revision."
      activeRoute="/"
    >
      <section className="demo-section">
        <Callout className="demo-callout" icon="info-sign">
          The site preserves the baseline, shows the completed critique and audit gates, and opens the pack-guided
          workbench that responds to those findings.
        </Callout>
      </section>

      <section className="demo-section" aria-labelledby="demo-routes-heading">
        <div className="demo-section-heading">
          <h2 id="demo-routes-heading">Routes</h2>
          <p>Open the baseline first, then compare the review outputs with the pack-guided revision.</p>
        </div>
        <div className="demo-route-grid">
          {routes.map((route) => (
            <RouteCard key={route.title} route={route} />
          ))}
        </div>
      </section>
    </DemoSiteShell>
  );
}

export function ReviewMethodPage() {
  return (
    <DemoSiteShell
      title="Review Method"
      description="Two separate gates judge the Blueprint baseline before any pack-guided revision begins."
      activeRoute="/review-method"
    >
      <section className="demo-gate-grid">
        <Card className="demo-gate-card">
          <div className="demo-card-header">
            <h2>Design Critique</h2>
            <Tag intent="primary">Gate 1</Tag>
          </div>
          <p>
            The critique asks whether the workbench communicates the review task clearly and supports the user&apos;s
            mental model.
          </p>
          <ul className="demo-check-list">
            <li>Workflow clarity</li>
            <li>Information hierarchy</li>
            <li>Cognitive load</li>
            <li>Persona red flags</li>
            <li>Review-state actionability</li>
            <li>Content clarity</li>
          </ul>
        </Card>

        <Card className="demo-gate-card">
          <div className="demo-card-header">
            <h2>Technical/System Audit</h2>
            <Tag intent="primary">Gate 2</Tag>
          </div>
          <p>
            The audit asks whether the implementation is durable enough for review across devices, states, and system
            expectations.
          </p>
          <ul className="demo-check-list">
            <li>Accessibility</li>
            <li>Performance</li>
            <li>Theming/system implementation</li>
            <li>Responsive behavior</li>
            <li>Product anti-patterns</li>
          </ul>
        </Card>
      </section>

      <section className="demo-section">
        <Callout className="demo-callout" icon="comparison">
          The gates stay separate on purpose. The critique documents design judgement and workflow risk; the audit
          documents implementation quality and system risk. Their outputs become acceptance criteria for the future
          pack-guided route.
        </Callout>
      </section>
    </DemoSiteShell>
  );
}

function FindingCard({
  severity,
  title,
  body
}: {
  severity: Severity;
  title: string;
  body: string;
}) {
  const intent = severity === "P0" ? "danger" : severity === "P1" ? "warning" : undefined;
  return (
    <Card className={`demo-finding-card severity-${severity.toLowerCase()}`}>
      <div className="demo-card-header">
        <h3>{title}</h3>
        <Tag minimal intent={intent}>{severity}</Tag>
      </div>
      <p>{body}</p>
    </Card>
  );
}

function ScoreSummary({
  result,
  score,
  body,
  sourcePath
}: {
  result: string;
  score: string;
  body: string;
  sourcePath: string;
}) {
  return (
    <section className="demo-report-summary">
      <Card className="demo-score-card">
        <div>
          <span className="demo-score-label">Result</span>
          <strong>{result}</strong>
        </div>
        <div>
          <span className="demo-score-label">Score</span>
          <strong>{score}</strong>
        </div>
      </Card>
      <Callout className="demo-callout" intent="primary" icon="endorsed">
        {body}
      </Callout>
      <SourcePath path={sourcePath} />
    </section>
  );
}

function SeverityGroup({
  severity,
  findings
}: {
  severity: Severity;
  findings: ReportFinding[];
}) {
  if (!findings.length) return null;
  return (
    <section className="demo-section">
      <div className="demo-section-heading">
        <h2>{severity} Findings</h2>
        <p>{severity === "P0" ? "Blocking issue to fix before the revision." : "Grouped directly from the source report."}</p>
      </div>
      <div className="demo-finding-grid">
        {findings.map((finding) => (
          <FindingCard key={`${finding.severity}-${finding.title}`} {...finding} />
        ))}
      </div>
    </section>
  );
}

function FindingGroups({ findings }: { findings: ReportFinding[] }) {
  const severities: Severity[] = ["P0", "P1", "P2", "P3"];
  return (
    <>
      {severities.map((severity) => (
        <SeverityGroup
          key={severity}
          severity={severity}
          findings={findings.filter((finding) => finding.severity === severity)}
        />
      ))}
    </>
  );
}

function ListPanel({
  title,
  items,
  icon
}: {
  title: string;
  items: string[];
  icon: "tick" | "changes";
}) {
  return (
    <Card className="demo-list-panel">
      <div className="demo-card-header">
        <h2>{title}</h2>
        <Tag minimal icon={icon}>
          {items.length}
        </Tag>
      </div>
      <ul className="demo-check-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}

export function CriticReportPendingPage() {
  return (
    <DemoSiteShell
      title="Critic Report"
      description="Completed design-quality critique of the Blueprint baseline."
      activeRoute="/critic-report"
    >
      <ScoreSummary
        result="Pass with concerns"
        score="24 / 40"
        sourcePath={criticReportPath}
        body="The baseline is credible and functional, but the review workflow is too quiet. The pack-guided version should make risk visible, scoped, and actionable without restarting from a different UI."
      />

      <section className="demo-section">
        <div className="demo-section-heading">
          <h2>Highlighted Risks</h2>
          <p>P1 items are the main design deltas the pack-guided version needs to make legible.</p>
        </div>
        <div className="demo-finding-grid">
          {criticFindings
            .filter((finding) => finding.severity === "P1")
            .map((finding) => (
              <FindingCard key={finding.title} {...finding} />
            ))}
        </div>
      </section>

      <FindingGroups findings={criticFindings} />

      <section className="demo-section">
        <div className="demo-two-panel-grid">
          <ListPanel title="Acceptance Criteria" icon="tick" items={criticAcceptanceCriteria} />
          <ListPanel title="Pack Update Recommendations" icon="changes" items={criticPackRecommendations} />
        </div>
      </section>

      <section className="demo-section demo-report-actions">
        <AnchorButton href="/blueprint-base" minimal icon="arrow-left" text="Open baseline" />
        <AnchorButton href="/pack-guided" minimal icon="arrow-right" text="Open pack-guided" />
      </section>
    </DemoSiteShell>
  );
}

export function AuditReportPendingPage() {
  return (
    <DemoSiteShell
      title="Audit Report"
      description="Completed implementation-quality audit of the Blueprint baseline."
      activeRoute="/audit-report"
    >
      <ScoreSummary
        result="Pass with concerns"
        score="12 / 20"
        sourcePath={auditReportPath}
        body="The implementation uses Blueprint honestly and loads cleanly, but the edit-state semantics, accessibility labels, responsive behavior, and fixture coverage need hardening."
      />

      <section className="demo-section">
        <div className="demo-section-heading">
          <h2>Highlighted Risks</h2>
          <p>The P0/P1 items define the first acceptance bar for `/pack-guided`.</p>
        </div>
        <div className="demo-finding-grid">
          {auditFindings
            .filter((finding) => finding.severity === "P0" || finding.severity === "P1")
            .map((finding) => (
              <FindingCard key={finding.title} {...finding} />
            ))}
        </div>
      </section>

      <FindingGroups findings={auditFindings} />

      <section className="demo-section">
        <div className="demo-two-panel-grid">
          <ListPanel title="Acceptance Criteria" icon="tick" items={auditAcceptanceCriteria} />
          <ListPanel title="Pack Update Recommendations" icon="changes" items={auditPackRecommendations} />
        </div>
      </section>

      <section className="demo-section demo-report-actions">
        <AnchorButton href="/blueprint-base" minimal icon="arrow-left" text="Open baseline" />
        <AnchorButton href="/pack-guided" minimal icon="arrow-right" text="Open pack-guided" />
      </section>
    </DemoSiteShell>
  );
}

export function ComparisonPendingPage() {
  return (
    <DemoSiteShell
      title="Comparison"
      description="What changed between the fair Blueprint baseline and the UX pack-guided revision."
      activeRoute="/comparison"
    >
      <section className="demo-section">
        <Callout icon="comparison" className="demo-callout">
          The baseline proves a fast Blueprint build can reach credible working software. The critique and audit found
          review-risk, edit-state, accessibility, and responsive issues. The pack-guided version makes review risk
          actionable, edits safer, and state meaning clearer while keeping Blueprint as the component foundation.
        </Callout>
      </section>

      <section className="demo-section">
        <div className="demo-section-heading">
          <h2>Before And After</h2>
          <p>The comparison is about product clarity and system behavior, not making Blueprint look bad.</p>
        </div>
        <div className="demo-comparison-grid">
          <Card className="demo-comparison-card">
            <h3>Blueprint baseline</h3>
            <ul className="demo-check-list">
              <li>Credible compact workbench with real Blueprint components.</li>
              <li>Summary tiles, Analysis/Detail tabs, drilldowns, edit/add/delete/exclude, and CSV simulation work.</li>
              <li>Review issues exist, but the screen is quiet about what to fix first.</li>
              <li>Edit/save, status labels, filter scope, and 390px action visibility need hardening.</li>
              <li>Good baseline for the experiment because it is credible, not artificially weak.</li>
            </ul>
          </Card>
          <Card className="demo-comparison-card">
            <h3>Pack-guided revision</h3>
            <ul className="demo-check-list">
              <li>First viewport names active issue flags and routes to scoped Detail rows.</li>
              <li>Review state is re-derived on edit, add, save, and restore.</li>
              <li>Rollups and Detail rows show stronger review-state pills and issue labels.</li>
              <li>Review status, active scope, column filters, and row counts use one visible grammar.</li>
              <li>Save, restore, add, and download provide local-state feedback when review items remain.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-report-panel demo-caveat-panel">
          <h2>Small Caveat</h2>
          <p>
            Loading and fixture states are still demo-scale, not a production QA harness. The route focuses on making
            the before/after design and system delta legible for review.
          </p>
          <div className="demo-action-row">
            <AnchorButton href="/blueprint-base" minimal icon="arrow-left" text="Open baseline" />
            <AnchorButton href="/pack-guided" minimal icon="arrow-right" text="Open pack-guided" />
            <AnchorButton href="/critic-report" minimal icon="manual" text="Critic report" />
            <AnchorButton href="/audit-report" minimal icon="clipboard" text="Audit report" />
          </div>
        </div>
      </section>
    </DemoSiteShell>
  );
}
