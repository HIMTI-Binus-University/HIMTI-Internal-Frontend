import { IconProps } from "@/types/icon";

const LinkIconV2 = ({ width = 96, height = 96, className }: IconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
    >
      <rect
        opacity="0.32"
        width="96"
        height="96"
        fill="url(#pattern0_100_154)"
      />
      <defs>
        <pattern
          id="pattern0_100_154"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_100_154" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_100_154"
          width="96"
          height="96"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAADH0lEQVR4nO3by04UQRTG8X9mxoVcTLxtBHdGfAEJPIGXtaLRxIUati4R1iosBRFCeAMJGsX4HhpcGy6aeMEtwqZNm5qIEKnTXTX00P39ktqRU13n9FRXVTcgIiIiIiIiIiIiIiIiIiIiIiIiIiLyrzowCIwBi8BH4CewDSSBLVRo/9tuLMtubKPAAFCjDZwFJoD1CANN2rQA/2trwDjQSwFOA3PAVgsHmLR5AZotzcEMcJIDcgvYOICBJYekAM32A7hBCx0B5g9wQMkhK0CzzQINIusA3hUwmCTCtRdxzW9dzqLd+UUlP4lw/UmBRYjySyhi2klKUIDEPZyD3M7Y4QowBVwC+oBODr9ON5Z0TM+A1Yw5Gcrbcbqs+m7sJN0HDLsNWdnVgOvApwyro1N5OpozdvAK6KJ6uoHXxhxN59nhWjZZT9tlS16QdOyThjz9AnqyBJ4w3vlVTn5TzfhLeIJR3XC2s1bRaWe/6eizJ2er1ht20FDNu5ZAFXPfkLd+S6Axw1KzCqudrOpuZtgvdw8tgV56gqQPnRBJm7cQ057YC5Ygy54gl4MusdwFuOqJ/cESxHfUfC7wIstcgD5P7HRj6+Vb/4eufspcgC7DfsBLBcjvWIwC+Kag84QpcwEuxJiC9BAu+CG86AmSHsmGKHMBZjyxX1iCjBq21NqI7dUwbMRGMBgw3CX3LIEqZtiQt4uWQDVDJdfdAZT8Xf18MRzhmE+Pxw3VTI9gdRzNnxy8MeTrcZagvcYXMpMVL0LNvQP35WkTOBP7ib7zl9Bd0WlnyZijtEiZnQC+GTtI/+5BK74Ia9O7/o5hzt/5Uj73d6M3jZ0025o7kr3idoVleGvW5caSbrKeGxYou9u10AuYzdhh7BaqyGvPNfXsVje8pFEB2NOWYk7JHe5bRxUAU0uXpUeJrJFhZVTlAky1ejEylOGTxSoV4GuMB26WJeq0e8FQ9QJsurv+OAXocV98rVawACvAozw73FZtTvrddy8L7sXDRqR/4gsV2v+WG8t7N7YRd6pZ5SMYERERERERERERERERERERERERERFhr9/M218L8dU2ygAAAABJRU5ErkJggg=="
        />
      </defs>
    </svg>
  );
};

export default LinkIconV2;
