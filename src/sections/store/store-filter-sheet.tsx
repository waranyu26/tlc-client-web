import type { CardKind } from 'src/api/types';
import type { PillOption } from 'src/components/vault';
import type { StoreSheetFilters } from './store-filters';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';
import { PillGroup } from 'src/components/vault';

import { fieldSx, dialogPaperProps } from 'src/sections/account/dialog-style';

import { STORE_KINDS, bahtToSatang, satangToBaht } from './store-filters';

// ----------------------------------------------------------------------

type KindOption = CardKind | 'any';

type Props = {
  open: boolean;
  onClose: () => void;
  value: StoreSheetFilters;
  onApply: (value: StoreSheetFilters) => void;
};

const sectionLabelSx = {
  fontSize: '10.5px',
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: '#9A9285',
} as const;

const toText = (satang: number | undefined) => (satang === undefined ? '' : satangToBaht(satang));

/**
 * The less-used filters, kept off the page so the shelf stays the first thing
 * you see. Edits are a draft until Apply: closing the sheet throws them away.
 */
export function StoreFilterSheet({ open, onClose, value, onApply }: Props) {
  const { t } = useTranslation('store');

  const [kind, setKind] = useState<KindOption>('any');
  const [graded, setGraded] = useState(false);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');

  // Each opening starts from what is applied, not from an abandoned draft.
  useEffect(() => {
    if (open) {
      setKind(value.kind ?? 'any');
      setGraded(value.graded);
      setMinText(toText(value.minPrice));
      setMaxText(toText(value.maxPrice));
    }
  }, [open, value]);

  const minPrice = minText.trim() ? bahtToSatang(minText) : undefined;
  const maxPrice = maxText.trim() ? bahtToSatang(maxText) : undefined;

  const minError = minPrice === null ? t('filter.price.invalid') : '';
  const maxError =
    maxPrice === null
      ? t('filter.price.invalid')
      : minPrice != null && maxPrice !== undefined && minPrice > maxPrice
        ? t('filter.price.minAboveMax')
        : '';

  const kindOptions: PillOption<KindOption>[] = [
    { value: 'any', label: t('filter.kind.any') },
    ...STORE_KINDS.map((option) => ({ value: option, label: t(`filter.kind.${option}`) })),
  ];

  const handleClear = () => {
    setKind('any');
    setGraded(false);
    setMinText('');
    setMaxText('');
  };

  const handleApply = () => {
    if (minError || maxError) return;
    onApply({
      kind: kind === 'any' ? undefined : kind,
      graded,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={dialogPaperProps}>
      <DialogTitle
        sx={{
          fontFamily: `'Cormorant Garamond', serif`,
          color: '#F4ECDD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {t('filter.title')}
        <IconButton
          onClick={onClose}
          aria-label={t('filter.close')}
          size="small"
          sx={{ color: '#9A9285', mr: -1 }}
        >
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 0.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Typography sx={sectionLabelSx}>{t('filter.kind.label')}</Typography>
            <PillGroup
              options={kindOptions}
              value={kind}
              onChange={setKind}
              label={t('filter.kind.label')}
            />
          </Box>

          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Typography id="store-filter-graded" sx={{ fontSize: '14px', color: '#F4ECDD' }}>
              {t('filter.graded')}
            </Typography>
            <Switch
              checked={graded}
              onChange={(event) => setGraded(event.target.checked)}
              slotProps={{ input: { 'aria-labelledby': 'store-filter-graded' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Typography sx={sectionLabelSx}>{t('filter.price.label')}</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                value={minText}
                onChange={(event) => setMinText(event.target.value)}
                label={t('filter.price.min')}
                error={!!minError}
                helperText={minError || undefined}
                slotProps={{ htmlInput: { inputMode: 'decimal', autoComplete: 'off' } }}
                sx={{ ...fieldSx, flex: 1 }}
              />
              <TextField
                size="small"
                value={maxText}
                onChange={(event) => setMaxText(event.target.value)}
                label={t('filter.price.max')}
                error={!!maxError}
                helperText={maxError || undefined}
                slotProps={{ htmlInput: { inputMode: 'decimal', autoComplete: 'off' } }}
                sx={{ ...fieldSx, flex: 1 }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={handleClear} sx={{ color: '#9A9285' }}>
          {t('filter.clear')}
        </Button>
        <Button
          onClick={handleApply}
          disabled={!!minError || !!maxError}
          variant="contained"
          sx={{ bgcolor: '#E7CE92', color: '#17161B', '&:hover': { bgcolor: '#D9BE7E' } }}
        >
          {t('filter.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StoreFilterSheet;
