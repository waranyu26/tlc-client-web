import type { ReactNode } from 'react';

import Box from '@mui/material/Box';

import { BottomNav } from 'src/components/vault/bottom-nav';

import { SidebarNav } from './sidebar-nav';
import { LiveTickerBar } from './live-ticker-bar';
import { gutter, CONTENT_MAX_WIDTH, BOTTOM_NAV_HEIGHT } from './layout-config';

// ----------------------------------------------------------------------
// Desktop-first application frame.
//
//   lg+  [ Sidebar 248 ][ ticker + content pane, inner cap 1440, centered ]
//   md   [ Rail 88     ][ same pane ]
//   < md [ ticker + full-width column ] + fixed BottomNav
//
// @see DESIGN.md — "Responsive Layout"
// ----------------------------------------------------------------------

export type AppShellProps = {
  children?: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start' }}>
      <SidebarNav />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LiveTickerBar />

        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: CONTENT_MAX_WIDTH,
            mx: 'auto',
            px: gutter,
            py: { xs: 2, md: 3 },
            // The bottom nav only exists below `md`, so only reserve space there.
            pb: {
              xs: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`,
              md: 5,
            },
          }}
        >
          {children}
        </Box>
      </Box>

      <BottomNav />
    </Box>
  );
}

export default AppShell;
