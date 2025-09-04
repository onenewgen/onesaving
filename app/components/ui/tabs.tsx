"use client";
import React, { ReactNode } from 'react';

export const Tabs: React.FC<{ children?: ReactNode; defaultValue?: string; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const TabsList: React.FC<{ children?: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex ${className}`}>{children}</div>
);

export const TabsTrigger: React.FC<{
  children?: ReactNode;
  value?: string;
  className?: string;
  onClick?: (value?: string) => void;
}> = ({ children, value, className = '', onClick }) => (
  <button
    type="button"
    onClick={() => onClick && onClick(value)}
    className={`px-3 py-2 ${className}`}
    suppressHydrationWarning={true}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<{ children?: ReactNode; value?: string; className?: string }> = ({ children, className = '' }) => <div className={className}>{children}</div>;

export default Tabs;
