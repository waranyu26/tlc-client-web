import type { PointerEvent } from 'react';
import type { Transition } from 'framer-motion';

import { useRef, useState } from 'react';
import { m, useSpring, useTransform, useMotionValue } from 'framer-motion';

import ButtonBase from '@mui/material/ButtonBase';

import { CardBack } from 'src/components/vault';

// ----------------------------------------------------------------------
// One face-down card in the pick grid.
//
// A real <button> (via ButtonBase) rather than a div, so the grid is tabbable,
// Enter/Space work for free, and screen readers announce it. The 3D tilt tracks
// the pointer through spring-damped motion values, which is what makes the card
// feel like an object you could actually pick up.
// ----------------------------------------------------------------------

const TILT_DEGREES = 14;
const SPRING = { stiffness: 260, damping: 22, mass: 0.5 };

/**
 * The transition a dealt-in card rests on.
 *
 * Kept separate from the deal because framer falls back to the `transition`
 * prop for gesture targets that don't carry one of their own
 * (`animateTarget` -> `visualElement.getDefaultTransition()`). While the deal's
 * `delay` lived on that prop, every hover *and* every hover-release inherited
 * it: the last card in the grid took 873ms to lift and 1050ms to drop back.
 */
const REST_SPRING: Transition = { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 };

/** Keeps a gesture mounted while it must not move anything. Module-scoped so
 *  framer sees a stable reference rather than a new target every render. */
const NO_GESTURE = {};

export type PickCardProps = {
  index: number;
  ariaLabel: string;
  disabled?: boolean;
  reduceMotion?: boolean;
  onPick: (index: number) => void;
  onHoverStart?: () => void;
  /** Hands the underlying <button> to the grid so it can drive roving focus. */
  registerRef?: (node: HTMLButtonElement | null) => void;
  /**
   * Set on the cards that weren't chosen: they blow out of frame along this
   * vector while the picked one takes the stage.
   */
  disperseTo?: { x: number; y: number; rotate: number };
};

export function PickCard({
  index,
  ariaLabel,
  disabled = false,
  reduceMotion = false,
  onPick,
  onHoverStart,
  registerRef,
  disperseTo,
}: PickCardProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const hovering = useRef(false);

  // Flipped by the deal's own completion rather than a timer, so it is exact.
  // Nothing else animates this element before then — hover and tilt are gated
  // on it — so the first completion is unambiguously the deal landing.
  const [dealt, setDealt] = useState(false);

  const px = useMotionValue(0); // -0.5 .. 0.5
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [TILT_DEGREES, -TILT_DEGREES]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-TILT_DEGREES, TILT_DEGREES]), SPRING);

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || disabled || !dealt) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);

    if (!hovering.current) {
      hovering.current = true;
      onHoverStart?.();
    }
  };

  const handlePointerLeave = () => {
    hovering.current = false;
    px.set(0);
    py.set(0);
  };

  // Deal-in: every card drops from above the grid with a slight inward lean, so
  // the twelve read as one hand being dealt rather than twelve independent fades.
  const dealDelay = reduceMotion ? 0 : 0.34 + index * 0.045;
  const leanFrom = (5.5 - index) * 4;

  const dealtIn = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 };

  const dispersed = disperseTo
    ? {
        opacity: 0,
        scale: 0.68,
        x: reduceMotion ? 0 : disperseTo.x,
        y: reduceMotion ? 0 : disperseTo.y,
        rotate: reduceMotion ? 0 : disperseTo.rotate,
      }
    : null;

  // The deal's delay is dropped the moment the card has landed. Leaving it in
  // place would keep lagging every later gesture by this card's place in the
  // stagger, which is what made hover stick.
  let transition: Transition;
  if (dispersed) transition = { duration: 0.55, ease: 'easeIn' };
  else if (reduceMotion) transition = { duration: 0.2, delay: dealt ? 0 : index * 0.012 };
  else if (dealt) transition = REST_SPRING;
  else transition = { type: 'spring', stiffness: 210, damping: 20, delay: dealDelay };

  // A card still in flight must not answer to the pointer. whileHover only
  // claims y and scale, so a card caught mid-deal keeps the deal's x and rotate
  // and simply stalls at its pre-deal position — sitting on top of the card in
  // the row above it.
  //
  // Gated by swapping the gesture's *target* rather than unsetting whileHover:
  // framer only starts a hover animation on pointerenter, so a pointer already
  // resting on a card while it dealt would never get its lift. An empty target
  // keeps the gesture mounted and moving nothing, and the lift engages on the
  // render where the card lands.
  const interactive = dealt && !dispersed;

  return (
    <ButtonBase
      ref={(node: HTMLButtonElement | null) => {
        ref.current = node;
        registerRef?.(node);
      }}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={() => onPick(index)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      sx={{
        display: 'block',
        width: '100%',
        padding: 0,
        borderRadius: '4px',
        perspective: '900px',
        // A lifted, tilted card is larger than its grid cell, so it grows into
        // its neighbours. Without this it grows *under* every later sibling,
        // which reads as the cards colliding rather than one being picked up.
        position: 'relative',
        zIndex: 0,
        '&:hover': { zIndex: 2 },
        '&.Mui-focusVisible': {
          zIndex: 2,
          outline: '2px solid #E7CE92',
          outlineOffset: '4px',
        },
      }}
    >
      <m.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -170, x: leanFrom, scale: 0.62, rotate: leanFrom * 0.6 }
        }
        animate={dispersed ?? dealtIn}
        transition={transition}
        onAnimationComplete={() => setDealt(true)}
        whileHover={
          reduceMotion || dispersed ? undefined : interactive ? { y: -12, scale: 1.06 } : NO_GESTURE
        }
        whileTap={dispersed ? undefined : interactive ? { scale: 0.97 } : NO_GESTURE}
      >
        {/*
          The layout target is kept free of transforms of its own — the deal,
          tilt and hover all live on the parent — so framer can hand this exact
          card off to the suspense stage without fighting them.
        */}
        <m.div layoutId={reduceMotion ? undefined : `pick-card-${index}`}>
          <CardBack sheen={!reduceMotion} />
        </m.div>
      </m.div>
    </ButtonBase>
  );
}

export default PickCard;
