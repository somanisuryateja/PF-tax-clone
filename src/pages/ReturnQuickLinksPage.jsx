import { Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";

const tableRows = [
  {
    title: "Return Filing",
    links: [
      { label: "Return Filing Home Page", to: "/returns/monthly" },
      { label: "Return Filing History", to: "/returns/history" },
      { label: "Challans History", to: "/returns/challans/history" },
    ],
  },
  {
    title: "Return Challans",
    links: [
      { label: "View/Pay Challan", to: "/returns/challans" },
      { label: "Direct Challan Entry", to: "/returns/challans/direct-entry" },
      { label: "Challans History", to: "/returns/challans/history" },
    ],
  },
  {
    title: "Arrear",
    links: [
      { label: "File Arrear Return", to: "/returns/arrears" },
      { label: "Arrear History", to: "/returns/arrears/history" },
    ],
  },
];

const ReturnQuickLinksPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <DashboardHeader />
        <BlueNavbar />
      </header>

      <main className="mx-auto py-8">
        {/* Breadcrumb */}
        <div className="w-full px-4 py-2 bg-gray-100 mb-2">
          <nav className="text-[13px] font-semibold">
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-black">Return Home Page</span>
          </nav>
        </div>

        {/* Header */}
        <div className="w-full px-4 py-2 mb-2 border-t-2 border-b-2 border-[#99c2ff]">
          <h2 className="text-[16px] font-semibold text-[#b8860b]">
            * Return Quick Links:
          </h2>
        </div>

        {/* Table Box */}
        <div className=" rounded-sm shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto p-6">
            <table className="w-full text-[13px] text-[#003366] border-collapse border border-gray-300">
              <tbody>
                {tableRows.map((row, rowIndex) => {
                  // Alternating backgrounds: 0=ash, 1=white, 2=ash
                  const bgColor = rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white";
                  
                  return (
                    <tr
                      key={row.title}
                      className={`${bgColor} ${rowIndex < tableRows.length - 1 ? "border-b border-gray-300" : ""}`}
                    >
                      <th className={`${bgColor} px-4 py-2 text-left font-semibold w-1/5 text-black text-[14px] border-r border-gray-300`}>
                        {row.title}
                      </th>
                      {row.links.map((link, linkIndex) => (
                        <td 
                          key={link.label} 
                          className={`px-4 py-2 ${linkIndex < row.links.length - 1 ? "border-r border-gray-300" : ""}`}
                        >
                          <Link
                            to={link.to}
                            className="text-[#003366] hover:underline font-medium"
                          >
                            {link.label}
                          </Link>
                        </td>
                      ))}
                      {/* Fill empty cells if row has fewer than 3 links */}
                      {row.links.length < 3 && (
                        <td className="px-4 py-2" />
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReturnQuickLinksPage;

