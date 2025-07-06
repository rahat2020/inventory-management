import { memo, useEffect, useRef, useState } from "react";
import { Clipboard, Delete, Key, PlusCircle, XCircle } from "react-feather";
import AppButton from "./AppButton";

const getClassName = (modalType) => {
  switch (modalType) {
    case "delete":
      return "bg-gradient-to-b from-[#D40404] via-[#BB0000] to-[#6E0202] flex items-center justify-between";
    case "radiobutton":
      return "bg-brand flex items-center justify-between";
    case "one_hcm":
      return "bg-[#662D90] flex items-center justify-center";
    case "courier":
      return "bg-[#CB7A3A] flex items-center justify-center";
    default:
      return "bg-brand";
  }
};

const AppModal = ({
  isModalOpen,
  setIsModalOpen,
  title = "TITLE",
  modalType = "",
  children,
  onCancel,
  onConfirm,
  showAssignNDesassignBtns = false,
  showCancelBtn = true,
  showSaveBtn = true,
  showDeleteBtn = false,
  showAccessIcon = false,
  modalSize = "max-w-3xl",
  customClasses = "fixed inset-0 bg-[#5f5f61bd] bg-opacity-100",
  zIndex = 50,
  onFocus = () => {},
}) => {
  const modalRef = useRef(null);

  // states
  const [countdown, setCountdown] = useState(5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const closeModal = () => setIsModalOpen(false);

  // drag functionalities
  const handleMouseDown = (e) => {
    if (e.target.closest(".modal-content")) return;

    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Get modal dimensions
    const modalRect = modalRef.current.getBoundingClientRect();

    // Calculate boundaries
    const maxX = window.innerWidth - modalRect.width;
    const maxY = window.innerHeight - modalRect.height;

    // Constrain position within screen bounds
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Center modal on first open
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      const centerX = (window.innerWidth - rect.width) / 2;
      const centerY = (window.innerHeight - rect.height) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [isModalOpen]);

  // show count down for delete modal
  useEffect(() => {
    let timer;
    if (isModalOpen && modalType === "delete") {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setIsModalOpen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isModalOpen, modalType, setIsModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div className="">
      {isModalOpen && (
        <div className="mx-auto bg-white p-6 rounded-lg">
          <div
            className={`${customClasses} flex items-center justify-center ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            ref={modalRef}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: zIndex,
              userSelect: isDragging ? "none" : "auto",
            }}
            onMouseDown={(e) => {
              handleMouseDown(e);
              onFocus && onFocus();
            }}
          >
            <div
              className={`bg-white rounded-lg shadow-lg w-full ${modalSize} mx-4`}
            >
              {/* Modal Header */}
              <div
                className={`${getClassName(
                  modalType
                )} text-white py-3 px-4 rounded-t-lg`}
              >
                <h3 className="text-center font-bold">{title}</h3>
                {modalType === "delete" && (
                  <button
                    role="button"
                    tabIndex={0}
                    onClick={onCancel}
                    className="cursor-pointer"
                  >
                    <XCircle width="15" height="15" />
                  </button>
                )}
                {showAccessIcon && (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-center md:gap-2">
                    <button
                      role="button"
                      tabIndex={0}
                      onClick={onCancel}
                      className="cursor-pointer"
                    >
                      <Key width="20" height="20" />
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-4">{children}</div>

              {/* Modal Footer */}
              <div
                className={`p-4 flex ${
                  showAssignNDesassignBtns ? "justify-between" : "justify-end"
                } space-x-2`}
              >
                {showCancelBtn && (
                  <AppButton
                    Icon={PlusCircle}
                    callBack={onCancel || closeModal}
                    btnType="cancel_btn"
                    buttonWidth="w-36"
                    fullWidthBtn
                    fillClassName="#FF961F"
                    iconWidth="16"
                    modalTypeForBtn={showDeleteBtn && "delete_modal"}
                    deleteModalCountDown={showDeleteBtn && countdown}
                    iconHeight="20"
                    buttonTitleStylings="text-base font-semibold pl-1"
                    title="CANCEL"
                  />
                )}
                {showSaveBtn && (
                  <AppButton
                    Icon={Clipboard}
                    callBack={onConfirm || closeModal}
                    buttonWidth="w-36"
                    fullWidthBtn
                    buttonTitleStylings="text-base font-semibold"
                    iconWidth="16"
                    iconHeight="20"
                    btnType="save_btn"
                    title="SAVE"
                  />
                )}
                {showDeleteBtn && (
                  <AppButton
                    Icon={Delete}
                    callBack={onConfirm || closeModal}
                    buttonWidth="w-36"
                    fullWidthBtn
                    buttonTitleStylings="text-base font-semibold"
                    iconWidth="16"
                    iconHeight="20"
                    btnType="delete_btn"
                    title="DELETE"
                  />
                )}
                {/* {showAssignNDesassignBtns && (
                  <div className="flex gap-2">
                    <AppButton
                      Icon={RoundedMinusIcon}
                      callBack={() => onConfirm("deassign") || closeModal}
                      buttonWidth="w-36"
                      fullWidthBtn
                      buttonTitleStylings="text-[15px] font-semibold"
                      iconWidth="16"
                      iconHeight="20"
                      btnType="delete_btn"
                      title="DEASSIGN"
                    />
                    <AppButton
                      Icon={RoundedPlusIcon}
                      callBack={() => onConfirm("assign") || closeModal}
                      buttonWidth="w-36"
                      fullWidthBtn
                      buttonTitleStylings="text-base font-semibold pl-1"
                      iconWidth="16"
                      iconHeight="20"
                      fillClassName="#00A800"
                      btnType="save_btn"
                      title="ASSIGN"
                    />
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default memo(AppModal);
