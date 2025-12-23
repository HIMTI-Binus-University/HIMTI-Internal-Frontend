import { IconProps } from "@/types/icon";

const EmailIcon = ({ width = 24, height = 24, className }: IconProps) => {
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
      <rect opacity="0.75" width="24" height="24" fill="url(#pattern0_72_18)" />
      <defs>
        <pattern
          id="pattern0_72_18"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_72_18" transform="scale(0.0416667)" />
        </pattern>
        <image
          id="image0_72_18"
          width="24"
          height="24"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAz0lEQVR4nO3UzWkCQRyG8UVvgViAsKSFgGANkSB4SQtpwRbSgi3k4sEqhEBakI0WkIC3hJ+sTMgi+6WuwcM+MPBn3+F92BmYKGq5GvCItfP5wChPkAZNkeQJ9jRwEnsKAyxwd0JxH691BClbTNGtUdzBM76yBWWCMVZhfsewpPwey7B3g6dKQZhv8IJv/GCGXmZvXn572FMoyHwb4C1ECSZhpbOQDap6SgN/Z/xZ546OFvyCGPOw4qiAkwV1aQVnCS7+2I0akiR4qP7Xlv9iBxHIwZ/UX51PAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
};

export default EmailIcon;
