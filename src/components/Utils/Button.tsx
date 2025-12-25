// UNTUK RESOLVE PROPS GABOLE 'ANY' TYPE
import { ReactNode } from "react";

type ButtonProps = {
  text: string;
  icon?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "primary" | "danger" | "warning";
};

const Button = ( { text, icon, onClick, type="primary" }: ButtonProps ) => {
    return (
        <>
        <div className="flex justify-end">
          <button
            onClick={onClick}
            className={`
              text-white px-5 py-3 rounded-xl
              flex items-center gap-2
              transition-all duration-200
              hover:cursor-pointer
              ${
                type === "danger"
                  ? "bg-danger-500 hover:bg-danger-600"
                  : type === "warning"
                  ? "bg-warning-500 hover:bg-warning-600"
                  : "bg-primary-600 hover:bg-primary-700"
              }
            `}
          >
            {icon} {text}
          </button>
        </div>
        </>
    );
}
 
export default Button;