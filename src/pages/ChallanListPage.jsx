import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";
import { apiClient } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const formatAmount = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatMonthLabel = (value) => {
  if (!value) return "—";
  if (!value.includes("-")) return value;
  const [year, month] = value.split("-");
  const date = new Date(`${value}-01`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleString("en-US", { month: "short" })} ${year}`;
};

const ChallanListPage = () => {
  const { employer } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/challans");
        setChallans(response.data.challans ?? []);
      } catch (err) {
        setError(err.response?.data?.message ?? "Unable to load challans.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const inProcess = challans.filter((challan) => challan.status === "due");

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <DashboardHeader />
        <BlueNavbar />
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <header className="rounded-md border border-gray-300 bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold text-[#b30000]">
            View / Pay Challans
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Home › Return Home Page › Return Monthly Dashboard › View / Pay Challans
          </p>
        </header>

        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        <section className="rounded-md border border-gray-300 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">In-Process Challan List</h2>
            <span className="text-xs font-semibold uppercase text-gray-500">
              Displaying {Math.max(inProcess.length, 1)} record(s)
            </span>
          </header>
          {loading ? (
            <p className="px-6 py-6 text-sm text-gray-500">Loading challans…</p>
          ) : (
            <div className="overflow-x-auto px-6 py-6">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-semibold">Sr. No.</th>
                    <th className="px-3 py-2 font-semibold">TRRN</th>
                    <th className="px-3 py-2 font-semibold">Wage Month</th>
                    <th className="px-3 py-2 font-semibold">Challan Type</th>
                    <th className="px-3 py-2 font-semibold">Challan Status</th>
                    <th className="px-3 py-2 font-semibold">AC(1)</th>
                    <th className="px-3 py-2 font-semibold">AC(2)</th>
                    <th className="px-3 py-2 font-semibold">AC(10)</th>
                    <th className="px-3 py-2 font-semibold">AC(21)</th>
                    <th className="px-3 py-2 font-semibold">AC(22)</th>
                    <th className="px-3 py-2 font-semibold">Total Challan Amount</th>
                    <th className="px-3 py-2 font-semibold">Pay Challan</th>
                    <th className="px-3 py-2 font-semibold">Cancel Challan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inProcess.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-3 py-6 text-center text-sm text-gray-500">
                        No challans are awaiting payment.
                      </td>
                    </tr>
                  ) : (
                    inProcess.map((challan, index) => (
                      <tr key={challan._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">{challan.trrn}</td>
                        <td className="px-3 py-2">{formatMonthLabel(challan.wageMonth)}</td>
                        <td className="px-3 py-2">Monthly Contribution</td>
                        <td className="px-3 py-2">Due for Payment</td>
                        <td className="px-3 py-2">{formatAmount(challan.accounts?.ac1)}</td>
                        <td className="px-3 py-2">{formatAmount(challan.accounts?.ac2)}</td>
                        <td className="px-3 py-2">{formatAmount(challan.accounts?.ac10)}</td>
                        <td className="px-3 py-2">{formatAmount(challan.accounts?.ac21)}</td>
                        <td className="px-3 py-2">{formatAmount(challan.accounts?.ac22)}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {formatAmount(challan.totalAmount)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Link
                            to={`/returns/challans/${challan._id}`}
                            className="rounded bg-[#047857] px-3 py-1 text-center text-xs font-semibold text-white hover:bg-[#065f46]"
                          >
                            Pay
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Link
                            to={`/returns/challans/${challan._id}/cancel`}
                            className="rounded border border-rose-400 px-3 py-1 text-center text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Cancel
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default ChallanListPage;
