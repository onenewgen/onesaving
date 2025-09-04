"use client";
import React from 'react';

export const Dialog = ({ children, open, onOpenChange, className = '' }: any) => {
  if (!open) return null;
  return <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>{children}</div>;
};

export const DialogContent = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg shadow-lg max-w-full ${className}`}>{children}</div>
);

export const DialogHeader = ({ children }: any) => <div className="p-4 border-b">{children}</div>;
export const DialogTitle = ({ children }: any) => <h3 className="text-lg font-semibold">{children}</h3>;

export default Dialog;
