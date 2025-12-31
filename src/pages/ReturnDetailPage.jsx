import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";
import { apiClient } from "../api/client.js";

const formatMoney = (value) => Number(value ?? 0).toLocaleString("en-IN");

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const toShortMonth = (value) => {
  if (!value) return "";
  if (!value.includes("-")) return value;
  const date = new Date(`${value}-01`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
};

const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialBanner = location.state?.actionMessage ?? "";

  const [bannerMessage, setBannerMessage] = useState(initialBanner);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get(`/returns/${id}`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to load return details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadDetails();
    }
  }, [id, loadDetails]);

  useEffect(() => {
    if (initialBanner) {
      setBannerMessage(initialBanner);
    } else if (data?.status === "approved" && data?.trrn) {
      setBannerMessage(
        `Return File Id [${data.trrn}] approved successfully. Kindly prepare the challan using appropriate payment option.`
      );
    }
  }, [initialBanner, data]);

  const statement = data?.statement;
  const totals = data?.totals;
  const members = totals?.members ?? { active: 15, joined: 0, left: 0 };
  const wageMonthLabel = toShortMonth(data?.wageMonth);
  const totalGrossWages = totals?.wages?.gross ?? 0;
  const totalEpfWages = totals?.wages?.epf ?? 0;
  const totalEpsWages = totals?.wages?.eps ?? 0;
  const totalEdliWages = totals?.wages?.edli ?? 0;
  const totalNcpDays = totals?.ncpDays ?? 0;

  const totalEpfContribution = totals?.contributions?.employeePf ?? 0;
  const totalEpsContribution = totals?.contributions?.employerEps ?? 0;
  const totalDiffContribution = totals?.contributions?.difference ?? 0;
  const totalRefundOfAdvance = totals?.contributions?.refund ?? 0;
  const totalEdliContribution = Number((totalEdliWages * 0.005).toFixed(2));
  const sumOfContribution = totalEpfContribution + totalEpsContribution + totalDiffContribution + totalEdliContribution;
  const totalActiveMembers = members.active ?? 15;
  const newlyJoinedMembers = members.joined ?? 0;
  const totalLeftMembers = members.left ?? 0;
  const totalReturnMemberCount = 15;

  const contributionSummary = useMemo(
    () => ({
      epf: totalEpfContribution,
      eps: totalEpsContribution,
      diff: totalDiffContribution,
      edli: totalEdliContribution,
      refund: totalRefundOfAdvance,
      total: sumOfContribution,
    }),
    [totalEpfContribution, totalEpsContribution, totalDiffContribution, totalEdliContribution, totalRefundOfAdvance, sumOfContribution]
  );

  const accountSummary = useMemo(() => {
    if (!totals) return null;
    const due = {
      ac1: totalEpfContribution + totalDiffContribution,
      ac2: Math.max(totalEpfWages * 0.005, 500),
      ac10: totalEpsContribution,
      ac21: totalEdliContribution,
      ac22: 0,
    };
    const dueTotal = due.ac1 + due.ac2 + due.ac10 + due.ac21 + due.ac22;
    const paid = { ac1: 0, ac2: 0, ac10: 0, ac21: 0, ac22: 0, total: 0 };
    const balance = {
      ac1: due.ac1 - paid.ac1,
      ac2: due.ac2 - paid.ac2,
      ac10: due.ac10 - paid.ac10,
      ac21: due.ac21 - paid.ac21,
      ac22: due.ac22 - paid.ac22,
      total: dueTotal - paid.total,
    };
    return {
      due: { ...due, total: dueTotal },
      paid,
      balance,
    };
  }, [totals, totalEpfContribution, totalDiffContribution, totalEpfWages, totalEpsContribution, totalEdliContribution]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <DashboardHeader />
        <BlueNavbar />
      </header>

      <main className="mx-auto py-8 space-y-6">
        {/* Breadcrumb */}
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
            <span className="text-black">Due / Deposit Balance Summary</span>
          </nav>
        </div>

        {error && (
          <div className="mx-4 rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        {bannerMessage && !error && (
          <div className="mx-4 rounded border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✅ {bannerMessage}
          </div>
        )}

        {loading && (
          <div className="mx-4 rounded border border-slate-200 bg-white px-6 py-6 text-sm text-slate-500 shadow-sm">
            Loading return summary…
          </div>
        )}

        {statement && (
          <>
            <div className="mx-4 mb-2 w-full border-t-2 border-b-2 border-[#99c2ff] px-4 py-2">
              <h2 className="text-[16px] font-semibold text-[#b8860b]">
                * Return Summary for Wage Month: {wageMonthLabel || "—"}
              </h2>
            </div>
            <section className="mx-4 rounded-md border border-gray-300 bg-white shadow-sm">
              <div className="space-y-6 px-6 py-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="overflow-hidden rounded border border-gray-300">
                  <header className="border-b border-gray-300 bg-[#d6ecfb] px-4 py-2 text-sm font-semibold uppercase text-black text-center">
                    Establishment Details
                  </header>
                  <table className="w-full border-collapse text-sm text-gray-700">
                    <tbody>
                      {[
                        ['PF Exemption Status', 'No'],
                        ['Pension Exemption Status', 'No'],
                        ['EDLI Exemption Status', 'No'],
                        ['Total Active Members', totalActiveMembers],
                        ['Newly Joined Members', newlyJoinedMembers],
                        ['Total Left Members', totalLeftMembers],
                        ['Total NCP Days', totalNcpDays],
                        ['Total Return Member Count', totalReturnMemberCount],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">{label}</th>
                          <td className="border border-gray-200 px-4 py-2 text-right font-semibold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-hidden rounded border border-gray-300">
                  <header className="border-b border-gray-300 bg-[#d6ecfb] px-4 py-2 text-sm font-semibold uppercase text-black text-center">
                    Wage Summary
                  </header>
                  <table className="w-full border-collapse text-sm text-gray-700">
                    <tbody>
                      {[
                        ['Total Gross Wages', `₹${formatMoney(totals?.wages?.gross)}`],
                        ['Total EPF Wages', `₹${formatMoney(totals?.wages?.epf)}`],
                        ['Total EPS Wages', `₹${formatMoney(totals?.wages?.eps)}`],
                        ['Total EDLI Wages', `₹${formatMoney(totals?.wages?.edli)}`],
                        ['Total NCP Days', totalNcpDays],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-600">{label}</th>
                          <td className="border border-gray-200 px-4 py-2 text-right font-semibold">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-hidden rounded border border-gray-300">
                  <header className="border-b border-gray-300 bg-[#d6ecfb] px-4 py-2 text-sm font-semibold uppercase text-black text-center">
                    Contribution Summary
                  </header>
                  <table className="w-full border-collapse text-sm text-gray-700">
                    <tbody>
                      {[
                        ['Total EPF Contribution', `₹${formatMoney(contributionSummary.epf)}`],
                        ['Total EPF-EPS Contribution', `₹${formatMoney(contributionSummary.diff)}`],
                        ['Total EPS Contribution', `₹${formatMoney(contributionSummary.eps)}`],
                        ['Total EDLI Contribution', `₹${formatMoney(contributionSummary.edli)}`],
                        ['Total Refund of Advances', `₹${formatMoney(contributionSummary.refund)}`],
                        ['Sum of Contribution', `₹${formatMoney(contributionSummary.total)}`],
                      ].map(([label, value], index, arr) => (
                        <tr key={label}>
                          <th className={`border border-gray-200 px-4 py-2 text-left font-medium text-gray-600`}>
                            {label}
                          </th>
                          <td
                            className={`border border-gray-200 px-4 py-2 text-right font-semibold ${
                              label === 'Sum of Contribution' ? 'text-[#0f766e]' : ''
                            }`}
                          >
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            </section>
          </>
        )}

        {accountSummary && (
          <section className="mx-4 rounded-md border border-gray-300 bg-white shadow-sm">
            <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
              <h2 className="text-[16px] font-semibold text-[#b8860b]">* Total Account Wise Summary</h2>
            </header>
            <div className="overflow-x-auto px-6 py-6">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-[#d6ecfb] text-left text-xs uppercase tracking-wide text-black">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 font-semibold" />
                    <th className="border border-gray-200 px-3 py-2 font-semibold">AC(1)</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">AC(2) Admin Charges</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">AC(10)</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">AC(21) EDLI</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">AC(22) EDLI Admin Charges</th>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Due</th>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.due.ac1)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.due.ac2)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.due.ac10)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.due.ac21)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.due.ac22)}</td>
                    <td className="border border-gray-200 px-3 py-2 font-semibold">₹{formatMoney(accountSummary.due.total)}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Paid</th>
                    <td className="border border-gray-200 px-3 py-2">₹0</td>
                    <td className="border border-gray-200 px-3 py-2">₹0</td>
                    <td className="border border-gray-200 px-3 py-2">₹0</td>
                    <td className="border border-gray-200 px-3 py-2">₹0</td>
                    <td className="border border-gray-200 px-3 py-2">₹0</td>
                    <td className="border border-gray-200 px-3 py-2 font-semibold">₹0</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Balance</th>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.balance.ac1)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.balance.ac2)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.balance.ac10)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.balance.ac21)}</td>
                    <td className="border border-gray-200 px-3 py-2">₹{formatMoney(accountSummary.balance.ac22)}</td>
                    <td className="border border-gray-200 px-3 py-2 font-semibold">₹{formatMoney(accountSummary.balance.total)}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">
                      Payment Option Post
                    </th>
                    <td colSpan={6} className="border border-gray-200 px-3 py-4">
                      <div className="flex flex-wrap justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/returns/${id}/full-payment`)}
                          className="rounded-full bg-[#0b4d9b] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#093a75] disabled:opacity-60"
                          disabled={!data}
                        >
                          Full Payment
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-[#0b4d9b] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#093a75]"
                        >
                          Part Payment
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-[#0b4d9b] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#093a75]"
                        >
                          Pay Admin/Insp Charges
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/returns/challans")}
                          className="rounded-full bg-[#0b4d9b] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#093a75]"
                        >
                          View/Pay Challans
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mx-4 rounded-md border border-gray-300 bg-white shadow-sm">
          <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
            <h2 className="text-[16px] font-semibold text-[#b8860b]">* 7Q / 14B Summary</h2>
          </header>
          <div className="overflow-x-auto px-6 py-6">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-[#d6ecfb] text-xs uppercase tracking-wide text-black">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 font-semibold" />
                  <th className="border border-gray-200 px-3 py-2 font-semibold">AC(1)</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">AC(2)</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">AC(10)</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">AC(21)</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">AC(22)</th>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Dues</th>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2 font-semibold">₹0</td>
                </tr>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Paid</th>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2 font-semibold">₹0</td>
                </tr>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Balance</th>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2">₹0</td>
                  <td className="border border-gray-200 px-3 py-2 font-semibold">₹0</td>
                </tr>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Pay</th>
                  <td className="border border-gray-200 px-3 py-2 text-center" colSpan={6}>
                    <button
                      type="button"
                      className="rounded-full bg-[#0b4d9b] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#093a75]"
                    >
                      Pay 7Q / 14B Charges
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 text-right text-sm font-semibold text-gray-700">
              7Q/14B Summary: ₹0
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ReturnDetailPage;


