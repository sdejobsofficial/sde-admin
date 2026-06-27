import { PillOption } from "@/lib/formHelpers";
import { AlertCircle } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
      <AlertCircle size={11} /> {message}
    </p>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.FC<{ size?: number; className?: string }>;
  hasError?: boolean;
}

export function Input({
  className = "",
  icon: Icon,
  hasError,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      )}
      <input
        className={`w-full h-10 bg-gray-800 border rounded-xl text-sm text-gray-200 placeholder:text-gray-600
          focus:outline-none focus:ring-1 transition-all
          ${
            hasError
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
          }
          ${Icon ? "pl-9" : "px-3"} pr-3 ${className}`}
        {...props}
      />
    </div>
  );
}

export function Textarea({
  className = "",
  hasError,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  return (
    <textarea
      className={`w-full bg-gray-800 border rounded-xl text-sm text-gray-200 placeholder:text-gray-600
        focus:outline-none focus:ring-1 transition-all px-3 py-2.5 resize-none
        ${
          hasError
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
        } ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full h-10 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200
        focus:outline-none focus:border-violet-500 transition-all px-3 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function PillSelector<T extends number | string>({
  options,
  value,
  onChange,
  cols = 3,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`h-9 px-3 rounded-xl border text-xs font-semibold transition-all
            ${
              value === opt.value
                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
