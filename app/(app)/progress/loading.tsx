export default function Loading() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-7 w-24 bg-muted rounded-md" />
      <div className="h-56 bg-muted rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
      <div className="h-40 bg-muted rounded-2xl" />
    </div>
  );
}
