'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { IssueItem } from './api/issues/route';
import { Header } from '@/components/Header';
import { CallHero } from '@/components/CallHero';
import { StatsRibbon } from '@/components/StatsRibbon';
import { Board } from '@/components/Board';
import { IssueModal } from '@/components/IssueModal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<IssueItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: issues = [], mutate } = useSWR<IssueItem[]>('/api/issues', fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
    onSuccess: () => {
      setLastUpdated(new Date());
    },
  });

  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const [showAll, setShowAll] = useState(false);
  const severities = ['all', 'critical', 'high', 'medium', 'low'];

  // Only show top 4 issues by default unless searching, filtering, or toggled
  const displayedIssues = (searchQuery || selectedSeverity !== 'all' || showAll)
    ? issues
    : issues.slice(0, 4);

  return (
    <main className="dashboard-main-container">
      {/* 1. Simple, Clean Header */}
      <Header />

      {/* 2. Main Hero CTA: Voice Call (Prominent, Top, Mobile-First) */}
      <CallHero />

      {/* 3. Dashboard Container Beneath Call CTA */}
      <div className="dashboard-content-flow">
        {/* Metric Cards Ribbon */}
        <StatsRibbon issues={issues} />

        {/* Search & Filter Bar */}
        <section className="filter-bar" aria-label="Board Filters">
          <div className="search-box">
            <span className="search-prefix">/</span>
            <input
              type="text"
              id="search-issues-input"
              placeholder="Search by title, component, or #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-pills" id="severity-filters">
            <span className="filter-label">SEVERITY:</span>
            {severities.map((sev) => (
              <button
                key={sev}
                id={`filter-sev-${sev}`}
                className={`filter-pill ${selectedSeverity === sev ? 'active' : ''}`}
                onClick={() => setSelectedSeverity(sev)}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Kanban Board (Top 4 issues by default) */}
        <Board
          issues={displayedIssues}
          searchQuery={searchQuery}
          selectedSeverity={selectedSeverity}
          onSelectIssue={setSelectedIssue}
        />

        {/* Toggle to view more if repo has > 4 issues */}
        {issues.length > 4 && !searchQuery && selectedSeverity === 'all' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setShowAll((prev) => !prev)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                padding: '0.45rem 1rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              {showAll ? 'SHOW TOP 4 ISSUES ONLY' : `VIEW ALL ${issues.length} ISSUES`}
            </button>
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      <IssueModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </main>
  );
}
