import { createTag } from '../../libs/utils/utils.js';
import { decorateBlockBg, isDarkHexColor } from '../../libs/utils/decorate.js';
import { loadCSS } from '../../scripts/aem.js';

function isDarkColor(colors, colorStr) {
  const colorObject = colors.find((c) => c['brand-name'] === colorStr);
  if (!colorObject) return false;
  return isDarkHexColor(colorObject['color-value']);
}

function decorateIntro(el) {
  const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  const intro = heading.previousElementSibling;
  if (!intro) return;
  intro.classList.add('intro');
  const [text, color] = intro.textContent.trim().split('{');
  intro.innerHTML = '';
  const label = createTag('span', null, text.trim());
  const border = createTag('div');
  intro.appendChild(label);
  intro.appendChild(border);
  if (color) {
    const colorStr = color.replace('}', '');
    const isColorPalette = colorStr.startsWith('ca-');
    const usedColor = isColorPalette ? `var(--${colorStr})` : colorStr;
    const dark = isDarkHexColor(usedColor);
    if (colorStr === 'black' || dark) label.style.color = '#ffffff';
    label.style.backgroundColor = usedColor;
    border.style.backgroundColor = usedColor;
    // Check if colorStr is dark
    if (isColorPalette) {
      document.addEventListener('paletteLoaded', (event) => {
        const isDark = isDarkColor(event.detail.palette, colorStr);
        if (isDark) label.style.color = '#ffffff';
      });
    }
  }
}

function addCoins(el) {
  for (let i = 0; i < 10; i += 1) {
    const coinAttrs = {
      src: `${window.hlx.codeBasePath}/blocks/marquee/animated/big-coin.gif`,
      class: `coin coin-${i + 1}`,
    };
    const coinImg = createTag('img', coinAttrs);
    el.append(coinImg);
  }
}

function initAnimatedMarquee(block) {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading, i) => {
    heading.classList.add(`view-${i + 1}`);
  });
  const foreground = block.querySelector('.foreground');
  foreground.children[0].classList.add('toggle-copy');

  const input = createTag('input', { type: 'checkbox', id: 'btnToggle', name: 'btnToggle' });
  const slider = createTag('span', { class: 'slider' });
  const label = createTag('label', { class: 'toggle' }, [input, slider]);

  const toggleAria = createTag('div', { class: 'toggle-aria' }, label);
  foreground.append(toggleAria);
  addCoins(foreground);

  const toggleClass = () => { block.classList.toggle('toggled', input.checked); };
  input.addEventListener('change', toggleClass);

  // Auto-toggle every 8 seconds
  setInterval(() => {
    input.checked = !input.checked;
    toggleClass();
  }, '8000');
}

export default function decorate(block) {
  const children = block.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  const background = children.length > 1 ? children[0] : null;
  if (background) {
    decorateBlockBg(block, background, { useHandleFocalpoint: true });
  }
  foreground.classList.add('foreground', 'container');
  decorateIntro(foreground);
  const buttons = foreground.querySelectorAll('.button');
  buttons.forEach((button) => {
    const actionArea = button.closest('p, div');
    if (!actionArea) return;
    actionArea.classList.add('action-area');
  });
  const lastAction = buttons[buttons.length - 1]?.closest('p, div');
  if (!lastAction) return;
  lastAction.nextElementSibling?.classList.add('supplemental-text');
  if (block.classList.contains('animated-toggle')) {
    loadCSS(`${window.hlx.codeBasePath}/blocks/marquee/animated/animated-toggle.css`);
    initAnimatedMarquee(block);
  }
}
