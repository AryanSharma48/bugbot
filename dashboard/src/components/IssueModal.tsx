'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';
import { X, ExternalLink, GitPullRequest, Mic, ShieldAlert } from 'lucide-react';

interface IssueModalProps {
  issue: IssueItem | null;
  onClose: () => void;
}

export function IssueModal({ issue, onClose }: IssueModalProps) {
  if (!issue) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} id="modal-backdrop">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} id="issue-modal-content">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="card-number" style={{ fontSize: '1rem' }}>#{issue.number}</span>
              <span className={`badge badge-sev-${issue.sev.toLowerCase()}`}>{issue.sev}</span>
              {issue.comp && <span className="badge badge-comp">{issue.comp}</span>}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Status: <strong style={{ color: 'var(--text-primary)' }}>{issue.status}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {issue.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            id="btn-close-modal"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {issue.body ? (
          <div style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {issue.body}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            No additional description details provided.
          </div>
        )}

        {/* Spoken voice cheat sheet for this issue */}
        <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <Mic size={14} />
            <span>Voice Command Shortcuts</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Speak into the voice widget:
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>&ldquo;Fix issue {issue.number}&rdquo; &rarr; dispatches headless agent</li>
              <li>&ldquo;How is issue {issue.number} going?&rdquo; &rarr; reads live execution status</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          {issue.pr && (
            <a
              href={issue.pr}
              target="_blank"
              rel="noopener noreferrer"
              className="card-pr-link"
              id="modal-pr-btn"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <GitPullRequest size={15} />
              <span>Review Pull Request</span>
              <ExternalLink size={13} />
            </a>
          )}

          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon"
            id="modal-github-issue-btn"
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}
          >
            <span>Open in GitHub</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
