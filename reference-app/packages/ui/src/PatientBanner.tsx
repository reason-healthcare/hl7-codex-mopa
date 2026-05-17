import type { Patient } from "@ogca/fhir-client";

interface PatientBannerProps {
  patient: Patient;
}

export function PatientBanner({ patient }: PatientBannerProps) {
  const name = patient.name?.[0];
  const displayName = name
    ? [name.given?.join(" "), name.family].filter(Boolean).join(" ")
    : (patient.id ?? "Unknown");

  return (
    <div className="bg-blue-900 text-white px-6 py-3 flex items-center gap-6 text-sm">
      <span className="font-semibold text-base">{displayName}</span>
      {patient.birthDate && <span>DOB: {patient.birthDate}</span>}
      {patient.gender && <span className="capitalize">Sex: {patient.gender}</span>}
      {patient.id && <span className="text-blue-300">ID: {patient.id}</span>}
    </div>
  );
}
