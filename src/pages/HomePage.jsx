import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader.jsx";
import HomeFooter from "../components/HomeFooter.jsx";

const quickActions = [
  "Establishment Registration",
  "KYC Updation (Member)",
  "UMANG",
  "ECR/Returns/Payment",
  "Online Claims Member Account Transfer",
  "e-Passbook",
  "Performance of Establishments",
  "Revamped ECR/FAQs",
];

const HomePage = () => {
  console.log('🟢 [HOME PAGE] Component rendered');
  console.log('🟢 [HOME PAGE] Current URL:', window.location.href);
  console.log('🟢 [HOME PAGE] localStorage token:', localStorage.getItem('pf-token') ? 'EXISTS' : 'EMPTY');
  console.log('🟢 [HOME PAGE] localStorage employer:', localStorage.getItem('pf-employer') ? 'EXISTS' : 'EMPTY');
  
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <PublicHeader />

      {/* 🔵 Navigation */}
      <nav className="bg-[#2333cb] text-white text-sm font-medium flex flex-wrap justify-center gap-3 py-2 px-4">
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
          <button
            key={item}
            type="button"
            className="px-3 py-1 rounded-md cursor-not-allowed bg-white/10 text-white/80"
          >
            {item}
          </button>
        ))}
      </nav>

      {/* 🟣 Banner */}
      <section className="flex flex-col md:flex-row justify-center items-center bg-[#722f91] text-white px-6 py-10 gap-8 text-center md:text-left">
        <div className="max-w-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">
            Pradhan Mantri Viksit Bharat Rozgar Yojana
          </h2>
          <p className="text-base leading-relaxed">
            "रोजगार या स्वरोजगार के अनुप्रेरक बनाना, ये भारत सरकार का संकल्प और प्रतिबद्धता है।
            एम्प्लॉयीज़ प्रोविडेंट फंड के ज़रिए देश में करोड़ों रोजगार सृजन होंगे।" — श्री नरेंद्र मोदी
          </p>
        </div>
        <img
          src="https://wallpapers.com/images/hd/indian-leaderin-traditional-attire-41692svz6o3u223h.png"
          alt="PM Narendra Modi"
          className="rounded-lg w-48 sm:w-60 md:w-72 shadow-lg"
        />
      </section>

      {/* 🟢 Quick Action Buttons */}
      <section className="bg-[#f8f9ff] py-5 px-4 flex flex-wrap justify-center gap-3">
        {quickActions.map((item) =>
          item === "ECR/Returns/Payment" ? (
            <Link
              key={item}
              to="/login"
              className="bg-[#b30000] text-white text-sm px-4 py-2 rounded-md shadow hover:bg-[#cc3333] transition"
            >
              {item}
            </Link>
          ) : (
            <button
              key={item}
              type="button"
              disabled
              className="bg-gray-300 text-gray-600 text-sm px-4 py-2 rounded-md cursor-not-allowed opacity-70"
            >
              {item}
            </button>
          )
        )}
      </section>

      {/* 🟡 Main Section */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-10 flex-1">
        {/* Left: Online Services */}
        <div className="bg-[#f3f5ff] rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#2333cb] mb-4">
            Online Services
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>
              Establishment e-Report Card{" "}
              <span className="text-[#2333cb]">↗</span>
            </li>
            <li>
              Principal Employers-CATU Portal{" "}
              <span className="text-[#2333cb]">↗</span>
            </li>
            <li>
              Pensioners’ Portal <span className="text-[#2333cb]">↗</span>
            </li>
            <li>EDLI & Pension Calculator</li>
            <li>
              Jeevan Pramaan Through Mobile App{" "}
              <span className="text-[#2333cb]">(Process Flow ↗)</span>
            </li>
            <li>TBRN Query Search</li>
            <li>International Workers Portal</li>
          </ul>
        </div>

        {/* Center: About Us */}
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-[#2333cb] mb-4">
            About Us
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            EPFO ranks among the globe’s premier Social Security Organizations,
            distinguished by its vast clientele and the magnitude of financial
            transactions it manages. At present it maintains 29.88 crore
            accounts and oversees financial operations at a massive scale.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            The inception of the Employees’ Provident Fund dates back to the
            enactment of the Employees’ Provident Funds Ordinance on November
            15, 1951, which was later replaced by the Employees’ Provident Funds
            and Miscellaneous Provisions Act, 1952. The organization operates
            under the Ministry of Labour & Employment, Government of India.
          </p>
        </div>

        {/* Right: What's New */}
        <div className="bg-[#f3f5ff] rounded-xl p-5 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#2333cb] mb-4">
            What's New
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li>
              Notice inviting applications for empanelment of advocates (2025)
              <span className="text-[#2333cb]">...Read</span>
            </li>
            <li>
              Empanelment of Chartered Accountants (Mumbai, Thane)
              <span className="text-[#2333cb]">...Read</span>
            </li>
            <li>
              Extension of date for inviting applications
              <span className="text-[#2333cb]">...Read</span>
            </li>
            <li>
              CBT admission schemes and portal upgrades
              <span className="text-[#2333cb]">...Read</span>
            </li>
          </ul>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default HomePage;
