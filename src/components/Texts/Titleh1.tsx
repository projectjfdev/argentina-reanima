import React from "react";

interface Titleh1Props {
  title: string;
  className?: string;
}

interface Titleh1Props {
  title: string;
  className?: string;
}

export const Titleh1 = ({ title, className }: Titleh1Props) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h1
        className="
          text-center
          text-2xl
          md:text-3xl
          lg:text-4xl
          font-semibold
          leading-tight
          text-gray-800
          dark:text-white
        "
      >
        {title}
      </h1>

      <div className="mt-3 h-1.5 w-20 rounded-full bg-primary" />
    </div>
  );
};
