import { IconProps } from "@/types/icon";

const DashboardIcon = ({
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
        fill="url(#pattern0_45_10)"
      />
      <defs>
        <pattern
          id="pattern0_45_10"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_45_10" transform="scale(0.0416667)" />
        </pattern>
        <image
          id="image0_45_10"
          width="24"
          height="24"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAdUlEQVR4nOWVQQrAIAwEfV7+/4T0IVP05KGKu2Chda6JDDEmlvIbgAAunskad3J7QQ3MSCe3FzQG1TWc3HMFyeYexEQyfEV62QpvCHL1XjEHbflecZosVttQY3sFaMvOEihNtgTLhzhWkGz+cEIYtJCX3We5AbskbaLkfaUHAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
};

export default DashboardIcon;
