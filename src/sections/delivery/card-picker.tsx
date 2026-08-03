import type { CollectionItem } from 'src/api/types';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

import { pickerGridColumns } from 'src/layouts/vault/layout-config';

import { CardFrame, RarityBadge } from 'src/components/vault';

// ----------------------------------------------------------------------

export type CardPickerProps = {
  items: CollectionItem[];
  selectedId: string | null;
  onSelect: (instanceId: string) => void;
};

export function CardPicker({ items, selectedId, onSelect }: CardPickerProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: pickerGridColumns, gap: '10px' }}>
      {items.map((item) => {
        const selected = item.instance_id === selectedId;

        return (
          <ButtonBase
            key={item.instance_id}
            onClick={() => onSelect(item.instance_id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '6px',
              padding: '6px',
              borderRadius: '12px',
              textAlign: 'left',
              border: selected ? '1.5px solid #E7CE92' : '1.5px solid transparent',
              background: selected ? 'rgba(231,206,146,0.08)' : 'transparent',
            }}
          >
            <CardFrame
              imageUrl={item.image_url}
              rarity={item.rarity}
              alt={item.name}
              glow={selected}
              sx={{ width: '100%' }}
            />
            <Box sx={{ px: '2px', width: '100%' }}>
              <Box
                component="span"
                sx={{
                  display: 'block',
                  color: '#F4ECDD',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.name}
              </Box>
              <RarityBadge
                rarity={item.rarity}
                sx={{ mt: '4px', fontSize: '8px', padding: '2px 8px' }}
              />
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
