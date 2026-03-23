import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const logic = require('../logic.js');

const {
  getBaseState,
  normalizeState,
  buildDataBundle,
  isSupportedBundleSchema,
  migrateImportedData,
  extractImportPayload
} = logic;

const base = getBaseState();
assert.equal(base.membership, 'free');
assert.deepEqual(base.favorites, []);

const normalized = normalizeState({
  freeUsed: 2,
  favorites: 'not-an-array',
  shortlist: [{ id: '1', fullName: '李安' }],
  config: { freeQuota: 8 }
});

assert.equal(normalized.freeUsed, 2);
assert.deepEqual(normalized.favorites, []);
assert.equal(normalized.shortlist.length, 1);
assert.equal(normalized.config.freeQuota, 8);
assert.equal(normalized.analytics.packages, 0);

const withHistory = normalizeState({
  ...base,
  membership: 'month',
  history: [
    {
      requestId: 'req-1',
      createdAt: '2026-03-23 13:00:00',
      surname: '李',
      gender: '女',
      scenario: '宝宝起名',
      stylePreference: '清新灵秀',
      candidates: [
        { fullName: '李若溪', score: 95, scoreWuge: 93, scoreBazi: 94, scoreMeaning: 96, recommend: '整体柔和，传播自然。' }
      ]
    }
  ],
  favorites: [{ fullName: '李若溪' }],
  quotaLogs: [{ action: '消耗免费次数' }]
});

const bundle = buildDataBundle(withHistory, { exportedAt: '2026-03-23T13:00:00.000Z' });
assert.equal(bundle.bundleType, 'free-naming-agent-demo-data');
assert.equal(isSupportedBundleSchema(bundle), true);
assert.equal(bundle.summary.latestGeneratedName, '李若溪');
assert.equal(bundle.payload.membership.type, 'month');
assert.equal(bundle.payload.reportSnapshot.topCandidates.length, 1);

const extracted = extractImportPayload(bundle);
assert.equal(extracted.membership, 'month');
assert.equal(extracted.lastPackagedAt, '2026-03-23T13:00:00.000Z');
assert.equal(extracted.history.length, 1);

assert.throws(() => extractImportPayload({ foo: 'bar' }), /invalid-state/);
assert.throws(() => extractImportPayload({ ...bundle, schemaVersion: 999 }), /unsupported-package-version/);

const migratedLegacyBundle = migrateImportedData({
  ...bundle,
  schemaVersion: undefined,
  payload: {
    ...bundle.payload,
    membership: 'month',
    packs: 3
  }
});
assert.equal(migratedLegacyBundle.migration.migrated, true);
assert.equal(migratedLegacyBundle.state.membership, 'month');
assert.equal(migratedLegacyBundle.state.packs, 3);

const migratedRawState = migrateImportedData({ history: [], config: { freeQuota: 9 } });
assert.equal(migratedRawState.migration.source, 'raw-state');
assert.equal(migratedRawState.state.config.freeQuota, 9);

console.log('Logic behavior test passed.');
