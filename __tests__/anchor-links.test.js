import decorate from '../blocks/anchor-links/anchor-links.js';

describe('anchor-links block', () => {
  let block;

  beforeEach(() => {
    global.document.body.innerHTML = `
      <div class="block">
        <div>
          <p>
            <a href="#section1">SECTION 1</a>
            <a href="#section2">SECTION 2</a>
          </p>
        </div>
      </div>
    `;
    block = global.document.querySelector('.block');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('add new div "container" around the first row', () => {
    decorate(block);

    const container = block.querySelector('.container');

    expect(container).toBeTruthy();
    expect(container.querySelector('a[href="#section1"]')).toBeTruthy();
    expect(container.querySelector('a[href="#section2"]')).toBeTruthy();
  });
});