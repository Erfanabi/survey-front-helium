"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@heroui/button";
import { Rating } from "react-simple-star-rating";
import { Textarea } from "@heroui/input";
import LoadingOverlay from "@/components/LoadingOverlay";
import ShowThankYou from "@/components/ShowThankYou";
import { useSearchParams } from "next/navigation";

const getValidationSchema = Yup.object().shape({
  score: Yup.number()
    .min(0, "حداقل امتیاز ۰ است")
    .max(10, "حداکثر امتیاز ۱۰ است")
    .nullable()
    .when(["$type"], {
      is: val => val === "text",
      then: schema => schema.notRequired(),
    }),
  badReason: Yup.string().when(["score", "$type"], {
    is: (score, type) => type === "rating" && [1, 2, 9, 10].includes(score),
    then: schema => schema.required("لطفاً توضیحات را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
  finalComment: Yup.string().when(["$type"], {
    is: val => val === "text",
    then: schema => schema.required("لطفاً نظر خود را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
});

export default function SurveyForm() {
  const searchParams = useSearchParams();

  // console.log(searchParams.get("id"));

  const id = searchParams?.get("id");

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionsState, setQuestionsState] = useState({
    questions: [],
    loading: true,
    fetchError: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [participationState, setParticipationState] = useState({
    flag: false,
    sentFlag: false,
  });
  const [introductionWays, setIntroductionWays] = useState([]);

  useEffect(() => {
    const fetchParticipated = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SUBMIT_SURVEY}/${id}`,
        );
        if (!res.ok) throw new Error("خطا در دریافت");
        const data = await res.json();
        setParticipationState({
          flag: data?.data?.flag || false,
          sentFlag: data?.data?.sentFlag || false,
        });
      } catch (err) {
        console.log({ err });
      }
    };

    const fetchQuestions = async () => {
      setQuestionsState({ questions: [], loading: true, fetchError: null });

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_QUESTIONS);
        if (!res.ok) throw new Error("خطا در دریافت سوالات");
        const data = await res.json();

        setQuestionsState({
          questions: data?.data?.questions || [],
          loading: false,
          fetchError: null,
        });
      } catch (err) {
        setQuestionsState({
          questions: [],
          loading: false,
          fetchError: err.message,
        });
      }
    };

    const fetchIntroductionWays = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_INTRODUCTION_WAYS}`,
        );
        if (!res.ok) throw new Error("خطا در دریافت");
        const data = await res.json();
        setIntroductionWays(data.data.introduction_ways);
      } catch (err) {
        console.log({ err });
      }
    };

    fetchParticipated();

    fetchQuestions();

    fetchIntroductionWays();
  }, []);

  const questions = questionsState.questions;
  const loading = questionsState.loading;
  const fetchError = questionsState.fetchError;

  const question = questions[step];
  const isLastStep = step === questions.length - 1;

  const formik = useFormik({
    initialValues: {
      score: null,
      badReason: "",
      finalComment: "",
    },
    validationSchema: getValidationSchema,
    validateOnChange: false,
    context: { type: question?.type },
    onSubmit: async values => {
      if (!isLastStep) {
        const questionKey = `question${step + 1}`;
        const newAnswers = { ...answers };
        // ذخیره مقدار امتیاز و توضیحات برای هر سوال
        newAnswers[questionKey] = values.score;
        newAnswers[`badReason${step + 1}`] = values.badReason;
        newAnswers[`finalComment${step + 1}`] = values.finalComment;
        setAnswers(newAnswers);
        const nextStep = step + 1;
        const nextKey = `question${nextStep + 1}`;
        const nextValue = newAnswers[nextKey] ?? null;
        const nextBadReason = newAnswers[`badReason${nextStep + 1}`] ?? "";
        const nextFinalComment =
          newAnswers[`finalComment${nextStep + 1}`] ?? "";
        setStep(nextStep);
        formik.resetForm({
          values: {
            score: nextValue,
            badReason: nextBadReason,
            finalComment: nextFinalComment,
          },
        });
        setTimeout(() => {
          formik.setFormikState(prev => ({
            ...prev,
            context: { type: questions[nextStep].type },
          }));
        }, 0);
      } else {
        // ساختن body برای ارسال
        const response = questions.map((q, idx) => {
          const questionKey = `question${idx + 1}`;
          const badReasonKey = `badReason${idx + 1}`;
          const finalCommentKey = `finalComment${idx + 1}`;
          let value = answers[questionKey] ?? null;
          let desc = null;
          if (q.TypeId === 1) {
            desc = answers[badReasonKey] ?? null;
            value = value === "" ? null : value;
            desc = desc === "" ? null : desc;
          } else if (q.TypeId === 2) {
            desc = answers[finalCommentKey] ?? null;
            value = value === "" ? null : value;
            desc = desc === "" ? null : desc;
          } else if (q.TypeId === 3) {
            desc = answers[finalCommentKey] ?? null;
            value = null;
            desc = desc === "" ? null : desc;
          } else if (q.TypeId === 4) {
            // For introductionWays, store the selected id as value
            value = answers[questionKey] ?? null;
            desc = null;
            value = value === "" ? null : value;
          }
          return {
            questionId: Number(q.id),
            value: value !== null ? String(value) : null,
            desc,
          };
        });
        setSubmitting(true);
        console.log(response);

        // try {
        //   const res = await fetch(
        //     `${process.env.NEXT_PUBLIC_API_SUBMIT_SURVEY}/${id}`,
        //     {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify({ response }),
        //     },
        //   );

        //   console.log(res);

        //   // if (!res.ok) throw new Error("خطا در ارسال اطلاعات");

        //   const data = await res.json(); // یا res.text() اگر پاسخ متنی باشد
        //   console.log("Response data:", data);

        //   setShowThankYou(true);
        //   console.log({ response });

        //   // موفقیت
        //   // اینجا می‌توانید پیام موفقیت یا ریدایرکت بگذارید
        // } catch (e) {
        //   console.error("Error:", e);
        //   // خطا
        //   // اینجا می‌توانید پیام خطا نمایش دهید
        // } finally {
        //   setSubmitting(false);
        // }
      }
    },
  });

  const handlePrevious = () => {
    const prevStep = step - 1;
    const prevKey = `question${prevStep + 1}`;
    const prevValue = answers[prevKey] ?? null;
    const prevBadReason = answers[`badReason${prevStep + 1}`] ?? "";
    const prevFinalComment = answers[`finalComment${prevStep + 1}`] ?? "";
    setStep(prevStep);
    formik.setValues({
      score: prevValue,
      badReason: prevBadReason,
      finalComment: prevFinalComment,
    });
    setTimeout(() => {
      formik.setFormikState(prev => ({
        ...prev,
        context: { type: questions[prevStep].type },
      }));
    }, 0);
  };

  const getEmoji = value => {
    if (value === null || value === 0) return "🤔";
    if (value <= 2) return "😡";
    if (value <= 4) return "😞";
    if (value <= 6) return "😐";
    if (value <= 8) return "🙂";
    return "😄";
  };

  if (loading || submitting) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 px-2"
        style={{ backgroundImage: "url('/k2.jpg')" }}
      >
        <LoadingOverlay />;
      </div>
    );
  }

  // اگر id وجود نداشت، پیام خطا نمایش بده
  if (!id || !participationState.sentFlag) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 px-2"
        style={{ backgroundImage: "url('/k2.jpg')" }}
      >
        <div className="flex h-full min-h-[250px] w-[85vw] flex-col items-center justify-center rounded-md bg-white/90 p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">لینک نامعتبر</h2>
          <p className="mb-2 text-lg text-gray-700">
            لینک اعتبارسنجی معتبر نمی‌باشد.
          </p>
          <p className="text-md text-gray-500">
            لطفاً از لینک صحیح استفاده کنید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 px-2"
      style={{ backgroundImage: "url('/k2.jpg')" }}
    >
      {participationState.flag ? (
        <ShowThankYou alreadyParticipated />
      ) : showThankYou ? (
        <ShowThankYou />
      ) : (
        <div className="relative mx-auto mt-10 h-full min-h-[290px] w-[85vw] max-w-md rounded-md border bg-white/95 px-3 py-4 shadow-lg">
          <h2 className="text-md mb-5 font-bold">
            سؤال {step + 1} از {questions.length}
          </h2>

          <p className="text-md mb-6 font-medium text-gray-700">
            {question?.Description}
          </p>

          <form
            onSubmit={formik.handleSubmit}
            className="flex h-full flex-col justify-between"
          >
            <div className="text-center">
              {question?.TypeId === 1 && (
                <div className="mb-12">
                  <Rating
                    onClick={rate => {
                      // هر ستاره کامل ۲ امتیاز، نیم ستاره ۱ امتیاز
                      let score = Math.round(rate * 2);
                      formik.setFieldValue("score", score);
                    }}
                    size={40}
                    allowFraction
                    initialValue={
                      formik.values.score ? formik.values.score / 2 : 0
                    }
                    fillColorArray={[
                      "#ef4444",
                      "#f59e0b",
                      "#fbbf24",
                      "#10b981",
                      "#22c55e",
                    ]}
                    transition
                    allowHover
                    fillIcon={"★"}
                    emptyIcon={"☆"}
                    className="mx-auto space-x-3 text-3xl rtl:space-x-reverse"
                  />

                  <div className="mt-3 text-2xl">
                    {getEmoji(formik.values.score)}
                  </div>

                  {[1, 2, 3, 4, 5, 6, 9, 10].includes(formik.values.score) && (
                    <div className="mt-3">
                      <Textarea
                        id="badReason"
                        name="badReason"
                        // label="لطفاً توضیحات خود را بنویسید:"
                        // label={
                        //   formik.values.score < 3
                        //     ? "لطفا دلیل نارضایتی خود را بنویسید:"
                        //     : "چرا رضایت بخش بود:"
                        // }
                        className="col-span-12 mb-6 md:col-span-6 md:mb-0"
                        classNames={{
                          inputWrapper:
                            "!bg-white border-[1.5px] border-gray-400",
                        }}
                        labelPlacement="outside"
                        color={formik.values.score < 3 ? "danger" : "success"}
                        placeholder="اگه می خوای دلیلشو اینجا بنویس:"
                        variant="bordered"
                        value={formik.values.badReason || ""}
                        onChange={formik.handleChange}
                        radius="sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {question?.TypeId === 2 && (
                <div className="mb-12">
                  <div className="mb-3 mt-1 flex justify-center gap-6">
                    {/* دکمه بله */}
                    <button
                      type="button"
                      onClick={async () => {
                        await formik.setFieldValue("score", 1, false);
                        formik.setFormikState(prev => ({
                          ...prev,
                          context: { type: "boolean" },
                        }));
                      }}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition duration-200 ${
                        formik.values.score === 1
                          ? "border-2 border-black bg-gray-100 shadow-inner"
                          : "border border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      👍 بله
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await formik.setFieldValue("score", 0, false);
                        formik.setFormikState(prev => ({
                          ...prev,
                          context: { type: "boolean" },
                        }));
                      }}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition duration-200 ${
                        formik.values.score === 0
                          ? "border-2 border-black bg-gray-100 shadow-inner"
                          : "border border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      👎 خیر
                    </button>
                  </div>
                  <Textarea
                    id="finalComment"
                    name="finalComment"
                    className="col-span-12 mb-6 bg-white md:col-span-6 md:mb-0"
                    classNames={{
                      inputWrapper: "border-[1.5px] border-gray-400",
                    }}
                    labelPlacement="outside"
                    color="primary"
                    placeholder="اگه می خوای دلیلشو اینجا بنویس:"
                    variant="bordered"
                    value={formik.values.finalComment}
                    onChange={formik.handleChange}
                    radius="sm"
                  />
                </div>
              )}

              {question?.TypeId === 3 && (
                <div className="mb-10 mt-1 text-right">
                  <Textarea
                    id="finalComment"
                    name="finalComment"
                    className="col-span-12 mb-6 bg-white md:col-span-6 md:mb-0"
                    classNames={{
                      inputWrapper: "border-[1.5px] border-gray-400",
                    }}
                    labelPlacement="outside"
                    color="primary"
                    placeholder="..."
                    variant="bordered"
                    value={formik.values.finalComment}
                    onChange={e => {
                      formik.handleChange(e);
                      // مقدار desc را در answers ذخیره کن
                      setAnswers(prev => ({
                        ...prev,
                        [`finalComment${step + 1}`]: e.target.value,
                      }));
                    }}
                    radius="sm"
                  />
                </div>
              )}

              {/* Type 4: Introduction Ways */}
              {question?.TypeId === 4 && (
                <div className="mb-10 mt-1 text-center">
                  <div className="flex flex-col items-center gap-2 pb-5">
                    {introductionWays.map(way => (
                      <label
                        key={way.id}
                        className={`flex w-full max-w-xs cursor-pointer items-center rounded border px-2 py-2 text-right transition-all ${formik.values.score === way.id ? "border-2 border-blue-600 bg-blue-50" : "border border-gray-300 bg-white hover:bg-gray-50"}`}
                      >
                        <input
                          type="radio"
                          name="score"
                          value={way.id}
                          checked={formik.values.score === way.id}
                          onChange={() => {
                            formik.setFieldValue("score", way.id);
                            setAnswers(prev => ({
                              ...prev,
                              [`question${step + 1}`]: way.id,
                            }));
                          }}
                          className="ml-1 mr-2 accent-blue-600"
                        />
                        {way.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-4">
              {step > 0 && (
                <Button
                  radius="sm"
                  variant="light"
                  color="danger"
                  onClick={handlePrevious}
                  type="button"
                >
                  قبلی
                </Button>
              )}

              <Button
                type="submit"
                variant="solid"
                color="primary"
                radius="sm"
                isLoading={submitting}
              >
                {isLastStep ? "ارسال نهایی" : "سؤال بعدی"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
