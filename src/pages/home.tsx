import { Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { useFeatures } from 'src/api/features.api';

import { HomeView } from 'src/sections/home';

// ----------------------------------------------------------------------

const metadata = { title: `Home | ${CONFIG.appName}` };

export default function Page() {
  const { features } = useFeatures();

  // Home is the shop window for random pulls. With pulling switched off there is
  // nothing to show on it, and its tab is gone from the nav, so `/` — still the
  // logo's target and the post-sign-in landing — hands over to the next best
  // destination instead of rendering an empty shelf.
  if (!features.pull) {
    return <Navigate to={features.store ? paths.store : paths.vault} replace />;
  }

  return (
    <>
      <title>{metadata.title}</title>

      <HomeView />
    </>
  );
}
