import { memo, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { size } from "lodash";
import { ChevronLeft, Search } from "react-feather";
import { useClickOutside } from "../../hooks/useClickOutside";
import { truncateText } from "../../utils/appHelpers";

const AppDropdown = ({
  items = [],
  isOpen,
  dropdownType = "",
  value = "",
  disabled = false,
  customClassForSelector = "w-full h-10 px-4 py-2",
  selectorLabelClassName = "top-3 text-gray-500",
  showSearch = false,
  truncateNumber = 20,
  setIsOpenDropdown = () => {},
  placeholder = "Select an option",
  customClass = "mt-2",
  callback = () => {},
}) => {
  const dropdownRef = useRef(null);

  // states
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelectorMenuOpen, setIsSelectorMenuOpen] = useState(false);

  const handleDropdown = (data) => {
    if (size(data?.subItems) > 0) {
      setIsOpenDropdown(false);
      setIsSelectorMenuOpen(false);
      setSearchTerm("");
      const subItemsData = data?.subItems?.find((item) => item?.label);
      return callback(subItemsData);
    } else {
      setIsOpenDropdown(false);
      setIsSelectorMenuOpen(false);
      setSearchTerm("");
      callback(data);
    }
  };

  const selectedLabel = useMemo(
    () => items?.find((opt) => opt.value === value)?.label,
    [value, items]
  );

  const filteredItems = useMemo(() => {
    return items?.filter((opt) =>
      opt?.label?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [searchTerm, items]);
  console.log("filteredItems", filteredItems);
  console.log("items", items);

  // Handle click outside to close dropdown
  useClickOutside(dropdownRef, () => {
    setIsSelectorMenuOpen(false);
    setIsOpenDropdown(false);
    setSearchTerm("");
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* app selector label */}
      {dropdownType === "selector" && (
        <div className="relative w-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => !disabled && setIsSelectorMenuOpen((prev) => !prev)}
            className={`border border-gray-300 bg-white ${customClassForSelector} rounded cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:border-blue-500"
            }`}
          >
            <span className={`text-gray-500 text-xs font-medium uppercase`}>
              {truncateText(selectedLabel || "", truncateNumber) || ""}
            </span>

            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isSelectorMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" fill="#ddddd" />
            </svg>
          </div>

          {/* Floating Label of selector*/}
          <label
            className={`absolute left-3 px-1 bg-white text-xs font-medium transition-all duration-200 pointer-events-none ${
              selectedLabel
                ? "-top-2 bg-gray-50 px-2 text-brand"
                : `${selectorLabelClassName}`
            }`}
          >
            {placeholder}
          </label>
        </div>
      )}

      {/* app selector menu */}
      {isSelectorMenuOpen && (
        <div className="absolute mt-1 z-10 bg-white border border-gray-300 rounded w-full shadow-sm max-h-60 overflow-y-auto">
          {showSearch && (
            <div className="relative py-2 px-1">
              <input
                type="text"
                className="w-full border border-gray-200 rounded py-1 px-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          )}

          {size(filteredItems) ? (
            filteredItems?.map((opt, index) => (
              <div
                key={index}
                onClick={() => {
                  handleDropdown(opt?.value);
                  setIsSelectorMenuOpen(false);
                }}
                className={`px-4 py-1 text-xs font-medium text-gray-700 capitalize hover:bg-blue-100 cursor-pointer ${
                  value === opt?.value ? "bg-blue-100 font-semibold" : ""
                }`}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm text-center">
              No Options Available
            </div>
          )}
        </div>
      )}

      {/* app dropdown menu */}
      {isOpen && (
        <div
          className={`absolute right-0 w-48 rounded-md shadow-lg bg-slate-50 z-10 ${customClass}`}
        >
          <div className="absolute top-[-10px] right-4 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-slate-50"></div>{" "}
          {size(items) > 0 &&
            items?.map((item, index) =>
              item.subItems ? (
                <div key={index} className="relative group">
                  <Link
                    to={item.href || "#"}
                    onClick={() => handleDropdown(item)}
                    className="px-4 py-2 text-[.88rem] text-gray-700 font-medium text-start capitalize hover:bg-gray-100 border-b-1 border-gray-200 flex items-center justify-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {item.label}
                  </Link>
                  <div className="absolute right-full top-0 w-48 rounded-md shadow-lg bg-slate-50 hidden group-hover:block">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.href || "#"}
                        className="block px-4 py-2 text-[.88rem] font-medium text-start capitalize text-gray-700 border-b-1 border-gray-200 hover:bg-gray-100"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={index}
                  to={item.href || "#"}
                  onClick={() => handleDropdown(item)}
                  className="block px-4 py-2 text-[.88rem] text-center font-medium capitalize text-gray-700 border-b-1 border-gray-200 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              )
            )}
        </div>
      )}
    </div>
  );
};

export default memo(AppDropdown);
