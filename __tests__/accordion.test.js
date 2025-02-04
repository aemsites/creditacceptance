import init from '../blocks/accordion/accordion.js';
import { createTag } from '../libs/utils/utils.js';
import { loadFragment } from '../blocks/fragment/fragment.js';

jest.mock('../libs/utils/utils.js', () => ({
  createTag: jest.fn((tag, attributes = {}, content = '') => {
    const element = global.document.createElement(tag);

    // Apply attributes
    Object.entries(attributes || {}).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    // Append content
    if (Array.isArray(content)) {
      content.forEach((child) => {
        if (child instanceof global.Node) {
          element.appendChild(child);
        } else if (typeof child === 'string') {
          const textNode = global.document.createTextNode(child);
          element.appendChild(textNode);
        }
      });
    } else if (content instanceof global.Node) {
      element.appendChild(content);
    } else if (typeof content === 'string') {
      const textNode = global.document.createTextNode(content);
      element.appendChild(textNode);
    }

    return element;
  }),
}));

const staticAccordionContent = (fragmentPath = 'https://www.creditacceptance.com/get-prequalified#/') => `

    <details class="accordion-item">
        <summary class="accordion-item-label">
            <span class="accordion-item-plus">+</span>
            <span class="accordion-item-minus">-</span>
            <p>Customers</p>
        </summary>
    <div class="accordion-item-body">
        <ul>
          <li><a href="${fragmentPath}">Get Pre-Qualified</a></li>          
        </ul>
      </div></details>
    <details class="accordion-item">
        <summary class="accordion-item-label">
            <span class="accordion-item-plus">+</span>
            <span class="accordion-item-minus">-</span>
            <p>Dealers</p>
        </summary>
    <div class="accordion-item-body">
        <ul>
          <li><a href="https://www.creditacceptance.com/dealers">Dealers Overview</a></li>          
        </ul>
      </div></details>
    <details class="accordion-item">
        <summary class="accordion-item-label">
            <span class="accordion-item-plus">+</span>
            <span class="accordion-item-minus">-</span>
            <p>About Us</p>
        </summary>
        <div class="accordion-item-body">
        <ul>
          <li><a href="https://www.creditacceptance.com/about">About Us</a></li>          
        </ul>
        </div>
    </details>
    <details class="accordion-item">
        <summary class="accordion-item-label">
            <span class="accordion-item-plus">+</span>
            <span class="accordion-item-minus">-</span>
            <p>Careers</p>
        </summary>
    <div class="accordion-item-body">
        <ul>
          <li><a href="https://www.creditacceptance.com/careers">Job Search</a></li>          
        </ul>
      </div>
    </details>
    
`;

jest.mock('../blocks/fragment/fragment.js', () => ({
  loadFragment: jest.fn((path) => {
    if (path.startsWith('/')) {
      const fragment = global.document.createElement('div');
      fragment.innerHTML = `
          <div class="section fetched-fragment">
            <div>
              <h3>FAQs Label</h3>
              <div>
                <p>FAQs Content</p>
              </div>
            </div>
          </div>
        `;
      return fragment;
    }
    return null;
  }),
}));

describe('accordion block', () => {
  let block;

  afterEach(() => {
    block = null;
    jest.clearAllMocks();
  });

  it('transforms rows into details and summary elements', async () => {
    global.document.body.innerHTML = `
        <div class="section accordion-container">
        <div class="accordion-wrapper">
            <div class="accordion sitemap block" data-block-name="accordion" data-block-status="loaded">
            ${staticAccordionContent()}
            </div>
        </div>
        </div>
    `;
    block = global.document.querySelector('.accordion');

    await init(block);

    const detailsElements = block.querySelectorAll('details.accordion-item');
    expect(detailsElements.length).toBe(4);

    const firstDetails = detailsElements[0];
    const summary = firstDetails.querySelector('summary.accordion-item-label');
    const body = firstDetails.querySelector('.accordion-item-body');

    expect(summary).toBeTruthy();
    expect(summary.querySelector('.accordion-item-plus').textContent).toBe('+');
    expect(summary.querySelector('.accordion-item-minus').textContent).toBe('-');
    expect(summary.querySelector('p').textContent).toBe('Customers');
    expect(firstDetails.querySelector('.accordion-item-body').textContent.trim()).toBe('Get Pre-Qualified');
    expect(body).toBeTruthy();
    expect(body.querySelector('ul')).toBeTruthy();
    // block did not have 'faq' class thus decorateFAQs was not called
    expect(loadFragment).toHaveBeenCalledTimes(0);
  });

  it('invokes decorateFAQs, does not load fragments for anchors with href pointing to external resources', async () => {
    global.document.body.innerHTML = `
        <div class="section accordion-container">
        <div class="accordion-wrapper">
            <div class="accordion faqs sitemap block" data-block-name="accordion" data-block-status="loaded">
            ${staticAccordionContent()}
            </div>
        </div>
        </div>
    `;
    block = global.document.querySelector('.accordion');

    await init(block);
    expect(loadFragment).toHaveBeenCalledTimes(1);
    const fragment = global.document.querySelector('.fetched-fragment');
    expect(fragment).toBeNull();
  });

  it('invokes decorateFAQs, fetches fragments for anchors with href starting with /', async () => {
    global.document.body.innerHTML = `
        <div class="section accordion-container">
        <div class="accordion-wrapper">
            <div class="accordion faqs sitemap block" data-block-name="accordion" data-block-status="loaded">
            ${staticAccordionContent('/fragment')}
            </div>
        </div>
        </div>
    `;
    block = global.document.querySelector('.accordion');

    await init(block);
    expect(loadFragment).toHaveBeenCalledTimes(1);
    const fragment = global.document.querySelector('.fetched-fragment');
    expect(fragment).not.toBeNull();
  });
});
