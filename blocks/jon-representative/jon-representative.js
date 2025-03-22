/* eslint-disable max-len */
import { loadCSS } from '../../scripts/aem.js';

export default function decorate(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/columns.css`);

  const jonRepresentativeData = localStorage.getItem('jon-representative');
  if (jonRepresentativeData) {
    try {
      const jonRepresentative = JSON.parse(jonRepresentativeData);

      if (jonRepresentative && jonRepresentative.name && jonRepresentative.title && jonRepresentative.phone && jonRepresentative.email) {
        block.innerHTML = `
                        <div class="columns">
                                <div>
                                        <div><span class="icon icon-user-solid"></span></div>
                                        <div>
                                                <p><strong>${jonRepresentative.name}</strong></p>
                                                <p>${jonRepresentative.title}</p>
                                        </div>
                                </div>
                                <div>
                                        <div><span class="icon icon-phone-solid"></span></div>
                                        <div><a href="tel:${jonRepresentative.phone}">${jonRepresentative.phone}</a></div>
                                </div>
                                <div>
                                        <div><span class="icon icon-envelope-solid"></span></div>
                                        <div><a href="mailto:${jonRepresentative.email}">${jonRepresentative.email}</a></div>
                                </div>
                        </div>
                `;
      }
    } catch (error) {
      console.error('Error parsing jon-representative data from localStorage:', error);
    }
  }
}
