import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";
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

  const bifurcationRows = useMemo(() => {
    if (!accountSummary) return [];
    const epfContribution = accountSummary.balance.ac1;
    const epfCharges = accountSummary.balance.ac2;
    const epsContribution = accountSummary.balance.ac10;
    const edliContribution = accountSummary.balance.ac21;
    const edliCharges = accountSummary.balance.ac22;
    const totalAmount = epfContribution + epfCharges + epsContribution + edliContribution + edliCharges;

    return [
      {
        description: "Total EPF Contribution (A/C 1)",
        rows: [
          {
            detail: "Total EPF Contribution EE Share + Total EPS Contribution + Total Refund of Advance",
            amount: epfContribution,
          },
        ],
      },
      {
        description: "Total EPF Charges (A/C 2)",
        rows: [
          { detail: "Administration Charges (₹)", amount: epfCharges },
          { detail: "Inspection Charges (₹)", amount: 0 },
        ],
      },
      {
        description: "Total EPF Contribution (A/C 10)",
        rows: [
          {
            detail: epsContribution ? "Total EPS Contribution (ER Share)" : "— (No entry / empty)",
            amount: epsContribution || null,
          },
        ],
      },
      {
        description: "Total EDLI Contribution (A/C 21)",
        rows: [
          {
            detail: edliContribution ? "Total EDLI Contribution ER Share" : "— (No entry / empty)",
            amount: edliContribution || null,
          },
        ],
      },
      {
        description: "Total EDLI Charges (A/C 22)",
        rows: [
          { detail: "Administration Charges (₹)", amount: edliCharges },
          { detail: "Inspection Charges (₹)", amount: 0 },
        ],
      },
      {
        description: "Total Amount (₹)",
        rows: [{ detail: "", amount: totalAmount }],
        emphasize: true,
      },
    ];
  }, [accountSummary]);

  const handlePrepareChallan = () => {
    // If challan is already paid, don't open modal, just navigate to challans
    if (isChallanPaid) {
      navigate("/returns/challans");
      return;
    }
    setShowModal(true);
  };

  const handleFinalizeChallan = () => {
    if (data?.challanId && accountSummary) {
      const returnAmount = accountSummary.balance.total ?? accountSummary.due.total ?? 0;
      const interest7q = Math.round(returnAmount * 0.012);
      const damages14b = Math.round(returnAmount * 0.005);
      const grandTotal = returnAmount + interest7q + damages14b;

      const fullPaymentPayload = {
        challanId: data.challanId,
        trrn: data.trrn ?? data.statement?.returnFileId ?? data?.challanId,
        wageMonth: data.wageMonth,
        returnAmount,
        interest7q,
        damages14b,
        grandTotal,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem("pf-full-payment-context", JSON.stringify(fullPaymentPayload));
      }

      setShowModal(false);
      navigate("/returns/challans", {
        state: {
          actionMessage: `Return File Id [${data.trrn ?? data.statement?.returnFileId ?? data?.challanId}] finalized. Please use View / Pay Challans to proceed with payment.`,
          fullPaymentContext: fullPaymentPayload,
        },
      });
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader />
      <BlueNavbar />

      <main className="mx-auto  px-6 py-8 space-y-6">
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
            <span className="text-black">Return Summary (Full Payment)</span>
          </nav>
        </div>

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
          <>
            <div className="mx-4 mb-2 w-full border-t-2 border-b-2 border-[#99c2ff] px-4 py-2">
              <h2 className="text-[16px] font-semibold text-[#b8860b]">
                * Account Wise Due Deposit Balance Summary - {wageMonthLabel || "—"}
              </h2>
            </div>
            <section className="mx-4 rounded-md border border-gray-300 bg-white shadow-sm">
              <div className="space-y-6 px-6 py-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-[#d6ecfb] text-xs uppercase tracking-wide text-black">
                      <tr className="text-right">
                        <th className="border border-gray-200 px-3 py-2 text-left font-semibold" />
                        <th className="border border-gray-200 px-3 py-2 font-semibold">AC 1 (EPF) (₹)</th>
                        <th className="border border-gray-200 px-3 py-2 font-semibold">AC 2 EPF Admin Charges (₹)</th>
                        <th className="border border-gray-200 px-3 py-2 font-semibold">AC 10 (EPS) (₹)</th>
                        <th className="border border-gray-200 px-3 py-2 font-semibold">AC 21 (EDLI) (₹)</th>
                        <th className="border border-gray-200 px-3 py-2 font-semibold">AC 22 (EDLI Admin Charges) (₹)</th>
                        <th className="border border-gray-200 px-3 py-2 font-semibold">Total (₹)</th>
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
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm text-gray-700">
                      <tbody>
                        <tr className="bg-[#d6ecfb]">
                          <th
                            colSpan={3}
                            className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide text-black"
                          >
                            Account Wise Bifurcation of Balance Amount
                          </th>
                        </tr>
                        {bifurcationRows.map((group) =>
                          group.rows.map((row, index) => (
                            <tr
                              key={`${group.description}-${index}`}
                              className={group.emphasize ? "bg-[#d6e9e3]" : undefined}
                            >
                              {index === 0 && (
                                <th
                                  rowSpan={group.rows.length}
                                  className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-800 align-top"
                                >
                                  {group.description}
                                </th>
                              )}
                              <td className="border border-gray-200 px-3 py-2 text-left text-gray-600">
                                {row.detail || ""}
                              </td>
                              <td
                                className={`border border-gray-200 px-3 py-2 text-right font-semibold ${
                                  group.emphasize ? "text-black font-bold" : ""
                                }`}
                              >
                                {row.amount === null || row.amount === undefined ? "—" : `₹${formatMoney(row.amount)}`}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handlePrepareChallan}
            disabled={!data?.challanId || !accountSummary}
            className="rounded-md bg-[#0b4d9b] px-8 py-3 text-sm font-semibold text-white shadow hover:bg-[#093a75] disabled:cursor-not-allowed disabled:opacity-50"
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
                <table className="min-w-full border border-gray-300 text-sm text-gray-700">
                  <thead className="bg-[#d6ecfb] text-xs uppercase tracking-wide text-black">
                    <tr>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Account Head</th>
                      <th className="border border-gray-200 px-4 py-2 text-right font-semibold">Due Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC 1 (EPF)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac1)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC 2 (Admin Charges)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC 10 (EPS)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac10)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC 21 (EDLI)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac21)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-2">AC 22 (EDLI Admin)</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{formatMoney(accountSummary.balance.ac22)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-semibold text-[#0f172a]">
                        Total Challan Amount (₹)
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-[#0f172a]">
                        {formatMoney(accountSummary.balance.total)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        className="border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-red-600"
                      >
                        Note: Once finalized, you can't modify the challan details.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center gap-4 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={handleFinalizeChallan}
                className="rounded-full bg-blue-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Finalize Challan
              </button>
              <button
                type="button"
                onClick={handleCancelModal}
                className="rounded-full bg-red-600 px-8 py-2 text-sm font-semibold text-white shadow hover:bg-red-700"
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

