import type { PackCardItem } from 'src/api/types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { formatThb } from 'src/utils/format-currency';

import { Iconify } from 'src/components/iconify';
import { CardFrame, HdImageButton, getRarityColor, CardImageViewer } from 'src/components/vault';

// ----------------------------------------------------------------------

type Props = {
  card: PackCardItem | null;
  /** The tier's display name, which the card itself doesn't carry. */
  rarityName?: string;
  onClose: () => void;
};

/** One labelled row of the card's provenance. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '12px',
        py: '9px',
        borderBottom: '1px solid rgba(231,206,146,0.08)',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Typography
        sx={{
          fontSize: '10px',
          color: '#9A9285',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#F4ECDD',
          textAlign: 'right',
          minWidth: 0,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * A single card from a pack's manifest, opened from the rarity sheet.
 *
 * Shows provenance — name, set, tier, PSA cert — and the card's buyback value.
 *
 * The value lives here rather than under the thumbnail: a grid of prices reads
 * as a shop, while a customer who has tapped a specific card is asking what
 * that card is worth. It is still the only figure disclosed. How much of the
 * tier is left remains unpublished, here as in the grid — a buyback price is a
 * standing offer, not an inventory fact.
 */
export function PackCardDetailDialog({ card, rarityName, onClose }: Props) {
  const { t } = useTranslation('pack');
  const [viewerOpen, setViewerOpen] = useState(false);

  // Keep the dialog mounted through its close transition, but never render a
  // stale card once it has gone.
  if (!card) return null;

  const accent = getRarityColor(card.rarity_code);

  return (
    <>
      <Dialog
        open={Boolean(card)}
        onClose={onClose}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'calc(100% - 32px)', sm: 520 },
              m: { xs: '16px', sm: '32px' },
              borderRadius: '18px',
              backgroundColor: '#111019',
              backgroundImage: 'none',
              border: '1px solid rgba(231,206,146,0.16)',
              // MUI focuses the paper on open; Chrome then paints its default
              // ring over the gold border. The paper isn't a control, so the
              // ring carries no meaning here.
              outline: 'none',
            },
          },
        }}
      >
        <Box sx={{ p: { xs: '18px', sm: '22px' } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px', mb: '16px' }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: `'Cormorant Garamond', serif`,
                  fontSize: { xs: '20px', sm: '23px' },
                  fontWeight: 600,
                  color: '#F4ECDD',
                  lineHeight: 1.2,
                }}
              >
                {card.name}
              </Typography>
              {/* The tier's own display name, tinted by the card's rarity —
                  RarityBadge labels itself from the value it colours by, which
                  can't show "Grail" in the legendary tint. */}
              {rarityName && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    mt: '7px',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    bgcolor: `${accent}1A`,
                    border: `1px solid ${accent}47`,
                    color: accent,
                    fontSize: '9.5px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    lineHeight: 1.6,
                  }}
                >
                  {rarityName}
                </Box>
              )}
            </Box>

            <IconButton onClick={onClose} sx={{ color: '#9A9285', mt: '-4px', mr: '-6px' }}>
              <Iconify icon="mingcute:close-line" width={20} />
            </IconButton>
          </Box>

          {/* Capped so the art stays a card, not a poster, on a wide dialog. */}
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 240, mx: 'auto' }}>
            <CardFrame
              priority
              glow
              thumbUrl={card.thumb_url}
              imageUrl={card.image_url}
              rarity={card.rarity_code}
              alt={card.name}
              soldOut={card.sold_out}
            />
            {(card.thumb_url || card.image_url) && (
              <HdImageButton onOpen={() => setViewerOpen(true)} />
            )}
          </Box>

          <Box
            sx={{
              mt: '18px',
              px: '14px',
              borderRadius: '12px',
              border: `1px solid ${accent}2E`,
              backgroundColor: '#17161B',
            }}
          >
            <DetailRow label={t('rarity.set', { defaultValue: 'Set' })} value={card.set_name} />
            {/* Omitted rather than shown as "฿0" when a card has no buyback
                price set — a zero here would read as worthless instead of as
                not yet priced. */}
            {card.buyback_price_satang > 0 && (
              <DetailRow
                label={t('rarity.value', { defaultValue: 'Buyback value' })}
                value={formatThb(card.buyback_price_satang)}
              />
            )}
            {/* Stated as a row rather than only as a grey wash, so it survives
                a screen reader and a colour-blind reading of the grid. */}
            <DetailRow
              label={t('rarity.availability', { defaultValue: 'Availability' })}
              value={
                card.sold_out
                  ? t('rarity.soldOut', { defaultValue: 'Sold out' })
                  : t('rarity.stillAvailable', { defaultValue: 'Still in the pack' })
              }
            />
            {card.kind !== 'unique' && (
              <DetailRow
                label={t('rarity.kindLabel', { defaultValue: 'Type' })}
                value={t(`rarity.kind.${card.kind}`)}
              />
            )}
            {card.psa_cert_number && (
              <DetailRow
                label={t('rarity.cert', { defaultValue: 'PSA cert' })}
                value={card.psa_cert_number}
              />
            )}
            {card.psa_grade && (
              <DetailRow
                label={t('rarity.grade', { defaultValue: 'Grade' })}
                value={card.psa_grade}
              />
            )}
          </Box>
        </Box>
      </Dialog>

      <CardImageViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        thumbUrl={card.thumb_url}
        imageUrl={card.image_url}
        alt={card.name}
      />
    </>
  );
}

export default PackCardDetailDialog;
