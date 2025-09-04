"use client";
import React from 'react';

export const Card = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg bg-white/90 border p-0 ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-4 py-3 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`text-lg font-semibold ${className}`}>{children}</div>
);

export const CardDescription = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export default Card;
