import type { VerificationReport } from 'src/lib/fair-verify';

import { useParams } from 'react-router';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { usePullProof } from 'src/api/pull.api';
import { verifyPull } from 'src/lib/fair-verify';
import { fetchDrandRound, verifyBeaconRound, type BeaconVerdict } from 'src/lib/drand-beacon';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Fetches the beacon straight from drand, not from our API.
 *
 * This is the single most important line on the page. If the randomness came
 * from us, the whole exercise would be us marking our own homework — the value
 * of the receipt is that an independent, publicly operated source confirms the
 * number we claim to have used.
 */
type BeaconState =
  | { kind: 'loading' }
  | { kind: 'ok'; randomness: string; matches: boolean; verdict: BeaconVerdict }
  | { kind: 'error'; message: string };

// ----------------------------------------------------------------------

export function VerifyView() {
  const { ticketId } = useParams();
  const proofQuery = usePullProof(ticketId);

  const [beacon, setBeacon] = useState<BeaconState>({ kind: 'loading' });
  const [report, setReport] = useState<VerificationReport | null>(null);

  const proof = proofQuery.data;

  useEffect(() => {
    if (!proof || proof.status !== 'resolved') {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const round = await fetchDrandRound(proof.actual_round);
        if (cancelled) return;

        const randomness = round.randomness;
        const matches = randomness === proof.beacon_randomness;

        // Checking the threshold signature is what makes this independent of
        // the mirror that served it — comparing two strings only proves
        // api.drand.sh agrees with us, which a hostile mirror also would.
        const verdict = verifyBeaconRound(round, proof.commitment.beacon_chain_hash);
        setBeacon({ kind: 'ok', randomness, matches, verdict });

        // Recompute from the independently fetched beacon, never the one on
        // the receipt — otherwise a doctored receipt would verify against
        // itself.
        const result = await verifyPull({
          preimage: proof.preimage,
          randomness,
          commitHash: proof.commitment.commit_hash,
          effectiveOdds: proof.effective_odds,
          candidateIds: proof.candidate_ids,
          claimedRarity: proof.rarity_code,
          claimedRoll: proof.rarity_roll,
          claimedIndex: proof.card_index,
          claimedCardId: proof.card_id,
        });
        if (!cancelled) setReport(result);
      } catch (error) {
        if (!cancelled) {
          setBeacon({ kind: 'error', message: (error as Error).message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [proof]);

  if (proofQuery.isPending) {
    return (
      <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={280} />
      </Box>
    );
  }

  if (proofQuery.isError || !proof) {
    return (
      <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Alert severity="error">We couldn&apos;t find a pull with that id.</Alert>
      </Box>
    );
  }

  if (proof.status !== 'resolved') {
    return (
      <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
        <Alert severity="info">
          This pull is <strong>{proof.status}</strong>, so there is nothing to verify yet. A pull
          can only be checked once its beacon round has been published.
        </Alert>
      </Box>
    );
  }

  const verdictColor = report?.ok ? 'success.main' : report ? 'error.main' : 'text.secondary';

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto', color: '#F4ECDD' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Fairness check
      </Typography>
      <Typography variant="body2" sx={{ color: '#9A9285', mb: 3 }}>
        Pull #{proof.pack_seq} of this pack · {proof.user_hash}
      </Typography>

      {/* Verdict */}
      <Box
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          border: '1px solid rgba(231,206,146,0.16)',
          backgroundColor: '#17161B',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {report ? (
          <Iconify
            icon={report.ok ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
            width={40}
            sx={{ color: verdictColor }}
          />
        ) : (
          <CircularProgress size={32} />
        )}

        <Box>
          <Typography variant="h6" sx={{ color: verdictColor }}>
            {report ? (report.ok ? 'This pull was fair' : 'Verification failed') : 'Checking…'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9A9285' }}>
            {report?.ok
              ? 'Recomputed from drand’s own randomness. Every value matches.'
              : report
                ? 'At least one value does not reproduce. Please report this.'
                : 'Fetching the beacon from drand and recomputing the draw.'}
          </Typography>
        </Box>
      </Box>

      {/* Beacon provenance */}
      <SectionTitle>The randomness</SectionTitle>
      <Typography variant="body2" sx={{ color: '#9A9285', mb: 1.5 }}>
        The card was decided by drand round {proof.actual_round}, which had not been published when
        the pull was paid for. Your browser fetched it from drand directly:
      </Typography>

      {beacon.kind === 'loading' && <Skeleton variant="rounded" height={56} />}

      {beacon.kind === 'error' && (
        <Alert severity="warning">
          Couldn&apos;t reach drand ({beacon.message}). Try again, or fetch{' '}
          <Link href={proof.recipe.beacon_url} target="_blank" rel="noopener">
            the round
          </Link>{' '}
          yourself.
        </Alert>
      )}

      {beacon.kind === 'ok' && (
        <>
          <Mono label="From drand" value={beacon.randomness} />
          <Mono label="On this receipt" value={proof.beacon_randomness} />
          <Alert severity={beacon.matches ? 'success' : 'error'} sx={{ mt: 1.5 }}>
            {beacon.matches
              ? 'They match — we used the real published randomness.'
              : 'They differ. The randomness on this receipt is not what drand published.'}
          </Alert>

          {/* Matching strings only prove api.drand.sh agrees with us. The
              threshold signature is what a hostile mirror could not have
              produced, so it is the check that stands on its own. */}
          <Alert severity={beacon.verdict.ok ? 'success' : 'error'} sx={{ mt: 1.5 }}>
            {beacon.verdict.ok
              ? 'Signature verified in your browser against drand’s published key — this randomness could only have been produced by the drand network, whatever server handed it to you.'
              : `Signature check failed: ${beacon.verdict.detail}.`}
          </Alert>
        </>
      )}

      <Divider sx={{ my: 3, borderColor: 'rgba(231,206,146,0.16)' }} />

      {/* Step-by-step */}
      <SectionTitle>The maths</SectionTitle>
      {report ? (
        <Box component="ul" sx={{ pl: 0, listStyle: 'none', m: 0 }}>
          {report.checks.map((check) => (
            <Box
              key={check.label}
              component="li"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}
            >
              <Iconify
                icon={check.passed ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                width={20}
                sx={{ color: check.passed ? 'success.main' : 'error.main', flexShrink: 0 }}
              />
              <Box>
                <Typography variant="body2">{check.label}</Typography>
                <Typography variant="caption" sx={{ color: '#9A9285' }}>
                  {check.detail}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Skeleton variant="rounded" height={160} />
      )}

      <Divider sx={{ my: 3, borderColor: 'rgba(231,206,146,0.16)' }} />

      {/* The recipe, so nobody has to take our word for the algorithm either. */}
      <SectionTitle>Check it yourself</SectionTitle>
      <Box component="ol" sx={{ pl: 2.5, color: '#9A9285' }}>
        {proof.recipe.steps.map((step) => (
          <Typography
            key={step}
            component="li"
            variant="caption"
            sx={{ display: 'list-item', mb: 0.5 }}
          >
            {step}
          </Typography>
        ))}
      </Box>

      <Mono label="Commitment hash" value={proof.commitment.commit_hash} />
      <Mono label="Preimage layout" value={proof.recipe.preimage_layout} />
      <Mono label="Preimage" value={proof.preimage} />
      <Mono label="Your seed" value={proof.commitment.client_seed} />
    </Box>
  );
}

// ----------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ mb: 1 }}>
      {children}
    </Typography>
  );
}

function Mono({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#9A9285', display: 'block' }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          color: '#F4ECDD',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}
