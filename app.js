const STORAGE_KEY = 'freeNamingAgentState';
const {
  DEFAULT_CONFIG,
  DEFAULT_ANALYTICS,
  getBaseState,
  normalizeState,
  buildDataBundle,
  migrateImportedData
} = window.FreeNamingLogic;
const PREMIUM_STYLES = new Set(['大师定制', '品牌创意']);
const CHAR_BANK = {
  文雅儒雅: ['书', '言', '礼', '修', '谦', '雅', '宁', '知', '墨', '和'],
  大气稳重: ['承', '岳', '弘', '远', '峻', '安', '钧', '宸', '厚', '泰'],
  清新灵秀: ['清', '禾', '若', '宁', '溪', '岚', '语', '芊', '灵', '沐'],
  国学经典: ['之', '景', '维', '昭', '允', '成', '文', '思', '礼', '清'],
  简洁现代: ['一', '可', '辰', '亦', '安', '宁', '简', '初', '乐', '言'],
  志向远大: ['鸿', '程', '远', '志', '腾', '航', '卓', '昂', '霄', '达'],
  大师定制: ['玥', '澄', '翊', '璟', '衍', '珩', '宥', '璇', '昀', '晟'],
  品牌创意: ['元', '曜', '象', '启', '序', '寰', '曜', '域', '创', '宙']
};
const SCENARIO_COPY = { 宝宝起名: '更强调成长寓意、亲和传播与家庭讨论决策。', 成人改名: '更强调气质提升、职业表达与长期使用稳定性。', 品牌命名: '更强调传播性、辨识度与商业记忆点。' };
const MEANINGS = { 书: '书香与学识，象征温润与才华。', 言: '言而有信，表达清晰。', 礼: '礼序有度，内外兼修。', 修: '修身立德，进取不息。', 谦: '谦和有礼，气质沉稳。', 雅: '雅正清朗，富有书卷气。', 宁: '安宁从容，心境稳定。', 知: '知行合一，聪慧有见地。', 墨: '文墨气质，文化底蕴浓。', 和: '和顺圆融，亲和力强。', 承: '承志而行，责任感强。', 岳: '山岳稳重，格局大气。', 弘: '胸怀弘阔，发展空间大。', 远: '志向高远，眼界开阔。', 峻: '峻拔坚定，气势挺拔。', 安: '安定温和，适配广泛。', 钧: '分量与格局并重。', 宸: '气度端庄，带有尊贵感。', 厚: '厚德载物，稳健可信。', 泰: '安泰顺遂，寓意吉祥。', 清: '清明纯净，气质通透。', 禾: '生机丰盈，富有自然感。', 若: '柔和含蓄，文雅秀丽。', 溪: '灵动清润，意境悠远。', 岚: '山间雾岚，意象柔美。', 语: '表达温柔，善于沟通。', 芊: '草木茂盛，清秀轻盈。', 灵: '灵秀聪慧，反应敏捷。', 沐: '润泽温和，清新自然。', 之: '典雅古意，出自经典语感。', 景: '光景明朗，前程可期。', 维: '稳固周全，结构完整。', 昭: '昭明清正，品格鲜明。', 允: '允执其中，正直可信。', 成: '有所成就，结果导向。', 文: '文采与修养兼备。', 思: '思辨敏锐，内心丰沛。', 一: '简洁专注，辨识度高。', 可: '亲和自然，易于传播。', 辰: '星辰光彩，富有希望。', 亦: '简约克制，现代感强。', 简: '简净清晰，风格利落。', 初: '初心纯粹，富有新意。', 乐: '愉悦开朗，氛围明快。', 鸿: '鸿鹄之志，寓意高远。', 程: '前程万里，路径清晰。', 志: '志向坚定，目标明确。', 腾: '腾跃向上，发展迅猛。', 航: '远航探索，行动力强。', 卓: '卓然不群，能力突出。', 昂: '昂扬进取，气势鲜明。', 霄: '凌霄而上，境界高。', 达: '通达顺遂，执行力强。' };

const form = document.querySelector('#naming-form');
const authForm = document.querySelector('#auth-form');
const configForm = document.querySelector('#config-form');
const sortSelect = document.querySelector('#sort-select');
const resultsSection = document.querySelector('#results-section');
const resultsGrid = document.querySelector('#results-grid');
const resultCardTemplate = document.querySelector('#result-card-template');
const quotaBanner = document.querySelector('#quota-banner');
const usageText = document.querySelector('#usage-text');
const membershipSummary = document.querySelector('#membership-summary');
const usedCount = document.querySelector('#used-count');
const remainingCount = document.querySelector('#remaining-count');
const packCount = document.querySelector('#pack-count');
const candidateLimit = document.querySelector('#candidate-limit');
const freeLimitLabel = document.querySelector('#free-limit-label');
const modal = document.querySelector('#paywall-modal');
const modalTitle = document.querySelector('#modal-title');
const modalDescription = document.querySelector('#modal-description');
const authModal = document.querySelector('#auth-modal');
const accountSummary = document.querySelector('#account-summary');
const accountStatus = document.querySelector('#account-status');
const accountMobile = document.querySelector('#account-mobile');
const historyList = document.querySelector('#history-list');
const favoritesList = document.querySelector('#favorites-list');
const ordersList = document.querySelector('#orders-list');
const quotaLogList = document.querySelector('#quota-log-list');
const comparePanel = document.querySelector('#compare-panel');
const shortlistPanel = document.querySelector('#shortlist-panel');
const reportSection = document.querySelector('#report-section');
const reportPreview = document.querySelector('#report-preview');
const downloadReportBtn = document.querySelector('#download-report-btn');
const clearShortlistBtn = document.querySelector('#clear-shortlist-btn');
const regenerateBtn = document.querySelector('#regenerate-btn');
const reportBtn = document.querySelector('#report-btn');
const shareBtn = document.querySelector('#share-btn');
const resultSubtitle = document.querySelector('#result-subtitle');
const exportStateBtn = document.querySelector('#export-state-btn');
const importStateBtn = document.querySelector('#import-state-btn');
const importStateFile = document.querySelector('#import-state-file');
const packageDataBtn = document.querySelector('#package-data-btn');
const packageSummaryCount = document.querySelector('#package-summary-count');
const packageSummaryDetail = document.querySelector('#package-summary-detail');
const packageLastExported = document.querySelector('#package-last-exported');
const packageMigrationStatus = document.querySelector('#package-migration-status');
const packageMigrationDetail = document.querySelector('#package-migration-detail');

