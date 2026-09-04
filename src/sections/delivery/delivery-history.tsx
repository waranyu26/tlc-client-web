import type { BoxProps } from '@mui/material/Box';
import type { MyDeliveryRequest } from 'src/api/types';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useMyDeliveryRequests } from 'src/api/delivery.api';

import { Iconify } from 'src/components/iconify';
import { CardFrame, RarityBadge, SectionHeading } from 'src/components/vault';

// ----------------------------------------------------------------------

const STATUS_STYLES = {
  pending: { color: '#E7CE92', icon: 'solar:clock-circle-bold' },
  fulfilled: { color: '#6FBF8E', icon: 'solar:check-circle-bold' },
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ----------------------------------------------------------------------

/**
 * Requesting delivery removes the card from the vault, so without this list a
 * shipped card simply vanishes with no trace. Shows pending and fulfilled
 * requests so the owner can always account for where a card went.
 */
export function DeliveryHistory({ sx, ...other }: Omit<BoxProps, 'children'>) {
  const { t } = useTranslation('delivery');
  const { data: requests, isPending, isError } = useMyDeliveryRequests();

  return (
    <Box sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]} {...other}>
      <SectionHeading sx={{ mb: '12px' }}>
        {t('history.title', { defaultValue: 'Your deliveries' })}
      </SectionHeading>

      {isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: '24px' }}>
          <CircularProgress size={20} sx={{ color: '#E7CE92' }} />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          {t('history.error', { defaultValue: "Couldn't load your deliveries." })}
        </Alert>
      )}

      {!isPending && !isError && (requests?.length ?? 0) === 0 && (
        <Typography sx={{ fontSize: '12px', color: '#9A9285' }}>
          {t('history.empty', {
            defaultValue: 'No delivery requests yet. Cards you send stay listed here.',
          })}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {requests?.map((request) => (
          <DeliveryHistoryRow key={request.id} request={request} />
        ))}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function DeliveryHistoryRow({ request }: { request: MyDeliveryRequest }) {
  const { t } = useTranslation('delivery');
  const status = STATUS_STYLES[request.status] ?? STATUS_STYLES.pending;
  const isPickup = request.method === 'pickup';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        padding: '10px',
        borderRadius: '12px',
        border: '1px solid rgba(231,206,146,0.14)',
        bgcolor: '#111019',
      }}
    >
      <Box sx={{ width: 52, flexShrink: 0 }}>
        <CardFrame
          thumbUrl={request.thumb_url}
          imageUrl={request.image_url}
          rarity={request.rarity}
          alt={request.card_name}
        />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: '#F4ECDD' }}>
            {request.card_name}
          </Typography>
          <RarityBadge rarity={request.rarity} />
        </Box>

        {/* A collection has no province to name, so it says where to go
            instead of rendering "To Nook · " with an empty tail. */}
        <Typography noWrap sx={{ fontSize: '11px', color: '#9A9285', mt: '2px' }}>
          {isPickup
            ? t('history.collectBy', {
                recipient: request.recipient_name,
                defaultValue: 'Collect at the shop · {{recipient}}',
              })
            : t('history.shippingTo', {
                recipient: request.recipient_name,
                province: request.province,
                defaultValue: 'To {{recipient}} · {{province}}',
              })}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '6px' }}>
          <Iconify icon={status.icon} width={13} sx={{ color: status.color }} />
          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: status.color }}>
            {request.status === 'fulfilled'
              ? isPickup
                ? t('history.fulfilledPickup', { defaultValue: 'Ready to collect' })
                : t('history.fulfilled', { defaultValue: 'Shipped' })
              : isPickup
                ? t('history.pendingPickup', { defaultValue: 'Preparing for collection' })
                : t('history.pending', { defaultValue: 'Preparing to ship' })}
          </Typography>
          <Typography sx={{ fontSize: '10px', color: '#5A5550' }}>
            ·{' '}
            {request.status === 'fulfilled' && request.fulfilled_at
              ? formatDate(request.fulfilled_at)
              : t('history.requestedOn', {
                  date: formatDate(request.created_at),
                  defaultValue: 'Requested {{date}}',
                })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default DeliveryHistory;
