"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@heroui/button";
import { Rating } from "react-simple-star-rating";
import LoadingOverlay from "@/components/LoadingOverlay";

const questions = [
  "از تجربه کلی خود در هلیوم پارک چقدر راضی بودید؟",
  "رفتار کارکنان چگونه بود؟",
  "نظافت مجموعه را چگونه ارزیابی می‌کنید؟",
  "امکانات بازی چقدر جذاب بود؟",
  "قیمت خدمات چقدر منصفانه بود؟",
  "امنیت مجموعه را چگونه ارزیابی می‌کنید؟",
  "آیا فضای پارک برای کودکان مناسب بود؟",
  "میزان رضایت شما از بخش پذیرایی؟",
  "احتمال اینکه هلیوم پارک را به دیگران توصیه کنید؟",
  "احساس کلی شما نسبت به مجموعه؟",
];

const validationSchema = Yup.object().shape({
  score: Yup.number()
    .min(1, "حداقل امتیاز 1 است")
    .max(5, "حداکثر امتیاز 5 است")
    .nullable(), // اجازه می‌ده خالی بمونه
  badReason: Yup.string().when("score", {
    is: 1,
    then: schema => schema.required("لطفاً دلیل نارضایتی را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
});

export default function SurveyForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const formik = useFormik({
    initialValues: { score: null, badReason: "" },
    validationSchema,
    onSubmit: values => {
      const newAnswers = {
        ...answers,
        ["question" + (step + 1)]: values.score ?? null,
        ...(values.score === 1
          ? { ["badReason" + (step + 1)]: values.badReason }
          : {}),
      };
      setAnswers(newAnswers);

      if (step < questions.length - 1) {
        const nextStep = step + 1;
        const nextKey = "question" + (nextStep + 1);
        const nextValue = newAnswers[nextKey] ?? null;

        setStep(nextStep);
        formik.resetForm({
          values: {
            score: nextValue,
            badReason: "",
          },
        });
      } else {
        console.log("ارسال نهایی:", newAnswers);
        // ارسال به سرور
      }
    },
  });

  const handlePrevious = () => {
    const prevStep = step - 1;
    const prevKey = "question" + (prevStep + 1);
    const prevValue = answers[prevKey] ?? null;

    setStep(prevStep);
    formik.setValues({
      score: prevValue,
      badReason: "",
    });
  };

  const getEmoji = value => {
    if (value === null || value === 0) return "🤔";
    if (value <= 1) return "😡";
    if (value <= 2) return "😞";
    if (value <= 3) return "😐";
    if (value <= 4) return "🙂";
    return "😄";
  };

  // if(true){
  //   return <LoadingOverlay/>
  // }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 px-2"
      style={{
        backgroundImage: "url('/k2.jpg')",
      }}
    >
      {true ? (
        <LoadingOverlay />
      ) : (
        <div className="relative mx-auto mt-10 h-full min-h-[300px] w-[80vw] max-w-md rounded-md border bg-white/95 px-3 py-4 shadow-lg">
          <h2 className="text-md mb-5 font-bold">
            سؤال {step + 1} از {questions.length}
          </h2>

          <p className="text-md mb-6 font-medium text-gray-700">
            {questions[step]}
          </p>

          <form
            onSubmit={formik.handleSubmit}
            className="flex h-full flex-col justify-between"
          >
            <div className="text-center">
              <Rating
                onClick={rate => formik.setFieldValue("score", rate)}
                size={56}
                allowFraction={true}
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
                SVGclassName="inline-block drop-shadow-lg"
                className="mx-auto space-x-3 text-3xl rtl:space-x-reverse"
                style={{ marginBottom: 4, gap: 24 }}
              />

              <div className="mt-3 text-2xl">
                {getEmoji(formik.values.score)}
              </div>

              {(formik.values.score === 1 || formik.values.score === 0.5) && (
                <div className="mb-10 mt-3">
                  <label
                    htmlFor="badReason"
                    className="mb-2 block text-sm font-medium text-red-600"
                  >
                    لطفاً دلیل نارضایتی خود را بنویسید:
                  </label>
                  <textarea
                    id="badReason"
                    name="badReason"
                    className="w-full rounded border border-red-400 p-2 text-sm focus:border-red-600 focus:ring-2 focus:ring-red-200"
                    rows={3}
                    value={formik.values.badReason || ""}
                    onChange={formik.handleChange}
                    placeholder="دلیل..."
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

              <Button
                type="submit"
                variant="shadow"
                color="default"
                radius="sm"
              >
                {step === questions.length - 1 ? "ارسال نهایی" : "سؤال بعدی"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
