"use client";

import { useState } from "react";
import type {
  QItem,
  QuestionnaireAnswer,
  QuestionnaireDef,
} from "../lib/questionnaire-gen";

interface QuestionnaireFormProps {
  questionnaire: QuestionnaireDef;
  patientId: string;
  ehrBaseUrl: string;
  returnRegimen: string | null;
}

type Answers = Record<string, QuestionnaireAnswer>;

export default function QuestionnaireForm({
  questionnaire,
  patientId,
  ehrBaseUrl,
  returnRegimen,
}: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [qrId, setQrId] = useState<string | undefined>(undefined);

  const allAnswered = questionnaire.items.every((item) => {
    const answer = answers[item.linkId];
    return typeof answer === "string" ? answer.trim().length > 0 : answer !== undefined;
  });

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          answers,
          items: questionnaire.items,
          questionnaireCanonical: questionnaire.canonical,
          contextReference: questionnaire.contextReference,
          coverageReference: questionnaire.coverageReference,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const result = (await res.json()) as { qrId?: string };
      setQrId(result.qrId);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const returnUrl = new URL(`/patients/${patientId}/orders`, ehrBaseUrl);
    returnUrl.searchParams.set("dtr-complete", "true");
    if (returnRegimen) returnUrl.searchParams.set("regimen", returnRegimen);
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 text-green-800">
          <span className="text-lg">✓</span>
          <span className="font-medium">Documentation saved</span>
        </div>
        <p className="text-sm text-green-700">
          {qrId && (
            <>
              QuestionnaireResponse saved (id: <code className="font-mono text-xs">{qrId}</code>).{" "}
            </>
          )}
          Coded clinical answers were written to the EHR FHIR server. Return to the EHR to re-evaluate the order.
        </p>
        <a
          href={returnUrl.toString()}
          className="inline-block px-4 py-2 bg-green-700 text-white text-sm font-medium rounded hover:bg-green-800 transition-colors"
        >
          Return to EHR → Re-evaluate Order
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {questionnaire.items.map((item) => (
        <QuestionItem
          key={item.linkId}
          item={item}
          answer={answers[item.linkId]}
          onAnswer={(answer) => setAnswers((prev) => ({ ...prev, [item.linkId]: answer }))}
        />
      ))}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="px-5 py-2 bg-purple-700 text-white text-sm font-medium rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Saving…" : "Submit Documentation"}
      </button>
    </div>
  );
}

function QuestionItem({
  item,
  answer,
  onAnswer,
}: {
  item: QItem;
  answer: QuestionnaireAnswer | undefined;
  onAnswer: (answer: QuestionnaireAnswer) => void;
}) {
  if (item.type === "text") {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
        <label htmlFor={item.linkId} className="text-sm font-medium text-slate-800">
          {item.text}
        </label>
        <textarea
          id={item.linkId}
          value={typeof answer === "string" ? answer : ""}
          onChange={(event) => onAnswer(event.target.value)}
          required
          rows={4}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700"
        />
      </div>
    );
  }

  const selected = typeof answer === "string" ? undefined : answer;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
      <p className="text-sm font-medium text-slate-800">{item.text}</p>
      <div className="space-y-1.5">
        {item.answerOption.map((opt) => (
          <label key={opt.valueCoding.code} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={item.linkId}
              checked={selected?.code === opt.valueCoding.code}
              onChange={() => onAnswer(opt.valueCoding)}
              className="accent-purple-700"
            />
            <span className="text-sm text-slate-700">{opt.valueCoding.display}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
