'use client';

import React from 'react';

interface HeaderProps {
  repo: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export function Header({ repo, isRefreshing, onRefresh, lastUpdated }: HeaderProps) {
  const timeString = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Syncing...';

  return (
    <header className="header-container">
      <div className="brand-wrapper">
        <span className="brand-mark">[BB]</span>
        <div className="brand-info">
          <div className="brand-title-row">
            <h1 className="brand-title">BugBot</h1>
            <span className="version-tag">v1.0</span>
          </div>
          <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-badge"
            id="repo-link"
          >
            <span>{repo}</span>
            <span className="arrow-ext">↗</span>
          </a>
        </div>
      </div>

      <div className="header-controls">
        <div className="live-indicator" id="live-indicator">
          <span className="live-dot" />
          <span className="live-text">SYNCED</span>
          <span className="live-time">{timeString}</span>
        </div>

        <button
          className="btn-refresh"
          id="btn-manual-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'REFRESHING...' : 'REFRESH'}
        </button>
      </div>
    </header>
  );
}
