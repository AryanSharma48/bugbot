'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';
import { IssueCard } from './IssueCard';

interface BoardProps {
  issues: IssueItem[];
  searchQuery: string;
  selectedSeverity: string;
  onSelectIssue: (issue: IssueItem) => void;
}

interface ColumnDef {
  key: IssueItem['status'];
  title: string;
  dotClass: string;
  emptyHint: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'reported',
    title: 'Reported',
    dotClass: 'dot-cyan',
    emptyHint: 'No issues pending triage',
  },
  {
    key: 'WIP',
    title: 'In Progress',
    dotClass: 'dot-amber',
    emptyHint: 'No active agent jobs',
  },
  {
    key: 'needs-review',
    title: 'Needs Review',
    dotClass: 'dot-emerald',
    emptyHint: 'No pull requests pending approval',
  },
  {
    key: 'fix-failed',
    title: 'Fix Failed',
    dotClass: 'dot-rose',
    emptyHint: 'Zero failed fixes',
  },
];

export function Board({ issues, searchQuery, selectedSeverity, onSelectIssue }: BoardProps) {
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
                <span className={`status-dot ${col.dotClass}`} />
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
