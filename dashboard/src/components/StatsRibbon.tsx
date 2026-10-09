'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';
import { Bug, PlayCircle, GitPullRequest, AlertTriangle } from 'lucide-react';

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
        <div>
          <div className="stat-label">Pending Triage</div>
          <div className="stat-val" style={{ color: 'var(--accent-cyan)' }}>
            {reportedCount}
          </div>
        </div>
        <div style={{ color: 'var(--accent-cyan)', opacity: 0.8 }}>
          <Bug size={26} />
        </div>
      </div>

      <div className="stat-card" id="stat-wip">
        <div>
          <div className="stat-label">Agent In-Flight</div>
          <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>
            {wipCount}
          </div>
        </div>
        <div style={{ color: 'var(--accent-amber)', opacity: 0.8 }}>
          <PlayCircle size={26} />
        </div>
      </div>

      <div className="stat-card" id="stat-review">
        <div>
          <div className="stat-label">PRs Ready for Human</div>
          <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>
            {reviewCount}
          </div>
        </div>
        <div style={{ color: 'var(--accent-emerald)', opacity: 0.8 }}>
          <GitPullRequest size={26} />
        </div>
      </div>

      <div className="stat-card" id="stat-failed">
        <div>
          <div className="stat-label">Fix Retries Needed</div>
          <div className="stat-val" style={{ color: 'var(--accent-rose)' }}>
            {failedCount}
          </div>
        </div>
        <div style={{ color: 'var(--accent-rose)', opacity: 0.8 }}>
          <AlertTriangle size={26} />
        </div>
      </div>
    </section>
  );
}
