"use client";
import React from 'react';

export const Tabs = ({ children, defaultValue, className = '' }: any) => (
  <div className={className}>{children}</div>
);

export const TabsList = ({ children, className = '' }: any) => (
  <div className={`flex ${className}`}>{children}</div>
);

export const TabsTrigger = ({ children, value, className = '', onClick }: any) => (
  <button
    type="button"
    onClick={() => onClick && onClick(value)}
    className={`px-3 py-2 ${className}`}
    suppressHydrationWarning={true}
  >
    {children}
  </button>
);

export const TabsContent = ({ children, value, className = '' }: any) => <div className={className}>{children}</div>;

export default Tabs;
