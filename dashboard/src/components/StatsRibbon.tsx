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

  return (
    <section className="stats-ribbon" aria-label="System Metrics">
      <div className="stat-card" id="stat-reported">
        <div className="stat-card-header">
          <span className="stat-index">01</span>
          <span className="stat-status-dot dot-cyan" />
        </div>
        <div className="stat-val">{reportedCount}</div>
        <div className="stat-label">Pending Triage</div>
      </div>

      <div className="stat-card" id="stat-wip">
        <div className="stat-card-header">
          <span className="stat-index">02</span>
          <span className="stat-status-dot dot-amber" />
        </div>
        <div className="stat-val">{wipCount}</div>
        <div className="stat-label">Agent In-Flight</div>
      </div>

      <div className="stat-card" id="stat-review">
        <div className="stat-card-header">
          <span className="stat-index">03</span>
          <span className="stat-status-dot dot-emerald" />
        </div>
        <div className="stat-val">{reviewCount}</div>
        <div className="stat-label">PRs Ready for Review</div>
      </div>

      <div className="stat-card" id="stat-failed">
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
