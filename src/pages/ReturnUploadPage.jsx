import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client.js";
import DashboardHeader from "../components/DashboardHeader.jsx";
import BlueNavbar from "../components/BlueNavbar.jsx";

const contributionRates = [
  { label: "10%", value: 10 },
  { label: "12%", value: 12 },
];

const returnTypes = [
  { label: "Regular Return", value: "Regular Return", disabled: false },
  { label: "Revised Return", value: "Revised Return", disabled: true },
  { label: "Supplementary Return", value: "Supplementary Return", disabled: true },
];

const ACTIVE_MEMBER_COUNT = 15;

const DocumentIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6M9 16h6M9 8h3m5-2.5V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6.5L18 5.5Z"
    />
  </svg>
);

const ReturnUploadPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const shortMonth = (value) => {
    if (!value) return "";
    if (!value.includes("-")) return value;
    const date = new Date(`${value}-01`);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
  };
  const defaultWageMonth = shortMonth(query.get("wageMonth")) || "Nov 2024";

  const [wageMonth, setWageMonth] = useState(defaultWageMonth);
  const [returnType, setReturnType] = useState("Regular Return");
  const [contributionRate, setContributionRate] = useState(12);
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const downloadLinkRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpFile, setShowHelpFile] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [returnLists, setReturnLists] = useState({ inProcess: [], recent: [] });
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [tableError, setTableError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(true);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementError, setStatementError] = useState("");
  const [statementData, setStatementData] = useState(null);
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files?.[0] ?? null);

  const handleReset = () => {
    setWageMonth(defaultWageMonth);
    setReturnType("Regular Return");
    setContributionRate(12);
    setRemark("");
    setFile(null);
    setError("");
    setMessage("");
    setShowUploadForm(true);
  };

  const handleDownloadMembers = async () => {
    try {
      const response = await apiClient.get("/annexures/members");
      const members = response.data.members ?? [];
      const header = [
        "UAN",
        "MEMBER NAME AS PER UAN",
        "DATE OF JOINING",
        "DATE OF EXIT",
        "AADHAAR STATUS",
        "WHETHER MEMBER OF PENSION (EPS)",
        "CONTRIBUTING ON HIGHER WAGES",
        "DEFERRED PENSION",
        "NATIONALITY",
      ];

      const rows = members.map((member) => [
        member.uan,
        member.memberName,
        member.dateOfJoining ?? "",
        member.dateOfExit ?? "",
        member.aadhaarStatus ?? "",
        member.pensionMember ?? "",
        member.higherWages ?? "",
        member.deferredPension ?? "",
        member.nationality ?? "",
      ]);

      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\r\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = downloadLinkRef.current;
      if (link) {
        link.href = url;
        link.download = `active_member_list_${wageMonth.replace(/\s+/g, "_")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to download member list.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("File Validation Failed.");
      return false;
    }
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("File Validation Failed.");
      return false;
    }

    setUploading(true);
    setError("");
    setMessage("");
    let success = false;
    try {
      const form = new FormData();
      form.append("wageMonth", wageMonth);
      form.append("returnFile", file);
      form.append("returnType", returnType);
      form.append("contributionRate", contributionRate);
      form.append("remark", remark);

      const res = await apiClient.post("/returns/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message ?? "Return uploaded successfully.");
      success = true;
      setFile(null);
      setShowUploadForm(false);
    } catch (err) {
      setError(err.response?.data?.message ?? "File validation failed.");
    } finally {
      setUploading(false);
    }
    return success;
  };

  const toBackendWageMonth = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    const parts = value.split(" ");
    if (parts.length === 2) {
      const alt = new Date(`${parts[0]} 01, ${parts[1]}`);
      if (!Number.isNaN(alt.getTime())) {
        return `${alt.getFullYear()}-${String(alt.getMonth() + 1).padStart(2, "0")}`;
      }
    }
    return value;
  };

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

  const fetchReturnLists = useCallback(async () => {
    setLoadingReturns(true);
    try {
      const params = {};
      const backendMonth = toBackendWageMonth(wageMonth);
      if (backendMonth) params.wageMonth = backendMonth;
      const response = await apiClient.get("/returns/files", { params });
      const inProcess = response.data?.inProcess ?? [];
      const recent = response.data?.recent ?? [];
      setReturnLists({
        inProcess,
        recent,
      });
      const targetMonth = backendMonth || toBackendWageMonth(defaultWageMonth);
      const inProcessForMonth = inProcess.filter((item) => item.wageMonth === targetMonth);
      const recentForMonth = recent.filter((item) => item.wageMonth === targetMonth);
      let shouldShowForm = false;
      if (inProcessForMonth.length > 0) {
        shouldShowForm = false;
      } else if (recentForMonth.length === 0) {
        shouldShowForm = true;
      } else if (recentForMonth.some((item) => item.status === "rejected")) {
        shouldShowForm = true;
      } else {
        shouldShowForm = false;
      }
      setShowUploadForm(shouldShowForm);
      setTableError("");
    } catch (err) {
      setTableError(err.response?.data?.message ?? "Unable to load return files.");
    } finally {
      setLoadingReturns(false);
    }
  }, [wageMonth]);

  useEffect(() => {
    fetchReturnLists();
  }, [fetchReturnLists]);

  const openStatementModal = useCallback(async (id) => {
    setShowStatementModal(true);
    setStatementLoading(true);
    setStatementError("");
    try {
      const response = await apiClient.get(`/returns/${id}`);
      setStatementData(response.data);
    } catch (err) {
      setStatementError(err.response?.data?.message ?? "Unable to load return statement.");
      setStatementData(null);
    } finally {
      setStatementLoading(false);
    }
  }, []);

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Please download and review the generated return statement. Once approved, the wages and contribution details cannot be modified. Are you sure you want to proceed?"
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      const response = await apiClient.post(`/returns/${id}/approve`);
      await fetchReturnLists();
      navigate(`/returns/${id}`, {
        state: {
          actionMessage:
            response.data?.message ??
            "Return File approved successfully. Kindly prepare the challan using appropriate payment option.",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to approve return.");
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm("Are you sure to reject return?");
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      const response = await apiClient.post(`/returns/${id}/reject`, {
        reason: "Return rejected by employer",
      });
      setMessage(response.data?.message ?? "Return rejected successfully.");
      await fetchReturnLists();
      setShowUploadForm(true);
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to reject return.");
    }
  };

  const handleViewStatement = async (id) => {
    await openStatementModal(id);
  };

  const handleDownloadFile = async (id, filename) => {
    if (!id) return;
    setDownloadingFileId(id);
    try {
      const response = await apiClient.get(`/returns/${id}/file`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || "return_file.txt";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to download return file.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const closeStatementModal = () => {
    setShowStatementModal(false);
    setStatementData(null);
    setStatementError("");
  };

  const formatMoney = (value) =>
    Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <DashboardHeader />
      <BlueNavbar />

      <main className="mx-auto py-8">
        {/* Breadcrumb */}
        <div className="w-full px-4 py-2 bg-gray-100 mb-2">
          <nav className="flex items-center text-sm">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">
              Home
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to="/returns" className="text-black hover:underline font-semibold">
              Return Home Page
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to="/returns/monthly" className="text-black hover:underline font-semibold">
              Monthly Return Dashboard
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-black font-semibold">Upload Returns</span>
          </nav>
        </div>

        {error && (
          <div className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            ⚠️ {error}
          </div>
        )}
        {message && (
          <div className="rounded border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✅ {message}
          </div>
        )}

        {/* Sub-heading: Upload Monthly Return */}
        {showUploadForm && (
          <>
            <div className="w-full px-4 py-2 mb-2 border-t-2 border-b-2 border-[#99c2ff]">
              <h2 className="text-[16px] font-semibold text-[#b8860b]">
                * Upload Monthly Return for Wage Month: {wageMonth}
              </h2>
            </div>

          <section className="shadow-sm">
            <div className="grid gap-6 border-b border-gray-200 px-6 py-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold uppercase text-gray-600 whitespace-nowrap w-32">
                    Wage Month
                  </label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={wageMonth}
                      disabled
                      className="flex-1 rounded border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHelp(true)}
                      className="rounded border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Help
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold uppercase text-gray-600 whitespace-nowrap w-32">
                    Return File
                  </label>
                  <div className="flex-1">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Only text (.txt) files are allowed.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold uppercase text-gray-600 whitespace-nowrap w-32">
                    Return Type
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
                  >
                    {returnTypes.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                        {option.disabled ? " (Coming Soon)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-xs font-semibold uppercase text-gray-600 whitespace-nowrap w-32">
                    Contribution Rate
                  </label>
                  <select
                    value={contributionRate}
                    onChange={(e) => setContributionRate(Number(e.target.value))}
                    className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500"
                  >
                    {contributionRates.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-start gap-4">
                  <label className="text-xs font-semibold uppercase text-gray-600 whitespace-nowrap w-32 pt-2">
                    Remark
                  </label>
                  <textarea
                    rows={2}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    placeholder="Enter remark"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (!file || !file.name.toLowerCase().endsWith(".txt")) {
                        setError("File Validation Failed.");
                        return;
                      }
                      setShowUploadConfirm(true);
                    }}
                    disabled={uploading}
                    className="rounded bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-70"
                  >
                    {uploading ? "Uploading…" : "Upload"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded border border-gray-300">
                    <div className="border-b border-gray-200 bg-[#f5f7fa] px-4 py-2 text-sm font-semibold text-gray-800">
                      Member Details
                    </div>
                    <table className="w-full text-xs text-gray-700">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-2">Newly Joined Members</td>
                          <td className="px-3 py-2 text-right font-semibold">0</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-2">Total Left Members</td>
                          <td className="px-3 py-2 text-right font-semibold">0</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">Total Active Members</td>
                          <td className="px-3 py-2 text-right font-semibold">15</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded border border-gray-300">
                    <div className="border-b border-gray-200 bg-[#f5f7fa] px-4 py-2 text-sm font-semibold text-gray-800">
                      Exemption Status
                    </div>
                    <table className="w-full text-xs text-gray-700">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-2">PF</td>
                          <td className="px-3 py-2 text-right font-semibold">No</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-3 py-2">Pension</td>
                          <td className="px-3 py-2 text-right font-semibold">No</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2">EDLI</td>
                          <td className="px-3 py-2 text-right font-semibold">No</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadMembers}
                  className="w-full rounded border border-sky-600 bg-white px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                >
                  Download Active Member List
                </button>
                <a ref={downloadLinkRef} className="hidden" />
              </div>
            </div>
          </section>
          </>
        )}

        <section className="rounded-md border border-gray-300 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-[#f5f7fa] px-6 py-3">
            <h2 className="text-base font-semibold text-gray-800">
              In-Process Returns for Wage Month: {wageMonth}
            </h2>
          </div>

          <div className="overflow-x-auto p-4">
            {tableError && (
              <p className="mb-3 text-sm text-rose-600">{tableError}</p>
            )}
            <table className="min-w-full border-collapse text-sm text-gray-700">
              <thead className="bg-[#f3f5fa] border-b border-gray-300 text-left">
                <tr>
                  {[
                    "Sr. No.",
                    "Return File ID",
                    "Wage Month",
                    "Return Type",
                    "Status",
                    "Uploaded On",
                    "Cont. Rate %",
                    "Remarks",
                    "Return File",
                    "Error File",
                    "Return Statement",
                    "Action",
                  ].map((head) => (
                    <th key={head} className="px-3 py-2 font-semibold text-gray-700">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingReturns ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-4 text-center text-gray-500 italic">
                      Loading...
                    </td>
                  </tr>
                ) : returnLists.inProcess.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-4 text-center text-gray-500 italic">
                      No return file details found to display.
                    </td>
                  </tr>
                ) : (
                  returnLists.inProcess.map((item, index) => (
                    <tr key={item.id ?? index} className="border-b border-gray-200">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.trrn ?? "—"}</td>
                      <td className="px-3 py-2">{shortMonth(item.wageMonth)}</td>
                      <td className="px-3 py-2">{item.returnType}</td>
                      <td className="px-3 py-2">{item.statusLabel ?? item.status}</td>
                      <td className="px-3 py-2">{formatDateTime(item.uploadedOn)}</td>
                      <td className="px-3 py-2">{item.contributionRate ?? "—"}</td>
                      <td className="px-3 py-2">{item.remark || "—"}</td>
                      <td className="px-3 py-2">
                        {item.id ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(item.id, item.returnFileName)}
                            className="inline-flex items-center gap-1 rounded border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-60"
                            disabled={downloadingFileId === item.id}
                          >
                            <DocumentIcon className="h-4 w-4" />
                            {downloadingFileId === item.id ? "Downloading…" : "Download"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">N.A</td>
                      <td className="px-3 py-2">
                        {item.id ? (
                          <button
                            type="button"
                            onClick={() => handleViewStatement(item.id)}
                            className="rounded border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                          >
                            View
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 bg-[#f5f7fa] px-6 py-3">
            <h2 className="text-base font-semibold text-gray-800">
              Recent Returns for Wage Month: {wageMonth}
            </h2>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="min-w-full border-collapse text-sm text-gray-700">
              <thead className="bg-[#f3f5fa] border-b border-gray-300 text-left">
                <tr>
                  {[
                    "Sr. No.",
                    "Return File ID",
                    "Wage Month",
                    "Return Type",
                    "Status",
                    "Uploaded On",
                    "Cont. Rate %",
                    "Remarks",
                    "Return File",
                    "Error File",
                    "Return Statement",
                    "Action",
                  ].map((head) => (
                    <th key={head} className="px-3 py-2 font-semibold text-gray-700">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingReturns ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-4 text-center text-gray-500 italic">
                      Loading...
                    </td>
                  </tr>
                ) : returnLists.recent.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-4 text-center text-gray-500 italic">
                      No return file details found to display.
                    </td>
                  </tr>
                ) : (
                  returnLists.recent.map((item, index) => (
                    <tr key={item.id ?? index} className="border-b border-gray-200">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.trrn ?? "—"}</td>
                      <td className="px-3 py-2">{shortMonth(item.wageMonth)}</td>
                      <td className="px-3 py-2">{item.returnType}</td>
                      <td className="px-3 py-2">{item.statusLabel ?? item.status}</td>
                      <td className="px-3 py-2">{formatDateTime(item.uploadedOn)}</td>
                      <td className="px-3 py-2">{item.contributionRate ?? "—"}</td>
                      <td className="px-3 py-2">{item.remark || "—"}</td>
                      <td className="px-3 py-2">
                        {item.id ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(item.id, item.returnFileName)}
                            className="inline-flex items-center gap-1 rounded border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-60"
                            disabled={downloadingFileId === item.id}
                          >
                            <DocumentIcon className="h-4 w-4" />
                            {downloadingFileId === item.id ? "Downloading…" : "Download"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">N.A</td>
                      <td className="px-3 py-2">
                        {item.id ? (
                          <button
                            type="button"
                            onClick={() => handleViewStatement(item.id)}
                            className="rounded border border-sky-600 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                          >
                            View
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-rose-600 px-5 py-3 text-white">
              <h3 className="text-lg font-semibold">Important Notice</h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-full bg-white/20 px-2 py-1 text-sm font-semibold hover:bg-white/30"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-gray-700">
              <p className="font-semibold text-[#b30000] uppercase">
                Important Notice
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Please only use alphabets and numbers in file names. Remove special characters.</li>
                <li>Max size of file upload is 8 MB. If text file size exceeds 2 MB, please compress it using WinZip. Smaller files can also be uploaded in zip format.</li>
                <li>Do not upload any other files like jpg, gif, doc, xls, ppt etc bundled inside the zip.</li>
                <li>Only text file or zip file containing only one text file can be uploaded (file extension should be in small case).</li>
                <li>For bigger Return files, the system may take some more processing time. After uploading the file, kindly revisit the page after some time.</li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHelpFile(true)}
                  className="inline-flex items-center rounded border border-sky-600 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                >
                  Help File
                </button>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-sky-700 px-5 py-3 text-white">
              <h3 className="text-lg font-semibold">Return File Fields</h3>
              <button
                type="button"
                onClick={() => setShowHelpFile(false)}
                className="rounded-full bg-white/20 px-2 py-1 text-sm font-semibold hover:bg-white/30"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-gray-700">
              <p>Return file consists of 11 fields separated by <code>#~#</code>.</p>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border-b border-gray-200 px-4 py-2 font-semibold">Sr. No.</th>
                      <th className="border-b border-gray-200 px-4 py-2 font-semibold">Column Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      "UAN",
                      "Member Name as per UAN",
                      "Gross Wages",
                      "EPF Wages",
                      "EPS Wages",
                      "EDLI Wages",
                      "Employee PF Contribution",
                      "Employer EPS Contribution",
                      "Employer PF Contribution",
                      "NCP Days",
                      "Refund of Advance",
                    ].map((label, index) => (
                      <tr key={label} className="border-b border-gray-100">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <p className="font-semibold text-gray-800">Return Text File Format:</p>
                <pre className="mt-2 overflow-x-auto rounded bg-gray-900 px-4 py-3 text-xs text-gray-100">
100025774734#~#NITESH#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#0#~#0
100427601130#~#RAMESH#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#0#~#0
                </pre>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowHelpFile(false)}
                className="rounded bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatementModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#0f172a] px-6 py-4 text-white">
              <h3 className="text-lg font-semibold uppercase tracking-wide">
                Return Statement
              </h3>
              <button
                type="button"
                onClick={closeStatementModal}
                className="rounded bg-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/30"
              >
                Close
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-6 text-sm text-gray-700">
              {statementLoading ? (
                <p className="text-center text-sm text-gray-500">Loading return statement…</p>
              ) : statementError ? (
                <p className="rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  ⚠️ {statementError}
                </p>
              ) : statementData ? (
                <div className="space-y-6">
                  <header className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Employees’ Provident Fund Organisation, India
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      Employee’s Provident Fund Return Statement ({statementData.returnType}) ·{" "}
                      {shortMonth(statementData.wageMonth)}
                    </h2>
                  </header>

                  <section className="rounded border border-gray-300">
                    <table className="min-w-full text-xs text-gray-700">
                      <tbody>
                        <tr className="border-b border-gray-300">
                          <th className="w-1/3 bg-gray-100 px-4 py-2 text-left font-semibold">
                            Name of Establishment
                          </th>
                          <td className="px-4 py-2">{statementData.statement?.establishmentName ?? "—"}</td>
                          <th className="w-1/3 bg-gray-100 px-4 py-2 text-left font-semibold">Establishment ID</th>
                          <td className="px-4 py-2">{statementData.statement?.establishmentId ?? "—"}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">LIN</th>
                          <td className="px-4 py-2">{statementData.statement?.lin ?? "1234567890"}</td>
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">Contribution Rate (%)</th>
                          <td className="px-4 py-2">{statementData.statement?.contributionRate ?? "—"}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">Return File ID</th>
                          <td className="px-4 py-2">{statementData.statement?.returnFileId ?? statementData.trrn}</td>
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">Uploaded Date Time</th>
                          <td className="px-4 py-2">{formatDateTime(statementData.statement?.uploadedAt)}</td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">Remarks</th>
                          <td className="px-4 py-2">{statementData.statement?.remark || "—"}</td>
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">Exemption Status</th>
                          <td className="px-4 py-2">{statementData.statement?.exemptionStatus ?? "Unexempted"}</td>
                        </tr>
                        <tr>
                          <th className="bg-gray-100 px-4 py-2 text-left font-semibold">Total Members</th>
                          <td className="px-4 py-2" colSpan={3}>
                            {statementData.statement?.totals?.members ?? ACTIVE_MEMBER_COUNT}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  <section className="rounded border border-gray-300">
                    <header className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900">
                      Contribution and Remittance Details (in ₹)
                    </header>
                    <table className="min-w-full text-xs text-gray-700">
                      <tbody>
                        <tr className="border-b border-gray-300">
                          <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Total EPF Contribution</th>
                          <td className="px-4 py-2">
                            {formatMoney(statementData.statement?.totals?.epfContribution ?? 0)}
                          </td>
                          <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Total EPS Contribution</th>
                          <td className="px-4 py-2">
                            {formatMoney(statementData.statement?.totals?.epsContribution ?? 0)}
                          </td>
                        </tr>
                        <tr>
                          <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Total EPF-EPS Contribution</th>
                          <td className="px-4 py-2">
                            {formatMoney(statementData.statement?.totals?.epfEpsContribution ?? 0)}
                          </td>
                          <th className="bg-gray-50 px-4 py-2 text-left font-semibold">Total Refund of Advances</th>
                          <td className="px-4 py-2">
                            {formatMoney(statementData.statement?.totals?.refundOfAdvance ?? 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  <section className="rounded border border-gray-300">
                    <header className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900">
                      Member Details
                    </header>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 text-gray-700">
                          <tr>
                            {[
                              "Sl. No.",
                              "UAN",
                              "Name as per Return",
                              "Name as per UAN Repository",
                              "Wages – Gross",
                              "Wages – EPF",
                              "Wages – EPS",
                              "Wages – EDLI / EDU",
                              "Contribution Remitted – EE",
                              "Contribution Remitted – EPS",
                              "Contribution Remitted – ER",
                              "Refunds",
                              "NCP Days",
                              "Principal Employer ID / TAN",
                            ].map((label) => (
                              <th key={label} className="px-3 py-2 text-left font-semibold uppercase tracking-wide">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {(statementData.records ?? []).map((record, index) => (
                            <tr key={record.uan ?? index} className="hover:bg-gray-50">
                              <td className="px-3 py-2">{index + 1}</td>
                              <td className="px-3 py-2 font-medium text-gray-900">{record.uan}</td>
                              <td className="px-3 py-2">{record.memberName}</td>
                              <td className="px-3 py-2">{record.memberName}</td>
                              <td className="px-3 py-2">{formatMoney(record.grossWages)}</td>
                              <td className="px-3 py-2">{formatMoney(record.epfWages)}</td>
                              <td className="px-3 py-2">{formatMoney(record.epsWages)}</td>
                              <td className="px-3 py-2">{formatMoney(record.edliWages)}</td>
                              <td className="px-3 py-2">{formatMoney(record.employeePfContribution)}</td>
                              <td className="px-3 py-2">{formatMoney(record.employerEpsContribution)}</td>
                              <td className="px-3 py-2">{formatMoney(record.employerPfContribution)}</td>
                              <td className="px-3 py-2">{formatMoney(record.refundOfAdvance)}</td>
                              <td className="px-3 py-2">{record.ncpDays ?? 0}</td>
                              <td className="px-3 py-2">{statementData.statement?.establishmentId ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Return statement data is unavailable.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showUploadConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="border-b border-gray-200 bg-sky-700 px-5 py-3 text-white">
              <h3 className="text-lg font-semibold">Confirm Upload</h3>
            </div>
            <div className="space-y-4 px-6 py-6 text-sm text-gray-700">
              <p className="font-semibold text-gray-800">
                Please confirm the following details:
              </p>
              <table className="w-full overflow-hidden rounded border border-gray-200 text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-50 px-4 py-2 font-semibold">Wage Month</td>
                    <td className="px-4 py-2">{wageMonth}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="bg-gray-50 px-4 py-2 font-semibold">Return Type</td>
                    <td className="px-4 py-2">{returnType || "—"}</td>
                  </tr>
                  <tr>
                    <td className="bg-gray-50 px-4 py-2 font-semibold">Contribution Rate</td>
                    <td className="px-4 py-2">{contributionRate}%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500">
                Ensure the selected text file follows the prescribed format. Refer to the Help File for
                detailed field mapping.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => setShowUploadConfirm(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowUploadConfirm(false);
                  const success = await handleUpload();
                  if (success) {
                    await fetchReturnLists();
                  }
                }}
                className="rounded bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnUploadPage;
