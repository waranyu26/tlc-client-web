import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { useCards } from 'src/api/catalog.api';
import en from 'src/i18n/locales/en/catalog.json';
import th from 'src/i18n/locales/th/catalog.json';
import { registerNamespace } from 'src/i18n/register';

import { Iconify } from 'src/components/iconify';
import {
  FadeUp,
  CardFrame,
  ThbAmount,
  GhostButton,
  RarityBadge,
  PrimaryButton,
  CardImageViewer,
} from 'src/components/vault';

registerNamespace('catalog', en, th);

// ----------------------------------------------------------------------
// No dedicated "get card by id" endpoint exists on catalog.api — the single
// card is resolved by id from the same generous-pageSize catalog listing used
// on the catalog screen.
// ----------------------------------------------------------------------

const CATALOG_PAGE_SIZE = 200;

const metadata = { title: `Card | ${CONFIG.appName}` };

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('catalog');

  const [viewerOpen, setViewerOpen] = useState(false);

  const cardsQuery = useCards({ pageSize: CATALOG_PAGE_SIZE });

  const card = useMemo(() => cardsQuery.data?.data.find((c) => c.id === id), [cardsQuery.data, id]);

  return (
    <>
      <title>{metadata.title}</title>

      <Box sx={{ padding: '18px' }}>
        {cardsQuery.isPending && (
          <Typography sx={{ fontSize: '13px', color: '#9A9285' }}>
            {t('state.loading', { defaultValue: 'Loading catalog…' })}
          </Typography>
        )}

        {cardsQuery.isError && (
          <Alert severity="error">
            {t('state.error', { defaultValue: "Couldn't load the catalog." })}
          </Alert>
        )}

        {!cardsQuery.isPending && !cardsQuery.isError && !card && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Alert severity="warning">
              {t('detail.notFound', { defaultValue: 'Card not found.' })}
            </Alert>
            <GhostButton onClick={() => navigate(paths.catalog)}>
              {t('detail.back', { defaultValue: 'Back to catalog' })}
            </GhostButton>
          </Box>
        )}

        {card && (
          <FadeUp>
            {/* Desktop: art on the left stays put while the details scroll. */}
            <Box
              sx={{
                display: 'grid',
                alignItems: 'start',
                gap: { xs: 2.5, md: 5 },
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 4fr) minmax(0, 5fr)' },
              }}
            >
              <Box
                sx={{
                  maxWidth: { xs: 260, md: '100%' },
                  mx: { xs: 'auto', md: 0 },
                  position: { md: 'sticky' },
                  top: { md: 88 },
                }}
              >
                {/* The frame shows the cheap thumbnail; the original is only
                    fetched once the customer asks to see it in HD. */}
                <Box
                  component="button"
                  type="button"
                  onClick={() => setViewerOpen(true)}
                  aria-label={t('detail.viewHd', { defaultValue: 'View in HD' })}
                  sx={{
                    display: 'block',
                    width: '100%',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'zoom-in',
                    position: 'relative',
                    '&:hover .hd-hint': { opacity: 1 },
                  }}
                >
                  <CardFrame
                    priority
                    glow
                    thumbUrl={card.thumb_url}
                    imageUrl={card.image_url}
                    rarity={card.rarity}
                    alt={card.name}
                  />

                  <Box
                    className="hd-hint"
                    sx={{
                      position: 'absolute',
                      right: '10px',
                      bottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '999px',
                      bgcolor: 'rgba(11,11,13,0.72)',
                      border: '1px solid rgba(231,206,146,0.3)',
                      opacity: { xs: 1, md: 0.75 },
                      transition: 'opacity 0.2s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    <Iconify icon="carbon:zoom-in" width={13} sx={{ color: '#E7CE92' }} />
                    <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#E7CE92' }}>
                      {t('detail.viewHd', { defaultValue: 'View in HD' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography
                    sx={{
                      fontFamily: `'Cormorant Garamond', serif`,
                      fontSize: '23px',
                      fontWeight: 600,
                      color: '#F4ECDD',
                    }}
                  >
                    {card.name}
                  </Typography>
                  <RarityBadge rarity={card.rarity} />
                </Box>

                <Typography sx={{ fontSize: '12px', color: '#9A9285', mt: '4px' }}>
                  {t('detail.set', { defaultValue: 'Set' })}: {card.set_name}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: '20px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(231,206,146,0.16)',
                    bgcolor: '#111019',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontSize: '9.5px', color: '#9A9285', textTransform: 'uppercase' }}
                    >
                      {t('detail.buyback', { defaultValue: 'Buyback value' })}
                    </Typography>
                    <ThbAmount
                      satang={card.buyback_price_satang}
                      tone="success"
                      sx={{ fontSize: '18px', fontWeight: 700 }}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{ fontSize: '9.5px', color: '#9A9285', textTransform: 'uppercase' }}
                    >
                      {t('detail.stock', { defaultValue: 'Stock remaining' })}
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#F4ECDD' }}>
                      {card.stock_count}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  sx={{ fontSize: '12.5px', color: '#9A9285', lineHeight: 1.6, mt: '18px' }}
                >
                  {t('detail.wonVia', {
                    defaultValue:
                      "This card is won exclusively through gacha pulls — it isn't sold directly.",
                  })}
                </Typography>

                {/* A card can sit in several packs, so send them to pick one
                    rather than guessing which pack to pull from. */}
                <PrimaryButton fullWidth sx={{ mt: '18px' }} onClick={() => navigate(paths.home)}>
                  {t('detail.tryPull', { defaultValue: 'Find a pack' })}
                </PrimaryButton>
              </Box>
            </Box>
          </FadeUp>
        )}

        {card && (
          <CardImageViewer
            open={viewerOpen}
            onClose={() => setViewerOpen(false)}
            thumbUrl={card.thumb_url}
            imageUrl={card.image_url}
            alt={card.name}
          />
        )}
      </Box>
    </>
  );
}
