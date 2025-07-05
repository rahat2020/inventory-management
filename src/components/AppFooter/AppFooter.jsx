import { Link } from "react-router-dom";

const AppFooter = () => {
  return (
    <div className="w-full bg-[#3AABD9] text-white py-1 px-4 flex flex-col md:flex-row justify-between items-center text-sm">
      <div className="text-xs font-medium">
        <Link to="https://berrylabs.net/" target="_blank">
          © BERRYLABS, ALL RIGHTS RESERVED
        </Link>
      </div>
      <div className="text-xs font-medium">OWN COMPANY LTD.</div>
      <div className="text-xs font-medium">
        <Link to="#" className="hover:underline">
          HELP
        </Link>{" "}
        |{" "}
        <Link to="#" className="hover:underline">
          SUPPORT
        </Link>
      </div>
    </div>
  );
};
export default AppFooter;
