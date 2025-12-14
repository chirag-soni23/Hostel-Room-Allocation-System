import { useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import BottomToTop from "./hoc/BottomToTop";
import ScrollToTop from "./hoc/ScrollToTop";
import FullscreenSpinner from "./hoc/FullscreenSpinner";
import AddHostel from "./pages/admin/AddHostel";
import AddRoom from "./pages/admin/AddRoom";
import Contact from "./pages/Contact";

const Index = lazy(() => import("./pages/Index"));
const Hostels = lazy(() => import("./pages/Hostels"));
const Rooms = lazy(() => import("./pages/Rooms"));
const RoomDetail = lazy(() => import("./pages/RoomDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Profile = lazy(() => import("./pages/Profile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RequireAuth({ children }) {
  const { isAuth, loading } = useAuthStore();
  if (loading) return <FullscreenSpinner />;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { isAuth, loading } = useAuthStore();
  if (loading) return <FullscreenSpinner />;
  return !isAuth ? children : <Navigate to="/" replace />;
}

function RequireAdmin({ children }) {
  const { isAuth, loading, user } = useAuthStore();
  if (loading) return <FullscreenSpinner />;
  const role = (user?.role || "").toString().toLowerCase();
  return isAuth && role === "admin" ? children : <Navigate to="/" replace />;
}

const App = () => {
  const { init } = useAuthStore();

  useEffect(() => {
    init?.();
  }, [init]);

  return (
    <TooltipProvider>
      <BottomToTop />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<FullscreenSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:roomId" element={<RoomDetail />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />

            {/* Guest-only */}
            <Route
              path="/login"
              element={
                <RequireGuest>
                  <Login />
                </RequireGuest>
              }
            />
            <Route
              path="/register"
              element={
                <RequireGuest>
                  <Register />
                </RequireGuest>
              }
            />

            {/* Auth-only */}
            <Route
              path="/bookings"
              element={
                <RequireAuth>
                  <Bookings />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/checkout/:bookingId"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />

            {/* Admin-only */}
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/hostels/new"
              element={
                <RequireAdmin>
                  <AddHostel />
                </RequireAdmin>
              }
            />

            <Route
              path="/admin/rooms/new"
              element={
                <RequireAdmin>
                  <AddRoom />
                </RequireAdmin>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
