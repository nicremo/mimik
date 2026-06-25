import { describe, expect, it } from 'vitest';
import { chooseArrowSide, computeCropRect, type Rect } from '../annotate';

describe('chooseArrowSide', () => {
  const canvasW = 1000;
  const canvasH = 800;

  it('points from below when the element is in the upper area', () => {
    const rect: Rect = { x: 450, y: 50, width: 100, height: 40 };
    expect(chooseArrowSide(rect, canvasW, canvasH)).toBe('bottom');
  });

  it('points from above when the element is near the bottom', () => {
    const rect: Rect = { x: 450, y: 720, width: 100, height: 40 };
    expect(chooseArrowSide(rect, canvasW, canvasH)).toBe('top');
  });

  it('points from the right when the element hugs the left edge', () => {
    const rect: Rect = { x: 10, y: 380, width: 60, height: 40 };
    // bottom space (800-420=380) still beats right (1000-70=930)? no: right is larger
    expect(chooseArrowSide(rect, canvasW, canvasH)).toBe('right');
  });

  it('points from the left when the element hugs the right edge', () => {
    const rect: Rect = { x: 930, y: 380, width: 60, height: 40 };
    expect(chooseArrowSide(rect, canvasW, canvasH)).toBe('left');
  });
});

describe('computeCropRect', () => {
  it('keeps the crop window inside the image bounds', () => {
    const rect: Rect = { x: 20, y: 20, width: 40, height: 30 };
    const { cropX, cropY, visW, visH } = computeCropRect(1000, 800, rect);
    expect(cropX).toBeGreaterThanOrEqual(0);
    expect(cropY).toBeGreaterThanOrEqual(0);
    expect(cropX + visW).toBeLessThanOrEqual(1000 + 1e-6);
    expect(cropY + visH).toBeLessThanOrEqual(800 + 1e-6);
  });

  it('centers the crop on the element when there is room', () => {
    const rect: Rect = { x: 480, y: 380, width: 40, height: 40 };
    const { cropX, cropY, visW, visH } = computeCropRect(1000, 800, rect);
    const elCx = rect.x + rect.width / 2;
    const elCy = rect.y + rect.height / 2;
    expect(cropX + visW / 2).toBeCloseTo(elCx, 0);
    expect(cropY + visH / 2).toBeCloseTo(elCy, 0);
  });

  it('never produces a crop larger than the image', () => {
    const rect: Rect = { x: 100, y: 100, width: 800, height: 600 };
    const { visW, visH } = computeCropRect(1000, 800, rect);
    expect(visW).toBeLessThanOrEqual(1000);
    expect(visH).toBeLessThanOrEqual(800);
  });
});
