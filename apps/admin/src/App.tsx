import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminShell } from './layout/AdminShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Catalogue } from './pages/Catalogue';
import { Insights } from './pages/Insights';
import { Payments } from './pages/Payments';
import { Settings } from './pages/Settings';
import { PaymentRequests } from './pages/PaymentRequests';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminShell />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="payment-requests" element={<PaymentRequests />} />
            <Route path="catalogue" element={<Catalogue />} />
            <Route path="payments" element={<Payments />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
