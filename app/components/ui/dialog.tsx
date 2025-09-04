"use client";
import React, { ReactNode } from 'react';

interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ children, open = false, onOpenChange, className = '' }) => {
  if (!open) return null;
  // keep onOpenChange available for consumers (call noop to avoid unused var)
  if (onOpenChange) onOpenChange(open);
  return <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>{children}</div>;
};

export const DialogContent: React.FC<{ children?: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg max-w-full ${className}`}>{children}</div>
);

export const DialogHeader: React.FC<{ children?: ReactNode }> = ({ children }) => <div className="p-4 border-b">{children}</div>;
export const DialogTitle: React.FC<{ children?: ReactNode }> = ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>;

export default Dialog;
