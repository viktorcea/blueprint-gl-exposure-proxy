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
  severity: string;
  title: string;
  body: string;
}) {
  return (
    <Card className="demo-finding-card">
      <div className="demo-card-header">
        <h3>{title}</h3>
        <Tag minimal intent={severity === "P0" || severity === "P1" ? "warning" : undefined}>
          {severity}
        </Tag>
      </div>
      <p>{body}</p>
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
      <section className="demo-section">
        <Callout className="demo-callout" intent="primary" icon="endorsed">
          Overall result: pass with concerns. Design health score: 24 / 40.
        </Callout>
        <SourcePath path={criticReportPath} />
      </section>

      <section className="demo-section">
        <div className="demo-section-heading">
          <h2>Top Risks</h2>
          <p>The critique found a credible baseline whose review workflow is functional but too quiet.</p>
        </div>
        <div className="demo-finding-grid">
          <FindingCard
            severity="P1"
            title="First-viewport review summary is passive"
            body="The header shows a compact count, but does not name Missing class or Blank exposure or route directly to affected rows."
          />
          <FindingCard
            severity="P1"
            title="Rollup review indicators are too compact"
            body="Issue drilldown works, but the visible rollup state is a small far-right icon instead of an inline issue label/count."
          />
          <FindingCard
            severity="P1"
            title="Scope and filter state are easy to misread"
            body="A scoped Detail tag, a Show select, and a separate Filter popover force the user to infer which filters are active."
          />
          <FindingCard
            severity="P2"
            title="Correction moments lack confidence"
            body="Add can create unresolved rows without enough intent, exclude is quiet, and save gives no closure about remaining review items."
          />
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-report-panel">
          <h2>Acceptance Direction</h2>
          <p>
            The pack-guided revision should make issue types actionable in the first viewport, expose row review-state
            labels, unify active filters, keep excluded rows reversible, and preserve blank-vs-zero semantics.
          </p>
          <div className="demo-action-row">
            <AnchorButton href="/blueprint-base" minimal icon="arrow-left" text="Open baseline" />
            <AnchorButton href="/pack-guided" minimal icon="arrow-right" text="Open pack-guided" />
          </div>
        </div>
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
      <section className="demo-section">
        <Callout className="demo-callout" intent="primary" icon="endorsed">
          Overall result: pass with concerns. Audit health score: 12 / 20.
        </Callout>
        <SourcePath path={auditReportPath} />
      </section>

      <section className="demo-section">
        <div className="demo-section-heading">
          <h2>Top Risks</h2>
          <p>The audit found a credible implementation with one data-semantics blocker and several system gaps.</p>
        </div>
        <div className="demo-finding-grid">
          <FindingCard
            severity="P0"
            title="Edit/save can create an unflagged blank exposure"
            body="Clearing an included exposure and saving can show -- without Blank exposure treatment or attention-count changes."
          />
          <FindingCard
            severity="P1"
            title="Programmatic labels are incomplete"
            body="Some selects, status sort controls, and compact status tags lack useful accessible names."
          />
          <FindingCard
            severity="P1"
            title="Narrow viewport clips primary actions"
            body="At 390px, Edit and collapse actions can fall offscreen and table review targets become too compressed."
          />
          <FindingCard
            severity="P1"
            title="State coverage is partial"
            body="Loaded/edit/delete/excluded states exist, but loading, error, empty schedule, low confidence, validation, and selected/focused states need better coverage."
          />
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-report-panel">
          <h2>Acceptance Direction</h2>
          <p>
            The pack-guided revision should centralize review-state derivation, label controls/statuses, preserve primary
            actions at 390px, add low-confidence filtering, and introduce semantic proxy theme roles.
          </p>
          <div className="demo-action-row">
            <AnchorButton href="/blueprint-base" minimal icon="arrow-left" text="Open baseline" />
            <AnchorButton href="/pack-guided" minimal icon="arrow-right" text="Open pack-guided" />
          </div>
        </div>
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
          The baseline proves a fast Blueprint build can reach credible working software. The pack-guided revision uses
          the critique and audit to make review risk clearer, safer, and easier to act on.
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
              <li>Review issues exist but are visually quiet and require discovery.</li>
              <li>Edit/save can create an unflagged blank exposure.</li>
              <li>Filter scope, status labels, and 390px action visibility need hardening.</li>
            </ul>
          </Card>
          <Card className="demo-comparison-card">
            <h3>Pack-guided revision</h3>
            <ul className="demo-check-list">
              <li>First viewport names active issue types and routes to scoped Detail rows.</li>
              <li>Review state is re-derived on edit, add, save, exclude, and restore.</li>
              <li>Rollups and Detail rows show visible review-state labels.</li>
              <li>Review status, active scope, column filters, and row counts use one visible grammar.</li>
              <li>Save, exclude, restore, add, and download provide local-state feedback.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="demo-section">
        <div className="demo-report-panel">
          <h2>Remaining Scope</h2>
          <p>
            Loading, unavailable/error, and empty-schedule fixtures are still lighter-weight than a production QA
            harness. The route focuses on the P0/P1 findings needed for the before/after demo.
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
