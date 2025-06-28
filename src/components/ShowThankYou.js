import React from "react";
import Image from "next/image";

export default function ShowThankYou({ alreadyParticipated = false }) {
  return (
    <div className="flex h-full min-h-[300px] w-[85vw] flex-col items-center justify-center rounded-md bg-white/90 p-8 shadow-lg">
      {alreadyParticipated ? (
        <>
          <h2 className="mb-4 text-2xl font-bold text-yellow-600">
            شما قبلاً شرکت کرده‌اید
          </h2>
          <p className="mb-2 text-lg text-gray-700">
            شما قبلاً در این نظرسنجی شرکت کرده‌اید.
          </p>
          <p className="text-md mb-5 text-gray-500">
            از مشارکت شما سپاسگزاریم.
          </p>
          <Image
            src="/1111.png"
            alt="logo"
            width={180}
            height={80}
            className=""
          />
        </>
      ) : (
        <>
          <h2 className="mb-4 text-2xl font-bold text-green-600">ممنونیم!</h2>
          <p className="mb-2 text-center text-lg text-gray-700">
            از اینکه در نظرسنجی ما شرکت کردید سپاسگزاریم.
          </p>
          <p className="text-md mb-4 text-center text-gray-500">
            نظرات شما به ما کمک می‌کند خدمات بهتری ارائه دهیم.
          </p>
          <Image
            src="/1111.png"
            alt="logo"
            width={180}
            height={80}
            className=""
          />
        </>
      )}
    </div>
  );
}
