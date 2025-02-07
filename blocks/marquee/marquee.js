import { addStyles, createTag, loadPalette } from '../../libs/utils/utils.js';
import { decorateBlockBg, isDarkHexColor } from '../../libs/utils/decorate.js';
import { loadFragment } from '../fragment/fragment.js';

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
}

class CAMarqueeWebComponent extends HTMLElement {
  // connect component
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.prepend(addStyles('/blocks/marquee/marquee.css'));
    shadow.prepend(addStyles('/styles/styles.css'));
    shadow.prepend(addStyles('/styles/fonts.css'));
    await loadPalette();
    const fragment = await loadFragment('/drafts/msukta/marquee-test');
    shadow.append(fragment);
    // await decorate(fragment);
  }
}

// register component
customElements.define('ca-marquee', CAMarqueeWebComponent);
