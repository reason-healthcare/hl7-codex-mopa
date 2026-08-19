import Link from "next/link";
import OrderEntryClient from "./OrderEntryClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderEntryPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="px-5 py-4 space-y-4 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href={`/patients/${id}`} className="hover:text-slate-700 transition-colors">
          ← Chart Review
        </Link>
      </div>

      <OrderEntryClient patientId={id} />
    </div>
  );
}
