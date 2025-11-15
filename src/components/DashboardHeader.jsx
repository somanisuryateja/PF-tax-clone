import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const DashboardHeader = () => {
  const { employer, logout } = useAuth();
  const loginDate = useMemo(() => new Date().toLocaleString(), []);

  const handleLogout = () => {
    localStorage.removeItem('pf-token');
    localStorage.removeItem('pf-employer');
    logout();
    window.location.replace("/");
  };

  return (
    <header className=" rounded-md border-b border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: EPFO logo */}
        <div className="flex items-center gap-3">
          <img
            src="https://www.epfindia.gov.in/images/EPFO_Logo.png"
            alt="EPFO Logo"
            className="h-18 w-auto"
          />
          <div className="hidden border-l border-gray-200 pl-3 text-sm text-gray-600 sm:block">
            <p className="font-semibold text-[#b30000]">
              Employees' Provident Fund Organisation, India
            </p>
            <p>Ministry of Labour &amp; Employment, Government of India</p>
          </div>
        </div>

        {/* Center: Welcome message */}
        <div className="flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Welcome
          </p>
          <h1 className="text-lg font-semibold text-[#b30000]">
            {employer?.establishmentName ?? "Employer"}
          </h1>
          <p className="text-sm text-gray-600">
            Establishment ID:&nbsp;
            <span className="font-medium">
              {employer?.establishmentId ?? "N/A"}
            </span>
          </p>
        </div>

        {/* Right: Contact info & login time */}
        <div className="flex flex-col items-end gap-1 text-sm text-gray-600">
          <div>
            <span className="font-semibold text-[#2333cb]">PF Helpdesk:</span>{" "}
            helpdesk@epfindia.gov.in
          </div>
          <div>
            <span className="font-semibold text-[#2333cb]">Login Time:</span>{" "}
            {loginDate}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

