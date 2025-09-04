"use client";
import React from 'react';

// Marker components — they do not render DOM themselves when used inside <Select>
export const SelectTrigger = ({ children }: any) => null;
export const SelectContent = ({ children }: any) => null;
export const SelectItem = ({ value, children }: any) => null;
export const SelectValue = ({ placeholder }: any) => null;

export const Select = ({ children, value, onValueChange, disabled, className = '' }: any) => {
  // Children can be either raw <option/> elements or the pattern used in shadcn:
  // <Select>
  //   <SelectTrigger>...</SelectTrigger>
  //   <SelectContent>
  //     <SelectItem value="x">...</SelectItem>
  //   </SelectContent>
  // </Select>
  // We extract any SelectContent -> SelectItem definitions and build native <option>s to keep DOM valid.

  const childArray = React.Children.toArray(children) as any[];

  // Find SelectContent if present
  const content = childArray.find((c) => c && c.type === SelectContent);

  let items: any[] = [];

  if (content && content.props && content.props.children) {
    items = React.Children.toArray(content.props.children) as any[];
  } else {
    // fallback: look for direct option children or SelectItem children
    items = childArray.filter((c) => {
      if (!c) return false;
      // native option element
      if (typeof c.type === 'string' && c.type.toLowerCase() === 'option') return true;
      // SelectItem marker
      if (c.type === SelectItem) return true;
      return false;
    });
  }

  const options = items.map((it, idx) => {
    if (!it) return null;
    // If it's a native option element, render it directly
    if (typeof it.type === 'string' && it.type.toLowerCase() === 'option') return it;

    // Otherwise it's a SelectItem marker — pull props
    const props = it.props || {};
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
