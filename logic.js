(function initFreeNamingLogic(globalScope) {
  const PACKAGE_SCHEMA_VERSION = 1;
  const LEGACY_PACKAGE_SCHEMA_VERSION = 0;
  const DEFAULT_CONFIG = { weightWuge: 25, weightBazi: 25, weightMeaning: 20, freeQuota: 6 };
  const DEFAULT_ANALYTICS = { generations: 0, shareCount: 0, reportDownloads: 0, paywallShows: 0, imports: 0, exports: 0, packages: 0 };

  function detectBundleSchema(parsed) {
    return Number.isInteger(parsed?.schemaVersion) ? parsed.schemaVersion : LEGACY_PACKAGE_SCHEMA_VERSION;
  }

  function isSupportedBundleSchema(parsed) {
    const schemaVersion = detectBundleSchema(parsed);
    return schemaVersion === PACKAGE_SCHEMA_VERSION || schemaVersion === LEGACY_PACKAGE_SCHEMA_VERSION;
  }

  function getBaseState() {
    return {
      freeUsed: 0,
      packs: 0,
      membership: 'free',
      membershipExpireAt: null,
      favorites: [],
      shortlist: [],
      history: [],
      orders: [],
      quotaLogs: [],
      user: null,
      config: { ...DEFAULT_CONFIG },
      analytics: { ...DEFAULT_ANALYTICS },
      lastPackagedAt: null,
      lastMigration: null
    };
  }

  function normalizeState(source = {}) {
    const base = getBaseState();
    return {
      ...base,
      ...source,
      favorites: Array.isArray(source.favorites) ? source.favorites : [],
      shortlist: Array.isArray(source.shortlist) ? source.shortlist : [],
      history: Array.isArray(source.history) ? source.history : [],
      orders: Array.isArray(source.orders) ? source.orders : [],
      quotaLogs: Array.isArray(source.quotaLogs) ? source.quotaLogs : [],
      config: { ...DEFAULT_CONFIG, ...(source.config || {}) },
      analytics: { ...DEFAULT_ANALYTICS, ...(source.analytics || {}) },
      lastMigration: source.lastMigration || null
    };
  }

  function getMembershipLabel(membership) {
    return membership === 'year' ? '年会员' : membership === 'month' ? '月会员' : '免费用户';
  }

  function getRemainingFree(state) {
    const freeQuota = Number(state?.config?.freeQuota) || DEFAULT_CONFIG.freeQuota;
    return Math.max(freeQuota - (state?.freeUsed || 0), 0);
  }

  function buildPackageSummary(state) {
    const latest = state.history[0];
    return {
      freeUsed: state.freeUsed,
      remainingFree: getRemainingFree(state),
      packs: state.packs,
      membership: getMembershipLabel(state.membership),
      historyCount: state.history.length,
      favoriteCount: state.favorites.length,
      shortlistCount: state.shortlist.length,
      orderCount: state.orders.length,
      quotaLogCount: state.quotaLogs.length,
      latestGeneratedName: latest?.candidates?.[0]?.fullName || null,
      latestScenario: latest?.scenario || null
    };
  }

  function buildReportSnapshot(state) {
    if (!state.history.length) return null;
    const latest = state.history[0];
    return {
      requestId: latest.requestId,
      createdAt: latest.createdAt,
      surname: latest.surname,
      gender: latest.gender,
      scenario: latest.scenario || '宝宝起名',
      stylePreference: latest.stylePreference,
      topCandidates: latest.candidates.slice(0, 3).map((candidate) => ({
        fullName: candidate.fullName,
        score: candidate.score,
        scoreWuge: candidate.scoreWuge,
        scoreBazi: candidate.scoreBazi,
        scoreMeaning: candidate.scoreMeaning,
        recommend: candidate.recommend
      })),
      shortlist: state.shortlist.map((item) => item.fullName)
    };
  }

  function buildDataBundle(state, options = {}) {
    const exportedAt = options.exportedAt || new Date().toISOString();
    return {
      schemaVersion: PACKAGE_SCHEMA_VERSION,
      exportedAt,
      bundleType: 'free-naming-agent-demo-data',
      summary: buildPackageSummary(state),
      payload: {
        user: state.user,
        membership: {
          type: state.membership,
          label: getMembershipLabel(state.membership),
          expireAt: state.membershipExpireAt,
          packs: state.packs
        },
        config: state.config,
        analytics: state.analytics,
        history: state.history,
        favorites: state.favorites,
        shortlist: state.shortlist,
        orders: state.orders,
        quotaLogs: state.quotaLogs,
        reportSnapshot: buildReportSnapshot(state)
      }
    };
  }

  function migrateImportedData(parsed) {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('invalid-state');
    }
    if (parsed.bundleType === 'free-naming-agent-demo-data' && parsed.payload) {
      if (!isSupportedBundleSchema(parsed)) {
        throw new Error('unsupported-package-version');
      }
      const sourceSchema = detectBundleSchema(parsed);
      const membership = typeof parsed.payload.membership === 'string'
        ? { type: parsed.payload.membership, expireAt: null, packs: parsed.payload.packs || 0 }
        : (parsed.payload.membership || {});
      const state = {
        user: parsed.payload.user,
        membership: membership.type || 'free',
        membershipExpireAt: membership.expireAt || null,
        packs: membership.packs || parsed.payload.packs || 0,
        config: parsed.payload.config,
        analytics: parsed.payload.analytics,
        history: parsed.payload.history,
        favorites: parsed.payload.favorites,
        shortlist: parsed.payload.shortlist,
        orders: parsed.payload.orders,
        quotaLogs: parsed.payload.quotaLogs,
        lastPackagedAt: parsed.exportedAt || null,
        lastMigration: {
          importedAt: new Date().toISOString(),
          source: 'bundle',
          sourceSchema,
          targetSchema: PACKAGE_SCHEMA_VERSION,
          migrated: sourceSchema !== PACKAGE_SCHEMA_VERSION,
          steps: sourceSchema === PACKAGE_SCHEMA_VERSION ? ['数据包 schema 已是当前版本，无需迁移。'] : ['检测到旧版数据包。', '已按当前 schema 结构补齐 membership 与 migration 元数据。']
        }
      };
      return { state, migration: state.lastMigration };
    }
    if ('history' in parsed || 'config' in parsed) {
      const state = {
        ...parsed,
        lastMigration: {
          importedAt: new Date().toISOString(),
          source: 'raw-state',
          sourceSchema: 'raw-state',
          targetSchema: PACKAGE_SCHEMA_VERSION,
          migrated: true,
          steps: ['检测到旧版原始状态导出。', '已转换为当前标准状态结构。']
        }
      };
      return { state, migration: state.lastMigration };
    }
    throw new Error('invalid-state');
  }

  function extractImportPayload(parsed) {
    return migrateImportedData(parsed).state;
  }

  const api = {
    PACKAGE_SCHEMA_VERSION,
    LEGACY_PACKAGE_SCHEMA_VERSION,
    DEFAULT_CONFIG,
    DEFAULT_ANALYTICS,
    detectBundleSchema,
    getBaseState,
    normalizeState,
    isSupportedBundleSchema,
    getMembershipLabel,
    getRemainingFree,
    buildPackageSummary,
    buildReportSnapshot,
    buildDataBundle,
    migrateImportedData,
    extractImportPayload
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  globalScope.FreeNamingLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
