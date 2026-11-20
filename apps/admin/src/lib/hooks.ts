import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type CreatePaymentRequest, type ProductRow, type Settings } from './api';
import type { Tier } from '@rf/mocks';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: adminApi.dashboard });
}

export function useOrders(status: string, q: string) {
  return useQuery({ queryKey: ['orders', status, q], queryFn: () => adminApi.orders(status, q) });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => adminApi.order(id as string),
    enabled: !!id,
  });
}

export function useTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, body }: { id: string; action: string; body?: unknown }) =>
      adminApi.transition(id, action, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['order'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: adminApi.products });
}

export function usePatchProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, patch }: { slug: string; patch: Partial<ProductRow> }) =>
      adminApi.patchProduct(slug, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useBulkPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tier, pct, apply }: { tier: Tier; pct: number; apply: boolean }) =>
      adminApi.bulkPrice(tier, pct, apply),
    onSuccess: (_d, vars) => {
      if (vars.apply) void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function usePayments(source: string, status: string) {
  return useQuery({ queryKey: ['payments', source, status], queryFn: () => adminApi.payments(source, status) });
}
export function usePayouts() {
  return useQuery({ queryKey: ['payouts'], queryFn: adminApi.payouts });
}
export function useDisputes() {
  return useQuery({ queryKey: ['disputes'], queryFn: adminApi.disputes });
}
export function usePaymentAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'capture' | 'cancel-hold' }) =>
      action === 'capture' ? adminApi.capturePayment(id) : adminApi.cancelHold(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount_cents, reason }: { id: string; amount_cents: number; reason: string }) =>
      adminApi.refundPayment(id, amount_cents, reason),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payments'] }),
  });
}

export function useInsights() {
  return useQuery({ queryKey: ['insights'], queryFn: adminApi.insights });
}

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: adminApi.settings });
}
export function usePatchSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => adminApi.patchSettings(patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function usePaymentRequests(status: string) {
  return useQuery({ queryKey: ['payment-requests', status], queryFn: () => adminApi.paymentRequests(status) });
}
export function useCreatePaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => adminApi.createPaymentRequest(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payment-requests'] }),
  });
}
export function usePaymentRequestAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'cancel' | 'resend' | 'duplicate' }) =>
      action === 'cancel'
        ? adminApi.cancelPaymentRequest(id)
        : action === 'duplicate'
          ? adminApi.duplicatePaymentRequest(id)
          : adminApi.resendPaymentRequest(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payment-requests'] }),
  });
}

export function useUpdatePaymentRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreatePaymentRequest> }) =>
      adminApi.updatePaymentRequest(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payment-requests'] }),
  });
}
