const ToggleCheckBox = ({
  checked,
  onChange,
  disabled = false,
  customClass = "accent-purple-600",
}) => (
  <input
    type="checkbox"
    checked={!!checked}
    onChange={onChange}
    disabled={disabled}
    className={`
        h-4 w-4 rounded border-gray-300 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
        ${customClass}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
  />
);
export default ToggleCheckBox;
