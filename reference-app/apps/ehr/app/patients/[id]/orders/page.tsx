import Link from "next/link";
import OrderEntryClient from "./OrderEntryClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderEntryPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const dtrReturnRegimenId =
    query["dtr-complete"] === "true" && typeof query.regimen === "string"
      ? query.regimen
      : undefined;

  return (
    <div className="px-5 py-4 space-y-4 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href={`/patients/${id}`} className="hover:text-slate-700 transition-colors">
          ← Chart Review
        </Link>
      </div>

      <OrderEntryClient patientId={id} dtrReturnRegimenId={dtrReturnRegimenId} />
    </div>
  );
}
