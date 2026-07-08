import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { size } from "lodash";
import {
  getFocusColor,
  getOptions,
  handleMoveHeighlight,
  truncateText,
} from "../../utils/appHelpers";
import { ChevronDown, Loader, Search, X } from "react-feather";
import { useClickOutside } from "../../hooks/useClickOutside";
import AppModal from "./AppModal";
import AppHoverTooltip from "./AppHoverTooltip";
import ToggleCheckBox from "./ToggleCheckBox";
import toastAlert from "../../utils/toastAlert";
import { useCreateNewSelectOptionMutation } from "../../redux/api/globalApi";

export function FilterDropdown({
  buttonLabel = "Select",
  options = [],
  selectedValue = null,
  onChange,
  isMulti = false,
  headerClassName = "bg-brand border-[#3173b1] text-white px-4 py-2",
  chevronIconClasses = "h-5 w-5 transition-transform font-bold",
  labelClasses = "text-[.9rem] font-bold",
  dropdownMenuSize = "300px",
  dropdownMenuHeight = "max-h-60",
  isLoading = false,
  isDisabled = false,
  showFocus = false,
  showCreateOption = false,
  showMultiItemLabel = false,
  isShowFloatingLavel = false,
  isDisableDropdownMenu = false,
  truncateNumber = 10,
  callback = () => {},
  label,
  setOpenDropdown,
  isOpenDropdown,
  customHeader,
  customTrigger,
  selectionType,
  updateOptionsData,
  setNewCompany = () => {},
  createOptionMode = "local",
  model = "",
  fieldName = "",
}) {
  // hooks
  const dropdownRef = useRef(null);
  const actualButtonLabel = buttonLabel || label || "";
  const actualIsMulti =
    isMulti !== undefined ? isMulti : selectionType === "multi";
  const actualOptions = useMemo(
    () => (options.length > 0 ? options : label ? getOptions(label) : []),
    [options, label],
  );

  // states
  const [isOpen, setIsOpen] = useState(isOpenDropdown || false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuStyles, setMenuStyles] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [createdOptions, setCreatedOptions] = useState([]);
  const [internalSelectedValue, setInternalSelectedValue] =
    useState(selectedValue);

  const isLargeDataset = actualOptions.length > 20000;

  useEffect(() => {
    if (selectedValue !== undefined) {
      setInternalSelectedValue(selectedValue);
    }
  }, [selectedValue]);

  const allAvailableOptions = useMemo(() => {
    const combined = [...actualOptions];
    createdOptions.forEach((newOpt) => {
      const valToFind = newOpt?.value !== undefined ? newOpt.value : newOpt;
      if (
        !actualOptions.some(
          (opt) => (opt?.value !== undefined ? opt.value : opt) === valToFind,
        )
      ) {
        combined.push(newOpt);
      }
    });
    return combined;
  }, [actualOptions, createdOptions]);

  const resolvedSelectedValue = useMemo(() => {
    if (
      selectedValue &&
      typeof selectedValue === "object" &&
      selectedValue.label
    ) {
      return selectedValue;
    }
    const currentSelection =
      selectedValue !== undefined ? selectedValue : internalSelectedValue;

    if (
      currentSelection === null ||
      currentSelection === undefined ||
      currentSelection === ""
    )
      return null;

    if (actualIsMulti && Array.isArray(currentSelection)) {
      return currentSelection.map((val) => {
        const valueToFind = val?.value !== undefined ? val.value : val;
        const found = allAvailableOptions.find(
          (opt) => (opt?.value !== undefined ? opt.value : opt) === valueToFind,
        );
        return found || val;
      });
    }

    const valueToFind =
      currentSelection?.value !== undefined
        ? currentSelection.value
        : currentSelection;
    const found = allAvailableOptions.find(
      (opt) => (opt?.value !== undefined ? opt.value : opt) === valueToFind,
    );
    return found || currentSelection;
  }, [
    selectedValue,
    internalSelectedValue,
    allAvailableOptions,
    actualIsMulti,
  ]);

  const filteredOptions = useMemo(() => {
    let filtered = allAvailableOptions;

    if (searchTerm) {
      filtered = allAvailableOptions.filter((option) =>
        option.label
          ? option?.label
              ?.toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : option?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (isLargeDataset) {
      return filtered.slice(0, 100);
    }

    return filtered;
  }, [allAvailableOptions, searchTerm, isLargeDataset]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setFocused(!focused);
  };

  const handleChange = useCallback(
    (option) => {
      setInternalSelectedValue(option);
      if (!actualIsMulti) {
        setIsOpen(false);
        setSearchTerm("");
      }

      if (onChange) onChange(option);

      if (callback) {
        callback(option);
      }
    },
    [actualIsMulti, onChange, callback],
  );

  const handleInputChange = (inputValue) => {
    setSearchTerm(inputValue);
  };

  // paste a list of values (comma/newline/tab/semicolon separated) and
  // auto-select the options that match; falls back to normal paste
  // behaviour in the search box when nothing matches.
  const handleSearchPaste = (e) => {
    e.stopPropagation();
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText || !pastedText.trim()) return;

    const tokens = pastedText
      .split(/[\n\r,;\t]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    const matchedOptions = [];
    tokens.forEach((token) => {
      const match = allAvailableOptions.find((opt) => {
        const optLabel = opt?.label !== undefined ? String(opt.label) : String(opt);
        const optValue = opt?.value !== undefined ? String(opt.value) : String(opt);
        return (
          optLabel.toLowerCase() === token.toLowerCase() ||
          optValue.toLowerCase() === token.toLowerCase()
        );
      });
      const matchValue = match?.value !== undefined ? match.value : match;
      if (
        match &&
        !matchedOptions.some(
          (m) => (m?.value !== undefined ? m.value : m) === matchValue,
        )
      ) {
        matchedOptions.push(match);
      }
    });

    if (matchedOptions.length === 0) return;

    e.preventDefault();

    if (actualIsMulti) {
      const currentSelection = Array.isArray(resolvedSelectedValue)
        ? resolvedSelectedValue
        : [];
      const newSelection = [...currentSelection];
      matchedOptions.forEach((opt) => {
        const optValue = opt?.value !== undefined ? opt.value : opt;
        const alreadySelected = newSelection.some(
          (item) => (item?.value !== undefined ? item.value : item) === optValue,
        );
        if (!alreadySelected) {
          newSelection.push(opt);
        }
      });
      handleChange(newSelection);
    } else {
      handleChange(matchedOptions[0]);
      setIsOpen(false);
    }

    setSearchTerm("");
  };

  const getButtonText = () => {
    if (resolvedSelectedValue) {
      if (actualIsMulti && Array.isArray(resolvedSelectedValue)) {
        if (resolvedSelectedValue.length === 0) return actualButtonLabel;
        if (resolvedSelectedValue.length === 1) {
          const item = resolvedSelectedValue[0];
          const textLabel =
            item?.label !== undefined &&
            item?.label !== null &&
            item?.label !== ""
              ? String(item.label)
              : item?.value !== undefined
                ? String(item.value)
                : String(item);
          return textLabel;
        }
        return `${resolvedSelectedValue.length} selected`;
      } else if (!actualIsMulti && resolvedSelectedValue) {
        return (
          resolvedSelectedValue.label ||
          resolvedSelectedValue.value ||
          actualButtonLabel
        );
      }
    }
    return actualButtonLabel;
  };

  const handleOptionClick = useCallback(
    (option) => {
      if (option.disabled) return;
      const optionValue = option.value || option;
      setFocused(false);
      if (actualIsMulti) {
        const currentSelection = Array.isArray(selectedValue)
          ? selectedValue
          : [];
        let newSelection;

        const isSelected = currentSelection.some(
          (item) => (item?.value || item) === optionValue,
        );

        if (isSelected) {
          newSelection = currentSelection.filter(
            (item) => (item?.value || item) !== optionValue,
          );
        } else {
          newSelection = [...currentSelection, option];
        }

        handleChange(newSelection);
      } else {
        handleChange(option);
      }
    },
    [actualIsMulti, resolvedSelectedValue, handleChange],
  );

  const isSelected = (option) => {
    const optionValue = option?.value !== undefined ? option.value : option;

    if (actualIsMulti && Array.isArray(resolvedSelectedValue)) {
      return resolvedSelectedValue.some((item) => {
        const itemValue = item?.value !== undefined ? item.value : item;
        return itemValue === optionValue;
      });
    } else if (!actualIsMulti && resolvedSelectedValue) {
      const selectedItemValue =
        resolvedSelectedValue?.value !== undefined
          ? resolvedSelectedValue.value
          : resolvedSelectedValue;
      return selectedItemValue === optionValue;
    }
    return false;
  };

  const handleRemoveSelectedItem = (itemToRemove) => {
    setFocused(false);
    if (itemToRemove.disabled) return;
    if (actualIsMulti && Array.isArray(resolvedSelectedValue)) {
      const itemToRemoveValue =
        itemToRemove?.value !== undefined ? itemToRemove.value : itemToRemove;
      const newSelection = resolvedSelectedValue.filter((item) => {
        const itemValue = item?.value !== undefined ? item.value : item;
        return itemValue !== itemToRemoveValue;
      });
      handleChange(newSelection);
    }
    if (
      itemToRemove &&
      (resolvedSelectedValue?.value || resolvedSelectedValue) ===
        (itemToRemove?.value || itemToRemove)
    ) {
      handleChange({});
    }
  };

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setFocused(false);
    if (setOpenDropdown) {
      setOpenDropdown(false);
    }
  });

  const isNewItem =
    searchTerm &&
    !allAvailableOptions.some((o) =>
      [o?.label, o?.value].some(
        (v) => v?.toString().toLowerCase() === searchTerm.toLowerCase(),
      ),
    );

  // delete or remove item by keyboard
  useEffect(() => {
    if (!focused) return;
    const handleKeyDown = (event) => {
      if (event.key !== "Delete") return;
      setFocused(false);
      if (actualIsMulti && size(resolvedSelectedValue)) {
        handleChange([]);
      } else if (!actualIsMulti && resolvedSelectedValue) {
        handleChange({});
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused, actualIsMulti, resolvedSelectedValue, handleChange]);

  // select item from menu using keyboard up & down arrow
  useEffect(() => {
    if (!isOpen) return;
    const actions = {
      ArrowDown: () =>
        handleMoveHeighlight("down", setHighlightedIndex, filteredOptions),
      ArrowUp: () =>
        handleMoveHeighlight("up", setHighlightedIndex, filteredOptions),
      Enter: () => {
        if (highlightedIndex >= 0) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
      },
      Escape: () => setIsOpen(false),
    };
    const handleKeyDown = (event) => {
      const action = actions[event.key];
      if (action) {
        event.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, handleOptionClick]);

  // dropdown menu portal
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();

      // Estimate the menu height from the option count (search box + ~30px per
      // row, capped at the scroll max-height) instead of assuming a flat 250px.
      // A too-large estimate flipped short menus (e.g. 2 options) above the
      // trigger even when they fit comfortably below.
      const optionCount = size(filteredOptions) || size(allAvailableOptions);
      const dropdownHeight = Math.min(300, 64 + optionCount * 30);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top;
      // Prefer opening below; only flip above when it can't fit below AND there
      // is genuinely more room above.
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Open above
        top = rect.top + window.scrollY - dropdownHeight;
      } else {
        // Open below
        top = rect.bottom + window.scrollY;
      }
      setMenuStyles({
        position: "fixed",
        top,
        left: rect.left + window.scrollX,
        width: dropdownMenuSize,
        zIndex: 9999,
      });
    }
    if (isOpen) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, dropdownMenuSize]);

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      {isShowFloatingLavel && size(resolvedSelectedValue) > 0 && (
        <label
          className={`
        absolute left-3 px-1 bg-gray-50 text-xs font-medium transition-all rounded-md
        ${
          focused || size(resolvedSelectedValue) > 0 || getButtonText()
            ? "-top-2 text-brand"
            : "top-3 text-brand"
        }
      `}
        >
          {actualButtonLabel}
        </label>
      )}

      <div className="group w-full">
        <div
          role="button"
          tabIndex={0}
          className={` ${headerClassName} ${
            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
          } flex w-full justify-between items-center rounded-md ${getFocusColor(
            showFocus,
            focused,
          )}`}
          onClick={() => !isDisabled && toggleDropdown()}
        >
          {isLoading ? (
            <div className="flex justify-center items-center w-full animate-spin">
              <Loader className="w-6 h-6" />
            </div>
          ) : (
            <>
              {customTrigger ? (
                customTrigger
              ) : showMultiItemLabel ? (
                actualIsMulti && size(resolvedSelectedValue) > 0 ? (
                  <div
                    className={`flex flex-wrap gap-1 border-gray-400 w-full h-6 ${labelClasses}`}
                  >
                    {resolvedSelectedValue?.slice(0, 4).map((item, index) => (
                      <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        className={`flex items-center gap-1 bg-[#065cac] text-white text-xs font-semibold px-2 py-0.5 rounded h-6! ${item.disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                        onClick={() =>
                          !item.disabled && handleRemoveSelectedItem(item)
                        }
                      >
                        {item.label || buttonLabel}
                        {!item.disabled && (
                          <div className="bg-white rounded-full">
                            <X className="h-3 w-3 text-red-500 font-bold" />
                          </div>
                        )}
                      </div>
                    ))}
                    {size(resolvedSelectedValue) > 6 && (
                      <div className="flex items-center gap-1 bg-gray-300 text-gray-700 text-xs px-2 py-0.5 rounded h-6">
                        +{size(resolvedSelectedValue) - 6} more
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <span className={`${labelClasses} capitalize`}>
                      {isNaN(getButtonText())
                        ? truncateText(getButtonText() || "", truncateNumber)
                        : getButtonText()}
                    </span>
                    <ChevronDown
                      className={`${chevronIconClasses} ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )
              ) : (
                <>
                  {truncateNumber === truncateNumber && truncateNumber > 10 ? (
                    <AppHoverTooltip content={<span>{getButtonText()}</span>}>
                      <span className={`${labelClasses} capitalize`}>
                        {isNaN(getButtonText())
                          ? truncateText(getButtonText() || "", truncateNumber)
                          : getButtonText()}
                      </span>
                    </AppHoverTooltip>
                  ) : (
                    <span className={`${labelClasses} capitalize`}>
                      {isNaN(getButtonText())
                        ? truncateText(getButtonText() || "", truncateNumber)
                        : getButtonText()}
                    </span>
                  )}
                  <ChevronDown
                    className={`${chevronIconClasses} ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          style={menuStyles}
          className="absolute z-50 bg-white border border-gray-200 shadow-lg mt-1 rounded-md dropdpwnMenu"
        >
          <div className="p-2">
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full border border-gray-200 rounded-md py-1 px-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Search ${String(actualButtonLabel).toLowerCase()}...`}
                value={searchTerm}
                autoComplete="off"
                autoCorrect="off"
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    !["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)
                  ) {
                    e.stopPropagation();
                  }
                }}
                onPaste={handleSearchPaste}
                autoFocus
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* mutli select*/}
            {actualIsMulti && size(resolvedSelectedValue) > 0 && (
              <div className="mb-2 flex flex-wrap gap-1 border-b border-gray-400 pb-2 overflow-y-scroll max-h-30 h-auto">
                {resolvedSelectedValue?.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1 bg-[#065cac] text-white text-xs px-2 py-0.5 rounded h-6 ${item.disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                    onClick={() =>
                      !item.disabled && handleRemoveSelectedItem(item)
                    }
                  >
                    {isNaN(item?.label)
                      ? truncateText(item?.label || "", 20)
                      : item?.label || ""}
                    {!item.disabled && (
                      <div className="bg-white rounded-full">
                        <X className="h-3 w-3 text-red-500 font-bold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* single select */}
            {!actualIsMulti && size(resolvedSelectedValue) > 0 && (
              <div className="mb-2 flex flex-wrap gap-1 border-b border-gray-400 pb-2">
                <div
                  className={`flex items-center gap-1 bg-[#065cac] text-white text-xs px-2 py-0.5 rounded ${resolvedSelectedValue.disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                  onClick={() =>
                    !resolvedSelectedValue.disabled &&
                    handleRemoveSelectedItem(resolvedSelectedValue)
                  }
                >
                  {isNaN(resolvedSelectedValue?.label)
                    ? truncateText(resolvedSelectedValue?.label || "", 20)
                    : resolvedSelectedValue?.label || ""}

                  {!resolvedSelectedValue.disabled && (
                    <div className="bg-white rounded-full">
                      <X className="h-3 w-3 text-red-500 font-bold" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              className={`${dropdownMenuHeight} overflow-y-auto flex flex-col items-start justify-start gap-1`}
            >
              {actualIsMulti &&
                size(filteredOptions) > 0 &&
                (() => {
                  const allSelected =
                    size(resolvedSelectedValue) === size(filteredOptions);
                  const toggleSelectAll = () => {
                    if (allSelected) {
                      handleChange(
                        resolvedSelectedValue.filter((item) => item.disabled),
                      );
                    } else {
                      const currentlySelectedDisabled =
                        resolvedSelectedValue.filter((item) => item.disabled);
                      const nonDisabledFiltered = filteredOptions.filter(
                        (opt) => !opt.disabled,
                      );
                      handleChange([
                        ...currentlySelectedDisabled,
                        ...nonDisabledFiltered,
                      ]);
                    }
                  };
                  return (
                    <div
                      className={`p-1 font-semibold w-full flex items-center gap-1 cursor-pointer bg-gray-50 text-[.7rem] hover:bg-blue-50 rounded ${
                        allSelected ? "text-red-600" : "text-green-600"
                      }`}
                      onClick={toggleSelectAll}
                    >
                      <ToggleCheckBox
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        customClass="w-3! h-3! accent-gray-600"
                      />
                      {allSelected ? "DESELECT ALL" : "SELECT ALL"}
                    </div>
                  );
                })()}
              {customHeader && <div className="w-full">{customHeader}</div>}
              {/* options data */}
              {size(filteredOptions) > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    role="button"
                    tabIndex={0}
                    key={index}
                    className={`p-1 font-medium w-full flex-wrap text-[.7rem] ${
                      isDisableDropdownMenu || option.disabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    } ${
                      isSelected(option) ? "bg-[#065bacb4] rounded-md" : ""
                    } ${index === highlightedIndex ? "bg-blue-300" : ""} `}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() =>
                      !isDisableDropdownMenu &&
                      !option.disabled &&
                      handleOptionClick(option)
                    }
                  >
                    {actualIsMulti ? (
                      <div className="flex items-center gap-1">
                        <ToggleCheckBox
                          checked={isSelected(option)}
                          disabled={isDisableDropdownMenu || option.disabled}
                          onChange={() =>
                            !isDisableDropdownMenu &&
                            !option.disabled &&
                            handleOptionClick(option)
                          }
                          customClass="w-3! h-3! accent-gray-600"
                        />
                        {option?.label || ""}
                      </div>
                    ) : (
                      option?.label || ""
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-xs text-gray-500 text-center">
                  {searchTerm
                    ? `No ${String(actualButtonLabel).toLowerCase()} found for "${searchTerm}"`
                    : `No ${String(actualButtonLabel).toLowerCase()} available`}
                </div>
              )}
            </div>

            {actualIsMulti && (
              <button
                className="flex justify-center items-center h-5 w-14 mt-2 rounded py-0.5 bg-linear-to-b from-[#448CCB] via-[#3075B2] to-[#224665] text-white cursor-pointer text-xs italic"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Apply
              </button>
            )}
            {isLargeDataset && size(filteredOptions) > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 text-center">
                Showing first 2000 of {size(actualOptions)} options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
