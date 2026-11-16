import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type PillOption<T extends string> = {
  value: T;
  label: ReactNode;
};

export type PillGroupProps<T extends string> = {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Names the group for assistive tech — the pills alone don't say what they choose. */
  label: string;
  /**
   * Scroll sideways instead of squeezing when the pills outgrow the row, so a
   * long list stays one swipeable line on a phone. Off for a group that always
   * fits, which keeps it an ordinary flex row.
   */
  scroll?: boolean;
};

/**
 * A row of single-choice pills: the gold-outlined chips used wherever there are
 * few enough options that a dropdown would only hide them.
 */
export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  scroll = true,
}: PillGroupProps<T>) {
  return (
    <Box
      role="group"
      aria-label={label}
      sx={{
        display: 'flex',
        gap: '6px',
        ...(scroll && {
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }),
      }}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <ButtonBase
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            sx={{
              px: '12px',
              py: '5px',
              borderRadius: '999px',
              border: `1px solid ${selected ? '#E7CE92' : 'rgba(231,206,146,0.22)'}`,
              backgroundColor: selected ? 'rgba(231,206,146,0.12)' : 'transparent',
              transition: 'border-color 160ms ease, background-color 160ms ease',
              '&:hover': { borderColor: 'rgba(231,206,146,0.55)' },
              ...(scroll && { flexShrink: 0 }),
            }}
          >
            <Typography
              noWrap
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: selected ? '#E7CE92' : '#9A9285',
              }}
            >
              {option.label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default PillGroup;
