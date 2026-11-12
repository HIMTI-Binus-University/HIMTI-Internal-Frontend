import type { Textbox } from "fabric";

export const GUIDELINE_MARGIN = 40;
export const SNAP_THRESHOLD = 8;
export const GRID_SNAP_THRESHOLD = 4;

export type SnapResult = {
  snappedAt: number | null;
  kind: "guide" | "grid" | null;
  delta: number;
};

const nullSnap: SnapResult = { snappedAt: null, kind: null, delta: 0 };

// Snap the textbox edges/center to the canvas guidelines (margins, midpoint,
// canvas edges) first, then its center to a coarse grid. Mutates the textbox
// position when something is within threshold. Returns where the object
// snapped so callers can draw temporary guide lines.
export const snapToTargets = (
  textbox: Textbox,
  size: { width: number; height: number }
): { x: SnapResult; y: SnapResult } => {
  // Fabric caches object coordinates; refresh them so getBoundingRect()
  // reflects the position Fabric just applied for this drag step.
  textbox.setCoords();

  const bounds = textbox.getBoundingRect();

  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;

  const gridStep = Math.max(
    20,
    Math.round(Math.min(size.width, size.height) / 8)
  );

  const guidelineTargets = (axisSize: number) => [
    0,
    axisSize,
    GUIDELINE_MARGIN,
    axisSize - GUIDELINE_MARGIN,
    axisSize / 2, // canvas midpoint
  ];

  const gridTargets = (axisSize: number) => {
    const targets = [];
    for (let grid = gridStep; grid < axisSize; grid += gridStep) {
      targets.push(grid);
    }
    return targets;
  };

  const snapAxis = (
    targetList: number[],
    edges: number[],
    threshold: number
  ): SnapResult => {
    let best: { delta: number; snappedAt: number; distance: number } | null =
      null;

    for (const target of targetList) {
      for (const edge of edges) {
        const distance = Math.abs(target - edge);
        if (distance <= threshold && (!best || distance < best.distance)) {
          best = {
            delta: target - edge,
            snappedAt: target,
            distance,
          };
        }
      }
    }

    if (!best) return nullSnap;

    return { snappedAt: best.snappedAt, kind: "guide", delta: best.delta };
  };

  const xEdges = [bounds.left, centerX, bounds.left + bounds.width];
  const yEdges = [bounds.top, centerY, bounds.top + bounds.height];

  // Guidelines win over the grid.
  let resultX = snapAxis(guidelineTargets(size.width), xEdges, SNAP_THRESHOLD);
  let resultY = snapAxis(guidelineTargets(size.height), yEdges, SNAP_THRESHOLD);

  if (resultX.snappedAt === null) {
    const gridResult = snapAxis(gridTargets(size.width), [centerX], GRID_SNAP_THRESHOLD);
    if (gridResult.snappedAt !== null) resultX = { ...gridResult, kind: "grid" };
  }

  if (resultY.snappedAt === null) {
    const gridResult = snapAxis(gridTargets(size.height), [centerY], GRID_SNAP_THRESHOLD);
    if (gridResult.snappedAt !== null) resultY = { ...gridResult, kind: "grid" };
  }

  const applyX = resultX.snappedAt === null ? null : resultX.delta;
  const applyY = resultY.snappedAt === null ? null : resultY.delta;

  if (applyX !== null && applyX !== 0) {
    textbox.set({ left: textbox.left! + applyX });
  }

  if (applyY !== null && applyY !== 0) {
    textbox.set({ top: textbox.top! + applyY });
  }

  if (applyX !== null || applyY !== null) {
    textbox.setCoords();
  }

  return { x: resultX, y: resultY };
};
