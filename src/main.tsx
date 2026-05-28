import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Tool from './components/Tool';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <main style={{ maxWidth: '48rem', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>third-party AI tool</h1>
      <p>
        Standalone preview of the component this app exposes as{' '}
        <code>thirdparty/Tool</code> via Module Federation. The shell at
        port 3010 loads it remotely.
      </p>
      <Tool />
    </main>
  </StrictMode>,
);
