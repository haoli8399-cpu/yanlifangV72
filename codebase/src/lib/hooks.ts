// ── V7.2 TanStack Query Hooks ──
// 使用 React Query 管理 API 数据获取与状态

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMSACandidate,
  patchTenantDecision,
  acceptQuote,
  confirmCredential,
  declarePayment,
  type MSAActivation,
} from "./api-client";
import { msaFixtures, projects, type MainServiceAssignment, type Project } from "./fixtures";

// ── Capabilities ──

export function useCapabilities() {
  return useQuery({
    queryKey: ["capabilities"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3002/v2/capabilities");
      const json = await res.json();
      return json.data ?? [];
    },
    staleTime: 60_000,
  });
}

// ── MSA ──

export function useMSAList() {
  return useQuery({
    queryKey: ["msa"],
    queryFn: async () => {
      try {
        // Try real API first
        const res = await fetch("http://localhost:3002/v2/demands");
        if (!res.ok) throw new Error("API unavailable");
        return await res.json();
      } catch {
        // Fallback to fixtures
        return msaFixtures as MainServiceAssignment[];
      }
    },
    staleTime: 30_000,
  });
}

export function useAcceptMSA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      await patchTenantDecision(assignmentId, "accepted");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msa"] });
    },
  });
}

export function useDeclineMSA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      await patchTenantDecision(assignmentId, "declined");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msa"] });
    },
  });
}

// ── Projects ──

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projects as Project[];
    },
    staleTime: 60_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const p = projects.find((pr) => pr.id === id);
      if (!p) throw new Error("Project not found");
      return p as Project;
    },
    enabled: !!id,
  });
}

// ── Commercial ──

export function useAcceptQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      await acceptQuote(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useConfirmCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentialId: string) => {
      await confirmCredential(credentialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useDeclarePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      await declarePayment(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}
