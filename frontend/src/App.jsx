import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Help from "./pages/Help";
import EvaluatorHome from "./pages/EvaluatorHome";
import SmeRegister from "./pages/SMERegister";
import SMEReport from "./pages/SMEReport";
import SMEScore from "./pages/Scoring";
import BankAdminLogin from "./pages/BankAdminLogin";
import BankAdminDashboard from "./pages/BankAdminDashbord";
import Results from "./pages/Results";
import EvaluatorProfile from "./pages/EvaluatorProfile";
import SuperAdmin from "./pages/SuperAdmin";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/help" element={<Help />} />

        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowRoles={["SUPER_ADMIN"]}>
              <SuperAdmin />
            </ProtectedRoute>
          }
        />

        {/* evaluator */}
        <Route
          path="/evaluator-home"
          element={
            <ProtectedRoute allowRoles={["EVALUATOR"]}>
              <EvaluatorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sme-register"
          element={
            <ProtectedRoute allowRoles={["EVALUATOR"]}>
              <SmeRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/smes/:id/report"
          element={
            <ProtectedRoute allowRoles={["EVALUATOR"]}>
              <SMEReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/smes/:id/score"
          element={
            <ProtectedRoute allowRoles={["EVALUATOR"]}>
              <SMEScore />
            </ProtectedRoute>
          }
        />

        {/* bank admin */}
        <Route
          path="/bank-admin-dashboard"
          element={
            <ProtectedRoute allowRoles={["BANK_ADMIN"]}>
              <BankAdminDashboard />
            </ProtectedRoute>
          }
        />

         <Route
          path="/smes/:id/results"
          element={
            <ProtectedRoute allowRoles={["EVALUATOR"]}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluator-profile"
           element={
            <ProtectedRoute allowRoles={["EVALUATOR"]}>
          <EvaluatorProfile />
        </ProtectedRoute>
      }
/>
      <Route 
      path="/admin-login" 
      element={<BankAdminLogin allowRoles={["BANK_ADMIN"]} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
