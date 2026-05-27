import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
        <BarChart3 className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold mb-3">Report Not Found</h1>
      <p className="text-zinc-400 max-w-md mb-8">
        This audit report doesn&apos;t exist or has expired. Run your own free
        AI spend audit to see how much you can save.
      </p>
      <Link
        href="/audit"
        className="btn-primary inline-flex items-center gap-2"
      >
        Start Free Audit
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
