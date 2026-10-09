'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';
import { IssueCard } from './IssueCard';
import { Inbox, Cpu, CheckCircle2, AlertOctagon } from 'lucide-react';

interface BoardProps {
  issues: IssueItem[];
  searchQuery: string;
  selectedSeverity: string;
  onSelectIssue: (issue: IssueItem) => void;
}

interface ColumnDef {
  key: IssueItem['status'];
  title: string;
  color: string;
  icon: React.ReactNode;
  emptyHint: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'reported',
    title: 'Reported',
    color: 'var(--accent-cyan)',
    icon: <Inbox size={16} />,
    emptyHint: 'No new voice reports waiting for fix',
  },
  {
    key: 'WIP',
    title: 'In Progress',
    color: 'var(--accent-amber)',
    icon: <Cpu size={16} />,
    emptyHint: 'No background coding agent runs active',
  },
  {
    key: 'needs-review',
    title: 'Needs Review',
    color: 'var(--accent-emerald)',
    icon: <CheckCircle2 size={16} />,
    emptyHint: 'No pull requests pending approval',
  },
  {
    key: 'fix-failed',
    title: 'Fix Failed',
    color: 'var(--accent-rose)',
    icon: <AlertOctagon size={16} />,
    emptyHint: 'Zero failed fix attempts',
  },
];

export function Board({ issues, searchQuery, selectedSeverity, onSelectIssue }: BoardProps) {
  // Filter issues
  const filteredIssues = issues.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.number).includes(searchQuery) ||
      (item.comp && item.comp.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity =
      !selectedSeverity || selectedSeverity === 'all' || item.sev.toLowerCase() === selectedSeverity.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="board-container" id="kanban-board">
      {COLUMNS.map((col) => {
        const colIssues = filteredIssues.filter((i) => i.status === col.key);

        return (
          <section className="column-wrapper" key={col.key} id={`column-${col.key}`}>
            <div className="column-header">
              <div className="col-title-group">
                <span className="col-indicator-bar" style={{ backgroundColor: col.color }} />
                <span style={{ color: col.color, display: 'flex', alignItems: 'center' }}>
                  {col.icon}
                </span>
                <h2>{col.title}</h2>
              </div>
              <span className="col-count-pill" id={`count-${col.key}`}>
                {colIssues.length}
              </span>
            </div>

            <div className="cards-list" id={`cards-list-${col.key}`}>
              {colIssues.length === 0 ? (
                <div className="empty-col">
                  <span>{col.emptyHint}</span>
                </div>
              ) : (
                colIssues.map((issue) => (
                  <IssueCard
                    key={issue.number}
                    issue={issue}
                    onSelect={onSelectIssue}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
