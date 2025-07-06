import { Slide, toast } from "react-toastify";

const toastType = ["info", "success", "warning", "error", "default"];

const toastAlert = (
  type,
  toastBody,
  position,
  toastId,
  options = { autoClose: 5000, draggable: true, transition: Slide }
) => {
  if (toastId) toast.dismiss(toastId.current);

  if (toastType?.includes(type)) {
    toast[type](toastBody, {
      position,
      toastId,
      ...options,
    });
  } else {
    toast(toastBody || "Default Toast", {
      position,
      toastId,
      ...options,
    });
  }
};

export default toastAlert;
