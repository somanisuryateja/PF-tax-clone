import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import EcrGatewayPage from './pages/EcrGatewayPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReturnQuickLinksPage from './pages/ReturnQuickLinksPage.jsx';
import ReturnMonthlyPage from './pages/ReturnMonthlyPage.jsx';
import ReturnUploadPage from './pages/ReturnUploadPage.jsx';
import ReturnDetailPage from './pages/ReturnDetailPage.jsx';
import ReturnFullPaymentPage from './pages/ReturnFullPaymentPage.jsx';
import ChallanListPage from './pages/ChallanListPage.jsx';
import ChallanPaymentPage from './pages/ChallanPaymentPage.jsx';
import PaymentGatewayPage from './pages/PaymentGatewayPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="w-full bg-[#c62839] text-white text-xs sm:text-sm py-2 px-4 text-center">
          This is a simulation. Please use this website for Educational purposes only. This is not affiliated with, endorsed by, or authorized by gst.gov.in or the Government of India.
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gateway/ecr" element={<EcrGatewayPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/returns" element={<ReturnQuickLinksPage />} />
            <Route path="/returns/monthly" element={<ReturnMonthlyPage />} />
            <Route path="/returns/upload" element={<ReturnUploadPage />} />
            <Route path="/returns/:id/full-payment" element={<ReturnFullPaymentPage />} />
            <Route path="/returns/:id" element={<ReturnDetailPage />} />
            <Route path="/returns/challans" element={<ChallanListPage />} />
            <Route path="/returns/challans/:id" element={<ChallanPaymentPage />} />
            <Route path="/returns/challans/:id/:action" element={<ChallanPaymentPage />} />
            <Route path="/payment/gateway" element={<PaymentGatewayPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;