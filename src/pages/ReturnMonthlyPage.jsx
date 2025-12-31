import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";

const TOTAL_ACTIVE_MEMBERS = 15;
const formatCurrency = (value) => Number(value ?? 0).toLocaleString();
const formatMonthLabel = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const date = new Date(`${value}-01`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleString("en-US", { month: "long" })} ${year}`;
};
const formatDisplay = (value) =>
  value === null || value === undefined || Number.isNaN(value) ? "N.A" : value;

const ReturnMonthlyPage = () => {
  const { employer } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentDate = new Date();
  const defaultMonthYear = currentDate.toISOString().slice(0, 7);
  const [pendingMonthYear, setPendingMonthYear] = useState(defaultMonthYear);
  const [selectedMonthYear, setSelectedMonthYear] =
    useState(defaultMonthYear);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/returns/monthly");
        const months = response.data.months ?? [];
        setData(months);
        if (months.length > 0) {
          setSelectedMonthYear(months[0].wageMonth);
          setPendingMonthYear(months[0].wageMonth);
        }
      } catch (err) {
        setError(err.response?.data?.message ?? "Unable to fetch return summary");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredData = useMemo(() => {
    if (!selectedMonthYear) return data;
    return data.filter((item) => item.wageMonth === selectedMonthYear);
  }, [data, selectedMonthYear]);

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
            <Link to="/returns" className="text-blue-600 hover:underline">
              Return Home Page
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-black">Return Monthly Dashboard</span>
          </nav>
        </div>

        {/* Sub-heading: Search Wage Month */}
        <div className="w-full px-4 py-2 mb-2 border-t-2 border-b-2 border-[#99c2ff]">
          <h2 className="text-[16px] font-semibold text-[#b8860b]">
            * Search Wage Month:
          </h2>
        </div>

        {/* Search Form */}
        <div className="w-full px-4 py-4 mb-2  rounded-sm border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                Wage Month *
              </label>
              <div>
                <input
                  type="month"
                  value={pendingMonthYear}
                  max={defaultMonthYear}
                  onChange={(event) => setPendingMonthYear(event.target.value)}
                  className="w-52 rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedMonthYear(pendingMonthYear)}
                className="rounded-full bg-[#1e40af] px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-[#1e3a8a] transition-all"
              >
                Search
              </button>
            </div>
            <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded text-sm text-green-800">
              <svg
                className="h-4 w-4 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                Last return filed for wage month October 2024.
              </span>
            </div>
          </div>
        </div>

        {/* Sub-heading: Wage Month Wise Return Summary Details */}
     <div className=" ">
     <div className="w-full px-4 py-2 border-t-2 border-b-2 border-[#99c2ff]">
          <h2 className="text-[16px] font-semibold text-[#b8860b]">
            * Wage Month Wise Return Summary Details:
          </h2>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-x-auto  bg-white p-10 border border-gray-300">
          <table className="min-w-full text-[13px] text-gray-700 border border-gray-300">
            <thead className="text-center text-[12px] uppercase tracking-wide">
                <tr className="bg-[#d6ecfb]">
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" rowSpan={2}>
                    Sr.No
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" rowSpan={2}>
                    Wage Month
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" colSpan={3}>
                    Total Members
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" colSpan={4}>
                    Total Wages (₹)
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" colSpan={4}>
                    Total Contribution (₹)
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" rowSpan={2}>
                    NCP Days
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" rowSpan={2}>
                    Return
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" rowSpan={2}>
                    Due / Deposit Balance Summary
                  </th>
                  <th className="border border-gray-300 px-2 py-2 font-semibold text-black" rowSpan={2}>
                    Part Payment / Contribution
                  </th>
                </tr>
                <tr className="bg-[#d6ecfb]">
                  <th className="border border-gray-300 px-2 py-2 text-black">Active</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">Newly Joined</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">Left</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">Gross</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">EPF</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">EPS</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">EDLI</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">EE EPF</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">ER EPF</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">ER EPS</th>
                  <th className="border border-gray-300 px-2 py-2 text-black">Refund of Advance</th>
                </tr>
              </thead>
              <tbody>
                {(filteredData.length > 0 ? filteredData : [{
                  id: selectedMonthYear,
                  wageMonth: selectedMonthYear,
                  members: { active: TOTAL_ACTIVE_MEMBERS, joined: 0, left: 0 },
                  wages: { gross: null, epf: null, eps: null, edli: null },
                  contributions: {
                    employeePf: null,
                    employerPf: null,
                    employerEps: null,
                    refund: null,
                  },
                  ncpDays: null,
                  challan: null,
                }]).map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="text-center bg-white"
                  >
                    <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-2 py-2 font-semibold text-gray-800">
                      {formatMonthLabel(item.wageMonth)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {formatDisplay(item.members?.active ?? TOTAL_ACTIVE_MEMBERS)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {formatDisplay(item.members?.joined)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {formatDisplay(item.members?.left)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.wages?.gross != null ? `₹${formatCurrency(item.wages?.gross)}` : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.wages?.epf != null ? `₹${formatCurrency(item.wages?.epf)}` : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.wages?.eps != null ? `₹${formatCurrency(item.wages?.eps)}` : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.wages?.edli != null ? `₹${formatCurrency(item.wages?.edli)}` : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.contributions?.employeePf != null
                        ? `₹${formatCurrency(item.contributions?.employeePf)}`
                        : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.contributions?.employerPf != null
                        ? `₹${formatCurrency(item.contributions?.employerPf)}`
                        : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.contributions?.employerEps != null
                        ? `₹${formatCurrency(item.contributions?.employerEps)}`
                        : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {item.contributions?.refund != null
                        ? `₹${formatCurrency(item.contributions?.refund)}`
                        : "N.A"}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {formatDisplay(item.ncpDays)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="flex flex-col items-center gap-2">
                        <Link
                          to={`/returns/upload?wageMonth=${item.wageMonth}`}
                          className="inline-flex items-center justify-center rounded-full bg-[#1d4ed8] px-3 py-1 text-xs font-semibold text-white shadow hover:bg-[#1e40af]"
                        >
                          View / Upload
                        </Link>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      {item.challan ? (
                        <Link
                          to={`/returns/challans/${item.challan}`}
                          state={{ mode: "simple" }}
                          className="inline-flex items-center justify-center rounded-full bg-[#047857] px-3 py-1 text-xs font-semibold text-white shadow hover:bg-[#065f46]"
                        >
                          View / Prepare Challan
                        </Link>
                      ) : (
                        <span aria-hidden="true">&nbsp;</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <span aria-hidden="true">&nbsp;</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
     </div>
      </main>
    </div>
  );
};

export default ReturnMonthlyPage;

