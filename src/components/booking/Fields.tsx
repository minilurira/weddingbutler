"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useId } from "react";

const CONTROL =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-mute/60 transition-colors focus:border-rose focus:outline-none";

export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean }) => ReactNode;
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[13px] font-medium text-ink"
      >
        {label}
        {required && (
          <span aria-hidden className="text-rose-deep">
            *
          </span>
        )}
      </label>
      {hint && <p className="mt-1 text-[12px] text-ink-mute">{hint}</p>}
      <div className="mt-2">{children({ id, "aria-invalid": Boolean(error) })}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12.5px] text-[#a8392f]">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={`${CONTROL} aria-[invalid=true]:border-[#a8392f] ${className}`}
      {...rest}
    />
  );
}

export function TextArea({
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={`${CONTROL} min-h-28 resize-y leading-relaxed aria-[invalid=true]:border-[#a8392f] ${className}`}
      {...rest}
    />
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
  error,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  error?: string;
}) {
  const id = useId();

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-line accent-ink"
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-[13.5px] leading-relaxed text-ink-soft"
        >
          {children}
        </label>
      </div>
      {error && (
        <p role="alert" className="ml-[30px] mt-1 text-[12.5px] text-[#a8392f]">
          {error}
        </p>
      )}
    </div>
  );
}
