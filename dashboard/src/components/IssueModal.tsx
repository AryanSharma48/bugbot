'use client';

import React from 'react';
import { IssueItem } from '@/app/api/issues/route';

interface IssueModalProps {
  issue: IssueItem | null;
  onClose: () => void;
}

export function IssueModal({ issue, onClose }: IssueModalProps) {
  if (!issue) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} id="modal-backdrop">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} id="issue-modal-content">
        <div className="modal-header">
          <div>
            <div className="modal-meta-row">
              <span className="card-number">#{issue.number}</span>
              <span className={`badge badge-sev-${issue.sev.toLowerCase()}`}>{issue.sev}</span>
              {issue.comp && <span className="badge badge-comp">{issue.comp}</span>}
              <span className="modal-status-text">
                STATUS: <strong>{issue.status.toUpperCase()}</strong>
              </span>
            </div>
            <h2 className="modal-title">
              {issue.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-modal-close"
            id="btn-close-modal"
            title="Close"
          >
            ✕
          </button>
        </div>

        {issue.body ? (
          <div className="modal-body-box">
            {issue.body}
          </div>
        ) : (
          <div className="modal-empty-body">
            No additional description provided.
          </div>
        )}

        {/* Voice cheat sheet for this issue */}
        <div className="voice-cheatsheet-box">
          <div className="voice-cheatsheet-title">
            <span className="status-dot dot-cyan" />
            <span>VOICE COMMANDS FOR THIS ISSUE</span>
          </div>
          <ul className="voice-cheatsheet-list">
            <li>&ldquo;Fix issue {issue.number}&rdquo; &rarr; dispatches autonomous Coder agent</li>
            <li>&ldquo;Status of issue {issue.number}&rdquo; &rarr; voice readout of current stage</li>
          </ul>
        </div>

        <div className="modal-footer">
          {issue.pr && (
            <a
              href={issue.pr}
              target="_blank"
              rel="noopener noreferrer"
              className="card-pr-link"
              id="modal-pr-btn"
            >
              <span>REVIEW PULL REQUEST</span>
              <span className="arrow-ext">↗</span>
            </a>
          )}

          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-link-ext"
            id="modal-github-issue-btn"
          >
            <span>OPEN ON GITHUB</span>
            <span className="arrow-ext">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
