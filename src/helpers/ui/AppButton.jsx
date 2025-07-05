import { Check } from "react-feather";
import Loader from "./Loader";

// allowed required button types
/*
 1. save_btn
 2. cancel_btn
 3. add_btn
 4. addMore_btn
 5. delete_btn
 6. other_btn
 7. icon_btn
*/

const AppButton = ({
  Icon = Check,
  btnType = "btn_primary",
  title = "save",
  disabled = false,
  loader = false,
  loaderText = `loading`,
  callBack = () => {},
  customClass = "",
  modalTypeForBtn = "",
  deleteModalCountDown,
  fullWidthBtn = false,
  customPadding = "",
  btnBorder = "border-light",
  buttonTitleStylings = "text-sm font-medium",
  buttonWidth = "w-[100%]",
  iconSize = 20,
  iconWidth = 20,
  iconHeight = 20,
  fillClassName = "",
  iconPosition = "left",
  loaderPosition = "left",
  submitType = false,
  noIcon = false,
}) => {
  const btnContent = () => {
    const getIconAndLoaderPosition = (position) =>
      (!noIcon && !loader && iconPosition === position) ||
      (loader && loaderPosition === position);
    const getIconOrLoader = () =>
      loader ? (
        <Loader />
      ) : (
        !noIcon && (
          <Icon
            size={iconSize}
            width={iconWidth}
            height={iconHeight}
            fillClassName={fillClassName}
          />
        )
      );

    return (
      <div
        className={`flex justify-center items-center w-full ${
          modalTypeForBtn !== "delete_modal" ? "gap-2" : ""
        }`}
      >
        {getIconAndLoaderPosition("left") && getIconOrLoader()}
        {modalTypeForBtn === "delete_modal" ? (
          <span className={`whitespace-nowrap ${buttonTitleStylings}`}>
            {title} {deleteModalCountDown}
          </span>
        ) : (
          <span className={`whitespace-nowrap ${buttonTitleStylings}`}>
            {loader ? loaderText : title}
          </span>
        )}

        {getIconAndLoaderPosition("right") && getIconOrLoader()}
      </div>
    );
  };

  const btnTypes = {
    save_btn: (
      <button
        type={submitType ? "submit" : "button"}
        className={`${customClass || ""} ${buttonWidth} ${
          !fullWidthBtn && "lg:w-max"
        } ${
          customPadding || "px-6 h-[35px]"
        } cursor-pointer flex justify-center items-center gap-2 bg-gradient-to-b from-[#00A800] via-[#048404] to-[#005A00] text-white rounded ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
    cancel_btn: (
      <button
        type="button"
        className={`${customClass || ""} ${buttonWidth} ${
          customPadding || "px-6 h-[35px]"
        } cursor-pointer flex justify-center items-center bg-gradient-to-b from-[#FF961F] via-[#E37B03] to-[#CF6F02] font-semibold text-white rounded ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
    add_btn: (
      <button
        type="button"
        className={`${customClass || ""} ${buttonWidth} ${
          customPadding || "px-6 h-[35px]"
        } cursor-pointer flex justify-between items-center bg-gradient-to-b from-[#1FC5C5] via-[#24B9B9] to-[#0B7F7F] text-white rounded ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
    addMore_btn: (
      <button
        type="button"
        className={`${customClass || ""} ${buttonWidth} ${
          customPadding || "px-6 h-[35px]"
        } bg-gradient-to-b from-[#1FC5C5] via-[#24B9B9] to-[#0B7F7F] cursor-pointer text-white rounded-md flex items-center justify-center ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
    delete_btn: (
      <button
        type="button"
        className={`${customClass || ""} ${buttonWidth} ${
          customPadding || "px-6 h-[35px]"
        } bg-gradient-to-b from-[#D40404] via-[#BB0000] to-[#6E0202] cursor-pointer text-white rounded flex items-center justify-center ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
    other_btn: (
      <button
        type="button"
        className={`${customClass || ""} ${buttonWidth} ${
          customPadding || "px-6 h-[35px]"
        } cursor-pointer text-white rounded-md flex items-center justify-center ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
    icon_btn: (
      <button
        type="button"
        className={`${customClass || ""} ${buttonWidth} ${
          customPadding || "px-6 h-[35px]"
        } cursor-pointer text-white rounded-md flex items-center justify-center ${
          !disabled ? "btn_hover_color" : ""
        }`}
        onClick={callBack}
        disabled={disabled}
      >
        <Icon
          size={iconSize}
          width={iconWidth}
          height={iconHeight}
          fillClassName={fillClassName}
        />
      </button>
    ),

    btn_bordered_brand: (
      <button
        type="button"
        className={`gap-2.5 ${customClass}`}
        onClick={callBack}
        disabled={disabled}
      >
        {btnContent()}
      </button>
    ),
  };

  return <div className="flex">{btnTypes[btnType]}</div>;
};
export default AppButton;
