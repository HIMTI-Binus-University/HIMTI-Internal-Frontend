import type { ReactNode } from "react";

const Container = ({ children }: { children: ReactNode }) => (
  <div className="bg-white rounded-xl shadow p-6">{children}</div>
);

export default Container;
