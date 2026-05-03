import type { ReactNode } from "react";

const ContainerHeader = ({ children }: { children: ReactNode }) => (
  <h3 className="text-h5 font-bold mb-6">{children}</h3>
);

export default ContainerHeader;
