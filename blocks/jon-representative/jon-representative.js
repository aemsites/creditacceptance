/* eslint-disable max-len */
import {
  loadCSS, decorateIcons, buildBlock, loadBlock,
} from '../../scripts/aem.js';
import decorate from '../columns/columns.js';

export default async function initialize(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/columns.css`);

  const jonRepresentativeData = localStorage.getItem('jon-representative');
  if (jonRepresentativeData) {
    try {
      const jonRepresentative = JSON.parse(jonRepresentativeData);

      if (jonRepresentative && jonRepresentative.name && jonRepresentative.title && jonRepresentative.phone && jonRepresentative.email) {
        block.innerHTML = `
            <div class="columns">
              <div>
                <div>
                  <p><span class="icon icon-user-solid"></span><strong>${jonRepresentative.name}</strong></p>
                  <p>${jonRepresentative.title}</p>
                  <p><span class="border divider-thin-blue-dot"></span></p>
                </div>
              </div>
              <div>
                <div><p><span class="icon icon-phone-solid"></span><a href="tel:${jonRepresentative.phone}">${jonRepresentative.phone}</a></p>
                <p><span class="border divider-thin-blue-dot"></span></p></div>
              </div>
              <div>
                <div><p><span class="icon icon-envelope-solid"></span><a href="mailto:${jonRepresentative.email}">${jonRepresentative.email}</a></p>
                <p><span class="border divider-thin-blue-dot"></span></p></div>
              </div>
            </div>
        `;
      }
    } catch (error) {
      console.error('Error parsing jon-representative data from localStorage:', error);
    }
  }
  const columnsEl = block.querySelector('.columns');
  if (!columnsEl) return;
  const columns = buildBlock('columns', columnsEl);
  columns.dataset.blockName = 'columns';
  const loadedColumns = await loadBlock(columns);
  block.innerHTML = loadedColumns.innerHTML;

  decorate(block.querySelector('.columns'));

  decorateIcons(block);
}
