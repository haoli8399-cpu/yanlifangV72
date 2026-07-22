// ============================================================
// 演立方 V7.2 · 四轴正交状态机
// 参考 Trae state_machine.py → TypeScript 实现
// PRD §20.4: readiness / lifecycle / publication / evidence
// ============================================================

export type ReadinessLevel = 'draft' | 'matchable' | 'quotable' | 'publishable';
export type LifecycleStatus = 'draft' | 'pending_confirmation' | 'active' | 'suspended' | 'expired' | 'superseded' | 'retired';
export type PublicationStatus = 'private' | 'pending_publish' | 'published' | 'withdrawn';
export type EvidenceStatus = 'declared' | 'supported' | 'verified' | 'conflict' | 'expired';

const RD_TRANSITIONS: Record<ReadinessLevel, ReadinessLevel[]> = {
  draft: ['matchable', 'quotable', 'publishable'],
  matchable: ['draft', 'quotable', 'publishable'],
  quotable: ['draft', 'matchable', 'publishable'],
  publishable: ['draft', 'matchable', 'quotable'],
};

const LC_TRANSITIONS: Record<LifecycleStatus, LifecycleStatus[]> = {
  draft: ['pending_confirmation', 'active', 'retired'],
  pending_confirmation: ['active', 'draft'],
  active: ['suspended', 'expired', 'superseded', 'retired'],
  suspended: ['active', 'expired', 'retired'],
  expired: ['retired'],
  superseded: ['retired'],
  retired: [],
};


const PB_TRANSITIONS: Record<PublicationStatus, PublicationStatus[]> = {
  private: ['pending_publish'],
  pending_publish: ['published', 'private'],
  published: ['withdrawn', 'private'],
  withdrawn: ['pending_publish', 'private'],
};

const EV_TRANSITIONS: Record<EvidenceStatus, EvidenceStatus[]> = {
  declared: ['supported', 'conflict'],
  supported: ['verified', 'conflict', 'declared'],
  verified: ['expired', 'conflict'],
  conflict: ['declared', 'supported'],
  expired: ['declared'],
};

export class StateMachine<S extends string> {
  private t: Record<S, S[]>;
  constructor(t: Record<S, S[]>) { this.t = t; }
  can(from: S, to: S): boolean { return (this.t[from] || []).includes(to); }
  assert(from: S, to: S, label = 'entity'): void {
    if (!this.can(from, to)) throw new Error(`State transition denied: ${from} -> ${to} (${label})`);
  }
}

export const readinessSM = new StateMachine(RD_TRANSITIONS);
export const lifecycleSM = new StateMachine(LC_TRANSITIONS);
export const publicationSM = new StateMachine(PB_TRANSITIONS);
export const evidenceSM = new StateMachine(EV_TRANSITIONS);

export type StateAxis = 'readiness' | 'lifecycle' | 'publication' | 'evidence';

const SM_MAP: Record<StateAxis, StateMachine<string>> = {
  readiness: readinessSM as StateMachine<string>,
  lifecycle: lifecycleSM as StateMachine<string>,
  publication: publicationSM as StateMachine<string>,
  evidence: evidenceSM as StateMachine<string>,
};

export function validateTransition(
  axis: StateAxis,
  from: string,
  to: string,
  entity = '',
): void {
  const sm = SM_MAP[axis];
  if (!sm) throw new Error(`Unknown axis: ${axis}`);
  sm.assert(from, to, entity);
}

// MainServiceAssignment lifecycle (PRD §20.10)
export type MSALifecycle = 'proposed' | 'pending_dual_confirmation' | 'active' | 'completed' | 'expired' | 'reassigned' | 'terminated' | 'disputed' | 'closed_external';
const MSA_LC: Record<string, string[]> = {
  proposed: ['pending_dual_confirmation','expired'],
  pending_dual_confirmation: ['active','expired'],
  active: ['completed','reassigned','terminated','disputed'],
  completed: [],
  expired: [],
  reassigned: [],
  terminated: [],
  disputed: ['active','terminated','closed_external'],
  closed_external: [],
};
export const msaLifecycleSM = new StateMachine(MSA_LC);
