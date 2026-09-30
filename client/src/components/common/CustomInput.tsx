"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomInputProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  step?: string;
  min?: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  maxLength,
  step,
  min,
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${error ? "border-destructive focus-visible:ring-destructive" : ""} ${className}`}
        required={required}
        maxLength={maxLength}
        step={step}
        min={min}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default CustomInput;
