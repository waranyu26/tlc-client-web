import type { HTMLMotionProps } from 'framer-motion';

import { m } from 'framer-motion';

// ----------------------------------------------------------------------

export type FadeUpProps = HTMLMotionProps<'div'> & {
  delay?: number;
  duration?: number;
};

/** Simple entry animation wrapper: opacity 0->1, translateY 14px->0. */
export function FadeUp({ children, delay = 0, duration = 0.5, ...other }: FadeUpProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...other}
    >
      {children}
    </m.div>
  );
}

export default FadeUp;
