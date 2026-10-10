'use client';

import React, { createElement } from 'react';
import Script from 'next/script';

export function CallHero() {
  const agentId = process.env.NEXT_PUBLIC_AGENT_ID;

  const handleStartCall = () => {
    // Try triggering the ElevenLabs ConvAI widget
    if (typeof window !== 'undefined') {
      const widget = document.querySelector('elevenlabs-convai') as any;
      if (widget) {
        if (typeof widget.startSession === 'function') {
          widget.startSession();
          return;
        }
        const shadow = widget.shadowRoot;
        const btn = shadow ? shadow.querySelector('button') : widget.querySelector('button');
        if (btn) {
          btn.click();
          return;
        }
      }
    }
  };

  return (
    <section className="call-hero-section" id="call-hero" aria-label="Voice Call CTA">
      <div className="call-hero-inner">
        <div className="call-hero-header">
          <div className="call-badge">
            <span className="live-dot" />
            <span>VOICE BUG TRIAGE · ELEVENLABS CONVAI</span>
          </div>
          <span className="call-status-tag">ONLINE & READY</span>
        </div>

        <div className="call-hero-body">
          <div className="call-hero-text">
            <h2 className="call-hero-title">
              Talk directly to BugBot
            </h2>
            <p className="call-hero-desc">
              Report bugs in plain English, query in-progress agent fixes, or dispatch autonomous coding fixes straight from your voice.
            </p>
          </div>

          <div className="call-widget-holder" id="convai-widget-container">
            <button
              className="hero-call-cta-button"
              id="hero-call-trigger"
              onClick={handleStartCall}
              title="Initiate voice conversation with BugBot"
            >
              <span className="call-btn-dot" />
              <span>START VOICE CALL</span>
              <span className="call-btn-arrow">→</span>
            </button>

            {agentId && (
              <div className="elevenlabs-embed-hidden">
                {createElement('elevenlabs-convai', { 'agent-id': agentId })}
                <Script
                  src="https://unpkg.com/@elevenlabs/convai-widget-embed"
                  strategy="afterInteractive"
                />
              </div>
            )}
          </div>
        </div>

        <div className="call-prompts-row">
          <span className="call-prompts-label">Try saying:</span>
          <div className="call-prompts-list">
            <span className="prompt-chip">&ldquo;I found a bug in 429 backoff headers&rdquo;</span>
            <span className="prompt-chip">&ldquo;What issues are currently in progress?&rdquo;</span>
            <span className="prompt-chip">&ldquo;Fix issue 49&rdquo;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
