import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Help from "./pages/Help";
import BankAdminLogin from "./pages/BankAdminLogin";
import EvaluatorHome from "./pages/EvaluatorHome";
import SmeRegister from "./pages/SMERegister";
import SMEReport from "./pages/SMEReport";
import SMEScore from "./pages/Scoring";
import BankAdminDashboard from "./pages/BankAdminDashbord"; 
function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/help" element={<Help />} />
        <Route path="/admin-login" element={<BankAdminLogin />} />
        <Route path="/evaluator-home" element={<EvaluatorHome />} />
        <Route path="/sme-register" element={<SmeRegister />} />
        <Route path="/smes/:id/report" element={<SMEReport />} />
        <Route path="/smes/:id/score" element={<SMEScore />} />
        <Route path="/bank-admin-dashboard" element={<BankAdminDashboard />} />



      </Routes>

    </BrowserRouter>
  );
}

export default App;
