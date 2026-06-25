import type { Screenshot } from './types';

// Tango-style annotation: a bold red rounded box around the clicked element plus
// a red arrow pointing at it. Shared by the in-app viewer/replay and the
// HTML/PDF/Markdown exporters so the marker looks identical everywhere.

const HIGHLIGHT_COLOR = '#FF2D2D';
const HALO_COLOR = 'rgba(255,255,255,0.92)';
const DEFAULT_TYPE = 'image/webp';
const DEFAULT_QUALITY = 0.85;

type Ctx = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ArrowSide = 'top' | 'bottom' | 'left' | 'right';

export interface RenderOptions {
  /** Zoom/crop into the clicked region (Tango-style) in addition to the box. */
  crop?: boolean;
  /** Output image mime type, e.g. "image/webp" or "image/jpeg". */
  type?: string;
  quality?: number;
  /** Draw the pointing arrow (default true). */
  arrow?: boolean;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function roundedRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Pick the side of the element with the most free canvas space for the arrow. */
export function chooseArrowSide(rect: Rect, canvasW: number, canvasH: number): ArrowSide {
  const candidates: [ArrowSide, number][] = [
    ['bottom', canvasH - (rect.y + rect.height)],
    ['top', rect.y],
    ['right', canvasW - (rect.x + rect.width)],
    ['left', rect.x],
  ];
  // First entry wins ties, giving the preference order bottom > top > right > left.
  let best = candidates[0];
  for (const candidate of candidates) {
    if (candidate[1] > best[1]) best = candidate;
  }
  return best[0];
}

function strokeArrow(
  ctx: Ctx,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  width: number,
  headLen: number,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  const angle = Math.atan2(toY - fromY, toX - fromX);
  const spread = Math.PI / 7;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - spread), toY - headLen * Math.sin(angle - spread));
  ctx.lineTo(toX - headLen * Math.cos(angle + spread), toY - headLen * Math.sin(angle + spread));
  ctx.closePath();
  ctx.fill();
}

function drawArrow(ctx: Ctx, rect: Rect, side: ArrowSide, canvasW: number, canvasH: number, lw: number) {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const gap = lw * 2.2;
  const headLen = lw * 3.4;
  const diag = 0.18; // slight slant so the arrow looks hand-placed
  const len = clamp(canvasW * 0.13, 64, 240);

  let tipX = cx;
  let tipY = cy;
  let tailX = cx;
  let tailY = cy;

  switch (side) {
    case 'bottom':
      tipX = cx;
      tipY = rect.y + rect.height + gap;
      tailX = clamp(cx + len * diag, 0, canvasW);
      tailY = clamp(tipY + len, 0, canvasH);
      break;
    case 'top':
      tipX = cx;
      tipY = rect.y - gap;
      tailX = clamp(cx + len * diag, 0, canvasW);
      tailY = clamp(tipY - len, 0, canvasH);
      break;
    case 'right':
      tipX = rect.x + rect.width + gap;
      tipY = cy;
      tailX = clamp(tipX + len, 0, canvasW);
      tailY = clamp(cy + len * diag, 0, canvasH);
      break;
    case 'left':
      tipX = rect.x - gap;
      tipY = cy;
      tailX = clamp(tipX - len, 0, canvasW);
      tailY = clamp(cy + len * diag, 0, canvasH);
      break;
  }

  // Halo underneath for contrast on busy backgrounds, then the red arrow on top.
  strokeArrow(ctx, tailX, tailY, tipX, tipY, HALO_COLOR, lw + Math.max(2, lw * 0.7), headLen + 2);
  strokeArrow(ctx, tailX, tailY, tipX, tipY, HIGHLIGHT_COLOR, lw, headLen);
}

/** Draw the red highlight box (and optional arrow) for `rect` onto `ctx`. */
export function drawHighlight(
  ctx: Ctx,
  rect: Rect,
  canvasW: number,
  canvasH: number,
  options: { arrow?: boolean } = {},
) {
  const lw = Math.max(4, Math.round(canvasW * 0.0042));
  const radius = Math.max(6, Math.min(16, rect.width / 6, rect.height / 6));

  ctx.setLineDash([]);
  // White halo first so the box is visible on both light and dark UI.
  ctx.lineWidth = lw + Math.max(2, lw * 0.7);
  ctx.strokeStyle = HALO_COLOR;
  roundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, radius);
  ctx.stroke();

  ctx.lineWidth = lw;
  ctx.strokeStyle = HIGHLIGHT_COLOR;
  roundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, radius);
  ctx.stroke();

  if (options.arrow !== false) {
    drawArrow(ctx, rect, chooseArrowSide(rect, canvasW, canvasH), canvasW, canvasH, lw);
  }
}

