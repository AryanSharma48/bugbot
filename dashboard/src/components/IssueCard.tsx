'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';
import { GitPullRequest, ExternalLink, Clock, User } from 'lucide-react';

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
        <div className="wip-glow-strip" id={`wip-indicator-${issue.number}`}>
          <div className="wip-spinner"></div>
          <span>Aider agent running tests...</span>
        </div>
      )}

      {issue.pr && (
        <div style={{ marginBottom: '0.65rem' }}>
          <a
            href={issue.pr}
            target="_blank"
            rel="noopener noreferrer"
            className="card-pr-link"
            id={`pr-link-${issue.number}`}
            onClick={(e) => e.stopPropagation()}
            title="Open reviewable Pull Request on GitHub"
          >
            <GitPullRequest size={13} />
            <span>Review PR {issue.prNumber ? `#${issue.prNumber}` : ''}</span>
            <ExternalLink size={11} />
          </a>
        </div>
      )}

      {issue.body && (
        <p className="card-snippet">
          {issue.body.replace(/##|\*\*|---\|_/g, '').trim()}
        </p>
      )}

      <div className="card-footer">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <User size={11} />
          <span>{issue.author}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={11} />
          <span>{new Date(issue.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
      </div>
    </article>
  );
}
