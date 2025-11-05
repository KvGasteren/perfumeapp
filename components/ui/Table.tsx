import { ReactNode } from "react";
import { cn } from "@/lib/utils"; // adjust if your utils file is elsewhere

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-neutral-200 bg-white",
        className
      )}
    >
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead className={cn("bg-neutral-50 text-neutral-500", className)}>
      {children}
    </thead>
  );
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  // if clickable, add cursor + transition
  const clickable = typeof onClick === "function";
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b last:border-b-0",
        clickable &&
          "cursor-pointer transition-colors hover:bg-neutral-50 active:bg-neutral-100",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  width,
  className,
}: {
  children: ReactNode;
  width?: string;
  className?: string;
}) {
  return (
    <th
      className={cn("px-4 py-2 text-xs font-medium uppercase tracking-wide", className)}
      style={{ width }}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-2 align-top", className)}>{children}</td>;

}
