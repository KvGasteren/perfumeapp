import { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-neutral-50 text-neutral-500">{children}</thead>;
}

export function TR({ children }: { children: ReactNode }) {
  return <tr className="border-b last:border-b-0">{children}</tr>;
}

export function TH({
  children,
  width,
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <th className="px-4 py-2 font-medium" style={{ width }}>
      {children}
    </th>
  );
}

export function TD({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2 align-top">{children}</td>;
}
