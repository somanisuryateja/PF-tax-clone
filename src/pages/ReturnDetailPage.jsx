import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
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

  const breadcrumb = useMemo(
    () => "Home › Return Home Page › Return Monthly Dashboard › Due / Deposit Balance Summary",
    []
  );

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
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <header className="rounded-md border border-gray-300 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-[#b30000]">
                Return Summary for Wage Month: {wageMonthLabel || "—"}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{breadcrumb}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/returns/monthly")}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Monthly Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate("/returns/upload")}
                className="rounded border border-sky-600 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
              >
                Upload Another Return
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        {bannerMessage && !error && (
          <div className="rounded border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✅ {bannerMessage}
          </div>
        )}

        {loading && (
          <div className="rounded border border-slate-200 bg-white px-6 py-6 text-sm text-slate-500 shadow-sm">
            Loading return summary…
          </div>
        )}

        {statement && (
          <section className="rounded-md border border-gray-300 bg-white shadow-sm">
            <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
              <h2 className="text-base font-semibold text-gray-800">
                Return Summary for Wage Month: {wageMonthLabel || "—"}
              </h2>
            </header>
            <div className="space-y-6 px-6 py-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-700">
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-gray-50">
                      <th className="w-1/4 px-4 py-2 text-left font-semibold">Name of Establishment</th>
                      <td className="px-4 py-2">{statement.establishmentName ?? "—"}</td>
                      <th className="w-1/4 px-4 py-2 text-left font-semibold">Establishment Id</th>
                      <td className="px-4 py-2">{statement.establishmentId ?? "—"}</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">LIN</th>
                      <td className="px-4 py-2">{statement.lin ?? "1234567890"}</td>
                      <th className="px-4 py-2 text-left font-semibold">Return File Id</th>
                      <td className="px-4 py-2">{statement.returnFileId ?? data?.trrn ?? "—"}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold">Contribution Rate (%)</th>
                      <td className="px-4 py-2">{statement.contributionRate ?? "—"}</td>
                      <th className="px-4 py-2 text-left font-semibold">Uploaded Date Time</th>
                      <td className="px-4 py-2">{formatDateTime(statement.uploadedAt)}</td>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Remarks</th>
                      <td className="px-4 py-2">{statement.remark || "—"}</td>
                      <th className="px-4 py-2 text-left font-semibold">Exemption Status</th>
                      <td className="px-4 py-2">Unexempted</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded border border-gray-200">
                  <header className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800">
                    Establishment Details
                  </header>
                  <dl className="space-y-1 px-4 py-3 text-sm text-gray-700">
                    <div className="flex justify-between gap-4">
                      <dt>PF Exemption Status</dt>
                      <dd className="font-semibold">No</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Pension Exemption Status</dt>
                      <dd className="font-semibold">No</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>EDLI Exemption Status</dt>
                      <dd className="font-semibold">No</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total Active Members</dt>
                      <dd className="font-semibold">{totalActiveMembers}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Newly Joined Members</dt>
                      <dd className="font-semibold">{newlyJoinedMembers}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total Left Members</dt>
                      <dd className="font-semibold">{totalLeftMembers}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 mt-2">
                      <dt>Total NCP Days</dt>
                      <dd className="font-semibold">{totalNcpDays}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total Return Member Count</dt>
                      <dd className="font-semibold">{totalReturnMemberCount}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded border border-gray-200">
                  <header className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800">
                    Wage Summary
                  </header>
                  <dl className="space-y-1 px-4 py-3 text-sm text-gray-700">
                    <div className="flex justify-between gap-4">
                      <dt>Total Gross Wages</dt>
                      <dd className="font-semibold">₹{formatMoney(totals?.wages?.gross)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total EPF Wages</dt>
                      <dd className="font-semibold">₹{formatMoney(totals?.wages?.epf)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total EPS Wages</dt>
                      <dd className="font-semibold">₹{formatMoney(totals?.wages?.eps)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total EDLI Wages</dt>
                      <dd className="font-semibold">₹{formatMoney(totals?.wages?.edli)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total NCP Days</dt>
                      <dd className="font-semibold">{totalNcpDays}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded border border-gray-200">
                  <header className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800">
                    Contribution Summary
                  </header>
                  <dl className="space-y-1 px-4 py-3 text-sm text-gray-700">
                    <div className="flex justify-between gap-4">
                      <dt>Total EPF Contribution</dt>
                      <dd className="font-semibold">₹{formatMoney(contributionSummary.epf)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total EPF-EPS Contribution</dt>
                      <dd className="font-semibold">₹{formatMoney(contributionSummary.diff)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total EPS Contribution</dt>
                      <dd className="font-semibold">₹{formatMoney(contributionSummary.eps)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total EDLI Contribution</dt>
                      <dd className="font-semibold">₹{formatMoney(contributionSummary.edli)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Total Refund of Advances</dt>
                      <dd className="font-semibold">₹{formatMoney(contributionSummary.refund)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 mt-2">
                      <dt>Sum of Contribution</dt>
                      <dd className="font-semibold text-[#0f766e]">₹{formatMoney(contributionSummary.total)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        )}

        {accountSummary && (
          <section className="rounded-md border border-gray-300 bg-white shadow-sm">
            <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4 text-base font-semibold text-gray-800">
              Total Account Wise Summary
            </header>
            <div className="overflow-x-auto px-6 py-6">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 font-semibold">Head</th>
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
                    <td colSpan={7} className="border border-gray-200 px-3 py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/returns/${id}/full-payment`)}
                          className="rounded bg-[#047857] px-4 py-2 text-xs font-semibold text-white hover:bg-[#036349] disabled:opacity-60"
                          disabled={!data}
                        >
                          Full Payment
                        </button>
                        <button
                          type="button"
                          className="rounded border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          Part Payment
                        </button>
                        <button
                          type="button"
                          className="rounded border border-blue-300 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          Pay Admin/Insp Charges
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/returns/challans")}
                          className="rounded border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
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

        <section className="rounded-md border border-gray-300 bg-white shadow-sm">
          <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4 text-base font-semibold text-gray-800">
            7Q / 14B Summary
          </header>
          <div className="overflow-x-auto px-6 py-6">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 font-semibold">Head</th>
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
                  <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Due</th>
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
                      className="rounded bg-[#0f766e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0b5c57]"
                    >
                      Pay 7Q / 14B Charges
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {statement && (
          <section className="rounded-md border border-gray-300 bg-white shadow-sm">
            <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4 text-base font-semibold text-gray-800">
              Member Details
            </header>
            <div className="overflow-x-auto px-6 py-6">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-semibold">Sl. No.</th>
                    <th className="px-3 py-2 font-semibold">UAN</th>
                    <th className="px-3 py-2 font-semibold">Name as per Return</th>
                    <th className="px-3 py-2 font-semibold">Name as per UAN Repository</th>
                    <th className="px-3 py-2 font-semibold">Wages – Gross</th>
                    <th className="px-3 py-2 font-semibold">Wages – EPF</th>
                    <th className="px-3 py-2 font-semibold">Wages – EPS</th>
                    <th className="px-3 py-2 font-semibold">Wages – EDLI / EDU</th>
                    <th className="px-3 py-2 font-semibold">Contribution Remitted – EE</th>
                    <th className="px-3 py-2 font-semibold">Contribution Remitted – EPS</th>
                    <th className="px-3 py-2 font-semibold">Contribution Remitted – ER</th>
                    <th className="px-3 py-2 font-semibold">Refunds</th>
                    <th className="px-3 py-2 font-semibold">NCP Days</th>
                    <th className="px-3 py-2 font-semibold">Principal Employer ID / TAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(statement.records ?? []).map((record, index) => (
                    <tr key={record.uan ?? index} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{record.uan}</td>
                      <td className="px-3 py-2">{record.memberName}</td>
                      <td className="px-3 py-2">{record.memberName}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.grossWages)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.epfWages)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.epsWages)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.edliWages)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.employeePfContribution)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.employerEpsContribution)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.employerPfContribution)}</td>
                      <td className="px-3 py-2">₹{formatMoney(record.refundOfAdvance)}</td>
                      <td className="px-3 py-2">{record.ncpDays ?? 0}</td>
                      <td className="px-3 py-2">{statement.establishmentId ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ReturnDetailPage;


