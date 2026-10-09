'use client';

import React, { createElement } from 'react';
import Script from 'next/script';
import { Mic, Sparkles } from 'lucide-react';

export function VoiceWidget() {
  const agentId = process.env.NEXT_PUBLIC_AGENT_ID;

  return (
    <aside className="voice-bar-floating" id="voice-widget-wrapper">
      <div className="voice-cue-chip" id="voice-cue-pill">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
          <Mic size={15} />
          <strong>Voice Assistant:</strong>
        </div>
        <span>&ldquo;I found a bug&rdquo; · &ldquo;What&apos;s open?&rdquo; · &ldquo;Fix issue 1&rdquo;</span>
      </div>

      {agentId ? (
        <>
          {createElement('elevenlabs-convai', { 'agent-id': agentId })}
          <Script
            src="https://unpkg.com/@elevenlabs/convai-widget-embed"
            strategy="afterInteractive"
          />
        </>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
            color: '#fff',
            borderRadius: '9999px',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
            cursor: 'default',
          }}
          title="Add NEXT_PUBLIC_AGENT_ID to .env.local to activate ElevenLabs voice conversation widget"
          id="mock-mic-pill"
        >
          <Sparkles size={16} />
          <span>ConvAI Widget Ready</span>
        </div>
      )}
    </aside>
  );
}
