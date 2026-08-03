import { CONFIG } from 'src/global-config';

import { HomeView } from 'src/sections/home';

// ----------------------------------------------------------------------

const metadata = { title: `Home | ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <HomeView />
    </>
  );
}
