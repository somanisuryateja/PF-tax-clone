import React from "react";

const HomeFooter = () => (
  <>
    {/* 🔵 Footer Links */}
    <section className="flex flex-wrap justify-center gap-4 px-6 py-5 bg-[#f1f3fe] border-t border-gray-300 text-sm">
      <span className="text-[#2333cb] font-medium cursor-not-allowed">
        Employers Portal
      </span>
      <span className="text-[#2333cb] font-medium cursor-not-allowed">
        Pradhan Mantri Rojgar Protsahan Yojana
      </span>
      <span className="text-[#2333cb] font-medium cursor-not-allowed">
        mGovernance
      </span>
      <span className="text-[#2333cb] font-medium cursor-not-allowed">
        Ministry of Labour & Employment
      </span>
    </section>

    {/* ⚫ Footer */}
    <footer className="bg-[#2333cb] text-white text-center text-xs sm:text-sm py-3">
      © Owned and Developed by Employees’ Provident Fund Organisation, India | Last updated:
      23-Oct-2025
    </footer>
  </>
);

export default HomeFooter;

