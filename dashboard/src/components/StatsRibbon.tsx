'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';

interface StatsRibbonProps {
  issues: IssueItem[];
}

export function StatsRibbon({ issues }: StatsRibbonProps) {
  const reportedCount = issues.filter((i) => i.status === 'reported').length;
  const wipCount = issues.filter((i) => i.status === 'WIP').length;
  const reviewCount = issues.filter((i) => i.status === 'needs-review').length;
  const failedCount = issues.filter((i) => i.status === 'fix-failed').length;

  const scrollToColumn = (key: string) => {
    const el = document.getElementById(`column-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' });
      // Subtle pulse on targeted column
      el.classList.add('column-focus-highlight');
      setTimeout(() => el.classList.remove('column-focus-highlight'), 1200);
    }
  };

  return (
    <section className="stats-ribbon" aria-label="System Metrics">
      <div
        className="stat-card"
        id="stat-reported"
        role="button"
        tabIndex={0}
        onClick={() => scrollToColumn('reported')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && scrollToColumn('reported')}
        title="Jump to Reported column"
      >
        <div className="stat-card-header">
          <span className="stat-index">01</span>
          <span className="stat-status-dot dot-cyan" />
        </div>
        <div className="stat-val">{reportedCount}</div>
        <div className="stat-label">Pending Triage</div>
      </div>

      <div
        className="stat-card"
        id="stat-wip"
        role="button"
        tabIndex={0}
        onClick={() => scrollToColumn('WIP')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && scrollToColumn('WIP')}
        title="Jump to In Progress column"
      >
        <div className="stat-card-header">
          <span className="stat-index">02</span>
          <span className="stat-status-dot dot-amber" />
        </div>
        <div className="stat-val">{wipCount}</div>
        <div className="stat-label">Agent In-Flight</div>
      </div>

      <div
        className="stat-card"
        id="stat-review"
        role="button"
        tabIndex={0}
        onClick={() => scrollToColumn('needs-review')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && scrollToColumn('needs-review')}
        title="Jump to Needs Review column"
      >
        <div className="stat-card-header">
          <span className="stat-index">03</span>
          <span className="stat-status-dot dot-emerald" />
        </div>
        <div className="stat-val">{reviewCount}</div>
        <div className="stat-label">PRs Ready for Review</div>
      </div>

      <div
        className="stat-card"
        id="stat-failed"
        role="button"
        tabIndex={0}
        onClick={() => scrollToColumn('fix-failed')}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && scrollToColumn('fix-failed')}
        title="Jump to Fix Failed column"
      >
        <div className="stat-card-header">
          <span className="stat-index">04</span>
          <span className="stat-status-dot dot-rose" />
        </div>
        <div className="stat-val">{failedCount}</div>
        <div className="stat-label">Fix Retries Needed</div>
      </div>
    </section>
  );
}
