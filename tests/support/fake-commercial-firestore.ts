import type {
  CommercialCollectionReference,
  CommercialDocumentData,
  CommercialDocumentReference,
  CommercialDocumentSnapshot,
  CommercialFirestore,
  CommercialQuery,
  CommercialQuerySnapshot,
  CommercialTransaction,
} from '../../src/server/commercial-repository';

type Filter = { field: string; value: unknown };
type StoredDocument = { data: CommercialDocumentData };

export class FakeCommercialFirestore implements CommercialFirestore {
  private readonly documents = new Map<string, StoredDocument>();
  private transactionTail: Promise<void> = Promise.resolve();
  private nextId = 1;

  doc(path: string): CommercialDocumentReference {
    return new FakeDocumentReference(this, path);
  }

  collection(path: string): CommercialCollectionReference {
    return new FakeCollectionReference(this, path, []);
  }

  collectionGroup(collectionId: string): CommercialQuery {
    return new FakeQuery(this, { kind: 'group', value: collectionId }, []);
  }

  async runTransaction<T>(execute: (transaction: CommercialTransaction) => Promise<T>): Promise<T> {
    let release: () => void = () => undefined;
    const prior = this.transactionTail;
    this.transactionTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await prior;

    try {
      const transaction = new FakeTransaction(this);
      const result = await execute(transaction);
      transaction.commit();
      return result;
    } finally {
      release();
    }
  }

  read(path: string): CommercialDocumentData | undefined {
    const stored = this.documents.get(path);
    return stored ? clone(stored.data) : undefined;
  }

  list(collectionPath: string): readonly { path: string; data: CommercialDocumentData }[] {
    const prefix = `${collectionPath}/`;
    const targetSegments = splitPath(collectionPath).length + 1;
    return [...this.documents.entries()]
      .filter(([path]) => path.startsWith(prefix) && splitPath(path).length === targetSegments)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([path, stored]) => ({ path, data: clone(stored.data) }));
  }

  makeId(): string {
    const id = `server-${String(this.nextId).padStart(4, '0')}`;
    this.nextId += 1;
    return id;
  }

  snapshot(path: string): CommercialDocumentSnapshot {
    return new FakeDocumentSnapshot(this, path);
  }

  query(scope: QueryScope, filters: readonly Filter[]): CommercialQuerySnapshot {
    const documents = [...this.documents.keys()]
      .filter((path) => matchesScope(path, scope))
      .filter((path) => {
        const data = this.documents.get(path)?.data ?? {};
        return filters.every((filter) => data[filter.field] === filter.value);
      })
      .sort((left, right) => left.localeCompare(right))
      .map((path) => this.snapshot(path));
    return { docs: documents };
  }

  create(path: string, data: CommercialDocumentData): void {
    if (this.documents.has(path)) throw new Error(`Document already exists: ${path}`);
    this.documents.set(path, { data: clone(data) });
  }

  set(path: string, data: CommercialDocumentData): void {
    this.documents.set(path, { data: clone(data) });
  }

  update(path: string, data: CommercialDocumentData): void {
    const current = this.documents.get(path);
    if (!current) throw new Error(`Document does not exist: ${path}`);
    this.documents.set(path, { data: { ...clone(current.data), ...clone(data) } });
  }
}

class FakeDocumentReference implements CommercialDocumentReference {
  readonly id: string;
  readonly path: string;
  private readonly owner: FakeCommercialFirestore;

  constructor(owner: FakeCommercialFirestore, path: string) {
    this.owner = owner;
    this.path = path;
    this.id = splitPath(path).at(-1) ?? '';
  }

  async get(): Promise<CommercialDocumentSnapshot> {
    return this.owner.snapshot(this.path);
  }

  async create(data: CommercialDocumentData): Promise<void> {
    this.owner.create(this.path, data);
  }
}

class FakeDocumentSnapshot implements CommercialDocumentSnapshot {
  readonly id: string;
  readonly ref: CommercialDocumentReference;
  private readonly owner: FakeCommercialFirestore;

  constructor(owner: FakeCommercialFirestore, path: string) {
    this.owner = owner;
    this.id = splitPath(path).at(-1) ?? '';
    this.ref = new FakeDocumentReference(owner, path);
  }

  get exists(): boolean {
    return this.owner.read(this.ref.path) !== undefined;
  }

  data(): CommercialDocumentData | undefined {
    return this.owner.read(this.ref.path);
  }
}

type QueryScope =
  | { kind: 'collection'; value: string }
  | { kind: 'group'; value: string };

class FakeQuery implements CommercialQuery {
  protected readonly owner: FakeCommercialFirestore;
  protected readonly scope: QueryScope;
  protected readonly filters: readonly Filter[];

  constructor(owner: FakeCommercialFirestore, scope: QueryScope, filters: readonly Filter[]) {
    this.owner = owner;
    this.scope = scope;
    this.filters = filters;
  }

  where(field: string, operator: '==', value: unknown): CommercialQuery {
    if (operator !== '==') throw new Error(`Unsupported fake query operator: ${operator}`);
    return new FakeQuery(this.owner, this.scope, [...this.filters, { field, value }]);
  }

  async get(): Promise<CommercialQuerySnapshot> {
    return this.owner.query(this.scope, this.filters);
  }
}

class FakeCollectionReference extends FakeQuery implements CommercialCollectionReference {
  readonly path: string;

  constructor(owner: FakeCommercialFirestore, path: string, filters: readonly Filter[]) {
    super(owner, { kind: 'collection', value: path }, filters);
    this.path = path;
  }

  doc(id?: string): CommercialDocumentReference {
    return this.owner.doc(`${this.path}/${id ?? this.owner.makeId()}`);
  }
}

type StagedWrite =
  | { kind: 'create'; path: string; data: CommercialDocumentData }
  | { kind: 'set'; path: string; data: CommercialDocumentData }
  | { kind: 'update'; path: string; data: CommercialDocumentData };

class FakeTransaction implements CommercialTransaction {
  private readonly owner: FakeCommercialFirestore;
  private readonly writes: StagedWrite[] = [];

  constructor(owner: FakeCommercialFirestore) {
    this.owner = owner;
  }

  async get(reference: CommercialDocumentReference): Promise<CommercialDocumentSnapshot>;
  async get(query: CommercialQuery): Promise<CommercialQuerySnapshot>;
  async get(target: CommercialDocumentReference | CommercialQuery): Promise<CommercialDocumentSnapshot | CommercialQuerySnapshot> {
    if ('path' in target && 'id' in target) return this.owner.snapshot(target.path);
    return target.get();
  }

  create(reference: CommercialDocumentReference, data: CommercialDocumentData): void {
    this.writes.push({ kind: 'create', path: reference.path, data });
  }

  set(reference: CommercialDocumentReference, data: CommercialDocumentData): void {
    this.writes.push({ kind: 'set', path: reference.path, data });
  }

  update(reference: CommercialDocumentReference, data: CommercialDocumentData): void {
    this.writes.push({ kind: 'update', path: reference.path, data });
  }

  commit(): void {
    for (const write of this.writes) {
      if (write.kind === 'create') this.owner.create(write.path, write.data);
      if (write.kind === 'set') this.owner.set(write.path, write.data);
      if (write.kind === 'update') this.owner.update(write.path, write.data);
    }
  }
}

function matchesScope(path: string, scope: QueryScope): boolean {
  const segments = splitPath(path);
  if (scope.kind === 'group') return segments.at(-2) === scope.value;
  const prefix = `${scope.value}/`;
  return path.startsWith(prefix) && segments.length === splitPath(scope.value).length + 1;
}

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
