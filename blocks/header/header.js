import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { createTag } from '../../libs/utils/utils.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 960px)');
const icons = {
  user: 'https://main--creditacceptance--aemsites.aem.page/icons/user.svg',
};

function createRipple(event) {
  const button = event.currentTarget;

  const circle = document.createElement('span');
  const buttonRect = button.getBoundingClientRect();
  const diameter = Math.max(buttonRect.width, buttonRect.height);
  const radius = diameter / 2;

  // Calculate relative coordinates within the button
  const relativeX = event.clientX - buttonRect.left;
  const relativeY = event.clientY - buttonRect.top;

  circle.style.width = `${diameter}px`;
  circle.style.height = `${diameter}px`;
  circle.style.left = `${relativeX - radius}px`;
  circle.style.top = `${relativeY - radius}px`;
  circle.classList.add('ripple');

  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) ripple.remove();
  button.prepend(circle);
}

function decorateMainMenu(section) {
  const navHeaders = section.querySelectorAll('h3');
  if (!navHeaders) return;
  [...navHeaders].forEach((navHeader, i) => {
    const summaryTag = createTag('summary', { class: 'nav-summary' }, navHeader.textContent);
    const details = createTag('details', { class: `nav-detail detail-${i}` }, summaryTag);
    navHeader.replaceWith(details);
    const list = details.nextElementSibling;
    const listLinks = list.querySelectorAll('li');
    if (!list) return;
    details.append(list);

    /* toggle on mouseover in desktop */
    if (isDesktop.matches) {
      details.addEventListener('mouseover', () => {
        details.setAttribute('open', '');
      });
      details.addEventListener('mouseout', () => {
        details.removeAttribute('open');
      });
      summaryTag.addEventListener('mousedown', createRipple);
      if (listLinks.length) {
        listLinks.forEach((l) => {
          l.addEventListener('mousedown', createRipple);
        });
      }
    }
  });
}

function formatHeaderElements(fragments) {
  fragments.forEach((section, i) => {
    const innerSection = section.querySelector('.section');
    if (!innerSection) return;
    section.innerHTML = innerSection.innerHTML;
    const areas = ['brand', 'quick-links', 'main', 'tools'];
    section.classList.add(`nav-${areas[i]}`);
    section.classList.remove('section-outer');
    section.removeAttribute('data-section-status');
    section.removeAttribute('style');
    const contentWrapper = section.querySelector('.default-content-wrapper');
    if (i === 0) {
      const userIcon = createTag('img', { src: icons.user, alt: 'Login' });
      const userBtn = createTag('a', { class: 'btn-mobile btn-user', href: 'https://customer.creditacceptance.com/login', target: '_blank' }, userIcon);
      contentWrapper.prepend(userBtn);
      const hamAttr = {
        class: 'btn-mobile btn-ham',
        'aria-label': 'Open navigation',
        'aria-controls': 'nav-main',
        'aria-expanded': 'false',
        type: 'button',
      };
      const brandLink = section.querySelector('.icon-CA_Logo');
      if (brandLink) brandLink.parentNode.classList.add('btn-brand');
      section.setAttribute('data-nav-expanded', 'false');
      const hamIcon = createTag('div', { class: 'icon-ham' }, '<span></span><span></span><span></span><span></span>');
      const hamBtn = createTag('button', hamAttr, hamIcon);
      contentWrapper.append(hamBtn);
    } else {
      section.classList.add('nav-section');
      section.setAttribute('aria-expanded', 'false');
    }
  });
  decorateMainMenu(fragments[2]);
}

function decorateFragment(block, fragment) {
  block.textContent = '';
  const fragSections = [...fragment.children];
  formatHeaderElements(fragSections);
  const nav = createTag('nav', { id: 'nav' }, fragSections);
  block.append(nav);

  const hamburger = document.querySelector('.btn-ham');
  const navBrand = document.querySelector('.nav-brand');
  const navSections = document.querySelectorAll('.nav-section');
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    navBrand.setAttribute('data-nav-expanded', !isExpanded);
    hamburger.setAttribute('aria-expanded', !isExpanded);
    navSections.forEach((s) => {
      s.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

// toggle mobile menu if clicked outside of nav
document.addEventListener('click', (event) => {
  if (!isDesktop.matches) {
    const mainNav = document.querySelector('#nav');
    if (mainNav && !mainNav.contains(event.target)) {
      const hamburger = document.querySelector('.btn-ham');
      hamburger.click();
    }
  }
});

function toggleView() {
  const navBrand = document.querySelector('.nav-brand');
  if (isDesktop.matches) {
    navBrand.setAttribute('data-nav-expanded', 'false');
  } else {
    const hamburger = document.querySelector('.btn-ham');
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    navBrand.setAttribute('data-nav-expanded', isExpanded);
  }
}

// Call toggleView on resize
window.addEventListener('resize', () => {
  toggleView();
});

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  decorateFragment(block, fragment);
}
