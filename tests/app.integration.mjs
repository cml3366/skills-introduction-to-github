import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function createClassList() {
  const classes = new Set(['hidden']);
  return {
    add: (...items) => items.forEach((item) => classes.add(item)),
    remove: (...items) => items.forEach((item) => classes.delete(item)),
    toggle: (item) => {
      if (classes.has(item)) {
        classes.delete(item);
        return false;
      }
      classes.add(item);
      return true;
    },
    contains: (item) => classes.has(item)
  };
}

function createElement(name = 'div') {
  return {
    nodeName: name.toUpperCase(),
    className: '',
    classList: createClassList(),
    dataset: {},
    style: {},
    value: '',
    innerHTML: '',
    textContent: '',
    children: [],
    files: [],
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelector() {
      return createElement('div');
    },
    querySelectorAll() {
      return [];
    },
    scrollIntoView() {},
    click() {}
  };
}

function createEnvironment() {
  const elements = new Map();
  const selectors = [
    '#naming-form', '#auth-form', '#config-form', '#sort-select', '#results-section', '#results-grid', '#result-card-template',
    '#quota-banner', '#usage-text', '#membership-summary', '#used-count', '#remaining-count', '#pack-count', '#candidate-limit',
    '#free-limit-label', '#paywall-modal', '#modal-title', '#modal-description', '#auth-modal', '#account-summary', '#account-status',
    '#account-mobile', '#history-list', '#favorites-list', '#orders-list', '#quota-log-list', '#compare-panel', '#shortlist-panel',
    '#report-section', '#report-preview', '#download-report-btn', '#clear-shortlist-btn', '#regenerate-btn', '#report-btn', '#share-btn',
    '#result-subtitle', '#export-state-btn', '#import-state-btn', '#import-state-file', '#package-data-btn', '#package-summary-count',
    '#package-summary-detail', '#package-last-exported', '#package-migration-status', '#package-migration-detail', '#reset-form', '#demo-fill-btn', '#auth-trigger', '#reset-app-btn',
    '#reset-config-btn', '#metric-generations', '#metric-favorites', '#metric-orders', '#metric-shares', '#metric-exhausted',
    '#metric-conversion'
  ];

  selectors.forEach((selector) => elements.set(selector, createElement(selector)));
  const form = elements.get('#naming-form');
  form.scenario = { value: '宝宝起名' };
  form.stylePreference = { value: '清新灵秀' };
  form.fixedWord = { value: '' };
  form.nameMode = { value: '双名' };
  form.surname = { value: '' };
  form.gender = { value: '' };
  form.birthDate = { value: '' };
  form.birthTime = { value: '' };
  form.birthPlace = { value: '' };
  form.avoidWords = { value: '' };

  const configForm = elements.get('#config-form');
  configForm.weightWuge = { value: 25 };
  configForm.weightBazi = { value: 25 };
  configForm.weightMeaning = { value: 20 };
  configForm.freeQuota = { value: 6 };

  const template = elements.get('#result-card-template');
  template.content = {
    firstElementChild: {
      cloneNode() {
        const node = createElement('article');
        const detail = createElement('div');
        const favorite = createElement('button');
        favorite.textContent = '收藏此名';
        node.querySelector = (selector) => {
          if (selector === '.details') return detail;
          if (selector === '.candidate-name') return createElement('h3');
          if (selector === '.candidate-pinyin') return createElement('p');
          if (selector === '.score-badge') return createElement('span');
          if (selector === '.wuge-summary') return createElement('strong');
          if (selector === '.bazi-summary') return createElement('strong');
          if (selector === '.recommend-summary') return createElement('strong');
          if (selector === '.tag-row') return createElement('div');
          if (selector === '.action-expand') return createElement('button');
          if (selector === '.action-favorite') return favorite;
          if (selector === '.action-compare') return createElement('button');
          if (selector === '.action-shortlist') return createElement('button');
          return createElement('div');
        };
        return node;
      }
    }
  };

  const dynamicQueryLists = {
    '[data-scroll-target]': [],
    '.scenario-btn': [],
    '[data-close-modal="true"]': [],
    '[data-close-auth="true"]': [],
    '.buy-pack': [],
    '.buy-membership': []
  };

  const downloads = [];
  const blobStore = new Map();
  const storage = new Map();

  const context = {
    console,
    module: { exports: {} },
    exports: {},
    Blob: class MockBlob {
      constructor(parts) {
        this.parts = parts;
      }
      text() {
        return Promise.resolve(this.parts.join(''));
      }
    },
    URL: {
      createObjectURL(blob) {
        const url = `blob:${blobStore.size + 1}`;
        blobStore.set(url, blob);
        return url;
      },
      revokeObjectURL() {}
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key)
    },
    navigator: {
      clipboard: { writeText: async () => {} }
    },
    crypto: {
      randomUUID: () => 'test-uuid'
    },
    document: {
      querySelector(selector) {
        if (!elements.has(selector)) {
          elements.set(selector, createElement(selector));
        }
        return elements.get(selector);
      },
      querySelectorAll(selector) {
        return dynamicQueryLists[selector] || [];
      },
      getElementById(id) {
        return this.querySelector(`#${id}`);
      },
      createElement(tag) {
        const element = createElement(tag);
        if (tag === 'a') {
          element.click = () => downloads.push({ href: element.href, download: element.download });
        }
        return element;
      }
    },
    FormData: class MockFormData {
      constructor() {}
      entries() {
        return [];
      }
    },
    Event: class MockEvent {
      preventDefault() {}
    },
    __FREE_NAMING_ENABLE_TEST_API__: true,
    window: null,
    setTimeout,
    clearTimeout
  };

  context.window = context;
  context.globalThis = context;

  return { context, elements, downloads, blobStore };
}

