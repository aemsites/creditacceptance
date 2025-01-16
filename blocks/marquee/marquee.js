import { createTag } from '../../libs/utils/utils.js';
import { decorateBlockBg, decorateButtons } from '../../libs/utils/decorate.js';

const palette = {
  'brand-blue-light': 'rgb(15, 125, 156)',
  'brand-blue': 'rgb(13, 93, 115)',
  'brand-blue-dark': 'rgb(43, 67, 97)',
  'brand-red': 'rgb(179, 71, 0)',
};

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
    let colorStr = color.replace('}', '');
    if (colorStr === 'black' || palette[colorStr]) label.style.color = '#ffffff';
    if (palette[colorStr]) colorStr = palette[colorStr];
    label.style.backgroundColor = colorStr;
    border.style.backgroundColor = colorStr;
  }
}

export default function decorate(block) {
  const children = block.querySelectorAll(':scope > div');
  const foreground = children[children.length - 1];
  if (children.length > 1) {
    decorateBlockBg(block, children[0], { useHandleFocalpoint: true });
  }
  foreground.classList.add('foreground', 'container');
  decorateIntro(foreground);
  decorateButtons(foreground);
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
