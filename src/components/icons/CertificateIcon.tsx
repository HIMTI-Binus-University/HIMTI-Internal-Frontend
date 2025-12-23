import { IconProps } from "@/types/icon";

const CertificateIcon = ({
  width = 24,
  height = 24,
  className,
}: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
    >
      <rect
        opacity="0.75"
        width="24"
        height="24"
        fill="url(#pattern0_45_21)"
      />
      <defs>
        <pattern
          id="pattern0_45_21"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_45_21" transform="scale(0.0416667)" />
        </pattern>
        <image
          id="image0_45_21"
          width="24"
          height="24"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAx0lEQVR4nO2UMQrCQBBF9wRewFh7CSGNhcEr5UAiARuJhY2FJ4m2EcwFXtg4YNTRTXAEizxYWObDPGZY1rmBvwFYAme+5wQkmsAHVhSaoMFgEw2DwFYATIAMqORsgKmJgFvzklcuPrMQZBJtgTEQAbnU1haCSqLoaSrP1ULABwGWglzW45vvfiFQsRSs5DWVcu8tePjsuoqdPqn62SVtidYIGPkTEBTAwnWFO2lrRenbVfSFAJaCIzAHZsDeUnAAYqUe+yzUoAYGPgQgk9ZMfwAAAABJRU5ErkJggg=="
        />
      </defs>
    </svg>
  );
};

export default CertificateIcon;
