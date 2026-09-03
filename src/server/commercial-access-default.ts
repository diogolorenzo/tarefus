import type { Express } from 'express';
import {
  createCommercialAccessRouter,
  createUnavailableEntitlementReader,
  createUnavailableMembershipRepository,
  FirebaseAdminTokenVerifier,
} from './commercial-access';

export function mountCommercialAccessRouter(app: Express): void {
  app.use(
    createCommercialAccessRouter({
      verifier: new FirebaseAdminTokenVerifier(),
      memberships: createUnavailableMembershipRepository(),
      entitlements: createUnavailableEntitlementReader(),
    }),
  );
}
