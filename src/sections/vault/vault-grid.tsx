import type { CollectionItem } from 'src/api/types';

import Box from '@mui/material/Box';

import { gridGap, cardGridColumns } from 'src/layouts/vault/layout-config';

import { VaultCardItem } from './vault-card-item';

// ----------------------------------------------------------------------

export type VaultGridProps = {
  items: CollectionItem[];
  onSelect: (item: CollectionItem) => void;
};

export function VaultGrid({ items, onSelect }: VaultGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: cardGridColumns,
        gap: gridGap,
      }}
    >
      {items.map((item, index) => (
        <VaultCardItem key={item.instance_id} item={item} index={index} onSelect={onSelect} />
      ))}
    </Box>
  );
}

export default VaultGrid;
