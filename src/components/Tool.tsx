'use client';

import { JSX, useState } from 'react';
import styles from './tool.module.css';

interface ToolProps {
  /**
   * The shell can pass a session, branding hints, or other host context
   * down through props. Documented contract — not enforced.
   */
  session?: {
    userName?: string;
    agency?: string;
  };
}

/**
 * The third-party AI tool component. Exposed via Module Federation as
 * `thirdparty/Tool`. Inherits the host's CSS custom properties at render
 * because it mounts inside the host's DOM — that's how POC 1's branding
 * mechanism still applies here.
 */
function Tool({ session }: ToolProps): JSX.Element {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setResponses((r) => [
      `[mock response] You asked: "${prompt}". This component was loaded from the third party at runtime via Module Federation.`,
      ...r,
    ]);
    setPrompt('');
  };

  return (
    <div className={styles.tool}>
      <header className={styles.header}>
        <div className={styles.badge}>thirdparty/Tool</div>
        {session?.userName && (
          <div className={styles.session}>
            Signed in as <strong>{session.userName}</strong>
            {session.agency && <> ({session.agency})</>}
          </div>
        )}
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="prompt">Ask the assistant</label>
        <textarea
          id="prompt"
          name="prompt"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Summarize the latest agency policy memo…"
        />
        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Send
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => {
              setPrompt('');
              setResponses([]);
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <section className={styles.responses} aria-live="polite">
        {responses.length === 0 ? (
          <p className={styles.empty}>No responses yet.</p>
        ) : (
          responses.map((r, i) => (
            <article key={i} className={styles.response}>
              {r}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default Tool;
