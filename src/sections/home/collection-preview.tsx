import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { typeScale } from 'src/theme/type-scale';
import { useCollection } from 'src/api/catalog.api';
import { gridGap } from 'src/layouts/vault/layout-config';

import { Iconify } from 'src/components/iconify';
import { CardFrame, SectionHeading } from 'src/components/vault';

// ----------------------------------------------------------------------
// What the customer already owns, on the page they land on.
//
// Renders nothing at all when the collection is empty: a brand-new account
// gets the packs and the explainer instead, rather than an empty shelf telling
// it that it has nothing.
// ----------------------------------------------------------------------

/** One row's worth. Beyond this the vault is the right place to look. */
const PREVIEW_COUNT = 5;

export function CollectionPreview() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  const collectionQuery = useCollection();
  const cards = collectionQuery.data ?? [];

  if (collectionQuery.isPending || cards.length === 0) {
    return null;
  }

  const preview = cards.slice(0, PREVIEW_COUNT);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1.5,
        }}
      >
        <SectionHeading>
          {t('collection.heading', { defaultValue: 'Your collection' })}
        </SectionHeading>

        <Box
          onClick={() => navigate(paths.vault)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            cursor: 'pointer',
            color: '#E7CE92',
            '&:hover': { color: '#F6ECD1' },
          }}
        >
          <Typography sx={{ ...typeScale.buttonSecondary, color: 'inherit' }}>
            {t('collection.viewAll', { defaultValue: 'View vault' })}
          </Typography>
          <Iconify icon="eva:arrow-forward-fill" width={16} />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: gridGap,
          // One fewer column than the vault grid: this is a teaser strip, and
          // matching the vault's density would just look like a short vault.
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: `repeat(${PREVIEW_COUNT}, 1fr)`,
          },
        }}
      >
        {preview.map((card, index) => (
          <CardFrame
            key={card.card_id}
            thumbUrl={card.thumb_url}
            imageUrl={card.image_url}
            rarity={card.rarity}
            alt={card.name}
            onClick={() => navigate(paths.vault)}
            sx={{
              cursor: 'pointer',
              // Narrow viewports fit fewer columns than PREVIEW_COUNT. Hide the
              // overflow rather than let a ragged second row hang off a strip
              // that is meant to read as a single line.
              display: {
                xs: index < 3 ? 'block' : 'none',
                sm: index < 4 ? 'block' : 'none',
                md: 'block',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default CollectionPreview;
