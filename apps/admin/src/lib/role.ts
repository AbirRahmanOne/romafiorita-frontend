export type Role = 'OWNER' | 'MANAGER' | 'FLORIST' | 'RIDER';

/** Current staff role. Phase 4+ reads this from GET /me; mocked as OWNER for now. */
export const currentRole: Role = 'OWNER';

/** Florist and Rider never see payments/settings (prompt §6.9). */
export const canSeeMoney = (role: Role = currentRole) => role === 'OWNER' || role === 'MANAGER';
