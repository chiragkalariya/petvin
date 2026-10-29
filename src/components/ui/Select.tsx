"use client";

import React, { useId } from "react";
import ReactSelect, {
  Props as ReactSelectProps,
  StylesConfig,
  GroupBase,
} from "react-select";
import { cn } from "@/lib/utils";

export interface OptionType {
  value: string;
  label: string;
  [key: string]: any;
}

export interface CustomSelectProps
  extends Omit<ReactSelectProps<OptionType, boolean, GroupBase<OptionType>>, "value" | "onChange" | "options" | "defaultValue"> {
  value?: string | string[] | null;
  defaultValue?: string | OptionType | null;
  onChange?: (val: string) => void;
  options: (OptionType | string)[];
  size?: "sm" | "md";
  variant?: "default" | "table";
  className?: string;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  label?: string;
  error?: string;
  hint?: string;
  name?: string;
}

export function Select({
  value,
  defaultValue,
  onChange,
  options = [],
  size = "md",
  variant = "default",
  className,
  placeholder = "Select...",
  isClearable = false,
  isSearchable = true,
  label,
  error,
  hint,
  name,
  menuPortalTarget,
  ...props
}: CustomSelectProps) {
  const instanceId = useId();

  // Internal value for uncontrolled usage with defaultValue
  const [internalVal, setInternalVal] = React.useState<string>(() => {
    if (defaultValue) {
      return typeof defaultValue === "string" ? defaultValue : defaultValue.value;
    }
    return "";
  });

  const effectiveValue = value !== undefined ? value : internalVal;

  // Normalize options to support strings or OptionType objects
  const normalizedOptions: OptionType[] = React.useMemo(() => {
    return (options || []).map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Convert simple string/string[] value to OptionType object for react-select
  const selectedOption = React.useMemo(() => {
    if (effectiveValue === undefined || effectiveValue === null || effectiveValue === "") return null;
    return (
      normalizedOptions.find((opt) => opt.value === effectiveValue) || {
        value: String(effectiveValue),
        label: String(effectiveValue),
      }
    );
  }, [effectiveValue, normalizedOptions]);

  const handleChange = (selected: any) => {
    const val = selected ? selected.value : "";
    setInternalVal(val);
    if (onChange) {
      onChange(val);
    }
  };

  const isTable = variant === "table";

  const customStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isTable ? "transparent" : "#0D0F12",
      borderColor: isTable
        ? "transparent"
        : state.isFocused
        ? "#FF6A1A"
        : "#252932",
      boxShadow: state.isFocused
        ? isTable
          ? "inset 0 0 0 1px #FF6A1A"
          : "0 0 0 1px #FF6A1A"
        : "none",
      minHeight: isTable ? "36px" : size === "sm" ? "32px" : "38px",
      height: isTable ? "36px" : size === "sm" ? "32px" : "38px",
      maxHeight: isTable ? "36px" : size === "sm" ? "32px" : "38px",
      borderRadius: isTable ? "0px" : "2px",
      fontSize: size === "sm" ? "12px" : "13px",
      cursor: "pointer",
      borderWidth: isTable ? 0 : 1,
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      "&:hover": {
        borderColor: isTable ? "transparent" : state.isFocused ? "#FF6A1A" : "#353A47",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: isTable ? "0 8px" : size === "sm" ? "0 8px" : "0 10px",
      height: isTable ? "36px" : size === "sm" ? "32px" : "38px",
      display: "flex",
      alignItems: "center",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: isTable ? "36px" : size === "sm" ? "32px" : "38px",
    }),
    input: (base) => ({
      ...base,
      color: "#FFFFFF",
      margin: 0,
      padding: 0,
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6B7280",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#FFFFFF",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#171A21",
      border: "1px solid #252932",
      borderRadius: "2px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.7)",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#FF6A1A"
        : state.isFocused
        ? "rgba(255, 106, 26, 0.15)"
        : "transparent",
      color: state.isSelected
        ? "#FFFFFF"
        : state.isFocused
        ? "#FF8038"
        : "#E5E7EB",
      padding: size === "sm" ? "6px 10px" : "8px 12px",
      fontSize: size === "sm" ? "12px" : "13px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#FF6A1A",
        color: "#FFFFFF",
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6B7280",
      padding: size === "sm" ? "2px 4px" : "6px 8px",
      "&:hover": {
        color: "#FF6A1A",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#6B7280",
      padding: size === "sm" ? "2px 4px" : "6px 8px",
      "&:hover": {
        color: "#EF4444",
      },
    }),
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            "w-full bg-[#0D0F12] border border-[#252932] text-xs text-[#6B7280] flex items-center px-3",
            variant === "table" ? "border-0 bg-transparent h-9 px-1.5" : size === "sm" ? "h-8" : "h-[38px]"
          )}
        >
          {selectedOption?.label || placeholder}
        </div>
        {name && <input type="hidden" name={name} value={selectedOption?.value || ""} />}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block font-mono text-[11px] uppercase tracking-wider text-ink-dimmer mb-1.5">
          {label}
        </label>
      )}
      <ReactSelect
        instanceId={instanceId}
        value={selectedOption}
        onChange={handleChange}
        options={normalizedOptions}
        styles={customStyles}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        menuPosition="fixed"
        {...props}
      />
      {name && <input type="hidden" name={name} value={selectedOption?.value || ""} />}
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-ink-dimmer">{hint}</p>}
    </div>
  );
}
