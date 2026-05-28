import Navbar from "@/components/Navbar";

function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-100 rounded-xl px-5 py-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-10 space-y-1.5 text-center">
          <div className="h-2.5 w-6 mx-auto bg-zinc-200 rounded" />
          <div className="h-6 w-8 mx-auto bg-zinc-200 rounded" />
        </div>
        <div className="hidden sm:block w-px h-9 bg-zinc-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-40 bg-zinc-200 rounded" />
            <div className="h-5 w-16 bg-zinc-100 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-2.5 w-24 bg-zinc-100 rounded" />
            <div className="h-2.5 w-16 bg-zinc-100 rounded" />
          </div>
        </div>
        <div className="h-4 w-4 bg-zinc-100 rounded shrink-0" />
      </div>
    </div>
  );
}

export default function AppointmentsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8">

        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-zinc-200 rounded animate-pulse" />
            <div className="h-3.5 w-28 bg-zinc-100 rounded animate-pulse" />
          </div>
          <div className="h-9 w-40 bg-zinc-200 rounded-lg animate-pulse" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-2 mb-5">
          {[48, 80, 96, 96, 96].map((w, i) => (
            <div
              key={i}
              className="h-8 bg-zinc-200 rounded-lg animate-pulse"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Card skeletons */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
