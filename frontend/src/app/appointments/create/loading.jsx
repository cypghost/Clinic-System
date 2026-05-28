import Navbar from "@/components/Navbar";

function SkeletonSection({ rows = 2 }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
      <div className="h-3 w-36 bg-zinc-200 rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="h-2.5 w-20 bg-zinc-100 rounded mb-1.5" />
            <div className="h-10 w-full bg-zinc-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreateLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">

        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-8 h-8 bg-zinc-200 rounded-lg animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-5 w-40 bg-zinc-200 rounded animate-pulse" />
            <div className="h-3.5 w-28 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Section skeletons */}
        <div className="space-y-4">
          <SkeletonSection rows={2} />
          <SkeletonSection rows={2} />
          <SkeletonSection rows={2} />
        </div>

        {/* Button skeleton */}
        <div className="flex gap-3 pt-5">
          <div className="h-10 flex-1 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="h-10 flex-1 bg-zinc-200 rounded-lg animate-pulse" />
        </div>
      </main>
    </div>
  );
}
