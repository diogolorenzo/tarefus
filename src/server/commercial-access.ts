import { Router, type Request, type Response } from 'express';

export type CommercialRole = 'member' | 'admin' | 'billing_admin';

export interface AuthenticatedIdentity {
  uid: string;
}

export type TokenVerificationResult =
  | { ok: true; identity: AuthenticatedIdentity }
  | { ok: false; reason: 'invalid' | 'revoked' | 'unavailable' };

type TokenFailureReason = Extract<TokenVerificationResult, { ok: false }>['reason'];

export interface TokenVerifier {
  verifyIdToken(token: string): Promise<TokenVerificationResult>;
}

export interface FirebaseAdminModuleLoader {
  loadAppModule(): Promise<FirebaseAdminAppModule>;
  loadAuthModule(): Promise<FirebaseAdminAuthModule>;
}

export interface OrganizationMembership {
  organizationId: string;
  uid: string;
  role: CommercialRole;
}

export interface MembershipRepository {
  findMembershipsByUid(uid: string): Promise<readonly OrganizationMembership[]>;
}

export interface EntitlementReader {
  readEntitlements(organizationId: string): Promise<unknown>;
}

export interface CommercialAccessDependencies {
  verifier: TokenVerifier;
  memberships: MembershipRepository;
  entitlements: EntitlementReader;
}

const COMMERCIAL_ROLES: ReadonlySet<CommercialRole> = new Set(['member', 'admin', 'billing_admin']);

export function createCommercialAccessRouter(dependencies: CommercialAccessDependencies): Router {
  const router = Router();

  router.get('/api/organizations/:orgId/entitlements', async (request, response) => {
    const token = bearerToken(request);
    if (!token) {
      response.status(401).json({ error: 'authentication_required' });
      return;
    }

    const verification = await verifyToken(dependencies.verifier, token);
    if (!verification.ok) {
      respondToTokenFailure(response, verification.reason);
      return;
    }

    const memberships = await loadMemberships(dependencies.memberships, verification.identity.uid);
    if (!memberships) {
      response.status(503).json({ error: 'membership_unavailable' });
      return;
    }

    const membership = memberships.find(
      (candidate) =>
        candidate.organizationId === request.params.orgId &&
        candidate.uid === verification.identity.uid,
    );
    if (!membership) {
      response.status(403).json({
        error: memberships.length === 0 ? 'membership_required' : 'organization_forbidden',
      });
      return;
    }

    if (!COMMERCIAL_ROLES.has(membership.role)) {
      response.status(403).json({ error: 'role_forbidden' });
      return;
    }

    const entitlements = await loadEntitlements(dependencies.entitlements, membership.organizationId);
    if (!entitlements.ok) {
      response.status(503).json({ error: 'entitlements_unavailable' });
      return;
    }

    response.json({
      organizationId: membership.organizationId,
      role: membership.role,
      entitlements: entitlements.value,
    });
  });

  return router;
}

export class FirebaseAdminTokenVerifier implements TokenVerifier {
  private firebaseAdminAuth: Promise<FirebaseAdminAuth> | undefined;
  private readonly modules: FirebaseAdminModuleLoader;

  constructor(modules: FirebaseAdminModuleLoader = firebaseAdminModuleLoader) {
    this.modules = modules;
  }

  async verifyIdToken(token: string): Promise<TokenVerificationResult> {
    let auth: FirebaseAdminAuth;
    try {
      auth = await this.getFirebaseAdminAuth();
    } catch {
      return { ok: false, reason: 'unavailable' };
    }

    try {
      const decoded = await auth.verifyIdToken(token, true);
      return typeof decoded.uid === 'string' && decoded.uid.length > 0
        ? { ok: true, identity: { uid: decoded.uid } }
        : { ok: false, reason: 'invalid' };
    } catch (error) {
      return { ok: false, reason: firebaseErrorCode(error) === 'auth/id-token-revoked' ? 'revoked' : 'invalid' };
    }
  }

  private async getFirebaseAdminAuth(): Promise<FirebaseAdminAuth> {
    if (!this.firebaseAdminAuth) {
      this.firebaseAdminAuth = initializeFirebaseAdminAuth(this.modules);
    }
    return this.firebaseAdminAuth;
  }
}

export function createUnavailableMembershipRepository(): MembershipRepository {
  return {
    async findMembershipsByUid(): Promise<readonly OrganizationMembership[]> {
      throw new Error('Server-side membership repository is not configured');
    },
  };
}

export function createUnavailableEntitlementReader(): EntitlementReader {
  return {
    async readEntitlements(): Promise<unknown> {
      throw new Error('Server-side entitlement reader is not configured');
    },
  };
}

interface FirebaseAdminAuth {
  verifyIdToken(token: string, checkRevoked: boolean): Promise<{ uid: string }>;
}

async function initializeFirebaseAdminAuth(
  modules: FirebaseAdminModuleLoader,
): Promise<FirebaseAdminAuth> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are not configured');
  }

  const app = await modules.loadAppModule();
  const auth = await modules.loadAuthModule();
  const name = firebaseAdminAppName(projectId);
  let existingApp: FirebaseAdminApp | undefined;
  try {
    existingApp = app.getApp(name);
  } catch {
    existingApp = undefined;
  }

  if (existingApp && existingApp.options.projectId !== projectId) {
    throw new Error('Named Firebase Admin app is bound to a different project');
  }

  const firebaseApp = existingApp ?? app.initializeApp(
    {
      projectId,
      credential: app.cert({ projectId, clientEmail, privateKey }),
    },
    name,
  );
  return auth.getAuth(firebaseApp);
}

function bearerToken(request: Request): string | null {
  const authorization = request.header('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

async function verifyToken(verifier: TokenVerifier, token: string): Promise<TokenVerificationResult> {
  try {
    return await verifier.verifyIdToken(token);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

async function loadMemberships(
  repository: MembershipRepository,
  uid: string,
): Promise<readonly OrganizationMembership[] | null> {
  try {
    return await repository.findMembershipsByUid(uid);
  } catch {
    return null;
  }
}

async function loadEntitlements(
  reader: EntitlementReader,
  organizationId: string,
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  try {
    return { ok: true, value: await reader.readEntitlements(organizationId) };
  } catch {
    return { ok: false };
  }
}

function respondToTokenFailure(response: Response, reason: TokenFailureReason): void {
  if (reason === 'unavailable') {
    response.status(503).json({ error: 'authentication_unavailable' });
    return;
  }
  response.status(401).json({ error: 'invalid_token' });
}

export interface FirebaseAdminAppModule {
  getApp(name: string): FirebaseAdminApp;
  initializeApp(options: { projectId: string; credential: unknown }, name: string): FirebaseAdminApp;
  cert(credentials: { projectId: string; clientEmail: string; privateKey: string }): unknown;
}

export interface FirebaseAdminApp {
  name: string;
  options: { projectId?: string };
}

export interface FirebaseAdminAuthModule {
  getAuth(app: unknown): FirebaseAdminAuth;
}

const firebaseAdminModuleLoader: FirebaseAdminModuleLoader = {
  loadAppModule: async () => importFirebaseAdminModule('firebase-admin/app') as Promise<FirebaseAdminAppModule>,
  loadAuthModule: async () => importFirebaseAdminModule('firebase-admin/auth') as Promise<FirebaseAdminAuthModule>,
};

function firebaseAdminAppName(projectId: string): string {
  return `tarefus-admin:${projectId}`;
}

function importFirebaseAdminModule(moduleName: string): Promise<unknown> {
  return import(moduleName);
}

function firebaseErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined;
}
