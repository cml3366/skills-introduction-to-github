import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const logic = readFileSync(new URL('../logic.js', import.meta.url), 'utf8');
const integration = readFileSync(new URL('./app.integration.mjs', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const packageScript = readFileSync(new URL('../scripts/build-local-archive.sh', import.meta.url), 'utf8');
const packageScriptPy = readFileSync(new URL('../scripts/build-local-archive.py', import.meta.url), 'utf8');
const packageScriptPs1 = readFileSync(new URL('../scripts/build-local-archive.ps1', import.meta.url), 'utf8');

const checks = [
  ['index has ops panel', index.includes('id="ops-section"')],
  ['index has import/export tools', index.includes('导出演示数据') && index.includes('导入演示数据')],
  ['index has premium styles', index.includes('大师定制（会员专属）') && index.includes('品牌创意（会员专属）')],
  ['index loads shared logic module', index.includes('<script src="logic.js"></script>')],
  ['app has premium gating', app.includes('PREMIUM_STYLES') && app.includes('会员专属命名风格')],
  ['app has state export/import', app.includes('function exportState()') && app.includes('function importState(event)')],
  ['app uses shared package helpers', app.includes('buildDataBundle(state)') && app.includes('migrateImportedData(parsed)')],
  ['logic module has package helpers', logic.includes('function buildDataBundle(state') && logic.includes('function migrateImportedData(parsed)') && logic.includes('function isSupportedBundleSchema(parsed)')],
  ['app gates test api behind explicit flag', app.includes('window.__FREE_NAMING_ENABLE_TEST_API__ === true') && app.includes('window.__FREE_NAMING_TEST_API__')],
  ['integration test covers package flow', integration.includes('api.packageData()') && integration.includes('await api.importState(') && integration.includes('__FREE_NAMING_ENABLE_TEST_API__: true')],
  ['package scripts exist', packageScript.includes('build-local-archive.py') && packageScriptPy.includes('ZipFile') && packageScriptPs1.includes('build-local-archive.py')],
  ['readme mentions ops/config layer', readme.includes('本地运营指标面板与评分权重配置')],
  ['readme mentions packaged bundle export', readme.includes('一键打包本地演示数据')],
  ['readme mentions packaged bundle re-import', readme.includes('已支持回导标准数据包')],
  ['readme mentions migration debugging', readme.includes('迁移调试')],
  ['readme mentions package script', readme.includes('./scripts/build-local-archive.sh')],
  ['readme mentions Windows package script', readme.includes('./scripts/build-local-archive.ps1')],
  ['readme mentions shared logic testability', readme.includes('可复用逻辑模块')],
  ['readme mentions app integration test', readme.includes('tests/app.integration.mjs')],
  ['readme mentions schema version guard', readme.includes('schema 版本校验')],
  ['index has report and shortlist UI', index.includes('id="report-section"') && index.includes('加入终选')],
  ['index has package data button', index.includes('id="package-data-btn"') && index.includes('当前可打包数据') && index.includes('package-last-exported') && index.includes('package-migration-status')],
  ['app has validation guards', app.includes('手机号格式不正确') && app.includes('配置无效')],
  ['index has scenario entry', index.includes('宝宝起名') && index.includes('成人改名') && index.includes('品牌命名')],
  ['app has scenario support', app.includes('SCENARIO_COPY') && app.includes('applyScenarioPreset')]
];

const failures = checks.filter(([, ok]) => !ok);
if (failures.length) {
  console.error('Smoke test failed:');
  failures.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log(`Smoke test passed (${checks.length} checks).`);
