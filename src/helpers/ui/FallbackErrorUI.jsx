import { useNavigate } from "react-router-dom";

const FallbackErrorUI = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="p-6 text-center text-red-600">
      <h2 className="text-lg font-bold">Something went wrong 😢</h2>
      <div className="flex flex-wrap justify-center items-center">
        <p className="my-2">{error.message}</p>
      </div>
      <button
        role="button"
        tabIndex={0}
        onClick={() => {
          resetErrorBoundary();
          handleAction;
        }}
        className="bg-[#155DFC] font-semibold cursor-pointer text-white px-4 py-2 mt-4 rounded"
      >
        Go back
      </button>
    </div>
  );
};
export default FallbackErrorUI;
