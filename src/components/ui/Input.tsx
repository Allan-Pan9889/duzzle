import { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full border border-gray-200 px-4 py-3 text-sm text-primary outline-none transition-colors focus:border-primary ${className}`}
      {...props}
    />
  );
}
