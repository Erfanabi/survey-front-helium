"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@heroui/button";
import { Rating } from "react-simple-star-rating";
import { Textarea } from "@heroui/input";
import LoadingOverlay from "@/components/LoadingOverlay";

const questions = [
  { text: "از تجربه کلی خود در هلیوم پارک چقدر راضی بودید؟", type: "rating" },
  { text: "رفتار کارکنان چگونه بود؟", type: "rating" },
  { text: "نظافت مجموعه را چگونه ارزیابی می‌کنید؟", type: "rating" },
  { text: "امکانات بازی چقدر جذاب بود؟", type: "rating" },
  { text: "قیمت خدمات چقدر منصفانه بود؟", type: "rating" },
  { text: "امنیت مجموعه را چگونه ارزیابی می‌کنید؟", type: "rating" },
  { text: "آیا فضای پارک برای کودکان مناسب بود؟", type: "boolean" },
  { text: "میزان رضایت شما از بخش پذیرایی؟", type: "rating" },
  { text: "احتمال اینکه هلیوم پارک را به دیگران توصیه کنید؟", type: "rating" },
  { text: "نظر یا پیشنهاد کلی شما در مورد مجموعه را بنویسید", type: "text" },
];

const getValidationSchema = Yup.object().shape({
  score: Yup.number()
    .min(0, "حداقل امتیاز ۰ است")
    .max(5, "حداکثر امتیاز ۵ است")
    .nullable()
    .when("$type", {
      is: val => val === "text",
      then: schema => schema.notRequired(),
    }),
  badReason: Yup.string().when(["score", "$type"], {
    is: (score, type) => type === "rating" && score === 1,
    then: schema => schema.required("لطفاً دلیل نارضایتی را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
  finalComment: Yup.string().when("$type", {
    is: "text",
    then: schema => schema.required("لطفاً نظر خود را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
});

export default function SurveyForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
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
    context: { type: question.type },
    onSubmit: values => {
      const questionKey = `question${step + 1}`;
      const newAnswers = { ...answers };

      if (question.type === "text") {
        newAnswers[questionKey] = values.finalComment;
      } else {
        newAnswers[questionKey] = values.score;
        if (values.score === 1) {
          newAnswers[`badReason${step + 1}`] = values.badReason;
        }
      }

      setAnswers(newAnswers);

      if (!isLastStep) {
        const nextStep = step + 1;
        const nextKey = `question${nextStep + 1}`;
        const nextValue = newAnswers[nextKey] ?? null;

        setStep(nextStep);
        formik.resetForm({
          values: {
            score: nextValue,
            badReason: "",
            finalComment: "",
          },
        });
        setTimeout(() => {
          formik.setFormikState(prev => ({
            ...prev,
            context: { type: questions[nextStep].type },
          }));
        }, 0);
      } else {
        console.log("ارسال نهایی:", newAnswers);
        // اینجا می‌تونی اطلاعات رو به سرور بفرستی
      }
    },
  });

  const handlePrevious = () => {
    const prevStep = step - 1;
    const prevKey = `question${prevStep + 1}`;
    const prevValue = answers[prevKey] ?? null;
    const prevBadReason = answers[`badReason${prevStep + 1}`] ?? "";

    setStep(prevStep);
    formik.setValues({
      score: prevValue,
      badReason: prevBadReason,
      finalComment: "",
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
    if (value <= 1) return "😡";
    if (value <= 2) return "😞";
    if (value <= 3) return "😐";
    if (value <= 4) return "🙂";
    return "😄";
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 px-2"
      style={{ backgroundImage: "url('/k2.jpg')" }}
    >
      {false ? (
        <LoadingOverlay />
      ) : (
        <div className="relative mx-auto mt-10 h-full min-h-[300px] w-[80vw] max-w-md rounded-md border bg-white/95 px-3 py-4 shadow-lg">
          <h2 className="text-md mb-5 font-bold">
            سؤال {step + 1} از {questions.length}
          </h2>

          <p className="text-md mb-8 font-medium text-gray-700">
            {question.text}
          </p>

          <form
            onSubmit={formik.handleSubmit}
            className="flex h-full flex-col justify-between"
          >
            <div className="text-center">
              {question.type === "rating" && (
                <div className="mb-12">
                  <Rating
                    onClick={rate => formik.setFieldValue("score", rate)}
                    size={56}
                    allowFraction
                    initialValue={formik.values.score}
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

                  {(formik.values.score === 1 ||
                    formik.values.score === 0.5) && (
                    <div className="mt-3">
                      <Textarea
                        id="badReason"
                        name="badReason"
                        label="لطفاً دلیل نارضایتی خود را بنویسید:
"
                        className="col-span-12 mb-6 md:col-span-6 md:mb-0"
                        classNames={{
                          inputWrapper:
                            "!bg-white border-[1.5px] border-gray-400",
                        }}
                        labelPlacement="outside"
                        color="danger"
                        placeholder="دلیل..."
                        variant="bordered"
                        value={formik.values.badReason || ""}
                        onChange={formik.handleChange}
                        radius="sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {question.type === "boolean" && (
                <div className="mt-5 flex justify-center gap-6">
                  {/* دکمه بله */}
                  <button
                    type="button" // ❗ مهم
                    onClick={async () => {
                      await formik.setFieldValue("score", 1, false);
                      formik.setFormikState(prev => ({
                        ...prev,
                        context: { type: "boolean" },
                      }));
                      formik.submitForm();
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
                    type="button" // ❗ مهم
                    onClick={async () => {
                      await formik.setFieldValue("score", 0, false);
                      formik.setFormikState(prev => ({
                        ...prev,
                        context: { type: "boolean" },
                      }));
                      formik.submitForm();
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
              )}

              {question.type === "text" && (
                <div className="mb-16 mt-1 text-right">
                  <Textarea
                    id="finalComment"
                    name="finalComment"
                    className="col-span-12 mb-6 bg-white md:col-span-6 md:mb-0"
                    classNames={{
                      inputWrapper: "border-[1.5px] border-gray-400",
                    }}
                    labelPlacement="outside"
                    color="primary"
                    placeholder="نظر یا پیشنهاد خود را اینجا بنویسید..."
                    variant="bordered"
                    value={formik.values.finalComment}
                    onChange={formik.handleChange}
                    radius="sm"
                  />
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

              <Button type="submit" variant="solid" color="primary" radius="sm">
                {isLastStep ? "ارسال نهایی" : "سؤال بعدی"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
