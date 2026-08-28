import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/** Long enough that it cannot be guessed, short enough to read back off a receipt. */
export function randomClientSeed(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type Props = {
  value: string;
  onChange: (seed: string) => void;
  disabled?: boolean;
};

/**
 * The player's own entropy, chosen before the commitment exists.
 *
 * The server has always accepted this (`X-Client-Seed`) and fallen back to a
 * random UUID when it was absent — which it always was, because nothing sent
 * it. That fallback is the weak version of the promise: the inputs were all
 * ours, so "we could not have known the outcome" rested on the beacon alone.
 *
 * With a seed the player picked, the commitment preimage contains something we
 * provably did not choose, and it is printed back on the receipt so they can
 * confirm the pull they paid for used it.
 */
export function ClientSeedField({ value, onChange, disabled }: Props) {
  const { t } = useTranslation('pack');

  return (
    <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto' }}>
      <Typography
        component="label"
        htmlFor="client-seed"
        sx={{
          display: 'block',
          mb: '6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#6F6A60',
          textAlign: 'center',
        }}
      >
        {t('seed.label', { defaultValue: 'Your seed' })}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 6px 6px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(231,206,146,0.2)',
          backgroundColor: 'rgba(0,0,0,0.3)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <InputBase
          id="client-seed"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{ maxLength: 64, spellCheck: false, autoCapitalize: 'off' }}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            color: '#F4ECDD',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '12.5px',
          }}
        />

        <ButtonBase
          onClick={() => onChange(randomClientSeed())}
          disabled={disabled}
          aria-label={t('seed.reroll', { defaultValue: 'Generate a new seed' })}
          sx={{
            width: 30,
            height: 30,
            flexShrink: 0,
            borderRadius: '8px',
            color: '#E7CE92',
            border: '1px solid rgba(231,206,146,0.2)',
            '&:hover': { borderColor: 'rgba(231,206,146,0.5)' },
          }}
        >
          <Iconify icon="solar:restart-bold" width={15} />
        </ButtonBase>
      </Box>

      <Typography
        sx={{
          mt: '6px',
          fontSize: '10.5px',
          color: '#6F6A60',
          lineHeight: 1.5,
          textAlign: 'center',
        }}
      >
        {t('seed.hint', {
          defaultValue:
            'Mixed into the commitment before the beacon exists. Change it to anything you like — it appears on your receipt.',
        })}
      </Typography>
    </Box>
  );
}

export default ClientSeedField;
