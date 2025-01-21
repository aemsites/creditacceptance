// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';

export default async function decorate(block) {
  // build tablist
  const tabsListContainer = createTag('div', { class: 'container' });
  const tabsList = createTag('div', { class: 'tabs-list', role: 'tablist' }, tabsListContainer);
  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);
    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    const tabPanelContent = tabpanel.children[1];
    tabPanelContent.classList.add('container');
    const allChildren = [...tabPanelContent.children];
    const isLastChildImage = allChildren[allChildren.length - 1].querySelector('img');
    if (isLastChildImage) {
      tabPanelContent.classList.add('tabs-panel-flex');
      const lastChild = allChildren.pop();
      const copyContainer = createTag('div', { class: 'tabs-panel-copy' }, allChildren);
      const lastChildContainer = createTag('div', { class: 'tabs-panel-image' }, lastChild);
      const flexConatiner = createTag('div', { class: 'tabs-panel-container' });
      flexConatiner.append(copyContainer);
      flexConatiner.append(lastChildContainer);
      tabPanelContent.append(flexConatiner);
    } else {
      tabPanelContent.classList.add('tabs-panel-copy');
    }

    // build tab button
    const btnAttrs = {
      class: 'tabs-tab',
      id: `tab-${id}`,
      'aria-controls': `tabpanel-${id}`,
      'aria-selected': !i,
      role: 'tab',
      type: 'button',
    };
    const button = createTag('button', btnAttrs, tab.innerText);
    button.addEventListener('click', () => {
      const currentSelectedButton = tabsList.querySelector('[aria-selected="true"]');
      if (currentSelectedButton) {
        currentSelectedButton.setAttribute('aria-selected', 'false');
        const currentPanelId = currentSelectedButton.getAttribute('aria-controls');
        if (currentPanelId) {
          const currentPanel = document.getElementById(currentPanelId);
          if (currentPanel) currentPanel.setAttribute('aria-hidden', 'true');
        }
      }
      button.setAttribute('aria-selected', 'true');
      const newPanelId = button.getAttribute('aria-controls');
      if (newPanelId) {
        const newPanel = document.getElementById(newPanelId);
        if (newPanel) newPanel.setAttribute('aria-hidden', 'false');
      }
    });
    tabsListContainer.append(button);
    tab.remove();
  });

  block.prepend(tabsList);
}
