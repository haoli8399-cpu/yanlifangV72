// ── V7.2 TanStack Query Hooks ──
// 使用 React Query 管理 API 数据获取与状态

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMSACandidate,
  patchTenantDecision,
  patchCustomerDecision,
  activateMSA,
  acceptQuote,
  rejectQuote,
  listEngagements,
  respondEngagement,
  createRoutingDecision,
  selectTenant,
  createProject,
  getProject,
  changeProjectStatus,
  listPlans,
  createPlan,
  getPlan,
  submitPlanForReview,
  reviewPlan,
  createPlanItem,
  listPlanItems,
  updatePlanItemStatus,
  createChangeRequest,
  listChangeRequests,
  submitChangeRequest,
  createQuote,
  listQuotes,
  submitQuoteForApproval,
  approveQuote,
  sendQuote,
  type TenantEngagement,
  type PlanVersionSummary,
  type ProjectSummary,
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
        const res = await fetch("http://localhost:3002/v2/demands");
        if (!res.ok) throw new Error("API unavailable");
        return await res.json();
      } catch {
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

// ── TenantEngagement ──

export function useEngagementList(demandId: string | undefined) {
  return useQuery({
    queryKey: ["engagements", demandId],
    queryFn: async () => {
      if (!demandId) throw new Error("demandId required");
      const res = await listEngagements(demandId);
      return res.data;
    },
    enabled: !!demandId,
    staleTime: 30_000,
  });
}

export function useRespondEngagement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision, notes }: { id: string; decision: "accepted" | "declined" | "request_supplement"; notes?: string }) => {
      return respondEngagement(id, decision, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
      queryClient.invalidateQueries({ queryKey: ["msa"] });
    },
  });
}

// ── RoutingDecision ──

export function useRoutingDecision(demandId: string | undefined) {
  return useQuery({
    queryKey: ["routing", demandId],
    queryFn: async () => {
      if (!demandId) throw new Error("demandId required");
      const res = await import("./api-client").then(m => m.getRoutingDecision(demandId));
      return res.data;
    },
    enabled: !!demandId,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useSelectTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ demandId, tenantId, isReplacement }: { demandId: string; tenantId: string; isReplacement?: boolean }) => {
      return selectTenant(demandId, tenantId, isReplacement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routing"] });
      queryClient.invalidateQueries({ queryKey: ["engagements"] });
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

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ demandId, msaId, mainTenantId, title }: { demandId: string; msaId: string; mainTenantId: string; title?: string }) => {
      return createProject(demandId, msaId, mainTenantId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useProjectStatus(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-status", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("projectId required");
      const res = await getProject(projectId);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 15_000,
  });
}

export function useChangeProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      return changeProjectStatus(projectId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-status"] });
    },
  });
}

// ── Plans ──

export function usePlanList(projectId: string | undefined) {
  return useQuery({
    queryKey: ["plans", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("projectId required");
      const res = await listPlans(projectId);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function usePlanDetail(planId: string | undefined) {
  return useQuery({
    queryKey: ["plan", planId],
    queryFn: async () => {
      if (!planId) throw new Error("planId required");
      const res = await getPlan(planId);
      return res.data;
    },
    enabled: !!planId,
    staleTime: 30_000,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, title, goal }: { projectId: string; title?: string; goal?: string }) => {
      return createPlan(projectId, title, goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useSubmitPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      return submitPlanForReview(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useReviewPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, decision }: { planId: string; decision: "approved" | "rejected" }) => {
      return reviewPlan(planId, decision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

// ── PlanItems ──

export function usePlanItemList(planId: string | undefined) {
  return useQuery({
    queryKey: ["plan-items", planId],
    queryFn: async () => {
      if (!planId) throw new Error("planId required");
      const res = await listPlanItems(planId);
      return res.data;
    },
    enabled: !!planId,
    staleTime: 30_000,
  });
}

export function useCreatePlanItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, item }: { planId: string; item: import("./api-client").PlanItemInput }) => {
      return createPlanItem(planId, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-items"] });
    },
  });
}

export function useUpdatePlanItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, axis, status }: { itemId: string; axis: string; status: string }) => {
      return updatePlanItemStatus(itemId, axis, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plan-items"] });
    },
  });
}

// ── ChangeRequests ──

export function useChangeRequestList(projectId: string | undefined) {
  return useQuery({
    queryKey: ["change-requests", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("projectId required");
      const res = await listChangeRequests(projectId);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, title, reason }: { projectId: string; title: string; reason: string }) => {
      return createChangeRequest(projectId, title, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-requests"] });
    },
  });
}

export function useSubmitChangeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (crId: string) => {
      return submitChangeRequest(crId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-requests"] });
    },
  });
}

// ── Quotes ──

export function useQuotes(projectId: string | undefined) {
  return useQuery({
    queryKey: ["quotes", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("projectId required");
      const res = await listQuotes(projectId);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, input }: { projectId: string; input: import("./api-client").QuoteInput }) => {
      return createQuote(projectId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useAcceptQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      return acceptQuote(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["project-status"] });
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quoteId, reason }: { quoteId: string; reason?: string }) => {
      return rejectQuote(quoteId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useSubmitQuoteForApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      return submitQuoteForApproval(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useApproveQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quoteId, decision }: { quoteId: string; decision: "approved" | "rejected" }) => {
      return approveQuote(quoteId, decision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      return sendQuote(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["project-status"] });
    },
  });
}