let state = loadState();
let lastRequest = null;
let compareBucket = [];
let currentResults = [];

bindStaticEvents();
renderAll();

function loadState() {
  const base = getBaseState();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return base;
  try {
    return normalizeState(JSON.parse(saved));
  } catch (error) {
    console.warn('Failed to parse saved state, reset to defaults.', error);
    return base;
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getFreeLimit() { return Number(state.config.freeQuota) || DEFAULT_CONFIG.freeQuota; }
function getRemainingFree() { return Math.max(getFreeLimit() - state.freeUsed, 0); }
function getCandidateCount() { if (state.membership === 'year' || state.membership === 'month') return 12; if (state.packs >= 10) return 8; return 6; }
function getMembershipLabel() { return state.membership === 'year' ? '年会员' : state.membership === 'month' ? '月会员' : '免费用户'; }
function canGenerate() { return state.membership !== 'free' || state.packs > 0 || getRemainingFree() > 0; }
function buildRequestId() { return window.crypto?.randomUUID?.() || `req-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function logQuota(action, detail) { state.quotaLogs.unshift({ action, detail, createdAt: new Date().toLocaleString('zh-CN') }); state.quotaLogs = state.quotaLogs.slice(0, 20); }
function incrementMetric(key) { state.analytics[key] = (state.analytics[key] || 0) + 1; }

function bindStaticEvents() {
  document.querySelectorAll('[data-scroll-target]').forEach((button) => button.addEventListener('click', () => document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth' })));
  form.addEventListener('submit', handleGenerate);
  authForm.addEventListener('submit', handleAuthSubmit);
  configForm.addEventListener('submit', handleConfigSubmit);
  sortSelect.addEventListener('change', () => sortAndRenderCurrentResults(sortSelect.value));
  document.querySelector('#reset-form').addEventListener('click', () => window.setTimeout(updateQuotaBanner, 0));
  document.querySelector('#demo-fill-btn').addEventListener('click', fillDemoData);
  document.querySelectorAll('.scenario-btn').forEach((button) => button.addEventListener('click', () => applyScenarioPreset(button.dataset.scenario)));
  document.querySelector('#auth-trigger').addEventListener('click', openAuthModal);
  document.querySelector('#reset-app-btn').addEventListener('click', resetAppState);
  document.querySelector('#reset-config-btn').addEventListener('click', resetConfig);
  exportStateBtn.addEventListener('click', exportState);
  importStateBtn.addEventListener('click', () => importStateFile.click());
  importStateFile.addEventListener('change', importState);
  packageDataBtn.addEventListener('click', packageData);
  regenerateBtn.addEventListener('click', () => lastRequest && handleGenerate(new Event('submit'), lastRequest));
  reportBtn.addEventListener('click', showLatestReport);
  downloadReportBtn.addEventListener('click', downloadReport);
  clearShortlistBtn.addEventListener('click', clearShortlist);
  shareBtn.addEventListener('click', shareLatestResult);
  document.querySelectorAll('[data-close-modal="true"]').forEach((node) => node.addEventListener('click', closeModal));
  document.querySelectorAll('[data-close-auth="true"]').forEach((node) => node.addEventListener('click', closeAuthModal));
  document.querySelectorAll('.buy-pack').forEach((button) => button.addEventListener('click', () => purchasePack(Number(button.dataset.pack))));
  document.querySelectorAll('.buy-membership').forEach((button) => button.addEventListener('click', () => purchaseMembership(button.dataset.membership)));
}

function consumeQuota() {
  if (state.membership !== 'free') { logQuota('会员权益生成', '本次生成未扣减免费次数'); return 'membership'; }
  if (getRemainingFree() > 0) { state.freeUsed += 1; logQuota('消耗免费次数', `已使用 ${state.freeUsed}/${getFreeLimit()} 次`); return 'free'; }
  if (state.packs > 0) { state.packs -= 1; logQuota('消耗次数包', `剩余次数包 ${state.packs} 次`); return 'pack'; }
  return 'blocked';
}

function handleGenerate(event, requestOverride = null) {
  event.preventDefault();
  const formData = requestOverride || Object.fromEntries(new FormData(form).entries());
  if (PREMIUM_STYLES.has(formData.stylePreference) && state.membership === 'free') {
    return openPaywall('该风格为会员专属', `“${formData.stylePreference}”属于会员专属命名风格，请先开通会员后再使用。`);
  }
  if (!canGenerate()) return openPaywall('您的免费起名次数已用完', `您的 ${getFreeLimit()} 次免费起名机会已全部用完。继续生成更多名字，请升级付费服务。`);
  lastRequest = formData;
  if (!formData.surname || !formData.gender || !formData.birthDate || !formData.birthTime) {
    quotaBanner.textContent = '请先补全姓氏、性别、出生日期与出生时间。';
    quotaBanner.className = 'quota-banner danger';
    return;
  }
  const quotaType = consumeQuota();
  if (quotaType === 'blocked') return openPaywall('当前额度不足', '当前免费次数与次数包均已用尽，请购买次数包或开通会员。');

  const candidates = generateCandidates(formData, getCandidateCount());
  const requestRecord = { ...formData, requestId: buildRequestId(), quotaType, createdAt: new Date().toLocaleString('zh-CN'), candidates };
  state.history.unshift(requestRecord);
  state.history = state.history.slice(0, 12);
  incrementMetric('generations');
  saveState();
  renderAll();
  renderResults(requestRecord);
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth' });
  postGeneratePrompt();
}

function generateCandidates(request, count) {
  const bank = [...(CHAR_BANK[request.stylePreference] || CHAR_BANK['文雅儒雅'])];
  const avoid = new Set((request.avoidWords || '').split('').filter(Boolean));
  const usable = bank.filter((char) => !avoid.has(char));
  const fixed = (request.fixedWord || '').trim();
  const mode = request.nameMode || '双名';
  const { weightWuge, weightBazi, weightMeaning } = state.config;
  return Array.from({ length: count }, (_, index) => {
    const first = fixed || usable[index % usable.length] || bank[index % bank.length];
    const second = mode === '单名' ? '' : usable[(index + 2) % usable.length] || bank[(index + 2) % bank.length];
    const name = `${request.surname}${first}${second}`;
    const scoreWuge = 78 + ((index * 3 + request.surname.charCodeAt(0)) % 18);
    const scoreBazi = 76 + ((index * 5 + request.birthTime.length) % 20);
    const scoreMeaning = 80 + ((index * 7 + request.stylePreference.length) % 16);
    const scoreSound = 82 + (index % 10);
    const scorePractical = 79 + ((index * 2) % 12);
    const total = Math.round(((scoreWuge * weightWuge) + (scoreBazi * weightBazi) + (scoreMeaning * weightMeaning) + (scoreSound * 15) + (scorePractical * 15)) / (weightWuge + weightBazi + weightMeaning + 30) * 10) / 10;
    const wuge = buildWuge(index, request.surname.length + first.length + second.length);
    const bazi = buildBazi(index, request.stylePreference);
    const scenarioTag = request.scenario || '宝宝起名';
    return { id: `${name}-${index}`, fullName: name, pinyin: buildPinyin(first, second), score: total, scoreWuge, scoreBazi, scoreMeaning, tags: [scenarioTag, request.stylePreference, request.gender === '男' ? '稳健格局' : '灵秀气质', mode], wuge, bazi, meaning: [first, second].filter(Boolean).map((char) => `${char}：${MEANINGS[char] || '寓意积极，适合作为命名字。'}`), image: `${first}${second}相映，整体意象偏${request.stylePreference}。`, recommend: `与姓氏“${request.surname}”搭配自然，兼顾${scenarioTag}场景与${request.stylePreference}风格传播性。`, risk: buildRisk(index), rank: index + 1 };
  });
}
function buildPinyin(first, second) { const map = { 书: 'Shū', 言: 'Yán', 礼: 'Lǐ', 修: 'Xiū', 谦: 'Qiān', 雅: 'Yǎ', 宁: 'Níng', 知: 'Zhī', 墨: 'Mò', 和: 'Hé', 承: 'Chéng', 岳: 'Yuè', 弘: 'Hóng', 远: 'Yuǎn', 峻: 'Jùn', 安: 'Ān', 钧: 'Jūn', 宸: 'Chén', 厚: 'Hòu', 泰: 'Tài', 清: 'Qīng', 禾: 'Hé', 若: 'Ruò', 溪: 'Xī', 岚: 'Lán', 语: 'Yǔ', 芊: 'Qiān', 灵: 'Líng', 沐: 'Mù', 之: 'Zhī', 景: 'Jǐng', 维: 'Wéi', 昭: 'Zhāo', 允: 'Yǔn', 成: 'Chéng', 文: 'Wén', 思: 'Sī', 一: 'Yī', 可: 'Kě', 辰: 'Chén', 亦: 'Yì', 简: 'Jiǎn', 初: 'Chū', 乐: 'Yuè', 鸿: 'Hóng', 程: 'Chéng', 志: 'Zhì', 腾: 'Téng', 航: 'Háng', 卓: 'Zhuó', 昂: 'Áng', 霄: 'Xiāo', 达: 'Dá' }; return [map[first], map[second]].filter(Boolean).join(' '); }
function buildWuge(index, base) { const values = { tiange: 8 + ((index + base) % 12), renge: 15 + ((index * 2 + base) % 18), dige: 12 + ((index * 3 + base) % 15), waige: 9 + ((index * 4 + base) % 10), zongge: 26 + ((index * 5 + base) % 18) }; values.fortune = values.zongge >= 31 ? '吉' : values.zongge >= 24 ? '中吉' : '平'; values.sancai = values.renge % 2 === 0 ? '三才配置协调，成长节奏稳。' : '三才偏灵动，适合注重个性表达。'; return values; }
function buildBazi(index, style) { const modes = ['木火偏旺，宜补水金平衡。', '土金较稳，适合加入木火意象。', '水木通达，适合选择清朗开阔之字。']; return { wuxing: modes[index % modes.length], usefulGod: `${style}风格下喜用神贴合度 ${88 + (index % 8)}%`, balance: index % 2 === 0 ? '五行配置较平衡，适合作为优先推荐。' : '整体平衡良好，建议结合家庭偏好进一步筛选。' }; }
function buildRisk(index) { return { homophone: index % 3 === 0 ? '谐音风险低，日常称呼自然。' : '谐音风险可控。', rare: index % 4 === 0 ? '生僻字风险低，便于录入与传播。' : '字形较常见，识别难度低。', polyphone: '无明显多音字风险。', writing: index % 5 === 0 ? '书写笔画适中。' : '日常书写顺畅。' }; }

function renderResults(record) { currentResults = [...record.candidates]; resultSubtitle.textContent = `当前场景：${record.scenario || '宝宝起名'}。${SCENARIO_COPY[record.scenario || '宝宝起名']}`; sortAndRenderCurrentResults(sortSelect.value || 'score'); usageText.textContent = `您当前已使用 ${state.freeUsed}/${getFreeLimit()} 次，您还剩 ${getRemainingFree()} 次免费机会。`; }
function sortAndRenderCurrentResults(mode) {
  const sorted = [...currentResults].sort((a, b) => mode === 'wuge' ? b.scoreWuge - a.scoreWuge : mode === 'bazi' ? b.scoreBazi - a.scoreBazi : mode === 'name' ? a.fullName.localeCompare(b.fullName, 'zh-CN') : b.score - a.score);
  resultsGrid.innerHTML = '';
  sorted.forEach((candidate) => {
    const node = resultCardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.candidate-name').textContent = candidate.fullName;
    node.querySelector('.candidate-pinyin').textContent = candidate.pinyin;
    node.querySelector('.score-badge').textContent = `${candidate.score} 分`;
    node.querySelector('.wuge-summary').textContent = `${candidate.wuge.zongge} ${candidate.wuge.fortune}`;
    node.querySelector('.bazi-summary').textContent = candidate.bazi.usefulGod;
    node.querySelector('.recommend-summary').textContent = candidate.recommend;
    const tagRow = node.querySelector('.tag-row'); candidate.tags.forEach((tag) => { const span = document.createElement('span'); span.className = 'tag'; span.textContent = tag; tagRow.appendChild(span); });
    const details = node.querySelector('.details'); details.innerHTML = `<section class="detail-block"><h4>五格分析</h4><p>天格 ${candidate.wuge.tiange} / 人格 ${candidate.wuge.renge} / 地格 ${candidate.wuge.dige} / 外格 ${candidate.wuge.waige} / 总格 ${candidate.wuge.zongge}</p><p>五格得分：${candidate.scoreWuge}；数理吉凶：${candidate.wuge.fortune}；${candidate.wuge.sancai}</p></section><section class="detail-block"><h4>八字适配说明</h4><p>${candidate.bazi.wuxing}</p><p>${candidate.bazi.usefulGod}</p><p>八字得分：${candidate.scoreBazi}</p></section><section class="detail-block"><h4>字义与文化解释</h4><p>${candidate.meaning.join('<br/>')}</p><p>字义得分：${candidate.scoreMeaning}；整体意象：${candidate.image}</p></section><section class="detail-block"><h4>风险提示</h4><p>${candidate.risk.homophone}</p><p>${candidate.risk.rare}</p><p>${candidate.risk.polyphone}</p><p>${candidate.risk.writing}</p></section><section class="detail-block"><h4>推荐理由</h4><p>${candidate.recommend}</p><p>适用风格：${candidate.tags.join(' / ')}；排名顺位：第 ${candidate.rank} 位。</p></section>`;
    node.querySelector('.action-expand').addEventListener('click', (e) => { const expanded = !details.classList.contains('hidden'); details.classList.toggle('hidden'); e.currentTarget.textContent = expanded ? '查看完整分析' : '收起完整分析'; });
    node.querySelector('.action-favorite').addEventListener('click', (e) => { toggleFavorite(candidate); e.currentTarget.textContent = isFavorite(candidate.fullName) ? '已收藏' : '收藏此名'; });
    node.querySelector('.action-favorite').textContent = isFavorite(candidate.fullName) ? '已收藏' : '收藏此名';
    node.querySelector('.action-compare').addEventListener('click', () => addToCompare(candidate));
    node.querySelector('.action-shortlist').addEventListener('click', () => addToShortlist(candidate));
    resultsGrid.appendChild(node);
  });
}

function renderAll() {
  saveState();
  membershipSummary.textContent = getMembershipLabel();
  usedCount.textContent = `${state.freeUsed} / ${getFreeLimit()}`;
  remainingCount.textContent = `${getRemainingFree()} 次`;
  packCount.textContent = `${state.packs} 次`;
  candidateLimit.textContent = `每次 ${getCandidateCount()} 个`;
  freeLimitLabel.textContent = getFreeLimit();
  renderAccount(); updateQuotaBanner(); renderHistory(); renderFavorites(); renderOrders(); renderQuotaLogs(); renderCompare(); renderShortlist(); renderMetrics(); renderPackagingSummary(); renderMigrationDebug(); hydrateConfigForm();
}
function renderAccount() { if (!state.user) { accountSummary.textContent = '未登录，生成后将提示注册以保存记录。'; accountStatus.textContent = '访客'; accountMobile.textContent = '未绑定'; return; } accountSummary.textContent = `欢迎回来，${state.user.nickname}。历史记录与收藏已保存在本地。`; accountStatus.textContent = '已登录'; accountMobile.textContent = state.user.mobile; }
function updateQuotaBanner() {
  const remaining = getRemainingFree();
  if (state.membership !== 'free') { quotaBanner.textContent = `当前为${getMembershipLabel()}，可优先使用会员权益生成更多候选名。`; quotaBanner.className = 'quota-banner info'; return; }
  if (remaining <= 0 && state.packs <= 0) { quotaBanner.textContent = '免费次数已用完，请升级服务或购买次数包。'; quotaBanner.className = 'quota-banner danger'; return; }
  if (remaining === 1) { quotaBanner.textContent = '您还剩最后 1 次免费机会。继续使用后，可购买次数包或开通会员。'; quotaBanner.className = 'quota-banner danger'; return; }
  if (remaining === 2) { quotaBanner.textContent = '您还剩 2 次免费起名机会，建议提前开通会员，解锁更多候选名与深度分析。'; quotaBanner.className = 'quota-banner warning'; return; }
  quotaBanner.textContent = `免费用户总计可体验 ${getFreeLimit()} 次完整起名。`; quotaBanner.className = 'quota-banner info';
}
function renderMetrics() {
  document.querySelector('#metric-generations').textContent = state.analytics.generations || 0;
  document.querySelector('#metric-favorites').textContent = state.favorites.length;
  document.querySelector('#metric-orders').textContent = state.orders.length;
  document.querySelector('#metric-shares').textContent = state.analytics.shareCount || 0;
  document.querySelector('#metric-exhausted').textContent = `${state.freeUsed >= getFreeLimit() ? 100 : Math.round((state.freeUsed / getFreeLimit()) * 100)}%`;
  const conversion = state.analytics.generations ? Math.round((state.orders.length / state.analytics.generations) * 100) : 0;
  document.querySelector('#metric-conversion').textContent = `${conversion}%`;
}
function renderPackagingSummary() {
  const totalRecords = state.history.length + state.favorites.length + state.orders.length + state.quotaLogs.length;
  packageSummaryCount.textContent = `${totalRecords} 条记录`;
  if (!totalRecords) {
    packageSummaryDetail.textContent = '当前还没有可交付的演示数据。先生成结果或进行一次收藏/购买模拟后，即可打包。';
    packageLastExported.textContent = `最近打包：${state.lastPackagedAt ? state.lastPackagedAt : '尚未打包'}`;
    return;
  }
  packageSummaryDetail.textContent = `包含 ${state.history.length} 条历史、${state.favorites.length} 条收藏、${state.orders.length} 条订单、${state.quotaLogs.length} 条额度流水，以及账号、配置、运营指标和报告快照。`;
  packageLastExported.textContent = `最近打包：${state.lastPackagedAt ? state.lastPackagedAt : '尚未打包'}`;
}
function renderMigrationDebug() {
  if (!state.lastMigration) {
    packageMigrationStatus.textContent = '尚未导入';
    packageMigrationDetail.textContent = '导入旧版数据包或原始状态文件后，这里会显示迁移结果与 schema 信息。';
    return;
  }
  const migration = state.lastMigration;
  packageMigrationStatus.textContent = migration.migrated ? `已迁移（${migration.sourceSchema} → ${migration.targetSchema}）` : `无需迁移（schema ${migration.targetSchema}）`;
  packageMigrationDetail.textContent = `${migration.steps.join(' ')} 导入来源：${migration.source}。`;
}
function hydrateConfigForm() { configForm.weightWuge.value = state.config.weightWuge; configForm.weightBazi.value = state.config.weightBazi; configForm.weightMeaning.value = state.config.weightMeaning; configForm.freeQuota.value = state.config.freeQuota; }
function handleConfigSubmit(event) {
  event.preventDefault();
  const nextConfig = { weightWuge: Number(configForm.weightWuge.value), weightBazi: Number(configForm.weightBazi.value), weightMeaning: Number(configForm.weightMeaning.value), freeQuota: Number(configForm.freeQuota.value) };
  const totalWeight = nextConfig.weightWuge + nextConfig.weightBazi + nextConfig.weightMeaning;
  if (!Number.isFinite(totalWeight) || totalWeight < 30 || totalWeight > 90) {
    return openPaywall('配置无效', '五格、八字、字义三项权重总和需在 30 到 90 之间，以保留其他维度评分空间。');
  }
  if (nextConfig.freeQuota < 1 || nextConfig.freeQuota > 20) {
    return openPaywall('配置无效', '免费次数上限需设置在 1 到 20 之间。');
  }
  state.config = nextConfig;
  logQuota('更新规则配置', `五格 ${state.config.weightWuge}% / 八字 ${state.config.weightBazi}% / 字义 ${state.config.weightMeaning}% / 免费 ${state.config.freeQuota} 次`);
  if (state.freeUsed > getFreeLimit()) state.freeUsed = getFreeLimit();
  saveState(); renderAll();
}
function resetConfig() { state.config = { ...DEFAULT_CONFIG }; saveState(); renderAll(); }
function toggleFavorite(candidate) { const idx = state.favorites.findIndex((item) => item.fullName === candidate.fullName); idx >= 0 ? state.favorites.splice(idx, 1) : state.favorites.unshift({ fullName: candidate.fullName, score: candidate.score, tags: candidate.tags, savedAt: new Date().toLocaleString('zh-CN') }); renderAll(); }
function isFavorite(fullName) { return state.favorites.some((item) => item.fullName === fullName); }
function addToCompare(candidate) { if (!compareBucket.some((item) => item.id === candidate.id)) compareBucket.push(candidate); compareBucket = compareBucket.slice(-3); renderCompare(); }
function renderCompare() {
  if (!compareBucket.length) { comparePanel.classList.add('hidden'); comparePanel.innerHTML = ''; return; }
  comparePanel.classList.remove('hidden');
  const headers = ['指标', ...compareBucket.map((item) => item.fullName)];
  const rows = [ ['综合分', ...compareBucket.map((item) => `${item.score}`)], ['五格', ...compareBucket.map((item) => `${item.scoreWuge}`)], ['八字', ...compareBucket.map((item) => `${item.scoreBazi}`)], ['字义', ...compareBucket.map((item) => `${item.scoreMeaning}`)] ];
  comparePanel.innerHTML = `<h3>名字对比</h3><p>建议优先保留综合分更高、风险提示更低且更符合家庭偏好的候选名。</p><div class="compare-grid">${[headers, ...rows].map((row) => `<div class="compare-row">${row.map((cell) => `<span>${cell}</span>`).join('')}</div>`).join('')}</div>`;
}

function addToShortlist(candidate) {
  if (!state.shortlist.some((item) => item.id === candidate.id)) {
    state.shortlist.push({ id: candidate.id, fullName: candidate.fullName, score: candidate.score, scoreWuge: candidate.scoreWuge, scoreBazi: candidate.scoreBazi, tags: candidate.tags });
    state.shortlist = state.shortlist.slice(-5);
    saveState();
    renderShortlist();
  }
}

function renderShortlist() {
  if (!state.shortlist.length) {
    shortlistPanel.classList.add('hidden');
    shortlistPanel.innerHTML = '';
    return;
  }
  shortlistPanel.classList.remove('hidden');
  shortlistPanel.innerHTML = `<h3>终选短名单</h3><p>以下是你当前保留的终选名字，建议结合家人偏好与风险提示做最后决策。</p><div class="compare-grid">${state.shortlist.map((item) => `<div class="shortlist-item"><div><strong>${item.fullName}</strong><div class="list-item-meta">综合分 ${item.score} / 五格 ${item.scoreWuge} / 八字 ${item.scoreBazi}</div></div><button class="ghost-btn small shortlist-remove" data-id="${item.id}">移除</button></div>`).join('')}</div>`;
  shortlistPanel.querySelectorAll('.shortlist-remove').forEach((button) => button.addEventListener('click', () => removeShortlist(button.dataset.id)));
}

function removeShortlist(id) {
  state.shortlist = state.shortlist.filter((item) => item.id !== id);
  saveState();
  renderShortlist();
}

function clearShortlist() {
  state.shortlist = [];
  saveState();
  renderShortlist();
}

function showLatestReport() {
  if (!state.history.length) return openPaywall('暂无报告可查看', '请先生成一组名字，再查看深度报告。');
  const latest = state.history[0];
  const topThree = latest.candidates.slice(0, 3);
  reportPreview.innerHTML = `
    <article class="report-card">
      <h3>基础信息</h3>
      <p>姓氏：${latest.surname}</p>
      <p>性别：${latest.gender}</p>
      <p>出生信息：${latest.birthDate} ${latest.birthTime}</p>
      <p>命名场景：${latest.scenario || '宝宝起名'}</p><p>风格偏好：${latest.stylePreference}</p>
      <p>当前权重：五格 ${state.config.weightWuge}% / 八字 ${state.config.weightBazi}% / 字义 ${state.config.weightMeaning}%</p>
    </article>
    <article class="report-card">
      <h3>Top 3 推荐</h3>
      ${topThree.map((item, index) => `<p>${index + 1}. ${item.fullName}（${item.score} 分）- ${item.recommend}</p>`).join('')}
      <h4>终选短名单</h4>
      <p>${state.shortlist.length ? state.shortlist.map((item) => item.fullName).join(' / ') : '尚未加入终选短名单。'}</p>
    </article>
    <article class="report-card">
      <h3>风险与建议</h3>
      <p>建议优先关注谐音风险、生僻字风险和日常书写成本。</p>
      <p>若已接近免费额度上限，可引导购买次数包或开通会员继续筛选。</p>
      <p>如需更精细的字辈、方言避讳或品牌名扩展，建议进入专家服务阶段。</p>
    </article>
    <article class="report-card">
      <h3>转化建议</h3>
      <p>剩余免费次数：${getRemainingFree()} 次</p>
      <p>当前会员状态：${getMembershipLabel()}</p>
      <p>已保存终选数量：${state.shortlist.length} 个</p>
    </article>
  `;
  reportSection.classList.remove('hidden');
  reportSection.scrollIntoView({ behavior: 'smooth' });
}
function renderHistory() {
  if (!state.history.length) { historyList.className = 'list-panel empty-state'; historyList.textContent = '暂无历史记录，先生成一组名字吧。'; return; }
  historyList.className = 'list-panel';
  historyList.innerHTML = state.history.map((item) => `<article class="list-item"><strong>${item.surname} · ${item.stylePreference} · ${item.nameMode}</strong><div class="list-item-meta">${item.birthDate} ${item.birthTime} · ${item.createdAt}</div><div class="list-item-meta">候选：${item.candidates[0]?.fullName || '-'} 等 ${item.candidates.length} 个</div><div class="list-item-actions"><button class="ghost-btn small history-view" data-id="${item.requestId}">查看结果</button><button class="ghost-btn small history-rerun" data-id="${item.requestId}">再次生成</button><button class="ghost-btn small history-delete" data-id="${item.requestId}">删除记录</button></div></article>`).join('');
  historyList.querySelectorAll('.history-view').forEach((button) => button.addEventListener('click', () => viewHistoryResult(button.dataset.id)));
  historyList.querySelectorAll('.history-rerun').forEach((button) => button.addEventListener('click', () => rerunHistory(button.dataset.id)));
  historyList.querySelectorAll('.history-delete').forEach((button) => button.addEventListener('click', () => deleteHistory(button.dataset.id)));
}
function renderFavorites() { if (!state.favorites.length) { favoritesList.className = 'list-panel empty-state'; favoritesList.textContent = '暂无收藏名字。'; return; } favoritesList.className = 'list-panel'; favoritesList.innerHTML = state.favorites.map((item) => `<article class="list-item"><strong>${item.fullName}</strong><div class="list-item-meta">${item.tags.join(' / ')}</div><div class="list-item-meta">综合评分：${item.score} · 收藏于 ${item.savedAt}</div></article>`).join(''); }
function renderOrders() { if (!state.orders.length) { ordersList.className = 'list-panel empty-state'; ordersList.textContent = '暂无订单记录。'; return; } ordersList.className = 'list-panel'; ordersList.innerHTML = state.orders.map((item) => `<article class="list-item"><strong>${item.productName}</strong><div class="list-item-meta">支付金额：${item.amount}</div><div class="list-item-meta">状态：已开通 · ${item.createdAt}</div></article>`).join(''); }
function renderQuotaLogs() { if (!state.quotaLogs.length) { quotaLogList.className = 'list-panel empty-state'; quotaLogList.textContent = '暂无额度流水。'; return; } quotaLogList.className = 'list-panel'; quotaLogList.innerHTML = state.quotaLogs.map((item) => `<article class="list-item"><strong>${item.action}</strong><div class="list-item-meta">${item.detail}</div><div class="list-item-meta">${item.createdAt}</div></article>`).join(''); }
function purchasePack(pack) { state.packs += pack; state.orders.unshift({ productName: `${pack} 次包`, amount: pack === 3 ? '￥19' : '￥49', createdAt: new Date().toLocaleString('zh-CN') }); logQuota('购买次数包', `增加 ${pack} 次，当前次数包 ${state.packs} 次`); saveState(); renderAll(); closeModal(); }
function purchaseMembership(type) { state.membership = type; const months = type === 'year' ? 12 : 1; const expireDate = new Date(); expireDate.setMonth(expireDate.getMonth() + months); state.membershipExpireAt = expireDate.toISOString(); state.orders.unshift({ productName: type === 'year' ? '年会员' : '月会员', amount: type === 'year' ? '￥299' : '￥99', createdAt: new Date().toLocaleString('zh-CN') }); logQuota('开通会员', `${type === 'year' ? '年会员' : '月会员'}，到期时间 ${expireDate.toLocaleDateString('zh-CN')}`); saveState(); renderAll(); closeModal(); }
function handleAuthSubmit(event) { event.preventDefault(); const data = Object.fromEntries(new FormData(authForm).entries()); const nickname = data.nickname.trim(); const mobile = data.mobile.trim(); if (nickname.length < 2) return openPaywall('昵称过短', '请填写至少 2 个字符的昵称，便于识别当前体验账号。'); if (!/^1\d{10}$/.test(mobile)) return openPaywall('手机号格式不正确', '请输入有效的 11 位手机号，例如 13800138000。'); state.user = { nickname, mobile }; saveState(); renderAll(); closeAuthModal(); }
function openPaywall(title, description) { incrementMetric('paywallShows'); modalTitle.textContent = title; modalDescription.textContent = description; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); saveState(); }
function closeModal() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }
function openAuthModal() { authModal.classList.remove('hidden'); authModal.setAttribute('aria-hidden', 'false'); }
function closeAuthModal() { authModal.classList.add('hidden'); authModal.setAttribute('aria-hidden', 'true'); }
function postGeneratePrompt() { const remaining = getRemainingFree(); if (!state.user) return openAuthModal(); if (state.membership !== 'free') return; if (remaining === 2) openPaywall('您还剩 2 次免费机会', '建议提前开通会员，解锁更多候选名与深度分析。'); else if (remaining === 1) openPaywall('您还剩最后 1 次免费机会', '继续使用后，如需更多方案，可购买次数包或开通会员。'); else if (remaining === 0 && state.packs <= 0) openPaywall('您的免费起名次数已用完', '免费次数已全部用完，继续生成请购买次数包或开通会员。'); }
function downloadReport() { if (!state.history.length) return openPaywall('暂无报告可生成', '请先完成一次起名生成，再导出深度报告。'); const latest = state.history[0]; const content = ['免费起名 Agent 深度报告', `生成时间：${latest.createdAt}`, `基础信息：${latest.surname} / ${latest.gender} / ${latest.birthDate} ${latest.birthTime}`, `风格偏好：${latest.stylePreference}`, `当前权重：五格 ${state.config.weightWuge}% / 八字 ${state.config.weightBazi}% / 字义 ${state.config.weightMeaning}%`, `终选短名单：${state.shortlist.length ? state.shortlist.map((item) => item.fullName).join(' / ') : '无'}`, '推荐名单：', ...latest.candidates.slice(0, 5).map((candidate, index) => `${index + 1}. ${candidate.fullName} - ${candidate.score} 分 - ${candidate.recommend}`)].join('\n'); const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '免费起名Agent-深度报告.txt'; a.click(); URL.revokeObjectURL(url); incrementMetric('reportDownloads'); saveState(); renderMetrics(); }
async function shareLatestResult() { if (!state.history.length) return openPaywall('暂无可分享结果', '请先生成一组起名结果后再分享。'); const latest = state.history[0]; const message = `我在免费起名 Agent 里生成了 ${latest.candidates[0].fullName} 等 ${latest.candidates.length} 个候选名，风格偏好：${latest.stylePreference}。`; if (navigator.share) await navigator.share({ title: '免费起名 Agent 结果分享', text: message }); else { await navigator.clipboard.writeText(message); openPaywall('结果已复制', '分享文案已复制到剪贴板，你可以直接发送给家人或朋友。'); } incrementMetric('shareCount'); saveState(); renderMetrics(); }
function viewHistoryResult(requestId) { const record = state.history.find((item) => item.requestId === requestId); if (!record) return; lastRequest = record; renderResults(record); resultsSection.classList.remove('hidden'); resultsSection.scrollIntoView({ behavior: 'smooth' }); }
function rerunHistory(requestId) { const record = state.history.find((item) => item.requestId === requestId); if (!record) return; const cloned = { ...record }; delete cloned.requestId; delete cloned.createdAt; delete cloned.candidates; delete cloned.quotaType; handleGenerate(new Event('submit'), cloned); }
function deleteHistory(requestId) { state.history = state.history.filter((item) => item.requestId !== requestId); saveState(); renderAll(); }
function applyScenarioPreset(scenario) {
  form.scenario.value = scenario;
  if (scenario === '成人改名') {
    form.stylePreference.value = '大气稳重';
    form.fixedWord.value = '安';
  } else if (scenario === '品牌命名') {
    form.stylePreference.value = state.membership === 'free' ? '简洁现代' : '品牌创意';
    form.fixedWord.value = '';
    form.nameMode.value = '双名';
  } else {
    form.stylePreference.value = '清新灵秀';
    form.fixedWord.value = '';
  }
}

function fillDemoData() { form.scenario.value = '宝宝起名'; form.surname.value = '苏'; form.gender.value = '女'; form.birthDate.value = '2024-08-08'; form.birthTime.value = '09:16'; form.birthPlace.value = '杭州'; form.nameMode.value = '双名'; form.stylePreference.value = '清新灵秀'; form.fixedWord.value = ''; form.avoidWords.value = '伟'; }
function resetAppState() { localStorage.removeItem(STORAGE_KEY); state = loadState(); compareBucket = []; lastRequest = null; currentResults = []; resultsGrid.innerHTML = ''; resultsSection.classList.add('hidden'); renderAll(); }

function exportState() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'free-naming-agent-state.json';
  a.click();
  URL.revokeObjectURL(url);
  incrementMetric('exports');
  saveState();
  renderMetrics();
}

function packageData() {
  if (!state.history.length && !state.favorites.length && !state.orders.length && !state.quotaLogs.length) {
    return openPaywall('暂无可打包数据', '请先生成一组结果，或完成收藏/购买模拟后，再导出演示数据包。');
  }
  const bundle = buildDataBundle(state);
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `free-naming-agent-bundle-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  state.lastPackagedAt = new Date().toLocaleString('zh-CN');
  incrementMetric('packages');
  saveState();
  renderPackagingSummary();
  openPaywall('数据打包完成', '当前演示数据已打包为 JSON 文件，可直接交付评审、存档或供后续脚本继续处理。');
}

async function importState(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const { state: nextState, migration } = migrateImportedData(parsed);
    state = normalizeState(nextState);
    incrementMetric('imports');
    saveState();
    renderAll();
    openPaywall('导入成功', migration.migrated ? `数据已完成迁移导入：${migration.steps.join(' ')}` : (parsed.bundleType === 'free-naming-agent-demo-data' ? '数据包已导入，本地页面状态已按打包内容恢复。' : '演示数据已导入，本地页面状态已刷新。'));
  } catch (error) {
    openPaywall('导入失败', error.message === 'unsupported-package-version' ? '该数据包版本暂不受支持，请使用当前版本重新导出后再导入。' : '文件不是有效的 JSON 演示数据，请检查后重试。');
  } finally {
    event.target.value = '';
  }
}

if (window.__FREE_NAMING_ENABLE_TEST_API__ === true) {
  window.__FREE_NAMING_TEST_API__ = {
    getState: () => state,
    setState(nextState) {
      state = normalizeState(nextState);
      renderAll();
    },
    packageData,
    importState,
    renderPackagingSummary,
    renderMigrationDebug,
    openPaywall,
    closeModal
  };
}
