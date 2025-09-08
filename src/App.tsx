import { Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';

// Pages
import Dashboard from "@/pages/Dashboard";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentDetail from "@/pages/EquipmentDetail";

import Reports from "@/pages/Reports";
import TransmissionSystem from "@/pages/TransmissionSystem";
import DistributionSystem from "@/pages/DistributionSystem";
import NotFound from "@/pages/NotFound";

// Components
import Layout from "@/components/Layout";

export default function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/transmission" element={<TransmissionSystem />} />
          <Route path="/distribution" element={<DistributionSystem />} />

          <Route path="/reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}
