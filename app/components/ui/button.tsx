"use client";
import React from 'react';

export const Button = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) => {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md bg-sky-600 text-white px-3 py-2 text-sm font-medium hover:bg-sky-700 disabled:opacity-60 ${className}`}
      suppressHydrationWarning={true}
    >
      {children}
    </button>
  );
};

export default Button;
