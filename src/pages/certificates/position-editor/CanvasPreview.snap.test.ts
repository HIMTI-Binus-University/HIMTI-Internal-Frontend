import { describe, expect, it } from "vitest";
import type { Textbox } from "fabric";

// snapToTargets lives in its own module (kept out of the component file so
// CanvasPreview stays lint-clean for fast refresh); exercised here with a
// minimal textbox stand-in so the snap math (guidelines win over grid, edge
// deltas relative to the matched edge) stays covered by unit tests.
import { snapToTargets } from "./snap";

const CANVAS = { width: 800, height: 600 };
const MARGIN = 40;
const MID_X = 400;
const MID_Y = 300;

type FakeBox = {
  left: number;
  top: number;
  getBoundingRect: () => {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  set: (props: { left?: number; top?: number }) => void;
  setCoords: () => void;
};

const makeBox = (centerX: number, centerY: number, width = 200, height = 50) => {
  const box: FakeBox = {
    left: centerX,
    top: centerY,
    getBoundingRect: () => ({
      left: box.left - width / 2,
      top: box.top - height / 2,
      width,
      height,
    }),
    set: (props) => {
      if (props.left !== undefined) box.left = props.left;
      if (props.top !== undefined) box.top = props.top;
    },
    setCoords: () => {},
  };

  return box as unknown as Textbox & { left: number; top: number };
};

describe("snapToTargets", () => {
  it("snaps the center to the canvas midpoint within the threshold", () => {
    // center 406 = midpoint + 6 px (< 8 px threshold); y center sits on the
    // grid line 150 already, so it snaps to the grid.
    const box = makeBox(406, 150);
    const { x, y } = snapToTargets(box, CANVAS);

    expect(x.snappedAt).toBe(MID_X);
    expect(x.kind).toBe("guide");
    expect(box.left).toBe(MID_X); // center becomes 400
    expect(y.snappedAt).toBe(150);
    expect(y.kind).toBe("grid");
  });

  it("snaps the LEFT edge to the margin guideline using an edge-relative delta", () => {
    // left edge at 45 (margin + 5): regression for the delta bug where the
    // correction was computed against the object center instead of the edge.
    const box = makeBox(145, 150); // left edge = 45
    const { x } = snapToTargets(box, CANVAS);

    expect(x.snappedAt).toBe(MARGIN);
    expect(x.kind).toBe("guide");
    expect(box.left).toBe(140); // center must stay 100 px right of the edge
    expect(box.left - 200 / 2).toBe(MARGIN);
  });

  it("snaps the RIGHT edge to the canvas midpoint without jumping the object", () => {
    // right edge = 396 (midpoint - 4)
    const box = makeBox(296, 150);
    const { x } = snapToTargets(box, CANVAS);

    expect(x.snappedAt).toBe(MID_X);
    expect(box.left).toBe(300); // center = midpoint - width/2
  });

  it("falls back to grid snapping when guidelines are out of reach", () => {
    // x center = 748: 2 px from the grid line 750 (< 4 px grid threshold) and
    // far from every guideline target. y center = 345 and its edges are out
    // of threshold reach (top = 320, bottom = 370).
    const box = makeBox(748, 345);
    const { x, y } = snapToTargets(box, CANVAS);

    expect(x.snappedAt).toBe(750);
    expect(x.kind).toBe("grid");
    expect(box.left).toBe(750);
    expect(y.snappedAt).toBeNull();
  });

  it("does not snap when nothing is within threshold", () => {
    const box = makeBox(430, 250); // 30px from mid x, 50px from mid y
    const { x, y } = snapToTargets(box, CANVAS);

    expect(x.snappedAt).toBeNull();
    expect(y.snappedAt).toBeNull();
    expect(box.left).toBe(430);
    expect(box.top).toBe(250);
  });

  it("snaps the top edge to the vertical midpoint", () => {
    // top edge = 297 (midpoint y - 3)
    const box = makeBox(150, 322, 80, 50); // top = 322 - 25 = 297
    const { y } = snapToTargets(box, CANVAS);

    expect(y.snappedAt).toBe(MID_Y);
    expect(y.kind).toBe("guide");
    expect(box.top).toBe(325); // center = midpoint - height/2
  });
});
