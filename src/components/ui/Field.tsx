import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full bg-bg-alt border border-line text-ink px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-ink-dimmer";

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({ label, htmlFor, error, hint, children, className }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={htmlFor} className="font-mono text-[11px] uppercase tracking-wider text-ink-dimmer">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-dimmer">{hint}</p>}
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <input
        ref={ref}
        id={id}
        className={cn(fieldBase, error && "border-accent", className)}
        {...props}
      />
    </FieldWrapper>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={id}
        className={cn(fieldBase, "min-h-[110px] resize-y", error && "border-accent", className)}
        {...props}
      />
    </FieldWrapper>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, options, className, ...props }, ref) => (
    <FieldWrapper label={label} htmlFor={id} error={error} hint={hint}>
      <select ref={ref} id={id} className={cn(fieldBase, error && "border-accent", className)} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
);
Select.displayName = "Select";
