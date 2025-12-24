import { IconProps } from "@/types/icon";

const DownRightIcon = ({ width = 24, height = 24, className }: IconProps) => {
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
        opacity="0.5"
        width="24"
        height="24"
        fill="url(#pattern0_100_119)"
      />
      <defs>
        <pattern
          id="pattern0_100_119"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_100_119" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_100_119"
          width="96"
          height="96"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB2UlEQVR4nO3ZPy5EYRSG8ReFBBGtBUhsgC3QsgGdLdCRUFD5swzEXsQGiEQ0apnGkZtMNcn47mTC+51vnl9yKs3nPO6duZcEAAAAAAAAjBeFwR8jgBkBzAhgRgAzApgRwIwAZgQwI4AZAcwIYEYAMwKYEcCMAGYEMCOAGQHMCGBGADMCmBHAjABmBDAjgBkBzAhgRgAzApgRwIwAZq0FuFAyrQWIbBFaDBCZIrQaILJEGBQCrCiXyBbhsxBgQ7lEtgjPhQA7yiXGzKkq9VAIcKNc4pep8ko4Lhz6RdK88ojCVHclbPc49IHyiGwRur/u18KBu58vqZ0AUVuE8x4HvpM0p3YCRE0R1iV99TjwZYIIkTXCTc8D31V+O4qsEVYlvfc88JukQ0kLaiNA1PIVdV/S9wSH7j6cbyXtStqUtJw4QDVXwvWUv0QkH3uE7rZyX8Eiwjj229GipMcKFhGzfiVcTfiZEI2NPUJnT9JHBcuIWQ3QWRs+J/R5WItGpprljz4xn/V4dxTJp8rlj77A25J0NPzG9DT8z9qgguU1v/zaxRRz4j58C4Lle7F8M5ZvxvLNWL4Zyzdj+WYs34zlm7F8M5ZvxvLNWL4ZyzfjfT4AAAAAAAD0H34AluZ0x6Xn7X0AAAAASUVORK5CYII="
        />
      </defs>
    </svg>
  );
};

export default DownRightIcon;
