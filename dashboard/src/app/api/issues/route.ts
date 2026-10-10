import { NextResponse } from 'next/server';


export interface IssueItem {
  number: number;
  title: string;
  body?: string;
  status: 'reported' | 'WIP' | 'needs-review' | 'fix-failed';
  url: string;
  sev: string;
  comp: string;
  pr: string | null;
  prNumber: number | null;
  author: string;
  createdAt: string;
  updatedAt: string;
}

let cache: { at: number; body: IssueItem[] } | null = null;

// Fallback demo issues if repository has no open issues or rate limit hit without token
const DEMO_FALLBACK_ISSUES: IssueItem[] = [
  {
    number: 1,
    title: 'Discount percentage subtracted as flat dollar amount in cart checkout',
    body: '## Description\nApplying a 10% discount code subtracts $10 flat from the total rather than calculating 10% of subtotal.\n\n## Steps to reproduce\n1. Add items totaling $200\n2. Apply discount code SAVE10\n3. Observed total is $190 instead of $180\n\n## Environment\nChrome 130 / Node 20\n\n---\n_Filed automatically by VoiceBugBot_',
    status: 'WIP',
    url: 'https://github.com/aryanSharma48/smoothapi/issues/1',
    sev: 'high',
    comp: 'typescript',
    pr: null,
    prNumber: null,
    author: 'aryanSharma48',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    number: 2,
    title: 'Zero-length timeout handler rejects promise with unhandled exception in dual-shield runner',
    body: '## Description\nPassing timeoutMs: 0 triggers an immediate uncaught rejection instead of resolving synchronously or rejecting with TimeoutError.\n\n## Environment\nPython 3.12 / macOS',
    status: 'needs-review',
    url: 'https://github.com/aryanSharma48/smoothapi/issues/2',
    sev: 'medium',
    comp: 'python',
    pr: 'https://github.com/aryanSharma48/smoothapi/pull/4',
    prNumber: 4,
    author: 'aryanSharma48',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    number: 3,
    title: 'Typo in smoothapi dual-language usage quickstart docs for fallback handlers',
    body: '## Description\nExample snippet in docs/usage.md has missing parenthesis on fallback invocation.\n\n## Environment\nDocumentation',
    status: 'reported',
    url: 'https://github.com/aryanSharma48/smoothapi/issues/3',
    sev: 'low',
    comp: 'docs',
    pr: null,
    prNumber: null,
    author: 'aryanSharma48',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  }
];

export async function GET() {
  const repo = process.env.GITHUB_REPO || 'aryanSharma48/smoothapi';
  const token = process.env.GITHUB_TOKEN;

  // 3-second cache to prevent upstream GitHub rate-limiting across open tabs
  if (cache && Date.now() - cache.at < 3000) {
    return NextResponse.json(cache.body);
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'BugBot-Dashboard',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const ghFetch = async (path: string) => {
      const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
        headers,
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`GitHub API HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    };

    const [issuesRaw, pullsRaw] = await Promise.all([
      ghFetch('/issues?state=open&per_page=50'),
      ghFetch('/pulls?state=open&per_page=50'),
    ]);

    if (!Array.isArray(issuesRaw) || !Array.isArray(pullsRaw)) {
      if (cache) return NextResponse.json(cache.body);
      return NextResponse.json(DEMO_FALLBACK_ISSUES);
    }

    // Map branch names "fix/issue-12" to PR details
    const prByIssue: Record<string, { url: string; number: number }> = {};
    for (const p of pullsRaw) {
      const ref = p.head?.ref ?? '';
      const match = /^fix\/issue-(\d+)$/.exec(ref);
      if (match) {
        prByIssue[match[1]] = { url: p.html_url, number: p.number };
      }
    }

    const issues: IssueItem[] = issuesRaw
      .filter((i: any) => !i.pull_request)
      .map((i: any) => {
        const names: string[] = (i.labels || []).map((l: any) => l.name);

        const prData = prByIssue[String(i.number)];

        const sevLabel = names.find((n) => n.startsWith('sev:'));
        const compLabel = names.find((n) => n.startsWith('comp:'));

        let status: IssueItem['status'] = 'reported';
        if (names.includes('fix-failed')) {
          status = 'fix-failed';
        } else if (prData) {
          // Only mark as needs-review if an active PR actually exists for this issue
          status = 'needs-review';
        } else if (names.includes('WIP')) {
          status = 'WIP';
        } else {
          status = 'reported';
        }

        return {
          number: i.number,
          title: i.title,
          body: i.body || '',
          status,
          url: i.html_url,
          sev: sevLabel ? sevLabel.slice(4) : 'medium',
          comp: compLabel ? compLabel.slice(5) : 'typescript',
          pr: prData ? prData.url : null,
          prNumber: prData ? prData.number : null,
          author: i.user?.login || 'anonymous',
          createdAt: i.created_at,
          updatedAt: i.updated_at,
        };
      });

    // If repo currently has 0 open issues, provide the fallback demo set so the board isn't blank
    const finalData = issues.length > 0 ? issues : DEMO_FALLBACK_ISSUES;
    cache = { at: Date.now(), body: finalData };
    return NextResponse.json(finalData);
  } catch (err: any) {
    const isRateLimit = err?.message?.includes('403');
    if (!isRateLimit) {
      console.warn('Failed to fetch from GitHub API directly, using fallback data:', err?.message || err);
    } else if (!cache) {
      console.warn('GitHub API rate limit reached (unauthenticated). Add GITHUB_TOKEN in dashboard/.env.local for 5,000 req/hr. Using demo fallback data.');
    }
    const fallback = cache?.body || DEMO_FALLBACK_ISSUES;
    // Cache the fallback for 10s during rate limit so the terminal isn't spammed every poll
    cache = { at: Date.now() + 7000, body: fallback };
    return NextResponse.json(fallback);
  }
}
