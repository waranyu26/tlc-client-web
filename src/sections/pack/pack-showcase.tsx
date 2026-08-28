import type { PackDetail, PackCardItem } from 'src/api/types';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { CardFrame, CARD_ASPECT_RATIO } from 'src/components/vault';

import { PackCardDetailDialog } from './pack-card-detail-dialog';

// ----------------------------------------------------------------------

/**
 * How a slab is drawn at each step away from the focused one.
 *
 * The whole stack is absolutely positioned off a single centre, so a card's
 * place in the fan is a pure function of its distance from the active index —
 * which keeps the arrangement symmetric no matter how many cards a tier holds.
 */
const FAN_STEPS = [
  { x: 0, scale: 1, opacity: 1, blur: 0, z: 4 },
  { x: 64, scale: 0.78, opacity: 0.45, blur: 1.5, z: 3 },
  { x: 112, scale: 0.6, opacity: 0.16, blur: 3, z: 2 },
] as const;

/** Cards further out than this are not painted at all. */
const FAN_DEPTH = FAN_STEPS.length - 1;

type Props = {
  pack: Pick<PackDetail, 'name' | 'image_url'>;
  cards: PackCardItem[];
  /** Tier the showcased cards came from, used for the caption and the glow. */
  tierName?: string;
  accent?: string;
};

/**
 * The reason to open this box, shown at the size the art deserves.
 *
 * The page used to lead with a 150px pack thumbnail, which said nothing about
 * what is inside and left the column it sat in mostly empty. This shows the
 * actual slabs instead — the rarest tier, since that is what a buyer is here
 * for — and it is deliberately a manifest, not an inventory: a card in the fan
 * may already have been pulled, and nothing here says which.
 */
export function PackShowcase({ pack, cards, tierName, accent = '#E7CE92' }: Props) {
  const { t } = useTranslation('pack');
  const [active, setActive] = useState(0);
  const [inspecting, setInspecting] = useState<PackCardItem | null>(null);

  // An out-of-range index would blank the fan if a tier's manifest arrives
  // shorter than the one it replaced.
  const index = cards.length ? Math.min(active, cards.length - 1) : 0;
  const current = cards[index];

  const visible = useMemo(
    () =>
      cards
        .map((card, i) => ({ card, offset: i - index }))
        .filter(({ offset }) => Math.abs(offset) <= FAN_DEPTH),
    [cards, index]
  );

  // Steps off the clamped index, not the raw state: if a shorter manifest ever
  // left `active` past the end, stepping from it would stay out of range and
  // the arrows would look dead.
  const step = (delta: number) => {
    const next = index + delta;
    if (next < 0) setActive(cards.length - 1);
    else if (next > cards.length - 1) setActive(0);
    else setActive(next);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        border: '1px solid rgba(231,206,146,0.16)',
        // The accent bleeds up from behind the fan so the panel reads as a lit
        // display case rather than a flat tile with a picture on it.
        background: `radial-gradient(120% 90% at 50% 108%, ${accent}26 0%, transparent 62%), linear-gradient(168deg, #17150F 0%, #0B0A07 100%)`,
        padding: { xs: '24px 12px 20px', md: '32px 24px 24px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 380, md: 470 },
      }}
    >
      {cards.length > 0 ? (
        <>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: { xs: 300, sm: 340, md: 392 },
            }}
          >
            {visible.map(({ card, offset }) => {
              const pose = FAN_STEPS[Math.abs(offset)];
              const direction = Math.sign(offset);
              const focused = offset === 0;

              return (
                <ButtonBase
                  key={card.card_id}
                  onClick={() => (focused ? setInspecting(card) : step(offset))}
                  aria-label={card.name}
                  aria-current={focused || undefined}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    height: '100%',
                    aspectRatio: CARD_ASPECT_RATIO,
                    borderRadius: '6px',
                    zIndex: pose.z,
                    opacity: pose.opacity,
                    filter: pose.blur ? `blur(${pose.blur}px)` : 'none',
                    transform: `translateX(${direction * pose.x}%) scale(${pose.scale})`,
                    transition: 'transform 380ms cubic-bezier(0.22,1,0.36,1), opacity 380ms ease',
                    '&:hover': focused ? { transform: 'scale(1.03)' } : undefined,
                  }}
                >
                  <CardFrame
                    thumbUrl={card.thumb_url}
                    imageUrl={card.image_url}
                    rarity={card.rarity_code}
                    alt={card.name}
                    priority={focused}
                    sx={{ height: '100%', width: '100%' }}
                  />
                </ButtonBase>
              );
            })}

            {cards.length > 1 &&
              ([-1, 1] as const).map((delta) => (
                <ButtonBase
                  key={delta}
                  onClick={() => step(delta)}
                  aria-label={t(delta < 0 ? 'showcase.prev' : 'showcase.next', {
                    defaultValue: delta < 0 ? 'Previous card' : 'Next card',
                  })}
                  sx={{
                    position: 'absolute',
                    zIndex: 5,
                    [delta < 0 ? 'left' : 'right']: { xs: 0, md: '2%' },
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    color: '#E7CE92',
                    border: '1px solid rgba(231,206,146,0.22)',
                    backgroundColor: 'rgba(10,9,7,0.72)',
                    backdropFilter: 'blur(6px)',
                    transition: 'border-color 160ms ease',
                    '&:hover': { borderColor: 'rgba(231,206,146,0.55)' },
                  }}
                >
                  <Iconify
                    icon={delta < 0 ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'}
                    width={20}
                  />
                </ButtonBase>
              ))}
          </Box>

          <Typography
            noWrap
            sx={{
              mt: '18px',
              maxWidth: '100%',
              fontSize: '13px',
              fontWeight: 600,
              color: '#F4ECDD',
            }}
          >
            {current.name}
          </Typography>

          <Typography sx={{ mt: '2px', fontSize: '11px', color: '#9A9285' }}>
            {[
              tierName,
              current.psa_cert_number
                ? t('rarity.graded', {
                    grade: current.psa_grade || '—',
                    defaultValue: 'PSA {{grade}}',
                  })
                : current.set_name,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>

          {cards.length > 1 && (
            <Box
              sx={{
                display: 'flex',
                gap: '6px',
                mt: '14px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {cards.map((card, i) => (
                <ButtonBase
                  key={card.card_id}
                  onClick={() => setActive(i)}
                  aria-label={card.name}
                  sx={{
                    width: i === index ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    transition: 'width 240ms ease, background-color 240ms ease',
                    backgroundColor: i === index ? accent : 'rgba(231,206,146,0.24)',
                  }}
                />
              ))}
            </Box>
          )}
        </>
      ) : (
        /* No manifest yet — the pack's own cover holds the space rather than
           letting the panel collapse and shove the buy column upward. */
        <Box
          component={pack.image_url ? 'img' : 'div'}
          src={pack.image_url || undefined}
          alt={pack.image_url ? pack.name : undefined}
          sx={{
            height: { xs: 300, sm: 340, md: 392 },
            aspectRatio: CARD_ASPECT_RATIO,
            objectFit: 'cover',
            borderRadius: '10px',
            border: '1.5px solid rgba(231,206,146,0.32)',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
        />
      )}

      <PackCardDetailDialog
        card={inspecting}
        rarityName={tierName}
        onClose={() => setInspecting(null)}
      />
    </Box>
  );
}

export default PackShowcase;
