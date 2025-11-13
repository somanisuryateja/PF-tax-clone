import React from "react";

/**
 * PublicHeader Component
 * Common header used on public pages (HomePage, LoginPage)
 * Includes top bar and header with EPFO logo and government emblems
 */
const PublicHeader = () => (
  <>
    {/* 🔴 Top Bar */}
    <div className="bg-[#b30000] text-white text-xs sm:text-sm py-2 px-4 flex flex-wrap justify-between items-center">
      <span>Help Desk / Toll-Free Number (14470)</span>
      <span className="mt-1 sm:mt-0">
        Screen Reader Access | Skip to main content | A A A
      </span>
    </div>

    {/* 🟠 Header */}
    <header className="flex flex-wrap justify-between items-center px-6 py-4 border-b border-gray-300 bg-white">
      <div className="flex items-center gap-4">
        <img
          src="https://www.epfindia.gov.in/images/EPFO_Logo.png"
          alt="EPFO Logo"
          className="h-16 w-auto"
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#b30000]">
            Employees' Provident Fund Organisation, India
          </h1>
          <p className="text-sm text-gray-700">
            Ministry of Labour & Employment, Government of India
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0">
        <img
          src="https://www.epfindia.gov.in/images/G20_0.png"
          alt="G20 India"
          className="h-12 w-auto"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Azadi-Ka-Amrit-Mahotsav-Logo.png/330px-Azadi-Ka-Amrit-Mahotsav-Logo.png"
          alt="Azadi Ka Amrit Mahotsav"
          className="h-12 w-auto"
        />
        <img
          src="https://e7.pngegg.com/pngimages/146/150/png-clipart-sarnath-states-and-territories-of-india-lion-capital-of-ashoka-state-emblem-of-india-government-of-india-machias-seal-island-mammal-text-thumbnail.png"
          alt="Ashoka Emblem"
          className="h-12 w-auto"
        />
      </div>
    </header>
  </>
);

export default PublicHeader;

