import { IconProps } from "@/types/icon";

const ExpiredIcon = ({ width = 16, height = 16, className }: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
    >
      <rect
        opacity="0.5"
        width="16"
        height="16"
        fill="url(#pattern0_100_126)"
      />
      <defs>
        <pattern
          id="pattern0_100_126"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_100_126" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_100_126"
          width="96"
          height="96"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export default ExpiredIcon;
