import type { BoxProps } from '@mui/material/Box';
import type { PackListItem } from 'src/api/types';

import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { gridGap, packGridColumns } from 'src/layouts/vault/layout-config';

import { FadeUp } from 'src/components/vault';

import { PackCard } from './pack-card';

// ----------------------------------------------------------------------

export type PackGridProps = BoxProps & {
  packs: PackListItem[];
};

export function PackGrid({ packs, sx, ...other }: PackGridProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: packGridColumns,
          gap: gridGap,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {packs.map((pack, index) => (
        <FadeUp key={pack.id} delay={Math.min(index * 0.05, 0.3)}>
          <PackCard pack={pack} onClick={() => navigate(paths.pack(pack.id))} />
        </FadeUp>
      ))}
    </Box>
  );
}

export default PackGrid;
