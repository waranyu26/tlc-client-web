import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Full-resolution image viewer.
//
// Browse surfaces render a thumbnail, so a grid never decodes megapixel scans.
// This is the one place the original is fetched, and only once the customer
// asks for it.
//
// A single <img> is used rather than stacking the original over the thumbnail:
// it keeps the element's box exactly the size of the visible artwork, so
// "fits the screen" is enforced by `max-width/max-height: 100%` against a
// definite-height flex parent, and a click that lands outside that box is
// unambiguously a click on the backdrop. The original is preloaded off-screen
// and swapped in only once decoded, so the thumbnail never blinks out.
// ----------------------------------------------------------------------

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const WHEEL_SENSITIVITY = 0.0015;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type CardImageViewerProps = {
  open: boolean;
  onClose: () => void;
  /** Full-resolution art. */
  imageUrl?: string | null;
  /** Grid-sized copy, already cached — shown until the original decodes. */
  thumbUrl?: string | null;
  alt: string;
};

export function CardImageViewer({ open, onClose, imageUrl, thumbUrl, alt }: CardImageViewerProps) {
  const preview = thumbUrl || imageUrl || '';
  const full = imageUrl || thumbUrl || '';

  const [src, setSrc] = useState(preview);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const gesture = useRef({
    pointers: new Map<number, { x: number; y: number }>(),
    origin: { x: 0, y: 0 },
    start: { x: 0, y: 0 },
    startZoom: MIN_ZOOM,
    pinchDistance: 0,
    dragged: false,
  });

  const reset = useCallback(() => {
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Re-arm per card, then pull the original in the background. Swapping src only
  // after `decode()` resolves means the upgrade is a single clean frame instead
  // of a flash of empty image.
  useEffect(() => {
    if (!open) return undefined;

    reset();
    setSrc(preview);
    setLoaded(!full || full === preview);
    if (!full || full === preview) return undefined;

    let cancelled = false;
    const img = new Image();
    img.src = full;
    img
      .decode()
      .catch(() => undefined) // A broken original just leaves the preview up.
      .then(() => {
        if (cancelled) return;
        if (img.naturalWidth > 0) setSrc(full);
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, preview, full, reset]);

  const applyZoom = useCallback((next: number, focal?: { x: number; y: number }) => {
    setZoom((current) => {
      const clamped = clamp(next, MIN_ZOOM, MAX_ZOOM);
      // Back to fit means back to centre — a leftover offset would strand the
      // image off-screen with no way to drag it back.
      if (clamped === MIN_ZOOM) {
        setOffset({ x: 0, y: 0 });
      } else if (focal) {
        const ratio = clamped / current;
        setOffset((o) => ({
          x: focal.x - (focal.x - o.x) * ratio,
          y: focal.y - (focal.y - o.y) * ratio,
        }));
      }
      return clamped;
    });
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      applyZoom(zoom * (1 - event.deltaY * WHEEL_SENSITIVITY));
    },
    [applyZoom, zoom]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const g = gesture.current;
      g.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (g.pointers.size === 2) {
        const [a, b] = [...g.pointers.values()];
        g.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
        g.startZoom = zoom;
        return;
      }
      g.origin = { x: event.clientX, y: event.clientY };
      g.start = offset;
      g.dragged = false;
    },
    [offset, zoom]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const g = gesture.current;
      if (!g.pointers.has(event.pointerId)) return;
      g.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (g.pointers.size === 2) {
        const [a, b] = [...g.pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (g.pinchDistance > 0) applyZoom(g.startZoom * (distance / g.pinchDistance));
        return;
      }

      const dx = event.clientX - g.origin.x;
      const dy = event.clientY - g.origin.y;
      if (Math.hypot(dx, dy) > 4) g.dragged = true;

      // Panning an image that already fits would only slide it off-screen.
      if (zoom <= MIN_ZOOM) return;
      setOffset({ x: g.start.x + dx, y: g.start.y + dy });
    },
    [applyZoom, zoom]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    const g = gesture.current;
    g.pointers.delete(event.pointerId);
    if (g.pointers.size < 2) g.pinchDistance = 0;
  }, []);

  // Clicking the empty space around the artwork closes, the way every photo
  // viewer behaves. Guarded on `dragged` so releasing a pan gesture over the
  // backdrop doesn't dismiss the viewer.
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target !== event.currentTarget) return;
      if (gesture.current.dragged) return;
      onClose();
    },
    [onClose]
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const focal = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      applyZoom(zoom > MIN_ZOOM ? MIN_ZOOM : DOUBLE_TAP_ZOOM, focal);
    },
    [applyZoom, zoom]
  );

  const zoomed = zoom > MIN_ZOOM;

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition aria-label={alt}>
      <Fade in={open}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            outline: 'none',
            bgcolor: 'rgba(5,5,7,0.94)',
            backdropFilter: 'blur(6px)',
            overflow: 'hidden',
          }}
        >
          {/* Definite height is what makes `max-height: 100%` on the image
              actually constrain it — without it the browser falls back to the
              natural size and a 3000px scan overflows the screen. */}
          <Box
            onClick={handleBackdropClick}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: { xs: '56px 16px', md: '72px 48px' },
              touchAction: 'none',
              cursor: 'zoom-out',
            }}
          >
            {src && (
              <Box
                component="img"
                src={src}
                alt={alt}
                draggable={false}
                onDoubleClick={handleDoubleClick}
                sx={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transition: gesture.current.pointers.size ? 'none' : 'transform 0.18s ease-out',
                  willChange: 'transform',
                  cursor: zoomed ? 'grab' : 'zoom-in',
                  '&:active': { cursor: zoomed ? 'grabbing' : 'zoom-in' },
                }}
              />
            )}
          </Box>

          {!loaded && (
            <CircularProgress
              size={26}
              sx={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                marginLeft: '-13px',
                color: '#E7CE92',
                pointerEvents: 'none',
              }}
            />
          )}

          <IconButton
            onClick={onClose}
            aria-label="Close"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              color: '#F4ECDD',
              bgcolor: 'rgba(11,11,13,0.72)',
              border: '1px solid rgba(231,206,146,0.24)',
              '&:hover': { bgcolor: 'rgba(11,11,13,0.92)' },
            }}
          >
            <Iconify icon="carbon:close" width={20} />
          </IconButton>

          {zoomed && (
            <IconButton
              onClick={reset}
              aria-label="Reset zoom"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1,
                color: '#F4ECDD',
                bgcolor: 'rgba(11,11,13,0.72)',
                border: '1px solid rgba(231,206,146,0.24)',
                '&:hover': { bgcolor: 'rgba(11,11,13,0.92)' },
              }}
            >
              <Iconify icon="mingcute:minimize-line" width={20} />
            </IconButton>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

export default CardImageViewer;
