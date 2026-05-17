import type { Patient } from "./schemas";

export function getPatientDisplayName(patient: Patient): string {
  const name = patient.name?.[0];
  if (!name) return patient.id ?? "Unknown";
  if (name.text) return name.text;
  const given = name.given?.join(" ") ?? "";
  const family = name.family ?? "";
  return [given, family].filter(Boolean).join(" ") || (patient.id ?? "Unknown");
}

export function getPatientDOB(patient: Patient): string {
  return patient.birthDate ?? "Unknown";
}

export function getPatientGender(patient: Patient): string {
  return patient.gender ?? "unknown";
}

export function getPatientMRN(patient: Patient): string | undefined {
  return patient.identifier?.find((i) => i.type?.coding?.some((c) => c.code === "MR"))?.value;
}
