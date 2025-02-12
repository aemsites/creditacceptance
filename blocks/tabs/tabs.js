/*
 * tabs.js
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Tab_Role
 */
import { createTag } from '../../libs/utils/utils.js';

const isTabInTabListView = (tab) => {
  const tabList = tab.closest('[role="tablist"]');
  const tabRect = tab.getBoundingClientRect();
  const tabListRect = tabList.getBoundingClientRect();

  const tabLeft = Math.round(tabRect.left);
  const tabRight = Math.round(tabRect.right);
  const tabListLeft = Math.round(tabListRect.left);
  const tabListRight = Math.round(tabListRect.right);

  return (tabLeft >= tabListLeft && tabRight <= tabListRight);
};

const scrollTabIntoView = (e, inline = 'center') => {
  const isElInView = isTabInTabListView(e);
  if (!isElInView) e.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline });
};

function changeTabs(e) {
  const { target } = e;
  const parent = target.parentNode;
  const targetContent = document.querySelector(`#${target.getAttribute('aria-controls')}`);
  const blockId = target.closest('.tabs').id;
  parent
    .querySelectorAll(`[aria-selected="true"][data-block-id="${blockId}"]`)
    .forEach((t) => t.setAttribute('aria-selected', false));
  target.setAttribute('aria-selected', true);
  scrollTabIntoView(target);
  document
    .querySelectorAll(`[role="tabpanel"][data-block-id="${blockId}"]`)
    .forEach((p) => p.setAttribute('hidden', true));
  targetContent?.removeAttribute('hidden');
}

function getStringKeyName(str) {
  // The \p{L} and \p{N} Unicode props are used to match any letter or digit character in any lang.
  const regex = /[^\p{L}\p{N}_-]/gu;
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(regex, '');
}

function getUniqueId(el, rootElem) {
  const tabs = rootElem.querySelectorAll('.tabs');
  return [...tabs].indexOf(el) + 1;
}

function configTabs(config, rootElem) {
  if (config['active-tab']) {
    const id = `#tab-${CSS.escape(config['tab-id'])}-${CSS.escape(getStringKeyName(config['active-tab']))}`;
    const sel = rootElem.querySelector(id);
    if (sel) sel.click();
  }
  const tabParam = new URLSearchParams(window.location.search).get('tab');
  if (!tabParam) return;
  const dashIndex = tabParam.lastIndexOf('-');
  const [tabsId, tabIndex] = [tabParam.substring(0, dashIndex), tabParam.substring(dashIndex + 1)];
  if (tabsId === config.id) rootElem.querySelector(`#tab-${config.id}-${tabIndex}`)?.click();
}

function decorateTabSections(rootElem) {
  // Tab Sections
  const tabsMeta = rootElem.querySelectorAll('main .section .tabs-metadata');
  tabsMeta.forEach((meta, i) => {
    const section = meta.closest('.section-outer');
    const data = {};
    meta.querySelectorAll(':scope > div').forEach((row) => {
      data[row.children[0].textContent] = row.children[1].textContent;
    });
    meta.style.display = 'none';
    if (data.id !== null && data.section !== null) {
      section.id = `tab-panel-${data.id}-${data.section}`;
      section.setAttribute('role', 'tabpanel');
      section.classList.add('tabpanel');
      section.setAttribute('aria-labelledby', `tab-${data.id}-${data.section}`);
      section.setAttribute('data-block-id', `tabs-${data.id}`);
      if (i > 0) section.setAttribute('hidden', '');
    }
  });
}

function initTabs(elm, config, rootElem) {
  const tabs = elm.querySelectorAll('[role="tab"]');
  const tabLists = elm.querySelectorAll('[role="tablist"]');
  tabLists.forEach((tabList) => {
    let tabFocus = 0;
    tabList.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (e.key === 'ArrowRight') {
          tabFocus += 1;
          /* c8 ignore next */
          if (tabFocus >= tabs.length) tabFocus = 0;
        } else if (e.key === 'ArrowLeft') {
          tabFocus -= 1;
          /* c8 ignore next */
          if (tabFocus < 0) tabFocus = tabs.length - 1;
        }
        tabs[tabFocus].setAttribute('tabindex', 0);
        tabs[tabFocus].focus();
      }
    });
  });
  tabs.forEach((tab) => {
    tab.addEventListener('click', changeTabs);
  });
  decorateTabSections(rootElem);
  if (config) configTabs(config, rootElem);
}

const init = (block) => {
  const rootElem = document;
  const rows = block.querySelectorAll(':scope > div');
  const parentSection = block.closest('.section');
  /* c8 ignore next */
  if (!rows.length) return;

  // Tab Config
  const config = {};
  const configRows = [...rows];
  configRows.splice(0, 1);
  configRows.forEach((row) => {
    const rowKey = getStringKeyName(row.children[0].textContent);
    const rowVal = row.children[1].textContent.trim();
    config[rowKey] = rowVal;
    row.remove();
  });
  const tabId = config.id || getUniqueId(block, rootElem);
  config['tab-id'] = tabId;
  block.id = `tabs-${tabId}`;
  parentSection?.classList.add(`tablist-${tabId}-section`);

  // Tab List
  const tabList = rows[0];
  tabList.classList.add('tabList');
  tabList.setAttribute('role', 'tablist');
  const tabListContainer = tabList.querySelector(':scope > div');
  tabListContainer.classList.add('tab-list-container');
  const tabListItems = rows[0].querySelectorAll(':scope li');
  if (tabListItems) {
    tabListItems.forEach((item, i) => {
      const tabName = config.id ? i + 1 : getStringKeyName(item.textContent);
      const tabBtnAttributes = {
        role: 'tab',
        class: 'heading-xs',
        id: `tab-${tabId}-${tabName}`,
        tabindex: '0',
        'aria-selected': (i === 0) ? 'true' : 'false',
        'aria-controls': `tab-panel-${tabId}-${tabName}`,
        'data-block-id': `tabs-${tabId}`,
      };
      const tabBtn = createTag('button', tabBtnAttributes);
      tabBtn.innerText = item.textContent;
      tabListContainer.append(tabBtn);
    });
    tabListItems[0].parentElement.remove();
  }
  initTabs(block, config, rootElem);
};

export default init;
