import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PublicHeader from "../components/PublicHeader.jsx";
import {
  FaUser,
  FaLock,
  FaCheck,
  FaUndo,
  FaLandmark,
  FaUserPlus,
  FaInfoCircle,
  FaBuilding,
} from "react-icons/fa";

const instructions = [
  "Please create your permanent login ID and password after the first login.",
  "If you have forgotten your password/login ID, use the Forgot Password link to get it via SMS on your registered mobile.",
  "If your account is locked due to wrong password attempts, use Unlock Account link."
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authenticated, loading, error, setError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [showAlert, setShowAlert] = useState(true);

  const modalFrom = useMemo(() => location.state?.modalFrom ?? "/", [location.state]);

  useEffect(() => {
    if (authenticated) {
      const from = location.state?.from?.pathname ?? "/dashboard";
      navigate(from, { replace: true });
    }
  }, [authenticated, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username) return setError("Username is required.");
    if (!password) return setError("Password is required.");
    if (!captcha) return setError("Please enter captcha.");

    const success = await login(username, password);
    if (success) navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafc] text-gray-800">
      <PublicHeader />

      {/* 🔷 Main Section */}
      <main className="flex-1 flex justify-center px-6 py-10">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 🟧 Welcome Employers */}
          <div className="border border-[#ff7a00] bg-white rounded-sm shadow-sm w-full">
            <div className="bg-[#ff7a00] text-white font-semibold px-3 py-2 text-sm flex items-center justify-between">
              <span>Welcome Employers !!</span>
              <FaUserPlus className="text-white/80 w-4 h-4" />
            </div>

            <div className="p-3 text-[0.85rem] leading-relaxed">
              <p className="text-[#d70000] mb-2">
                For all news and updates on EPF, please subscribe our{" "}
                <span className="font-semibold">YouTube</span> channel (
                <Link
                  to="https://youtube.com/socialepfo"
                  target="_blank"
                  className="text-[#0000ee] underline"
                >
                  youtube.com/socialepfo
                </Link>
                ), <span className="font-semibold">Instagram</span> (
                <Link
                  to="https://instagram.com/social_epfo"
                  target="_blank"
                  className="text-[#0000ee] underline"
                >
                  instagram.com/social_epfo
                </Link>
                ), <span className="font-semibold">Twitter</span> (
                <Link
                  to="https://twitter.com/socialepfo"
                  target="_blank"
                  className="text-[#0000ee] underline"
                >
                  twitter.com/socialepfo
                </Link>
                ) and <span className="font-semibold">Facebook</span> (
                <Link
                  to="https://facebook.com/socialepfo"
                  target="_blank"
                  className="text-[#0000ee] underline"
                >
                  facebook.com/socialepfo
                </Link>
                ).
              </p>

              <p className="text-black">
                <span className="inline-block mr-1">🔸</span>
                No last date is declared by EPFO for filing nomination.
              </p>
            </div>
          </div>

          {/* 🟥 Instructions */}
          <div className="border border-rose-400 rounded-sm shadow-sm bg-white w-full">
            <div className="bg-rose-500 text-white font-semibold text-sm px-4 py-2 flex items-center justify-between">
              <span>Instructions</span>
              <FaInfoCircle className="text-white/80 w-4 h-4" />
            </div>

            <div className="p-4 text-[0.85rem] leading-relaxed text-rose-800 space-y-2">
              {instructions.map((item, index) => (
                <p key={index}>🔸 {item}</p>
              ))}
            </div>
          </div>

          {/* 🟦 Establishment Sign In */}
          <div className="border border-sky-400 rounded-sm shadow-sm bg-white w-full">
            <div className="bg-sky-500 text-white font-semibold text-sm px-4 py-2 flex items-center justify-between">
              <span>Establishment Sign In</span>
              <FaBuilding className="text-white/80 w-4 h-4" />
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Parliament Icon */}
                <div className="flex justify-center mb-2">
                  <FaLandmark className="text-sky-600 w-8 h-8" />
                </div>

                {/* Username */}
                <div className="relative">
                  <FaUser className="absolute left-2 top-3 text-gray-500 text-xs" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full border border-gray-300 rounded px-3 py-2 pl-8 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <FaLock className="absolute left-2 top-3 text-gray-500 text-xs" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full border border-gray-300 rounded px-3 py-2 pl-8 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Captcha */}
                <div className="space-y-2">
                  <div className="border border-gray-300 rounded px-3 py-2 text-center font-mono tracking-widest text-base bg-gray-100 text-gray-800">
                    W D k w 3
                  </div>
                  <input
                    type="text"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    placeholder="Enter Captcha"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                    ⚠️ {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md transition w-1/2 disabled:opacity-70"
                  >
                    {loading ? "Signing In..." : <>Sign In <FaCheck className="w-4 h-4" /></>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("");
                      setPassword("");
                      setCaptcha("");
                      setError("");
                    }}
                    className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-md transition w-1/2"
                  >
                    Reset <FaUndo className="w-4 h-4" />
                  </button>
                </div>

                {/* Links */}
                <div className="text-sm mt-2 text-center flex justify-center items-center gap-2">
                  <Link to="/forgot-password" className="text-sky-700 hover:underline">
                    Forgot Password
                  </Link>
                  <span className="text-gray-400 select-none">|</span>
                  <Link to="/unlock-account" className="text-sky-700 hover:underline">
                    Unlock Account
                  </Link>
                </div>

                {/* Footer Links */}
                <div className="pt-2 border-t border-gray-200 text-xs text-sky-700 space-y-1 text-center">
                  <p>Employer Sign In</p>
                  <p>Uncovered Principal Employer Sign In</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* 🔵 Bottom Info */}
      <section className="bg-white border-t border-gray-300 py-5">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sky-800 font-semibold mb-2">What's New</h3>
            <p className="text-sm text-gray-700">
              EPFO services are now available on UMANG (Unified Mobile App for
              New Governance). Download from{" "}
              <Link
                to="https://web.umang.gov.in"
                target="_blank"
                className="text-sky-700 underline"
              >
                UMANG website
              </Link>
              .
            </p>
          </div>
          <div>
            <h3 className="text-sky-800 font-semibold mb-2">Important Links</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                <Link to="/registration" className="text-sky-700 hover:underline">
                  Common Registration (EPFO & ESIC)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 🔴 Security Advisory Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4">
          <div className="bg-white w-full max-w-lg rounded-lg overflow-hidden shadow-2xl">
            <header className="bg-rose-600 text-white px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Security Advisory</h2>
              <button
                className="text-white bg-white/20 px-2 py-1 rounded hover:bg-white/30"
                onClick={() => setShowAlert(false)}
              >
                ×
              </button>
            </header>
            <div className="p-5 space-y-4 text-sm">
              <div className="bg-rose-50 border border-rose-200 rounded p-3 text-rose-800">
                <p className="font-semibold">Dear Employers,</p>
                <p>
                  Be vigilant against credential theft/loss that may lead to
                  cyber frauds.
                </p>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded p-3 text-sky-800">
                <ul className="list-disc list-inside space-y-2">
                  <li>Install a licensed Anti-Virus/Anti-Malware on systems.</li>
                  <li>Keep systems updated and patched.</li>
                  <li>Maintain a strong and complex password.</li>
                  <li>Do not share passwords with anyone.</li>
                </ul>
                <p className="mt-2 text-right font-semibold">– EPFO</p>
              </div>
            </div>
            <footer className="bg-gray-50 border-t border-gray-200 px-5 py-3 text-right">
              <button
                onClick={() => setShowAlert(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 rounded-md"
              >
                OK
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