export interface CropRect {
  cropX: number;
  cropY: number;
  visW: number;
  visH: number;
}

/** Compute the zoom/crop window centered on the element, matching its aspect. */
export function computeCropRect(imgW: number, imgH: number, rect: Rect): CropRect {
  const PAD_RATIO = 0.3;
  const padH = PAD_RATIO * imgW;
  const padV = PAD_RATIO * imgH;
  const imgAspect = imgW / imgH;
  const elAspect = rect.width / rect.height;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;

  let visW = rect.width + padH;
  let visH = rect.height + padV;
  if (elAspect > 1) {
    visW = rect.width + padH;
    visH = visW / imgAspect;
  } else if (elAspect < 1) {
    visH = rect.height + padV;
    visW = visH * imgAspect;
  }

  visW = Math.min(visW, imgW);
  visH = Math.min(visH, imgH);

  const cropX = clamp(cx - visW / 2, 0, imgW - visW);
  const cropY = clamp(cy - visH / 2, 0, imgH - visH);
  return { cropX, cropY, visW, visH };
}

/**
 * Render a screenshot with the red box+arrow baked in. Returns the full image
 * and, when `crop` is set and bounds exist, a zoomed-in variant.
 *
 * Degrades gracefully to the raw screenshot when canvas APIs are unavailable
 * (e.g. unit tests) or rendering throws, so exports never break.
 */
export async function renderAnnotatedScreenshot(
  screenshot: Screenshot,
  options: RenderOptions = {},
): Promise<{ fullBlob: Blob; croppedBlob: Blob | null }> {
  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
    return { fullBlob: screenshot.blob, croppedBlob: null };
  }
  try {
    return await renderAnnotatedInternal(screenshot, options);
  } catch {
    return { fullBlob: screenshot.blob, croppedBlob: null };
  }
}

async function renderAnnotatedInternal(
  screenshot: Screenshot,
  options: RenderOptions = {},
): Promise<{ fullBlob: Blob; croppedBlob: Blob | null }> {
  const type = options.type ?? DEFAULT_TYPE;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const arrow = options.arrow;

  const img = await createImageBitmap(screenshot.blob);
  const imgW = img.width;
  const imgH = img.height;
  const bounds = screenshot.bounds;
  const dpr = screenshot.pixelRatio || 1;

  const fullCanvas = new OffscreenCanvas(imgW, imgH);
  const fullCtx = fullCanvas.getContext('2d')!;
  fullCtx.drawImage(img, 0, 0, imgW, imgH);

  if (!bounds) {
    img.close();
    const fullBlob = await fullCanvas.convertToBlob({ type, quality });
    return { fullBlob, croppedBlob: null };
  }

  const elRect: Rect = {
    x: bounds.x * dpr,
    y: bounds.y * dpr,
    width: bounds.width * dpr,
    height: bounds.height * dpr,
  };

  drawHighlight(fullCtx, elRect, imgW, imgH, { arrow });
  const fullBlob = await fullCanvas.convertToBlob({ type, quality });

  if (!options.crop) {
    img.close();
    return { fullBlob, croppedBlob: null };
  }

  const { cropX, cropY, visW, visH } = computeCropRect(imgW, imgH, elRect);
  const cropCanvas = new OffscreenCanvas(imgW, imgH);
  const cropCtx = cropCanvas.getContext('2d')!;
  cropCtx.drawImage(img, cropX, cropY, visW, visH, 0, 0, imgW, imgH);

  const scaleX = imgW / visW;
  const scaleY = imgH / visH;
  drawHighlight(
    cropCtx,
    {
      x: (elRect.x - cropX) * scaleX,
      y: (elRect.y - cropY) * scaleY,
      width: elRect.width * scaleX,
      height: elRect.height * scaleY,
    },
    imgW,
    imgH,
    { arrow },
  );

  img.close();
  const croppedBlob = await cropCanvas.convertToBlob({ type, quality });
  return { fullBlob, croppedBlob };
}

/** Convenience for exports: a single annotated blob (zoomed if available). */
export async function renderAnnotatedBlob(screenshot: Screenshot, options: RenderOptions = {}): Promise<Blob> {
  const { fullBlob, croppedBlob } = await renderAnnotatedScreenshot(screenshot, options);
  return croppedBlob ?? fullBlob;
}
