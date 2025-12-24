import {
  FaPlus,
} from "react-icons/fa";

// UNTUK RESOLVE PROPS GABOLE 'ANY' TYPE
import { ReactNode } from "react";

type ButtonProps = {
  text: string;
  icon?: ReactNode;
};
// UNTUK RESOLVE PROPS GABOLE 'ANY' TYPE

const Button = ( { text, icon }: ButtonProps ) => {
    return (
        <>
        <div className="flex justify-end">
            <button className="bg-primary-600 text-white px-5 text-body-1 py-3 rounded-xl flex items-center gap-2 transition-all duration-200
                                 hover:cursor-pointer hover:bg-primary-700">
            {icon} {text}
            </button>
        </div>
        </>
    );
}
 
export default Button;