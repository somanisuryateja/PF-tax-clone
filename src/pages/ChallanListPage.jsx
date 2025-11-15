import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [bannerMessage, setBannerMessage] = useState(location.state?.actionMessage ?? "");
  const [fullPaymentContext, setFullPaymentContext] = useState(() => {
    if (location.state?.fullPaymentContext) return location.state.fullPaymentContext;
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("pf-full-payment-context");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location.state?.actionMessage) {
      setBannerMessage(location.state.actionMessage);
    }
  }, [location.state?.actionMessage]);

  useEffect(() => {
    if (location.state?.fullPaymentContext) {
      setFullPaymentContext(location.state.fullPaymentContext);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pf-full-payment-context", JSON.stringify(location.state.fullPaymentContext));
      }
    }
  }, [location.state?.fullPaymentContext]);
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

      <main className="mx-auto py-8 space-y-6">
        <div className="w-full px-4 py-2 bg-gray-100 mb-2">
          <nav className="flex flex-wrap items-center text-[13px] font-semibold">
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to="/returns" className="text-blue-600 hover:underline">
              Return Home Page
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to="/returns/monthly" className="text-black hover:underline">
              Return Monthly Dashboard
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-black">View / Pay Challans</span>
          </nav>
        </div>

        {bannerMessage && (
          <div className="mx-4 rounded border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✅ {bannerMessage}
          </div>
        )}

        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        <div className="mx-4 mb-2 w-full border-t-2 border-b-2 border-[#99c2ff] px-4 py-2">
          <h2 className="text-[16px] font-semibold text-[#b8860b]">* In-Process Challan List</h2>
        </div>
        <section className="mx-4 rounded-md border border-gray-300 bg-white shadow-sm">
          {loading ? (
            <p className="px-6 py-6 text-sm text-gray-500">Loading challans…</p>
          ) : (
            <div className="overflow-x-auto px-6 py-6">
              <table className="min-w-full border border-gray-300 text-sm text-gray-700">
                <thead className="bg-[#d6ecfb] text-xs uppercase tracking-wide text-black">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">Sr. No.</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">TRRN</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">Wage Month</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">Challan Type</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">Challan Status</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">AC(1)</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">AC(2)</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">AC(10)</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">AC(21)</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">AC(22)</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-left">Total Challan Amount</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-center">Pay Challan</th>
                    <th className="border border-gray-300 px-3 py-2 font-semibold text-center">Cancel Challan</th>
                  </tr>
                </thead>
                <tbody>
                  {inProcess.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="border border-gray-300 px-3 py-6 text-center text-sm text-gray-500">
                        No challans are awaiting payment.
                      </td>
                    </tr>
                  ) : (
                    inProcess.map((challan, index) => {
                      const isFullPaymentChallan =
                        !!fullPaymentContext &&
                        (fullPaymentContext.challanId === challan._id ||
                          fullPaymentContext.trrn === challan.trrn);
                      const paymentLinkState = isFullPaymentChallan
                        ? { mode: "full-payment", fullPaymentContext }
                        : { mode: "simple" };
                      return (
                        <tr key={challan._id} className="bg-white">
                        <td className="border border-gray-200 px-3 py-2">{index + 1}</td>
                        <td className="border border-gray-200 px-3 py-2 font-medium text-gray-800">{challan.trrn}</td>
                        <td className="border border-gray-200 px-3 py-2">{formatMonthLabel(challan.wageMonth)}</td>
                        <td className="border border-gray-200 px-3 py-2">Monthly Contribution</td>
                        <td className="border border-gray-200 px-3 py-2">Due for Payment</td>
                        <td className="border border-gray-200 px-3 py-2">{formatAmount(challan.accounts?.ac1)}</td>
                        <td className="border border-gray-200 px-3 py-2">{formatAmount(challan.accounts?.ac2)}</td>
                        <td className="border border-gray-200 px-3 py-2">{formatAmount(challan.accounts?.ac10)}</td>
                        <td className="border border-gray-200 px-3 py-2">{formatAmount(challan.accounts?.ac21)}</td>
                        <td className="border border-gray-200 px-3 py-2">{formatAmount(challan.accounts?.ac22)}</td>
                        <td className="border border-gray-200 px-3 py-2 font-semibold text-gray-900">
                          {formatAmount(challan.totalAmount)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <Link
                            to={`/returns/challans/${challan._id}`}
                            state={paymentLinkState}
                            className="inline-flex items-center justify-center rounded-full bg-[#0fb4d6] px-4 py-1 text-center text-xs font-semibold text-black shadow hover:bg-[#093a75]"
                          >
                            Pay
                          </Link>
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center">
                          <Link
                            to={`/returns/challans/${challan._id}/cancel`}
                            className="inline-flex items-center justify-center rounded-full bg-[#d8a40a] px-4 py-1 text-center text-xs font-semibold text-black shadow hover:bg-[#093a75]"
                          >
                            Cancel
                          </Link>
                        </td>
                      </tr>
                      );
                    })
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
