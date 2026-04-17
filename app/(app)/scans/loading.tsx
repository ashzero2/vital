export default function Loading() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-7 w-24 bg-muted rounded-md" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-muted rounded-2xl" />
      ))}
    </div>
  );
}
