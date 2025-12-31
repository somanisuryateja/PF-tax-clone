import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";
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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challan, setChallan] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [storedFullPaymentContext, setStoredFullPaymentContext] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = sessionStorage.getItem("pf-full-payment-context");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

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

  useEffect(() => {
    if (location.state?.fullPaymentContext) {
      setStoredFullPaymentContext(location.state.fullPaymentContext);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pf-full-payment-context", JSON.stringify(location.state.fullPaymentContext));
      }
    }
  }, [location.state?.fullPaymentContext]);

  const activeFullPaymentContext = useMemo(() => {
    if (location.state?.fullPaymentContext) return location.state.fullPaymentContext;
    if (
      storedFullPaymentContext &&
      (!storedFullPaymentContext.challanId || storedFullPaymentContext.challanId === id)
    ) {
      return storedFullPaymentContext;
    }
    return null;
  }, [location.state?.fullPaymentContext, storedFullPaymentContext, id]);

  const mode = location.state?.mode ?? (activeFullPaymentContext ? "full-payment" : "simple");
  const isFullPaymentMode = mode === "full-payment";

  const isPaid = challan?.status === "paid";

  useEffect(() => {
    if (isPaid && typeof window !== "undefined") {
      sessionStorage.removeItem("pf-full-payment-context");
      setStoredFullPaymentContext(null);
    }
  }, [isPaid]);
  const wageMonthLabel = useMemo(() => {
    if (!challan?.wageMonth) return "—";
    if (!challan.wageMonth.includes("-")) return challan.wageMonth;
    const [year] = challan.wageMonth.split("-");
    const date = new Date(`${challan.wageMonth}-01`);
    if (Number.isNaN(date.getTime())) return challan.wageMonth;
    return `${date.toLocaleString("en-US", { month: "short" })} ${year}`;
  }, [challan?.wageMonth]);

  const fullPaymentDetails = useMemo(() => {
    if (!isFullPaymentMode) return null;
    const baseAmount = activeFullPaymentContext?.returnAmount ?? challan?.totalAmount ?? 0;
    const interest7q = activeFullPaymentContext?.interest7q ?? Math.round(baseAmount * 0.012);
    const damages14b = activeFullPaymentContext?.damages14b ?? Math.round(baseAmount * 0.005);
    const grandTotal = activeFullPaymentContext?.grandTotal ?? baseAmount + interest7q + damages14b;
    return {
      trrn: activeFullPaymentContext?.trrn ?? challan?.trrn ?? "—",
      wageMonth: activeFullPaymentContext?.wageMonth ?? wageMonthLabel ?? "—",
      returnAmount: baseAmount,
      interest7q,
      damages14b,
      grandTotal,
    };
  }, [isFullPaymentMode, activeFullPaymentContext, challan?.trrn, challan?.totalAmount, wageMonthLabel]);

  const payableAmount = isFullPaymentMode
    ? fullPaymentDetails?.returnAmount ?? challan?.totalAmount ?? 0
    : challan?.totalAmount ?? 0;

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
        amount: payableAmount,
        trrn: challan.trrn,
        wageMonth: challan.wageMonth,
      },
    });
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
        <BlueNavbar />

        <main className="mx-auto px-6 py-8 space-y-6">
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
              <Link to="/returns/challans" className="text-black hover:underline">
                View / Pay Challans
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-black">Challan Payment Response</span>
            </nav>
          </div>

          <section className="mx-auto max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm">
            <div className={`rounded-t-md border-b px-6 py-4 ${isSuccessful ? 'bg-[#deebd8]' : 'bg-rose-50'}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold ${
                    isSuccessful ? 'bg-[#3b6a40] text-white' : 'bg-white text-rose-700'
                  }`}
                >
                  {isSuccessful ? '✓' : '✕'}
                </div>
                <h2 className={`text-base font-semibold ${bannerText}`}>{paymentStatus}</h2>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">Payment Details:</h3>
              <table className="w-full text-sm text-gray-700 border border-gray-300">
                <tbody>
                  <tr>
                    <th className="w-1/3 border border-gray-200 px-4 py-3 text-left font-semibold">Bank</th>
                    <td className="border border-gray-200 px-4 py-3">{paymentData.bank || "—"}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">TRRN</th>
                    <td className="border border-gray-200 px-4 py-3">{challan.trrn || "—"}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">CRN</th>
                    <td className="border border-gray-200 px-4 py-3">{paymentData.crn || "—"}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Paid Amount</th>
                    <td className="border border-gray-200 px-4 py-3 font-semibold">
                      ₹{formatMoney(paymentData.amount || challan.totalAmount)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Payment Status</th>
                    <td className={`border border-gray-200 px-4 py-3 font-semibold ${statusColor}`}>{paymentStatus}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-gray-200 px-4 py-4 text-center">
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Click "Home" here to go to home page
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader />
      <BlueNavbar />

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
            <Link to="/returns/challans" className="text-black hover:underline">
              View / Pay Challans
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-black">Challan Payment</span>
          </nav>
        </div>



        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}

        {!isFullPaymentMode && (
          <section className="mx-auto max-w-xl rounded-lg border border-gray-300 bg-white shadow-lg">
            {/* Header */}
            <div className="border-b border-gray-200 bpx-6 py-4">
              <h2 className="text-[16px] font-semibold text-[#b8860b] px-4">* Challan Payment</h2>
            </div>

            {/* Body */}
            <div className="space-y-4 px-6 py-6 text-sm text-gray-700">
              <div className="border-b border-gray-200 px-4 py-3 text-base font-semibold text-gray-900 flex flex-wrap items-center justify-between gap-4">
                <span className="text-gray-600">
                  TRRN: <span className="ml-2 text-gray-900">{challan.trrn}</span>
                </span>
                <span className="text-gray-600">
                  Wage Month: <span className="ml-2 text-gray-900">{wageMonthLabel}</span>
                </span>
              </div>

              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-gray-600 text-base font-semibold">Total Amount:</span>
                <span className="text-lg font-semibold text-[#0f766e]">{formatAmount(payableAmount)}</span>
              </div>

              <div className="border-b border-gray-200 px-4 py-3 text-base text-gray-800">
                Please select your payment bank and click on the{" "}
                <strong>"Make Payment"</strong> button below to initiate payment.
              </div>

      <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-4">
        <label className="text-xs font-semibold uppercase text-gray-500">
          Select Bank
        </label>
        <select
          value={selectedBank}
          onChange={(event) => setSelectedBank(event.target.value)}
          className="flex-1 min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
        >
          <option value="">Select Bank</option>
          {banks.map((bank) => (
            <option key={bank.name} value={bank.name}>
              {bank.name}
            </option>
          ))}
        </select>
              </div>

              <div className="border-b border-gray-200 px-4 py-3">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0b4d9b] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#093a75] disabled:opacity-60"
                  onClick={handlePayChallan}
                  disabled={submitting || !selectedBank}
                >
                  {submitting
                    ? "Processing…"
                    : `Make Payment of ${formatAmount(payableAmount)}`}
                </button>
              </div>

              <div className="rounded border border-[#bfdbfe] bg-[#e0f2fe] px-4 py-3 text-[0.85rem] text-[#0c4a6e]">
                <strong>Note to Employee:</strong> If the payment has been made
                successfully but the same amount has been debited from your bank
                account, please do not make the payment again for the same TRRN.
                Instead, check the status in the system.
              </div>
            </div>
          </section>
        )}


        {isFullPaymentMode && fullPaymentDetails && (
          <section className="mx-auto max-w-xl rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-[16px] font-semibold text-[#b8860b]">* Challan Payment (Full Payment)</h2>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-gray-700">
              <div className="border-b border-gray-200 px-4 py-3 text-base font-semibold text-gray-900 flex flex-wrap items-center justify-between gap-4">
                <span className="text-gray-600">
                  TRRN: <span className="ml-2 text-gray-900">{fullPaymentDetails.trrn}</span>
                </span>
                <span className="text-gray-600">
                  Wage Month: <span className="ml-2 text-gray-900">{fullPaymentDetails.wageMonth}</span>
                </span>
              </div>

              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-gray-600 text-base font-semibold">Return Amount:</span>
                <span className="text-base font-semibold">{formatAmount(fullPaymentDetails.returnAmount)}</span>
              </div>

              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-gray-600 text-base font-semibold">Grand Total:</span>
                <span className="text-lg font-semibold text-[#0f766e]">{formatAmount(fullPaymentDetails.returnAmount)}</span>
              </div>

              <div className="border-b border-gray-200 px-4 py-3 text-base text-gray-800">
                Please select your payment bank and click on the{" "}
                <strong>"Make Payment"</strong> button below to initiate payment.
              </div>

              <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-4">
                <label className="text-xs font-semibold uppercase text-gray-500">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(event) => setSelectedBank(event.target.value)}
                  className="flex-1 min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8]"
                >
                  <option value="">Select Bank</option>
                  {banks.map((bank) => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-b border-gray-200 px-4 py-3">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0b4d9b] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#093a75] disabled:opacity-60"
                  onClick={handlePayChallan}
                  disabled={submitting || !selectedBank}
                >
                  {submitting ? "Processing…" : `Make Payment of ${formatAmount(payableAmount)}`}
                </button>
              </div>

              <div className="rounded border border-[#bfdbfe] bg-[#e0f2fe] px-4 py-3 text-[0.85rem] text-[#0c4a6e]">
                <strong>Note to Employer:</strong> If the payment has been made successfully but the same amount has been
                debited from your bank account, please do not make the payment again for the same TRRN. Instead, check the
                status in the system.
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ChallanPaymentPage;