const logicCode = readFileSync(new URL('../logic.js', import.meta.url), 'utf8');
const appCode = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const { context, elements, downloads, blobStore } = createEnvironment();

vm.createContext(context);
vm.runInContext(logicCode, context);
vm.runInContext(appCode, context);

const api = context.window.__FREE_NAMING_TEST_API__;
assert.ok(api, 'test api should be exposed');

api.setState({
  freeUsed: 1,
  history: [
    {
      requestId: 'req-1',
      createdAt: '2026-03-23 13:00:00',
      surname: '苏',
      gender: '女',
      scenario: '宝宝起名',
      stylePreference: '清新灵秀',
      candidates: [
        { fullName: '苏若溪', score: 96, scoreWuge: 94, scoreBazi: 95, scoreMeaning: 97, recommend: '整体气质灵动。' }
      ]
    }
  ],
  quotaLogs: [{ action: '消耗免费次数', detail: '已使用 1/6 次', createdAt: '2026-03-23 13:00:00' }]
});

api.packageData();
assert.equal(downloads.length, 1);
assert.match(downloads[0].download, /^free-naming-agent-bundle-/);
assert.match(elements.get('#package-last-exported').textContent, /最近打包：/);

const exportedBlob = blobStore.get(downloads[0].href);
const exportedJson = JSON.parse(await exportedBlob.text());
assert.equal(exportedJson.bundleType, 'free-naming-agent-demo-data');

await api.importState({
  target: {
    files: [
      {
        async text() {
          return JSON.stringify(exportedJson);
        }
      }
    ],
    value: 'filled'
  }
});

assert.equal(api.getState().history[0].surname, '苏');
assert.match(elements.get('#modal-title').textContent, /导入成功/);
assert.match(elements.get('#package-migration-status').textContent, /无需迁移/);

await api.importState({
  target: {
    files: [
      {
        async text() {
          return JSON.stringify({ ...exportedJson, schemaVersion: 999 });
        }
      }
    ],
    value: 'filled'
  }
});

assert.match(elements.get('#modal-description').textContent, /数据包版本暂不受支持/);

await api.importState({
  target: {
    files: [
      {
        async text() {
          return JSON.stringify({
            history: [{ surname: '林', candidates: [] }],
            config: { freeQuota: 9 }
          });
        }
      }
    ],
    value: 'filled'
  }
});

assert.equal(api.getState().config.freeQuota, 9);
assert.match(elements.get('#package-migration-status').textContent, /已迁移/);
assert.match(elements.get('#package-migration-detail').textContent, /raw-state/);

console.log('App integration test passed.');
