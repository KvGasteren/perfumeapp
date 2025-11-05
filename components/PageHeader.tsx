export default function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
 return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
