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
      <div className="demo-source-label">Expected source file</div>
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
      status: "Pending",
      body: "The critique has not been completed yet. This page will stay empty of findings until the Markdown source is filled.",
      href: "/critic-report",
      action: "View pending page",
      sourcePath: criticReportPath
    },
    {
      title: "Audit report",
      status: "Pending",
      body: "The technical/system audit has not been completed yet. This page will stay empty of findings until the Markdown source is filled.",
      href: "/audit-report",
      action: "View pending page",
      sourcePath: auditReportPath
    },
    {
      title: "Comparison",
      status: "Pending",
      body: "The before/after comparison waits until the pack-guided version exists and both review gates have produced source findings.",
      href: "/comparison",
      action: "View pending page"
    },
    {
      title: "Pack-guided route",
      status: "Not built",
      body: "The improved GL Exposure workbench is intentionally held until both review source files are completed."
    }
  ];

  return (
    <DemoSiteShell
      title="Blueprint.js GL Exposure Proxy Experiment"
      description="A small working demo for comparing a fair Blueprint.js baseline with a later UX pack-guided revision."
      activeRoute="/"
    >
      <section className="demo-section">
        <Callout className="demo-callout" icon="info-sign">
          The interim site is a navigation and review shell. It preserves the baseline, identifies the two required
          review gates, and marks unfinished reports without inventing findings.
        </Callout>
      </section>

      <section className="demo-section" aria-labelledby="demo-routes-heading">
        <div className="demo-section-heading">
          <h2 id="demo-routes-heading">Routes</h2>
          <p>Available routes can be reviewed now. Pending routes describe their required source material.</p>
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

function PendingReportPage({
  title,
  description,
  sourcePath,
  activeRoute,
  nextStep
}: {
  title: string;
  description: string;
  sourcePath: string;
  activeRoute: string;
  nextStep: string;
}) {
  return (
    <DemoSiteShell title={title} description={description} activeRoute={activeRoute}>
      <section className="demo-section">
        <Callout intent="warning" icon="time" className="demo-callout">
          This report has not been completed yet. No findings, scores, risks, or acceptance criteria are shown here
          until the source Markdown file is filled in.
        </Callout>
      </section>

      <section className="demo-section">
        <div className="demo-report-panel">
          <h2>Expected Source</h2>
          <SourcePath path={sourcePath} />
          <p>{nextStep}</p>
          <AnchorButton href="/review-method" minimal icon="arrow-left" text="Review method" />
        </div>
      </section>
    </DemoSiteShell>
  );
}

export function CriticReportPendingPage() {
  return (
    <PendingReportPage
      title="Critic Report"
      description="Pending design critique for the Blueprint baseline."
      sourcePath={criticReportPath}
      activeRoute="/critic-report"
      nextStep="Run the independent design critique against /blueprint-base, then use the completed Markdown file as the report source."
    />
  );
}

export function AuditReportPendingPage() {
  return (
    <PendingReportPage
      title="Audit Report"
      description="Pending technical/system audit for the Blueprint baseline."
      sourcePath={auditReportPath}
      activeRoute="/audit-report"
      nextStep="Run the technical/system audit against /blueprint-base, then use the completed Markdown file as the report source."
    />
  );
}

export function ComparisonPendingPage() {
  return (
    <DemoSiteShell
      title="Comparison"
      description="The before/after comparison waits for the pack-guided GL Exposure workbench."
      activeRoute="/comparison"
    >
      <section className="demo-section">
        <Callout intent="warning" icon="timeline-events" className="demo-callout">
          The comparison is pending. It should be completed only after /pack-guided exists and both review source files
          contain completed findings.
        </Callout>
      </section>

      <section className="demo-section">
        <div className="demo-report-panel">
          <h2>What Will Be Compared</h2>
          <p>
            The eventual comparison will summarize what the Blueprint baseline solved, what the critique and audit
            identified, and how the pack-guided revision responded. No improved table or findings are introduced on
            this interim page.
          </p>
          <div className="demo-action-row">
            <AnchorButton href="/blueprint-base" minimal icon="arrow-left" text="Open baseline" />
            <AnchorButton href="/review-method" minimal icon="manual" text="Review method" />
          </div>
        </div>
      </section>
    </DemoSiteShell>
  );
}
