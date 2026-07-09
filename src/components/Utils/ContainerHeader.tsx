import type { ReactNode } from "react";

const ContainerHeader = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-4 text-lg font-semibold leading-7 tracking-tight text-foreground">
    {children}
  </h2>
);

export default ContainerHeader;
