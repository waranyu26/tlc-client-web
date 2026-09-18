import type { Theme, CSSObject } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router';

import GlobalStyles from '@mui/material/GlobalStyles';

import { forceReload, isStaleChunkError, reloadForStaleDeploy } from 'src/lib/stale-deploy';

// ----------------------------------------------------------------------

export function ErrorBoundary() {
  const error = useRouteError();

  // A chunk that didn't load is not an application error: the tab is running an
  // index.html from before the last deploy, so it is asking for files that were
  // replaced. Reloading is the whole fix, and showing a stack trace for it
  // teaches the customer to distrust a working app.
  if (isStaleChunkError(error)) {
    return <StaleDeployRecovery />;
  }

  return (
    <>
      {inputGlobalStyles()}

      <div className={errorBoundaryClasses.root}>
        <div className={errorBoundaryClasses.container}>{renderErrorMessage(error)}</div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------

function StaleDeployRecovery() {
  // Optimistic: the reload succeeds in almost every case, and starting at
  // `reloading` means the common path never flashes a manual screen on its way
  // out. The effect downgrades it only if recovery was declined.
  const [outcome, setOutcome] = useState<'reloading' | 'offline' | 'stale'>('reloading');

  useEffect(() => {
    if (reloadForStaleDeploy()) return;

    // A dropped connection fails a chunk exactly the way a deploy does, and it
    // is one of the two reasons a reload is declined. Telling someone whose
    // signal just went that a new version was released would send them
    // refreshing over and over against nothing.
    setOutcome(navigator.onLine === false ? 'offline' : 'stale');
  }, []);

  if (outcome === 'reloading') {
    return (
      <>
        {inputGlobalStyles()}

        <div className={errorBoundaryClasses.root}>
          <div className={errorBoundaryClasses.container}>
            <h1 className={errorBoundaryClasses.title}>Updating to the latest version…</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {inputGlobalStyles()}

      <div className={errorBoundaryClasses.root}>
        <div className={errorBoundaryClasses.container}>
          <h1 className={errorBoundaryClasses.title}>
            {outcome === 'offline' ? 'You appear to be offline' : 'Please refresh this page'}
          </h1>
          <p className={errorBoundaryClasses.notice}>
            {outcome === 'offline'
              ? 'Part of this page could not be downloaded. Check your connection and try again — nothing in your wallet or vault is affected.'
              : 'A newer version of Tokyo Lucky Card has been released, so part of this page could no longer be loaded. Refreshing picks it up — nothing in your wallet or vault is affected.'}
          </p>
          <button type="button" className={errorBoundaryClasses.button} onClick={forceReload}>
            {outcome === 'offline' ? 'Try again' : 'Refresh'}
          </button>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------

function parseStackTrace(stack?: string) {
  if (!stack) return { filePath: null, functionName: null };

  const filePathMatch = stack.match(/\/src\/[^?]+/);
  const functionNameMatch = stack.match(/at (\S+)/);

  return {
    filePath: filePathMatch ? filePathMatch[0] : null,
    functionName: functionNameMatch ? functionNameMatch[1] : null,
  };
}

function renderErrorMessage(error: any) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1 className={errorBoundaryClasses.title}>
          {error.status}: {error.statusText}
        </h1>
        <p className={errorBoundaryClasses.message}>{error.data}</p>
      </>
    );
  }

  if (error instanceof Error) {
    const { filePath, functionName } = parseStackTrace(error.stack);

    return (
      <>
        <h1 className={errorBoundaryClasses.title}>Unexpected Application Error!</h1>
        <p className={errorBoundaryClasses.message}>
          {error.name}: {error.message}
        </p>
        <pre className={errorBoundaryClasses.details}>{error.stack}</pre>
        {(filePath || functionName) && (
          <p className={errorBoundaryClasses.filePath}>
            {filePath} ({functionName})
          </p>
        )}
      </>
    );
  }

  return <h1 className={errorBoundaryClasses.title}>Unknown Error</h1>;
}

// ----------------------------------------------------------------------

const errorBoundaryClasses = {
  root: 'error-boundary-root',
  container: 'error-boundary-container',
  title: 'error-boundary-title',
  details: 'error-boundary-details',
  message: 'error-boundary-message',
  notice: 'error-boundary-notice',
  button: 'error-boundary-button',
  filePath: 'error-boundary-file-path',
};

const cssVars: CSSObject = {
  '--info-color': '#2dd9da',
  '--warning-color': '#e2aa53',
  '--error-color': '#ff5555',
  '--error-background': '#2a1e1e',
  '--details-background': '#111111',
  '--root-background': '#2c2c2e',
  '--container-background': '#1c1c1e',
  '--font-stack-monospace':
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  '--font-stack-sans':
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};

const rootStyles = (): CSSObject => ({
  display: 'flex',
  flex: '1 1 auto',
  alignItems: 'center',
  padding: '10vh 15px 0',
  flexDirection: 'column',
  fontFamily: 'var(--font-stack-sans)',
});

const contentStyles = (): CSSObject => ({
  gap: 24,
  padding: 20,
  width: '100%',
  maxWidth: 960,
  display: 'flex',
  borderRadius: 8,
  flexDirection: 'column',
  backgroundColor: 'var(--container-background)',
});

const titleStyles = (theme: Theme): CSSObject => ({
  margin: 0,
  lineHeight: 1.2,
  fontSize: theme.typography.pxToRem(20),
  fontWeight: theme.typography.fontWeightBold,
});

const messageStyles = (theme: Theme): CSSObject => ({
  margin: 0,
  lineHeight: 1.5,
  padding: '12px 16px',
  whiteSpace: 'pre-wrap',
  color: 'var(--error-color)',
  fontSize: theme.typography.pxToRem(14),
  fontFamily: 'var(--font-stack-monospace)',
  backgroundColor: 'var(--error-background)',
  borderLeft: '2px solid var(--error-color)',
  fontWeight: theme.typography.fontWeightBold,
});

const detailsStyles = (): CSSObject => ({
  margin: 0,
  padding: 16,
  lineHeight: 1.5,
  overflow: 'auto',
  borderRadius: 'inherit',
  color: 'var(--warning-color)',
  backgroundColor: 'var(--details-background)',
});

/**
 * The stale-deploy screen is addressed to a customer, not a developer, so it
 * drops the red "something exploded" treatment the message style carries.
 */
const noticeStyles = (theme: Theme): CSSObject => ({
  margin: 0,
  lineHeight: 1.6,
  color: 'white',
  fontSize: theme.typography.pxToRem(15),
});

const buttonStyles = (theme: Theme): CSSObject => ({
  border: 0,
  padding: '12px 24px',
  borderRadius: 8,
  cursor: 'pointer',
  color: 'black',
  alignSelf: 'flex-start',
  backgroundColor: 'white',
  fontFamily: 'inherit',
  fontSize: theme.typography.pxToRem(15),
  fontWeight: theme.typography.fontWeightBold,
});

const filePathStyles = (): CSSObject => ({
  marginTop: 0,
  color: 'var(--info-color)',
});

const inputGlobalStyles = () => (
  <GlobalStyles
    styles={(theme) => ({
      body: {
        ...cssVars,
        margin: 0,
        color: 'white',
        backgroundColor: 'var(--root-background)',
        [`& .${errorBoundaryClasses.root}`]: rootStyles(),
        [`& .${errorBoundaryClasses.container}`]: contentStyles(),
        [`& .${errorBoundaryClasses.title}`]: titleStyles(theme),
        [`& .${errorBoundaryClasses.message}`]: messageStyles(theme),
        [`& .${errorBoundaryClasses.notice}`]: noticeStyles(theme),
        [`& .${errorBoundaryClasses.button}`]: buttonStyles(theme),
        [`& .${errorBoundaryClasses.filePath}`]: filePathStyles(),
        [`& .${errorBoundaryClasses.details}`]: detailsStyles(),
      },
    })}
  />
);
