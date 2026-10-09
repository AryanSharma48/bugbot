'use client';

import React from 'react';
import { Bot, GitBranch, RefreshCw, Radio, ExternalLink } from 'lucide-react';

interface HeaderProps {
  repo: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export function Header({ repo, isRefreshing, onRefresh, lastUpdated }: HeaderProps) {
  const timeString = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Connecting...';

  return (
    <header className="header-container">
      <div className="brand-wrapper">
        <div className="brand-logo-badge" id="brand-logo">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="brand-title">
            VoiceBugBot
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              v1.0
            </span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <a
              href={`https://github.com/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-badge"
              id="repo-link"
              title="Target repository monitored by VoiceBugBot"
            >
              <GitBranch size={13} />
              <span>{repo}</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      <div className="header-controls">
        <div className="live-indicator" id="live-indicator" title="Connected to GitHub API via SWR auto-polling">
          <span className="pulse-dot"></span>
          <span>Live Sync</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.2rem' }}>
            ({timeString})
          </span>
        </div>

        <button
          className="btn-icon"
          id="btn-manual-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Manually fetch latest issues from GitHub"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
