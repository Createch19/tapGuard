import Link from "next/link";
import { AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CardStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; slug?: string; name?: string }>;
}) {
  const { status, slug, name } = await searchParams;

  let title = "Card Status Notice";
  let message = "This card cannot be processed at the moment.";
  let badge = "Notice";

  if (status === "not_found") {
    title = "Card Not Registered";
    message = `We could not find any active NFC review card matching identifier "${slug || "unknown"}". Please check the QR code or tap again.`;
    badge = "Unrecognized Card";
  } else if (status === "deactivated") {
    title = "Card Temporarily Inactive";
    message = `This review card for ${name || "this location"} has been paused by the business management.`;
    badge = "Deactivated";
  } else if (status === "lost") {
    title = "Card Reported Lost";
    message = "This card has been marked as misplaced or lost and has been retired.";
    badge = "Retired";
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
          {status === "lost" ? <ShieldAlert className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>

        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-100/70 rounded-full mb-3">
          {badge}
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">{message}</p>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to TapGate Home
          </Link>
        </div>
      </div>
    </div>
  );
}
