import decorate from '../blocks/cards/cards.js';
import { createOptimizedPicture } from '../scripts/aem.js';
import { createTag } from '../libs/utils/utils.js';

jest.mock('../scripts/aem.js', () => ({
  createOptimizedPicture: jest.fn((src, alt) => {
    const img = global.document.createElement('img');
    img.src = src;
    img.alt = alt;
    return img;
  }),
}));

jest.mock('../libs/utils/utils.js', () => ({
  createTag: jest.fn((tag, attributes = {}, content = '') => {
    const element = global.document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (content instanceof global.HTMLElement || Array.isArray(content)) {
      element.append(...[].concat(content));
    }
    return element;
  }),
}));

describe('cards block', () => {
  let block;

  beforeEach(() => {
    global.document.body.innerHTML = `
      <div class="block">
        <div>
          <div>
            <picture><img src="image1.jpg" alt="Image 1"></picture>
          </div>
          <div>
            <h3>Card Title 1</h3>
            <p>Some content here</p>
          </div>
        </div>
        <div>
          <div>
            <picture><img src="image2.jpg" alt="Image 2"></picture>
          </div>
          <div>
            <h3>Card Title 2</h3>
            <p>Another piece of content</p>
          </div>
        </div>
      </div>
    `;
    block = global.document.querySelector('.block');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a list of cards inside the block', () => {
    decorate(block);

    const ul = block.querySelector('ul');
    const firstCard = ul.querySelector('li');
    const cardWrapper = firstCard.querySelector('.card-wrapper');

    expect(ul).toBeTruthy();
    expect(cardWrapper.querySelector('.cards-card-image')).toBeTruthy();
    expect(cardWrapper.querySelector('.cards-card-body')).toBeTruthy();
  });

  it('adds the "animation-scale" class if block has animation class', () => {
    block.classList.add('animation');
    decorate(block);

    const listItems = block.querySelectorAll('li.animation-scale');
    expect(listItems.length).toBe(2);
  });

  it('replaces pictures with optimized versions', () => {
    decorate(block);

    const images = block.querySelectorAll('img');
    expect(images.length).toBe(2);
    expect(createOptimizedPicture).toHaveBeenCalledTimes(2);
    expect(createOptimizedPicture).toHaveBeenNthCalledWith(
      1,
      'http://localhost/image1.jpg',
      'Image 1',
      false,
      [{ width: '750' }],
    );
    expect(createOptimizedPicture).toHaveBeenNthCalledWith(
      2,
      'http://localhost/image2.jpg',
      'Image 2',
      false,
      [{ width: '750' }],
    );
  });

  it('clears block text content and appends the list', () => {
    decorate(block);

    const ul = block.querySelector('ul');
    expect(ul).toBeTruthy();
    expect(block.children.length).toBe(1); // block should have exactly one child
    expect(block.firstElementChild.tagName).toBe('UL'); // child should be <ul>
  });
});
