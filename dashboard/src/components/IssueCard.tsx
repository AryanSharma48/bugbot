'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';

interface IssueCardProps {
  issue: IssueItem;
  onSelect: (issue: IssueItem) => void;
}

export function IssueCard({ issue, onSelect }: IssueCardProps) {
  const getSeverityBadgeClass = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical':
        return 'badge badge-sev-critical';
      case 'high':
        return 'badge badge-sev-high';
      case 'medium':
        return 'badge badge-sev-medium';
      default:
        return 'badge badge-sev-low';
    }
  };

  const isWip = issue.status === 'WIP';

  return (
    <article
      className="issue-card"
      id={`issue-card-${issue.number}`}
      onClick={() => onSelect(issue)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(issue);
        }
      }}
    >
      <div className="card-top">
        <span className="card-number">#{issue.number}</span>
        <div className="card-tags">
          <span className={getSeverityBadgeClass(issue.sev)}>{issue.sev}</span>
          {issue.comp && <span className="badge badge-comp">{issue.comp}</span>}
        </div>
      </div>

      <h3 className="card-title">{issue.title}</h3>

      {isWip && (
        <div className="wip-tag" id={`wip-indicator-${issue.number}`}>
          <span className="wip-dot" />
          <span>FIX IN PROGRESS</span>
        </div>
      )}

      {issue.pr && (
        <div className="card-pr-container">
          <a
            href={issue.pr}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pr-link"
            id={`pr-link-${issue.number}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span>REVIEW PR {issue.prNumber ? `#${issue.prNumber}` : ''}</span>
            <span className="arrow-ext">↗</span>
          </a>
        </div>
      )}

      {issue.body && (
        <p className="card-snippet">
          {issue.body.replace(/##|\*\*|---\|_/g, '').trim()}
        </p>
      )}

      <div className="card-footer">
        <span className="card-author">@{issue.author}</span>
        <span className="card-time">
          {new Date(issue.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </article>
  );
}
