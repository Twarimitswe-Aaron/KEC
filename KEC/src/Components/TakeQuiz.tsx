import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  useGetQuizDataByQuizIdQuery,
  useSubmitQuizAttemptMutation,
  useGetMyAttemptQuery,
} from "../state/api/quizApi";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const TakeQuiz: React.FC = () => {
  const { id, quizId } = useParams();
  const courseId = Number(id);
  const qId = Number(quizId);
  const query = useQuery();
  const lessonId = Number(query.get("lessonId"));
  const formId = Number(query.get("formId"));
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetQuizDataByQuizIdQuery(
    { courseId, lessonId, quizId: qId, formId },
    { skip: !courseId || !lessonId || !qId || !formId }
  );

  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitQuiz, { isLoading: isSubmitting }] =
    useSubmitQuizAttemptMutation();
  const [result, setResult] = useState<{ score: number; total: number } | null>(
    null
  );
  const { data: myAttempt, refetch: refetchAttempt } = useGetMyAttemptQuery(
    qId,
    { skip: !qId }
  );

  const allowRetakes = Boolean((data as any)?.settings?.allowRetakes);
  const reviewMode = Boolean(myAttempt && !allowRetakes);

  useEffect(() => {
    if (myAttempt && data) {
      const map: Record<number, any> = {};
      (myAttempt.responses || []).forEach((r: any) => {
        map[r.questionId] = r.answer;
      });
      setAnswers(map);
      setResult({ score: myAttempt.score, total: myAttempt.totalPoints });
    }
  }, [myAttempt, data]);

  const handleChange = (question: any, value: any) => {
    if (question.type === "checkbox") {
      const raw = answers[question.id];
      const current: any[] = Array.isArray(raw) ? raw : [];
      const exists = current.includes(value);
      const next = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers((prev) => ({ ...prev, [question.id]: next }));
    } else {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    }
  };

  const onSubmit = async () => {
    if (!data) return;
    if (reviewMode) return;
    const responses = (data.questions || []).map((q: any) => ({
      questionId: q.id,
      answer: answers[q.id] ?? (q.type === "checkbox" ? [] : ""),
    }));
    try {
      const res = await submitQuiz({ quizId: data.id, responses }).unwrap();
      setResult({ score: res.score, total: res.totalPoints });
      await refetchAttempt();
    } catch (e) {
      // ignore
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading quiz…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Failed to load quiz</div>;
  }
  if (!data) return null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-gray-600 text-sm">{data.description}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 border rounded-md text-sm cursor-pointer"
        >
          Back
        </button>
      </div>

      {reviewMode && (
        <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
          Retakes are disabled. You are viewing your submitted answers and
          correct answers.
        </div>
      )}

      {result && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800">
          Score: {result.score} / {result.total}
        </div>
      )}

      <div className="space-y-5">
        {data.questions?.map((q: any, idx: number) => (
          <div key={q.id} className="bg-white border rounded-lg p-4">
            <div className="font-semibold text-gray-900 mb-2">
              {idx + 1}. {q.question}
            </div>
            {q.imageUrl && (
              <img
                src={q.imageUrl}
                alt="question"
                className="max-h-64 rounded mb-3 object-contain"
              />
            )}
            {q.type === "multiple" || q.type === "truefalse" ? (
              <div className="space-y-2">
                {(q.options || []).map((opt: string) => {
                  const correct =
                    Array.isArray(q.correctAnswers) && q.correctAnswers.length
                      ? String(q.correctAnswers[0])
                      : null;
                  const selected = answers[q.id];
                  const isCorrectOpt =
                    correct !== null && String(opt) === String(correct);
                  const isSelected = String(selected) === String(opt);
                  const cls = reviewMode
                    ? isCorrectOpt
                      ? "text-green-700"
                      : isSelected
                      ? "text-red-700"
                      : "text-gray-700"
                    : "text-gray-700";
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 text-sm ${cls}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt}
                        onChange={() => handleChange(q, opt)}
                        disabled={reviewMode}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === "checkbox" ? (
              <div className="space-y-2">
                {(q.options || []).map((opt: string) => {
                  const raw = answers[q.id];
                  const current: any[] = Array.isArray(raw) ? raw : [];
                  const checked = current.includes(opt);
                  const correctArr: any[] = Array.isArray(q.correctAnswers)
                    ? q.correctAnswers
                    : [];
                  const isCorrectOpt = correctArr
                    .map(String)
                    .includes(String(opt));
                  const cls = reviewMode
                    ? isCorrectOpt
                      ? "text-green-700"
                      : checked
                      ? "text-red-700"
                      : "text-gray-700"
                    : "text-gray-700";
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 text-sm ${cls}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleChange(q, opt)}
                        disabled={reviewMode}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            ) : q.type === "labeling" ? (
              <div className="space-y-2">
                {(q.correctAnswers || []).map((la: any) => (
                  <div
                    key={la.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="px-2 py-1 bg-gray-100 rounded font-semibold">
                      {la.label}
                    </span>
                    <input
                      type="text"
                      className={`border rounded px-2 py-1 text-sm ${
                        reviewMode
                          ? (
                              (Array.isArray(answers[q.id])
                                ? answers[q.id]
                                : []
                              ).find(
                                (x: any) => String(x.label) === String(la.label)
                              )?.answer || ""
                            )
                              .toString()
                              .trim()
                              .toLowerCase() ===
                            (la.answer || "").toString().trim().toLowerCase()
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                          : ""
                      }`}
                      placeholder={`Answer for ${la.label}`}
                      value={
                        (Array.isArray(answers[q.id])
                          ? answers[q.id]
                          : []
                        ).find((x: any) => x.label === la.label)?.answer || ""
                      }
                      onChange={(e) => {
                        const current: any[] = Array.isArray(answers[q.id])
                          ? answers[q.id]
                          : [];
                        const idx = current.findIndex(
                          (x) => x.label === la.label
                        );
                        const next = [...current];
                        if (idx >= 0)
                          next[idx] = {
                            label: la.label,
                            answer: e.target.value,
                          };
                        else
                          next.push({
                            label: la.label,
                            answer: e.target.value,
                          });
                        setAnswers((prev) => ({ ...prev, [q.id]: next }));
                      }}
                      disabled={reviewMode}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={onSubmit}
          disabled={isSubmitting || reviewMode}
          className="px-4 py-2 bg-[#034153] text-white rounded-md text-sm cursor-pointer disabled:opacity-60"
        >
          {reviewMode
            ? "Retakes Disabled"
            : myAttempt && allowRetakes
            ? "Retake & Submit"
            : isSubmitting
            ? "Submitting…"
            : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
};

export default TakeQuiz;
