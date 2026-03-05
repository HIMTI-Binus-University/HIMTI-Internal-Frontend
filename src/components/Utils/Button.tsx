import { ReactNode } from "react";

type ButtonProps = {
  text: string;
  icon?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "primary" | "danger" | "warning";
  disabled?: boolean;
  loading?: boolean;
};

const Button = ({
  text,
  icon,
  onClick,
  type = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) => {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          px-5 py-3 rounded-xl flex items-center gap-2 text-body-1
          transition-all duration-200
          ${
            type === "danger"
              ? "bg-danger-500 hover:bg-danger-600"
              : type === "warning"
              ? "bg-warning-500 hover:bg-warning-600"
              : "bg-primary-600 hover:bg-primary-700"
          }
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}
          text-white
        `}
      >
        {loading ? "Loading..." : <>
          {icon}
          {text}
        </>}
      </button>
    </div>
  );
};

export default Button;
