import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../api/client.js";

const PaymentGatewayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { challanId, selectedBank, amount, trrn, wageMonth } = location.state || {};

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(true);

  // Fetch bank details from backend (Annexure 3)
  useEffect(() => {
    const fetchBankDetails = async () => {
      setBankDetailsLoading(true);
      try {
        const response = await apiClient.get("/annexures/banks");
        const bankData = response.data.banks || [];
        // Find the selected bank details
        const selectedBankDetails = bankData.find((bank) => bank.name === selectedBank);
        setBankDetails(selectedBankDetails);
      } catch (err) {
        // If API fails, create a default bank details object
        setBankDetails({
          name: selectedBank,
          accountNumber: "N/A",
          userId: "N/A",
        });
      } finally {
        setBankDetailsLoading(false);
      }
    };

    if (selectedBank) {
      fetchBankDetails();
    }
  }, [selectedBank]);

  // Bank logos mapping (using local images from public folder)
  const bankLogos = {
    "State Bank of India": "/banks/sbi.png",
    "Bank of Baroda": "/banks/Bankofbaroda.png",
    "Punjab National Bank": "/banks/punjabbank.png",
    "Axis Bank": "/banks/axis.png",
  };

  // Bank colors mapping
  const bankColors = {
    "State Bank of India": "#1F4E79",
    "Bank of Baroda": "#f26719",
    "Punjab National Bank": "#91203e",
    "Axis Bank": "#861f41",
  };

  const handleBankLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/challans/validate-bank", {
        bankName: selectedBank,
        username: username,
        password: password,
        challanId: challanId,
      });

      if (response.data.valid) {
        // Bank authentication successful - proceed with payment
        const paymentResponse = await apiClient.post(`/challans/${challanId}/pay`, {
          bankName: selectedBank,
        });

        // Navigate to payment success page (ChallanPaymentPage will show success screen)
        navigate(`/returns/challans/${challanId}`, {
          state: {
            paymentSuccess: true,
            payment: paymentResponse.data.payment,
          },
        });
      } else {
        setError(response.data.message || "Invalid banking credentials. Please check your username and password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBankLogo = () => {
    return bankLogos[selectedBank] || "/banks/sbi.png";
  };

  const getBankColor = () => {
    return bankColors[selectedBank] || "#1F4E79";
  };

  // Show loading while fetching bank details
  if (bankDetailsLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Loading Bank Details</h1>
          <p className="text-gray-600 mb-4">Please wait while we fetch your bank information...</p>
        </div>
      </div>
    );
  }

  // Show error if bank is not found
  if (!bankDetails && selectedBank && !bankDetailsLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-800 mb-2">Bank Not Available</h1>
          <p className="text-red-600 mb-4">The selected bank "{selectedBank}" is not available in our system.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedBank || !challanId) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-800 mb-2">Invalid Payment Request</h1>
          <p className="text-red-600 mb-4">Missing payment information. Please try again.</p>
          <button
            onClick={() => navigate("/returns/challans")}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm"
          >
            Go to Challans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Bank-specific header */}
      <header
        className="text-white flex justify-between items-center px-6 py-4"
        style={{ backgroundColor: getBankColor() }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              selectedBank === "Bank of Baroda" || selectedBank === "Punjab National Bank" || selectedBank === "Axis Bank"
                ? ""
                : "bg-white shadow-sm"
            }`}
            style={
              selectedBank === "Bank of Baroda"
                ? { backgroundColor: "#f26719" }
                : selectedBank === "Punjab National Bank"
                ? { backgroundColor: "#91203e" }
                : selectedBank === "Axis Bank"
                ? { backgroundColor: "#861f41" }
                : {}
            }
          >
            <img
              src={getBankLogo()}
              alt={`${selectedBank} Logo`}
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Secure Payment Gateway</h1>
            <p className="text-sm opacity-90">Powered by {selectedBank}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-lg">{selectedBank}</p>
          <p className="text-sm opacity-90">Banking Partner</p>
        </div>
      </header>

      {/* Payment Details */}
      <div className="max-w-2xl mx-auto mt-10 border border-gray-300 rounded-md shadow-sm">
        <div className="bg-blue-50 border-b border-gray-300 p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h2>
          <div className="text-2xl font-bold text-green-600">
            Amount: ₹{Number(amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          {trrn && (
            <p className="text-sm text-gray-600 mt-2">TRRN: {trrn}</p>
          )}
        </div>

        {/* Bank Login Form */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-2 rounded-lg ${
                selectedBank === "Bank of Baroda" || selectedBank === "Punjab National Bank" || selectedBank === "Axis Bank"
                  ? ""
                  : "bg-gray-100"
              }`}
              style={
                selectedBank === "Bank of Baroda"
                  ? { backgroundColor: "#f26719" }
                  : selectedBank === "Punjab National Bank"
                  ? { backgroundColor: "#91203e" }
                  : selectedBank === "Axis Bank"
                  ? { backgroundColor: "#861f41" }
                  : {}
              }
            >
              <img
                src={getBankLogo()}
                alt={`${selectedBank} Logo`}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedBank} - Secure Login</h3>
              <p className="text-sm text-gray-600">Enter your banking credentials</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          )}

          <form onSubmit={handleBankLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2 rounded text-white font-medium ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={{ backgroundColor: getBankColor() }}
              >
                {loading ? "Processing..." : "Pay Securely"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>🔒 Your payment is secured with SSL encryption</p>
            <p>This is a secure payment gateway powered by {selectedBank}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayPage;

