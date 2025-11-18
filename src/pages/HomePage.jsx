import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGlobe } from "react-icons/fa";
import PublicHeader from "../components/PublicHeader.jsx";
import HomeFooter from "../components/HomeFooter.jsx";

const bannerOptions = [
  "Establishment Registration",
  "KYC Updation (Member)",
  "UMANG",
  "ECR/Returns/Payment",
  "Online Claims",
  "Member Account Transfer",
  "e-Passbook",
  "Performance of Establishments",
  "Revamped ECR/FAQs",
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    if (option === "ECR/Returns/Payment") {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <PublicHeader />

      {/* 🔵 Navigation */}
      <nav className="bg-[#0b2c6b] shadow-sm">
        <div className="px-6 sm:px-10 flex flex-wrap justify-center text-[0.875rem] font-medium text-white">
          {[
            "Services",
            "Exempted Estt",
            "EPFO Corner",
            "Miscellaneous",
            "Directory",
            "Payroll Data",
            "ABRY",
            "Dashboards",
            "Covid-19",
            "Downloads",
          ].map((item) => (
            <div key={item} className="relative border-r border-[#0d377a] last:border-none">
              <button
                type="button"
                disabled
                className="flex items-center gap-1 px-3 sm:px-4 py-3 text-white transition-colors duration-200 bg-transparent hover:bg-[#1c4587]/70 disabled:text-white/80 disabled:cursor-not-allowed"
              >
                {item}
                <span className="text-xs text-white/70 translate-y-px">▾</span>
              </button>
            </div>
          ))}
        </div>
      </nav>

      {/* 🟣 Banner */}
      <section className="px-4 sm:px-6 sm:pt-3">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <div className="w-full lg:basis-[60%]">
            <img
              src="https://www.epfindia.gov.in/images/PMVBRY%20Banner.jpg"
              alt="PMVBRY Banner"
              className="w-full rounded-xl shadow-md border border-gray-200"
              loading="lazy"
            />
          </div>

          <div className="w-full lg:basis-[40%]">
            <div className="grid grid-cols-2 gap-3">
              {bannerOptions.map((option) => {
                const isEnabled = option === "ECR/Returns/Payment";
                return (
                  <div
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className={`flex items-center justify-center rounded-md border border-[#0d377a] bg-[#0b2c6b] px-3 py-2 text-center text-[0.9rem] font-medium text-white shadow-sm ${
                      isEnabled ? "transition-colors duration-200 hover:bg-white hover:text-[#0b2c6b] cursor-pointer" : ""
                    }`}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 🟡 Main Section */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-10 flex-1">
        {/* Online Services */}
        <div className="rounded-md border border-gray-400 shadow-sm">
          <div className="bg-gray-300 px-5 py-3 rounded-t-md flex items-center gap-3">
            <FaGlobe className="text-[#6A2FC3] text-2xl" aria-hidden="true" />
            <h3 className="text-2xl font-bold text-[#6A2FC3]">
              Online Services
            </h3>
          </div>
          <ul className="list-none px-5 py-4 text-sm text-gray-800 space-y-2">
            {[
              "Establishment e-Report Card",
              "Principal Employers-CATU Portal",
              "Pensioners’ Portal",
              "EDLI & Pension Calculator",
              "Jeevan Pramaan Through Mobile App (Process Flow)",
              "TBRN Query Search",
              "International Workers Portal",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[#6A2FC3]">→</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* About Us */}
        <div className="rounded-md border border-gray-400 shadow-sm">
          <div className="bg-gray-300 px-5 py-3 rounded-t-md">
            <h3 className="text-2xl font-bold text-[#6A2FC3]">
              About Us
            </h3>
          </div>
          <ul className="list-disc px-6 py-4 text-sm text-gray-800 space-y-2">
            <li>
              EPFO stands among the world’s leading social security organizations,
              serving millions of members and establishments.
            </li>
            <li>
              Currently manages over 29 crore accounts and handles large-scale
              financial operations nationwide.
            </li>
            <li>
              Origin traces back to the Employees’ Provident Funds Ordinance (1951),
              later replaced by the EPF & MP Act, 1952.
            </li>
            <li>
              Operates under the Ministry of Labour & Employment, Government of India.
            </li>
          </ul>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default HomePage;
