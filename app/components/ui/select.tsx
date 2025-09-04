"use client";
import React, { ReactNode } from 'react';

// Marker components — they do not render DOM themselves when used inside <Select>
export const SelectTrigger: React.FC<{ children?: ReactNode; className?: string }> = () => null;
export const SelectContent: React.FC<{ children?: ReactNode; className?: string }> = () => null;
export const SelectItem: React.FC<{ value: string; children?: ReactNode }> = () => null;
export const SelectValue: React.FC<{ placeholder?: string; className?: string }> = () => null;

interface SelectProps {
  children?: ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ children, value, onValueChange, disabled, className = '' }) => {
  // Children can be either raw <option/> elements or the pattern used in shadcn:
  // <Select>
  //   <SelectTrigger>...</SelectTrigger>
  //   <SelectContent>
  //     <SelectItem value="x">...</SelectItem>
  //   </SelectContent>
  // </Select>
  // We extract any SelectContent -> SelectItem definitions and build native <option>s to keep DOM valid.

  const childArray = React.Children.toArray(children) as ReactNode[];

  // Find SelectContent if present
  const content = childArray.find((c) => React.isValidElement(c) && (c.type as unknown) === SelectContent) as React.ReactElement<{ children?: ReactNode }> | undefined;

  let items: ReactNode[] = [];

  if (content && content.props && content.props.children) {
    items = React.Children.toArray(content.props.children) as ReactNode[];
  } else {
    // fallback: look for direct option children or SelectItem children
    items = childArray.filter((c) => {
      if (!c) return false;
      if (!React.isValidElement(c)) return false;
      // native option element
  const t = (c.type as unknown) as string | React.ComponentType<unknown>;
      if (typeof t === 'string' && t.toLowerCase() === 'option') return true;
      // SelectItem marker
      if (t === SelectItem) return true;
      return false;
    });
  }

  const options = items.map((it, idx) => {
    if (!it) return null;
  // If it's a native option element, render it directly
  if (React.isValidElement(it) && typeof (it.type as unknown) === 'string' && ((it.type as unknown) as string).toLowerCase() === 'option') return it as React.ReactElement;

  // Otherwise it's a SelectItem marker — pull props
  const props = React.isValidElement(it) ? (it.props as { value?: string; children?: React.ReactNode }) : { value: undefined, children: null };
    return (
      <option key={props.value ?? idx} value={props.value}>
        {props.children}
      </option>
    );
  });

  return (
    <div className={className}>
      <select
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border px-3 py-2 text-sm"
        suppressHydrationWarning={true}
      >
        {options}
      </select>
    </div>
  );
};

export default Select;
