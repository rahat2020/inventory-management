import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "react-feather";
import AppSpinner from "../helpers/ui/AppSpinner";

const NotFound = ({
  title = "No data found",
  message = "We couldn't find any data matching your criteria.",
  actionLabel = "Go back",
  onAction,
  spinnerClass = "",
  isLoading = false,
}) => {
  const [loading, setLoading] = useState(isLoading);
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
      setLoading(true);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className={spinnerClass}>
        <AppSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center h-screen w-full p-4 rounded-lg shadow-s">
        <div className="w-full">
          <div className="pt-6 px-6 pb-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <HelpCircle className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-500 mb-6 max-w-xs">{message}</p>
            <button
              onClick={handleAction}
              disabled={loading}
              className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-brand text-white rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft width="12" height="12" className="fill-white" />
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
