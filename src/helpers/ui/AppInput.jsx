import { useState } from "react";
import { Delete, Eye, EyeOff, PlusCircle } from "react-feather";

export default function AppInput({
  id,
  name,
  label,
  type = "text",
  inputType = "input",
  value,
  onChange,
  showAddBtn = false,
  showDelBtn = false,
  showEyeForPass = false,
  showIcon = false,
  showPassword,
  setShowPassword,
  onFocus,
  onBlur,
  placeholder = "",
  disabled = false,
  required = false,
  maxLength,
  minLength,
  autoComplete,
  autoFocus = false,
  inputSize,
  min,
  max,
  title,
  onAdd,
  onDelete,
  inputWrapperClassName = "",
  labelClases = "text-xs",
  inputClsName = "w-full text-sm rounded px-4 py-2 border border-gray-300",
  placeholderClsName = "top-3 text-gray-500",
}) {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };
  return (
    <div className={`relative ${inputWrapperClassName}`}>
      {inputType === "input" ? (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          size={inputSize}
          min={min}
          max={max}
          title={title}
          className={`${inputClsName} ${
            disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
          } peer border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
        />
      ) : (
        <textarea
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          min={min}
          max={max}
          title={title}
          className={`${inputClsName} ${
            disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
          } peer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
        />
      )}

      <label
        htmlFor={id || name}
        className={`absolute left-3 transition-all duration-200 pointer-events-none rounded font-medium uppercase ${labelClases} ${
          focused || value
            ? "-top-2 bg-gray-50 px-2 text-brand"
            : `${placeholderClsName}`
        }`}
      >
        {label}
      </label>
      {showAddBtn && (
        <button
          role="button"
          tabIndex={0}
          onClick={onAdd}
          className="absolute cursor-pointer right-0 top-0 h-full px-2 bg-teal-500 text-white rounded-r"
        >
          <PlusCircle />
        </button>
      )}
      {showDelBtn && (
        <button
          role="button"
          tabIndex={0}
          onClick={onDelete}
          className="absolute cursor-pointer right-0 top-0 h-full px-2 bg-gradient-to-b from-[#D40404] via-[#BB0000] to-[#6E0202] text-white rounded-r"
        >
          <Delete />
        </button>
      )}

      {showEyeForPass && (
        <div className="absolute top-3 right-2 flex justify-center items-center">
          {showPassword ? (
            <Eye
              className="cursor-pointer w-4 h-4"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeOff
              className="cursor-pointer w-4 h-4"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
