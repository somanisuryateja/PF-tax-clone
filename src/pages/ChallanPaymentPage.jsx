import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import { apiClient } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const formatAmount = (value) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatMoney = (value) =>
  Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const ChallanPaymentPage = () => {
  const { employer } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challan, setChallan] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [challanResponse, bankResponse] = await Promise.all([
          apiClient.get("/challans"),
          apiClient.get("/annexures/banks"),
        ]);
        const challanDoc = challanResponse.data.challans.find((item) => item._id === id);
        setChallan(challanDoc ?? null);
        setBanks(bankResponse.data.banks ?? []);
        if (challanDoc?.status === "paid" && challanDoc.payment) {
          setSuccess({
            message: "Transaction Successful",
            payment: challanDoc.payment,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message ?? "Unable to load challan details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      load();
    }
  }, [id]);

  const accountSummary = useMemo(() => {
    if (!challan) return [];
    return [
      { label: "A/C 1 (EPF)", value: challan.accounts?.ac1 },
      { label: "A/C 2 (Admin Charges)", value: challan.accounts?.ac2 },
      { label: "A/C 10 (EPS)", value: challan.accounts?.ac10 },
      { label: "A/C 21 (EDLI)", value: challan.accounts?.ac21 },
      { label: "A/C 22 (EDLI Admin Charges)", value: challan.accounts?.ac22 },
    ];
  }, [challan]);

  const isPaid = challan?.status === "paid";
  const wageMonthLabel = useMemo(() => {
    if (!challan?.wageMonth) return "—";
    if (!challan.wageMonth.includes("-")) return challan.wageMonth;
    const [year] = challan.wageMonth.split("-");
    const date = new Date(`${challan.wageMonth}-01`);
    if (Number.isNaN(date.getTime())) return challan.wageMonth;
    return `${date.toLocaleString("en-US", { month: "short" })} ${year}`;
  }, [challan?.wageMonth]);

  const handlePayChallan = () => {
    if (!selectedBank) {
      setError("Please select a bank to proceed with payment.");
      return;
    }
    // Navigate to payment gateway instead of direct payment
    navigate("/payment/gateway", {
      state: {
        challanId: id,
        selectedBank: selectedBank,
        amount: challan.totalAmount,
        trrn: challan.trrn,
        wageMonth: challan.wageMonth,
      },
    });
  };

  const handleCancelChallan = async () => {
    setSubmitting(true);
    setError("");
    try {
      await apiClient.post(`/challans/${id}/cancel`);
      navigate("/returns/challans", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to cancel challan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-sm text-gray-500">Loading challan details…</p>
        </main>
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Challan not found or already processed.
          </div>
        </main>
      </div>
    );
  }

  // Check if payment was successful from gateway navigation
  const location = useLocation();
  const paymentSuccess = location.state?.paymentSuccess;
  const gatewayPayment = location.state?.payment;

  // Show payment response screen when payment is completed (successful or failed)
  // Only show if challan status is "paid" AND we have actual payment data
  const paymentData = gatewayPayment || success?.payment || challan.payment;
  const hasPaymentData = Boolean(paymentData && paymentData.crn && paymentData.bank);
  if (isPaid && hasPaymentData) {
    const isSuccessful = paymentData?.status === "success" || challan.status === "paid";
    const paymentStatus = isSuccessful ? "Transaction Successful" : "Transaction Failed";
    const bannerBg = isSuccessful ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200";
    const bannerText = isSuccessful ? "text-emerald-800" : "text-rose-800";
    const iconColor = isSuccessful ? "text-emerald-600" : "text-rose-600";
    const statusColor = isSuccessful ? "text-emerald-700" : "text-rose-700";

    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <DashboardHeader />

        <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          <header className="rounded-md border border-gray-300 bg-white px-6 py-4 shadow-sm">
            <div>
              <h1 className="text-lg font-semibold text-[#b30000]">Challan Payment Response</h1>
              <p className="mt-1 text-sm text-gray-600">
                Home / Return Home Page / View/Pay Challan / Challan Payment Response
              </p>
            </div>
          </header>

          <section className="rounded-md border border-gray-300 bg-white shadow-sm">
            <div className={`rounded-t-md border-b ${bannerBg} px-6 py-4`}>
              <div className="flex items-center gap-3">
                {isSuccessful ? (
                  <svg
                    className={`h-6 w-6 ${iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className={`h-6 w-6 ${iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                <h2 className={`text-base font-semibold ${bannerText}`}>{paymentStatus}</h2>
              </div>
            </div>

            <div className="px-6 py-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">Payment Details:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm text-gray-700">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="w-1/3 bg-gray-50 px-4 py-2 text-left font-semibold">TRRN</th>
                      <td className="px-4 py-2">{challan.trrn || "—"}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Bank</th>
                      <td className="px-4 py-2">{paymentData.bank || "—"}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="bg-gray-50 px-4 py-2 text-left font-semibold">CRN</th>
                      <td className="px-4 py-2">{paymentData.crn || "—"}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Amount paid</th>
                      <td className="px-4 py-2 font-semibold">
                        ₹{formatMoney(paymentData.amount || challan.totalAmount)}
                      </td>
                    </tr>
                    <tr>
                      <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Payment Status</th>
                      <td className={`px-4 py-2 font-semibold ${statusColor}`}>{paymentStatus}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Click "Home" here to go to home page
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader />

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <header className="rounded-md border border-gray-300 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-[#b30000]">Challan Payment</h1>
              <p className="mt-1 text-sm text-gray-600">
                Home › Return Home Page › Return Monthly Dashboard › View / Pay Challans › Challan Payment
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/returns/challans")}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Back to Challan List
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        <section className="rounded-md border border-gray-300 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Challan Details</h2>
          </div>
          <div className="grid gap-4 px-6 py-6 text-sm text-gray-700 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">TRRN</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{challan.trrn}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Wage Month</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{wageMonthLabel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Challan Type</p>
              <p className="mt-1 text-base font-semibold text-gray-900">Monthly Contribution</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Status</p>
              <p className="mt-1 text-base font-semibold text-gray-900 capitalize">{challan.status}</p>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-gray-300 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Account Wise Summary</h2>
          </div>
          <div className="overflow-x-auto px-6 py-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold">A/C 1</th>
                  <th className="px-3 py-2 font-semibold">A/C 2</th>
                  <th className="px-3 py-2 font-semibold">A/C 10</th>
                  <th className="px-3 py-2 font-semibold">A/C 21</th>
                  <th className="px-3 py-2 font-semibold">A/C 22</th>
                  <th className="px-3 py-2 font-semibold">Total Challan Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {accountSummary.map((item) => (
                    <td key={item.label} className="border border-gray-200 px-3 py-2">
                      {formatAmount(item.value)}
                    </td>
                  ))}
                  <td className="border border-gray-200 px-3 py-2 font-semibold text-[#0f766e]">
                    {formatAmount(challan.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-gray-300 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Challan Payment</h2>
          </div>
          <div className="space-y-4 px-6 py-6 text-sm text-gray-700">
            <div className="rounded border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">
              Please review your payment and click on the <strong>“Make Payment of {formatAmount(challan.totalAmount)}”</strong>{" "}
              button. Only banks listed in Annexure 3 are available for the payment gateway.
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-gray-500">Select Bank</label>
              <select
                value={selectedBank}
                onChange={(event) => setSelectedBank(event.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Select bank</option>
                {banks.map((bank) => (
                  <option key={bank.name} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => navigate("/returns/challans")}
              >
                Close
              </button>
              <button
                type="button"
                className="rounded bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b5c57] disabled:opacity-60"
                onClick={handlePayChallan}
                disabled={submitting || !selectedBank}
              >
                {submitting ? "Processing…" : `Make Payment of ${formatAmount(challan.totalAmount)}`}
              </button>
              <button
                type="button"
                className="rounded border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                onClick={handleCancelChallan}
                disabled={submitting}
              >
                Cancel Challan
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChallanPaymentPage;

