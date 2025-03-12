import decorate from '../blocks/awards/awards.js';
import { createOptimizedPicture } from '../scripts/aem.js';

jest.mock('../scripts/aem.js', () => ({
  createOptimizedPicture: jest.fn((src, alt) => {
    const img = global.document.createElement('img');
    img.src = src;
    img.alt = alt;
    return img;
  }),
}));

describe('awards block', () => {
  let block;

  beforeEach(() => {
    global.document.body.innerHTML = `
      <div class="block">
        <div>
          <div>
            <picture>
              <img src="image1.jpg" alt="Image 1">
            </picture>
          </div>
          <div>
            <p><a href="https://example1.com">Example 1</a></p>
          </div>
        </div>
        <div>
          <div>
            <picture>
              <img src="image2.jpg" alt="Image 2">
            </picture>
          </div>
          <div>
            <p><a href="https://example2.com">Example 2</a></p>
          </div>
        </div>
      </div>
    `;
    block = global.document.querySelector('.block');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create list of awards with links and images in block', () => {
    decorate(block);

    const ul = block.querySelector('ul');
    const li = ul.querySelector('li');
    const a = li.querySelector('a');
    const wrapper = a.querySelector('.awards-award-inner');

    expect(ul).toBeTruthy();
    expect(li).toBeTruthy();
    expect(a).toBeTruthy();
    expect(wrapper).toBeTruthy();
    expect(wrapper.querySelector('.awards-award-image')).toBeTruthy();
    expect(wrapper.querySelector('.awards-award-body')).toBeTruthy();
  });

  it('replace images with optimized pictures', () => {
    decorate(block);

    const images = block.querySelectorAll('img');
    expect(images.length).toBe(2);
    expect(createOptimizedPicture).toHaveBeenCalledTimes(2);
    expect(createOptimizedPicture).toHaveBeenNthCalledWith(
      1,
      'http://localhost/image1.jpg',
      'Image 1',
      false,
      [{ width: '127' }],
    );
    expect(createOptimizedPicture).toHaveBeenNthCalledWith(
      2,
      'http://localhost/image2.jpg',
      'Image 2',
      false,
      [{ width: '127' }],
    );
  });

  it('clear block content before appending the list', () => {
    decorate(block);

    const ul = block.querySelector('ul');
    expect(ul).toBeTruthy();
    expect(block.children.length).toBe(1);
    expect(block.firstElementChild.tagName).toBe('UL');
  });

  it('skip if no links present', () => {
    global.document.body.innerHTML = `
      <div class="block">
        <div>
          <div>
            <picture>
              <img src="image.jpg" alt="Image">
            </picture>
          </div>
        </div>
      </div>
    `;
    block = global.document.querySelector('.block');

    decorate(block);

    const ul = block.querySelector('ul');
    expect(ul.children.length).toBe(0);
  });
});