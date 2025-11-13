import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

/**
 * 🔷 BlueNavbar Component
 * Common EPFO-style blue navigation bar used across all employer pages.
 * Supports dropdown (e.g. Payments) and hover interactions.
 */

const navItems = [
  { label: "Home", to: "/dashboard" },
  { label: "Establishment", to: "/establishment" },
  {
    label: "Payments",
    to: "/returns",
    dropdown: [{ label: "Return Filing (Quick Links)", to: "/returns" }],
  },
  { label: "Dashboard", to: "/dashboard" },
  { label: "UAN", to: "/uan" },
  { label: "Admin", to: "/admin" },
  { label: "Online Services", to: "/services" },
  { label: "ABRY", to: "/abry" },
  { label: "Past Accum. File Upload", to: "/file-upload" },
  { label: "Surrender Exemption", to: "/surrender" },
];

const BlueNavbar = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <nav className="bg-[#0b2c6b] shadow-sm">
      <div className="px-10 flex flex-wrap text-[0.875rem] font-medium text-white">
        {navItems.map((item) => {
          const isOpen = openDropdown === item.label;
          const hasDropdown = !!item.dropdown;

          return (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => hasDropdown && setOpenDropdown(item.label)}
              onMouseLeave={() => hasDropdown && setOpenDropdown(null)}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1 px-4 py-3 border-r border-[#0d377a] transition-all duration-300 ${
                    isActive
                      ? "bg-[#002060] text-white font-semibold shadow-inner"
                      : "hover:bg-[#1c4587] hover:text-white"
                  }`
                }
                onClick={(event) => {
                  if (hasDropdown) {
                    event.preventDefault();
                    setOpenDropdown((prev) =>
                      prev === item.label ? null : item.label
                    );
                  } else {
                    setOpenDropdown(null);
                  }
                }}
              >
                {item.label}

                {/* Show arrow only for Payments */}
                {item.label === "Payments" && (
                  <span
                    className={`ml-1 text-xs transition-transform duration-200 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▾
                  </span>
                )}
              </NavLink>

              {/* Dropdown menu */}
              {hasDropdown && isOpen && (
                <div className="absolute left-0 top-full z-50 min-w-[240px] rounded-b-md border border-gray-200 bg-white text-gray-800 shadow-lg transition-all duration-200">
                  {item.dropdown.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate(option.to);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm transition hover:bg-[#e6ecf5] hover:text-[#0b2c6b]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default BlueNavbar;
