import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";

const DashboardPage = () => {
  const { employer } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/dashboard");
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message ?? "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <DashboardHeader />
        <BlueNavbar />
      </header>

      <main className="mx-auto px-6 py-8 space-y-6">
  {/* === Top Row: Alerts + Employer Profile === */}
  <div className="grid gap-6 lg:grid-cols-2">
    {/* ===== Alerts & To-Do Tasks ===== */}
    <section className="rounded-md shadow-md bg-white">
      {/* Header */}
      <header className="flex items-center gap-2 bg-white text-[#003366] px-4 py-2 rounded-t-md shadow-sm">
        <div className="bg-[#ffcc00] text-[#003366] border border-[#003366] font-bold text-xs flex items-center justify-center w-5 h-5 rounded-full shadow-sm">
          i
        </div>
        <h2 className="text-[15px] font-semibold tracking-wide">
          Alerts & To-Do Tasks
        </h2>
      </header>

      {/* Body */}
      <div className="p-4 space-y-2 bg-transparent">
        {/* 🔴 Red Alert */}
        <div className="flex items-start gap-2 bg-[#f8d7da] text-[#721c24] text-[13px] px-3 py-2.5 rounded-sm shadow-sm">
          <span className="text-[15px] mt-px">⚠️</span>
          <p>
            <strong>Dear Employers,</strong> Recently introduced OTP-based
            second factor authentication in employer’s login has been
            temporarily relaxed to enable Employers to update their mobile
            number after logging into Employee Portal.
          </p>
        </div>

        {/* 🔵 Blue Alerts */}
        <div className="bg-[#d1ecf1] text-[#0c5460] text-[13px] px-3 py-2.5 rounded-sm shadow-sm">
          <p>
            Dear Employer, You are liable to pay <strong>damages (14B)</strong>{" "}
            on belated payment of dues.{" "}
            <span className="text-[#004085] underline cursor-pointer">
              Click here
            </span>{" "}
            to pay.
          </p>
        </div>

        <div className="bg-[#d1ecf1] text-[#0c5460] text-[13px] px-3 py-2.5 rounded-sm shadow-sm">
          <p>
            Dear Employer, You are liable to pay <strong>interest (7Q)</strong>{" "}
            on belated remittance of contribution.{" "}
            <span className="text-[#004085] underline cursor-pointer">
              Click here
            </span>{" "}
            to pay.
          </p>
        </div>

        <div className="bg-[#d1ecf1] text-[#0c5460] text-[13px] px-3 py-2.5 rounded-sm shadow-sm">
          <p>
            Digital Signature process has been updated.{" "}
            <span className="text-[#004085] underline cursor-pointer">
              Click here
            </span>{" "}
            to view new procedure.
          </p>
        </div>

        <div className="bg-[#d1ecf1] text-[#0c5460] text-[13px] px-3 py-2.5 rounded-sm shadow-sm">
          <p>
            File Monthly ECR for employees completing 58 years this month.{" "}
            <span className="text-[#004085] underline cursor-pointer">PDF</span>{" "}
            |{" "}
            <span className="text-[#004085] underline cursor-pointer">
              Excel
            </span>
          </p>
        </div>

        {/* To-Do Section */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#003366] mb-2 border-b border-gray-200 pb-1">
            To-Do Tasks
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              "Submit monthly ECR returns before end of month.",
              "Update employer mobile number for 2FA.",
              "Upload digital signature certificate.",
            ].map((text, idx) => (
              <li
                key={idx}
                className="flex justify-between bg-[#f8f9fa] px-3 py-2 rounded-sm shadow-sm"
              >
                <span>{text}</span>
                <span className="text-xs uppercase text-gray-500">Pending</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    {/* ===== Employer Profile ===== */}
    <section className="rounded-md shadow-md bg-white">
      <header className="flex items-center gap-2 bg-white text-[#003366] px-4 py-2 rounded-t-md shadow-sm">
        <div className="bg-[#ffcc00] text-[#003366] border border-[#003366] font-bold text-xs flex items-center justify-center w-5 h-5 rounded-full shadow-sm">
          i
        </div>
        <h3 className="text-[15px] font-semibold tracking-wide">
          Employer Profile
        </h3>
      </header>
      <div className="p-5 text-sm text-gray-700 bg-transparent min-h-[180px]">
        <div className="flex justify-between py-1">
          <span>Establishment Name</span>
          <span className="font-medium">
            {employer?.establishmentName ?? "N/A"}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span>Establishment ID</span>
          <span className="font-medium">
            {employer?.establishmentId ?? "—"}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span>Total Members</span>
          <span className="font-medium">15</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Digital Signature</span>
          <span className="font-medium text-yellow-700">Pending</span>
        </div>
      </div>
    </section>
  </div>

  {/* === Bottom Row: What's New + Online Services === */}
  <div className="grid gap-6 lg:grid-cols-2">
    {/* ===== What's New ===== */}
    <section className="rounded-md shadow-md bg-white">
      <header className="flex items-center gap-2 bg-white text-[#003366] px-4 py-2 rounded-t-md shadow-sm">
        <div className="bg-[#ffcc00] text-[#003366] border border-[#003366] font-bold text-xs flex items-center justify-center w-5 h-5 rounded-full shadow-sm">
          i
        </div>
        <h3 className="text-[15px] font-semibold tracking-wide">What’s New</h3>
      </header>
      <div className="p-5 text-sm text-gray-700 bg-transparent">
        EPFO services are continuously updated to enhance user experience. Stay
        informed on policy updates, compliance deadlines, and ECR filing
        guidelines.
      </div>
    </section>

    {/* ===== Online Services ===== */}
    <section className="rounded-md shadow-md bg-white">
      <header className="flex items-center gap-2 bg-white text-[#003366] px-4 py-2 rounded-t-md shadow-sm">
        <div className="bg-[#ffcc00] text-[#003366] border border-[#003366] font-bold text-xs flex items-center justify-center w-5 h-5 rounded-full shadow-sm">
          i
        </div>
        <h3 className="text-[15px] font-semibold tracking-wide">
          Online Services
        </h3>
      </header>
      <div className="p-5 text-sm text-gray-700 bg-transparent">
        <span className="text-[#004085] font-medium underline cursor-pointer">
          Click here
        </span>{" "}
        to view pendency statistics.
      </div>
    </section>
  </div>
</main>

    </div>
  );
};

export default DashboardPage;
