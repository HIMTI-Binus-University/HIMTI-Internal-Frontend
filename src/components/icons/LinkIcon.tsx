import { IconProps } from "@/types/icon";

const LinkIcon = ({ width = 24, height = 24, className }: IconProps) => {
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
      <rect width="24" height="24" fill="url(#pattern0_72_15)" />
      <defs>
        <pattern
          id="pattern0_72_15"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_72_15" transform="scale(0.0208333)" />
        </pattern>
        <image
          id="image0_72_15"
          width="48"
          height="48"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAABw0lEQVR4nO2Wz07CQBDGNxq9QHwVTUz8c+quhsSbRl2Muz37GlxFvaAnr0g6y76QGPDGCxg46EkzgNEuLQWhaTHzS3prO/PtzDc7jBEEQRAEQRBELpHSrnMFF1xBwBW0uDJ9oc3npCfpn0nfc2X6w1gQCN0sYw5/Sp775oxr85oUcNEChCtIm45QcDp14lLaVaHhbtZAaQkQP0JuK5XKSqKAeZJPU4AYPFBNbJvxnoR3oU2N+8Fuya8XWMqU/HoBY3EF96PYoXw835zEG9bpea6gK3yzyTLCU3ZrkMNvEQrakcbGaTN28hkm74gIVeJAGclchmMrVK4aywlcmQfHC42ol15CKi/tTnpmnM38njZ7Tne0IhKCXsgs0hZzI0DaolOB3lIJONJPG+EKmLf/10LcMTHOYbZMJha6WXbHKI4wlocxquEj1N46OI+7yDqOiG6WIryYi2z76nEt8gPc+tzeRPVYQuzDJGMvJGlpi4eXdh9juic/OtTjiT/ArS8tMyJzmv068QRwZeXK3ORPAFSnWqe/wa0P+y1zAQraiW0TB5oFFyccW0KbZ/eyS0cA9EaxGjhtYg1LEARBEARBECxrvgDGTuHNZcrl5gAAAABJRU5ErkJggg=="
        />
      </defs>
    </svg>
  );
};

export default LinkIcon;
