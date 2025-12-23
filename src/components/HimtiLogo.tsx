import React from "react";
import logoUrl from "../assets/logo-himti.svg";

type Props = {
  className?: string;
};

const HimtiLogo = ({ className }: Props) => {
  return <img src={logoUrl} alt="HIMTI Logo" className={className} />;
};

export default HimtiLogo;
