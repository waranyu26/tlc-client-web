import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { QUICKNET, fetchDrandRound, verifyBeaconRound } from 'src/lib/drand-beacon';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; round: number; signature: string; verified: boolean }
  | { kind: 'error' };

/**
 * One drand signature, checked in the reader's own browser.
 *
 * Deliberately fetched once and left alone. An earlier version ticked with the
 * chain every few seconds, which looked impressive and proved nothing extra:
 * one signature is already the whole argument, and a number that moves while
 * you read it is harder to check, not easier. The point is not that the chain
 * is alive — it is that this specific signature could only have been produced
 * by drand's threshold key, and you can confirm that here without trusting us.
 *
 * The key it is checked against is pinned in the client (see `drand-beacon.ts`),
 * never read from our API — verifying a signature against a key the signer
 * handed you proves nothing.
 */
export function PackBeaconProof() {
  const { t } = useTranslation('pack');
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    fetchDrandRound('latest')
      .then((round) => {
        if (cancelled) return;
        setState({
          kind: 'ok',
          round: round.round,
          signature: round.signature,
          verified: verifyBeaconRound(round).ok,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      sx={{
        // minWidth 0 matters: this box lives in a grid track, and the signature
        // below is a 96-character unbroken string. Without it the track's
        // min-content width becomes the hex, which drags the whole panel past
        // the right edge of a phone.
        minWidth: 0,
        mt: '16px',
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(231,206,146,0.16)',
        backgroundColor: 'rgba(0,0,0,0.28)',
      }}
    >
      <Typography
        sx={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#9A9285',
          mb: '10px',
        }}
      >
        {t('beacon.title', { defaultValue: 'A signature you can check' })}
      </Typography>

      {state.kind === 'loading' && <Skeleton variant="rounded" height={72} />}

      {state.kind === 'error' && (
        <Typography sx={{ fontSize: '11.5px', color: '#9A9285', lineHeight: 1.55 }}>
          {t('beacon.unreachable', {
            defaultValue:
              'Couldn’t reach drand from this browser. That does not affect a pull — every receipt can be checked the same way afterwards.',
          })}
        </Typography>
      )}

      {state.kind === 'ok' && (
        <>
          <Typography sx={{ fontSize: '11px', color: '#6F6A60', mb: '2px' }}>
            {t('beacon.roundLabel', {
              round: state.round.toLocaleString('en-US'),
              defaultValue: 'drand quicknet · round #{{round}}',
            })}
          </Typography>

          <Typography
            sx={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '10px',
              lineHeight: 1.5,
              color: '#8A8478',
              // The signature is the artefact being verified, so it is shown in
              // full rather than truncated — wrapped mid-token, since hex has no
              // break opportunities of its own.
              wordBreak: 'break-all',
            }}
          >
            {state.signature}
          </Typography>

          <Box
            sx={{
              mt: '10px',
              display: 'flex',
              gap: '6px',
              color: state.verified ? '#6FBF8E' : '#C9605B',
            }}
          >
            <Iconify
              icon={state.verified ? 'solar:shield-check-bold' : 'solar:close-circle-bold'}
              width={14}
              sx={{ flexShrink: 0, mt: '1px' }}
            />
            <Typography sx={{ fontSize: '11px', lineHeight: 1.5 }}>
              {state.verified
                ? t('beacon.verified', {
                    defaultValue:
                      'Verified in your browser against drand’s published key. Only the drand network could have produced it.',
                  })
                : t('beacon.unverified', {
                    defaultValue: 'This signature did not verify. Please tell us — that is a bug.',
                  })}
            </Typography>
          </Box>

          <Typography sx={{ mt: '10px', fontSize: '10.5px', color: '#6F6A60', lineHeight: 1.6 }}>
            {t('beacon.pinned', {
              defaultValue:
                'The key is built into this page, not served by us — check it against drand yourself:',
            })}{' '}
            <Link
              href={`https://api.drand.sh/${QUICKNET.chainHash}/info`}
              target="_blank"
              rel="noopener"
              sx={{ color: '#E7CE92', wordBreak: 'break-all' }}
            >
              api.drand.sh
            </Link>
          </Typography>
        </>
      )}
    </Box>
  );
}

export default PackBeaconProof;
