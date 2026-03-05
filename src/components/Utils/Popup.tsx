import { ReactNode } from "react";

type PopupProps = {
  component?: ReactNode;
};

const Popup = ({ component }:PopupProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
        <div className="absolute inset-0 bg-black/50" />
          {component}
        </div>
    );
}
 
export default Popup;