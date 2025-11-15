import React from "react";

const HomeFooter = () => (
  <>
    {/* 🔵 Top Grey Link Bar */}
    <section className="w-full bg-[#e9e9e9] border-t border-gray-300">
      <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-black py-3">
        <a className="hover:underline cursor-pointer">Home</a> |
        <a className="hover:underline cursor-pointer">Contact Us</a> |
        <a className="hover:underline cursor-pointer">Help</a> |
        <a className="hover:underline cursor-pointer">Sitemap</a> |
        <a className="hover:underline cursor-pointer">Disclaimer</a> |
        <a className="hover:underline cursor-pointer">Copyright Policy</a> |
        <a className="hover:underline cursor-pointer">Hyperlinking Policy</a> |
        <a className="hover:underline cursor-pointer">Terms Of Use</a> |
        <a className="hover:underline cursor-pointer">Feedback</a> |
        <a className="hover:underline cursor-pointer">Privacy Policy</a>
      </div>
    </section>

    {/* 🔴 Bottom Red Footer */}
    <footer className="w-full bg-[#b60000] text-white text-xs sm:text-sm py-3">
      <div className="flex flex-col sm:flex-row justify-between items-center px-5 gap-2 text-center">
        <span>
          © Owned and Developed by Employees’ Provident Fund Organisation, India
        </span>

        <span>Last updated: 23-Oct-2025</span>

        <span>
          Visitor Count (w.e.f 06-08-2016): <b>3281079552</b>
        </span>
      </div>
    </footer>
  </>
);

export default HomeFooter;
