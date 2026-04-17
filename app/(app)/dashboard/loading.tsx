export default function Loading() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto space-y-6 animate-pulse">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded-md" />
        <div className="h-7 w-48 bg-muted rounded-md" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Latest scan card */}
      <div className="h-40 bg-muted rounded-2xl" />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-muted rounded-xl" />
        <div className="h-24 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
