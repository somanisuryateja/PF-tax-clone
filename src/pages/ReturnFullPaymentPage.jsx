import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import { apiClient } from "../api/client.js";

const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const toShortMonth = (value) => {
  if (!value) return "";
  if (!value.includes("-")) return value;
  const date = new Date(`${value}-01`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
};

const ReturnFullPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const breadcrumb = useMemo(
    () => "Home › Return Home Page › Return Monthly Dashboard › Due / Deposit Balance Summary › Return Summary (Full Payment)",
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

  // Check if challan is already paid
  const isChallanPaid = data?.challanStatus === 'paid';

  const totals = data?.totals;
  const wageMonthLabel = toShortMonth(data?.wageMonth);
  const totalEpfWages = totals?.wages?.epf ?? 0;
  const totalEpfContribution = totals?.contributions?.employeePf ?? 0;
  const totalEpsContribution = totals?.contributions?.employerEps ?? 0;
  const totalDiffContribution = totals?.contributions?.difference ?? 0;
  const totalRefundOfAdvance = totals?.contributions?.refund ?? 0;
  const totalEdliWages = totals?.wages?.edli ?? 0;
  const totalEdliContribution = Number((totalEdliWages * 0.005).toFixed(2));

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

  const handlePrepareChallan = () => {
    // If challan is already paid, don't open modal, just navigate to challans
    if (isChallanPaid) {
      navigate("/returns/challans");
      return;
    }
    setShowModal(true);
  };

  const handleFinalizeChallan = () => {
    if (data?.challanId) {
      navigate(`/returns/challans/${data.challanId}`);
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
    navigate("/returns/challans");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <header className="rounded-md border border-gray-300 bg-white px-6 py-4 shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-[#b30000]">
              Account Wise Due Deposit Balance Summary - {wageMonthLabel || "—"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{breadcrumb}</p>
          </div>
        </header>

        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        {isChallanPaid && (
          <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ℹ️ This challan has already been paid. You can view payment details in the "View/Pay Challans" section.
          </div>
        )}

        {loading && (
          <div className="rounded border border-slate-200 bg-white px-6 py-6 text-sm text-slate-500 shadow-sm">
            Loading return summary…
          </div>
        )}

        {accountSummary && (
          <section className="rounded-md border border-gray-300 bg-white shadow-sm">
            <header className="border-b border-gray-200 bg-[#e6f2ff] px-6 py-4">
              <h2 className="text-base font-semibold text-gray-800">
                Account Wise Due Deposit Balance Summary - {wageMonthLabel || "—"}
              </h2>
            </header>
            <div className="overflow-x-auto px-6 py-6">
              <table className="min-w-full border-collapse text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Head</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-semibold">AC 1 (EPF) (₹)</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-semibold">AC 2 EPF Admin Charges (₹)</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-semibold">AC 10 (EPS) (₹)</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-semibold">AC 21 (EDLI) (₹)</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-semibold">AC 22 (EDLI Admin Charges) (₹)</th>
                    <th className="border border-gray-200 px-3 py-2 text-right font-semibold">Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Due</th>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.due.ac1)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.due.ac2)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.due.ac10)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.due.ac21)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.due.ac22)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right font-semibold">{formatMoney(accountSummary.due.total)}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Paid</th>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.paid.ac1)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.paid.ac2)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.paid.ac10)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.paid.ac21)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.paid.ac22)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right font-semibold">{formatMoney(accountSummary.paid.total)}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">Balance</th>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.balance.ac1)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.balance.ac2)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.balance.ac10)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.balance.ac21)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right">{formatMoney(accountSummary.balance.ac22)}</td>
                    <td className="border border-gray-200 px-3 py-2 text-right font-semibold">{formatMoney(accountSummary.balance.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {accountSummary && (
          <section className="rounded-md border border-gray-300 bg-white shadow-sm">
            <header className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4 text-base font-semibold text-gray-800">
              Account Wise Bifurcation of Balance Amount
            </header>
            <div className="px-6 py-6 space-y-4">
              {/* S.No 7: Total EPF Contribution = A/C 1 */}
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Total EPF Contribution (A/C 1):</h3>
                  <span className="text-sm font-semibold text-gray-900">₹{formatMoney(accountSummary.balance.ac1)}</span>
                </div>
                <p className="text-xs text-gray-600">
                  Total EPF Contribution EE Share + Total EPS Contribution ER Share + Total Refund of Advance (₹)
                </p>
              </div>

              {/* S.No 8: Total EPF Charges = A/C 2 */}
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Total EPF Charges (A/C 2):</h3>
                  <span className="text-sm font-semibold text-gray-900">₹{formatMoney(accountSummary.balance.ac2)}</span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>Administration Charges (₹) - {formatMoney(accountSummary.balance.ac2)}</p>
                  <p>Inspection Charges (₹) - Not Applicable</p>
                </div>
              </div>

              {/* S.No 9: Total EPS Contribution = A/C 10 */}
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Total EPS Contribution (A/C 10):</h3>
                  <span className="text-sm font-semibold text-gray-900">₹{formatMoney(accountSummary.balance.ac10)}</span>
                </div>
              </div>

              {/* S.No 10: Total EDLI Contribution = A/C 21 */}
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Total EDLI Contribution ER Share A/C 21 (D):</h3>
                  <span className="text-sm font-semibold text-gray-900">₹{formatMoney(accountSummary.balance.ac21)}</span>
                </div>
              </div>

              {/* S.No 11: Total EDLI Charges = A/C 22 */}
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Total EDLI Charges (A/C 22):</h3>
                  <span className="text-sm font-semibold text-gray-900">₹{formatMoney(accountSummary.balance.ac22)}</span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>Administration Charges (₹) - {formatMoney(accountSummary.balance.ac22)}</p>
                  <p>Inspection Charges (₹) - Not Applicable</p>
                </div>
              </div>

              {/* S.No 12: Total Amount = Sum of S.No 7,8,9,10,11 */}
              <div className="rounded border-2 border-blue-300 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Total Amount (₹):</h3>
                  <span className="text-base font-bold text-blue-900">
                    ₹{formatMoney(
                      accountSummary.balance.ac1 +
                        accountSummary.balance.ac2 +
                        accountSummary.balance.ac10 +
                        accountSummary.balance.ac21 +
                        accountSummary.balance.ac22
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handlePrepareChallan}
            disabled={!data?.challanId || !accountSummary}
            className="rounded bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChallanPaid ? "View Payment Details" : "Prepare Challan"}
          </button>
        </div>
      </main>

      {/* Total Account Wise Summary Modal */}
      {showModal && accountSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Account Wise Summary</h3>
            </div>
            <div className="px-6 py-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm text-gray-700">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold">ACCOUNT HEAD</th>
                      <th className="border border-gray-200 px-4 py-2 text-right font-semibold">DUE AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC-1 (₹)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac1)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC-2 (₹)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC-10 (₹)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac10)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC-21 (₹)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac21)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC-22 (₹)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac22)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-semibold">Total Challan Amount (₹)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right font-semibold">
                        {formatMoney(accountSummary.balance.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm font-semibold text-red-600">
                Note: Once finalized, you can't modify the challan details.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={handleFinalizeChallan}
                className="rounded bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Finalize Challan
              </button>
              <button
                type="button"
                onClick={handleCancelModal}
                className="rounded bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnFullPaymentPage;

