import { useTranslation } from 'react-i18next';

import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// The "open this in HD" affordance, overlaid on a piece of artwork.
//
// It is its own button rather than a click handler on the art because the art
// is usually already interactive — a vault tile opens the actions sheet, a pack
// cover navigates to the pack. Propagation is stopped so opening the viewer
// never also triggers that underlying action.
// ----------------------------------------------------------------------

export type HdImageButtonProps = {
  onOpen: () => void;
  /** Hide the label and render just the icon, for tiles too small for text. */
  compact?: boolean;
};

export function HdImageButton({ onOpen, compact = false }: HdImageButtonProps) {
  const { t } = useTranslation('common');

  return (
    <ButtonBase
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onOpen();
      }}
      aria-label={t('viewHd', { defaultValue: 'View in HD' })}
      sx={{
        position: 'absolute',
        right: '8px',
        bottom: '8px',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: compact ? '6px' : '5px 10px',
        borderRadius: '999px',
        bgcolor: 'rgba(11,11,13,0.72)',
        border: '1px solid rgba(231,206,146,0.3)',
        backdropFilter: 'blur(2px)',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        '&:hover': { bgcolor: 'rgba(11,11,13,0.92)', borderColor: 'rgba(231,206,146,0.6)' },
      }}
    >
      <Iconify icon="carbon:zoom-in" width={13} sx={{ color: '#E7CE92' }} />
      {!compact && (
        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#E7CE92', lineHeight: 1 }}>
          {t('viewHd', { defaultValue: 'View in HD' })}
        </Typography>
      )}
    </ButtonBase>
  );
}

export default HdImageButton;
