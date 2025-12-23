import React from "react";

type Props = {
  className?: string;
};

const HimtiLogo = ({ className }: Props) => {
  return (
    <svg
      viewBox="0 0 90 106" // Sesuai screenshot lu
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink" // Fix syntax React
      className={className}
    >
      <path d="M90 0H0V106H90V0Z" fill="url(#pattern0_17_306)" />
      <defs>
        <pattern
          id="pattern0_17_306"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_17_306" // Fix: xlink:href jadi xlinkHref
            transform="matrix(0.00111818 0 0 0.000993204 -0.229474 -0.281624)"
          />
        </pattern>

        {/* IMAGE DATA (Jangan kaget codingannya panjang bgt ke kanan) */}
        <image
          id="image0_17_306"
          width="2500"
          height="2500"
          // Fix: xlink:href jadi xlinkHref
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABKQAAASkCAYAAAA8jCjBAAAACXBIWXMAAC4jAAAuIwF4pT92..."
        />
      </defs>
    </svg>
  );
};

export default HimtiLogo;
