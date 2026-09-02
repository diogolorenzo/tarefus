import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreCommercialRepository } from '../src/server/commercial-repository';

// Compile-only contract: no Admin SDK app is initialized and no credentials
// are loaded. A future adapter may inject an already-owned Firestore instance.
export function compileCommercialRepositoryWithAdmin(
  adminFirestore: Firestore,
): FirestoreCommercialRepository {
  return new FirestoreCommercialRepository(adminFirestore, {
    serverTimestamp: () => ({ __serverTimestampSentinel: true }),
  });
}
