import { IconProps } from "@/types/icon";

const CalendarIcon = ({ width = 16, height = 16, className }: IconProps) => {
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
        fill="url(#pattern0_100_123)"
      />
      <defs>
        <pattern
          id="pattern0_100_123"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_100_123" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_100_123"
          width="96"
          height="96"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAACFklEQVR4nO3dSU4DQQxAUW/CWRiOyixOAxwDOAjDLkhGkXqFQGGTeqbaX/L+/3LUnVVXRNM0TdMcjtwzmup+0wdmcb/pA7O43/SBWdxv+sAs7jd9YBb3mz4wi/tNH5jF/fZyFhHXEfEcER9/CPrv87G0XkXEqTz4o4i4i4jPAoeSaHbttxGxEYf/WOAAssg8jF7CXYHoLDY3I5/5a37s5C+zjYiTEQu4KRCbRedyxAJeCoRm0XkasYD3AqFZdN5GLGCfxOyk7ucCGN7PBTC8nwtgeD8XwPB+LoDh/VwAw/u5AIb37xNY+xwcHZjFpxcQvYBVz8HRgVl8egHRC1j1HBwdmMWHL2B2UvdzAQzv5wIY3s8FMLyfC2B4PxfA8H4ugOH9XADD+7kAhvdzAQzv5wIY3s8FMLyfC2B4PxfA8H4ugOH9XADD+7kAhvdzAQzv5wIY3s8FMLyfC2B4PxfA8H4ugOH9XADD+7kAhvdzAQzv5wIY3s8FMLyfC2B4PxfA8H4ugOH9XADD+7kAhvdzAQzv5wIY3s8FMLyfC2B4PxfA8H4ugOH9XADD+9/+ILHWeR2xgOcCobnmTxdfFQjNonM+YgG7azv68/Xx4+frj2MQtwWCs9jsngzD2CzXdujoLDL34h6ZzXKZw7bAASSa7fLLH374398Jl8s/gDXcLfC+tF6MurKkaZqmaZqmaZqmaZqmiSn4AuwF/gO5V/NxAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
};

export default CalendarIcon;
