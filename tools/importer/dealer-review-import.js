/* eslint-disable import/extensions */
/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fixUrl = (a) => {
  let href = a.getAttribute('href');
  const text = a.textContent;
  if (href?.startsWith('/')) {
    href = `https://main--creditacceptance--aemsites.hlx.page${href}`;
  }
  if (a.href === text) {
    a.textContent = href;
  }
  a.href = href;
  return a;
};

const formatLists = (main) => {
  const lists = main.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    list.querySelectorAll('br').forEach((br) => {
      br.remove();
    });
  });
};

const transformButtons = (main) => {
  const buttons = main.querySelectorAll('.btn-primary');
  buttons.forEach((button) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.appendChild(button.cloneNode(true));
    p.appendChild(strong);
    button.replaceWith(p);
  });
};

const createMetadataBlock = (main, document, url) => {
  const meta = {};

  // find the <title> element
  const title = document.querySelector('title');
  if (title) {
    meta.title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  // find the <meta property="og:description"> element
  const desc = document.querySelector('[property="og:description"]');
  if (desc) {
    meta.description = desc.content;
  }
  const imgElement = main.querySelector('img');
  if (imgElement) {
    const dtImage = imgElement.getAttribute('src');
    if (dtImage) {
      const desktopImage = document.createElement('img');
      desktopImage.src = dtImage;
      meta.image = desktopImage;
    }
  }

  meta.tags = [];

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be useful to other rules
  return meta;
};

export default {
  /**
         * Apply DOM operations to the provided document and return
         * the root element to be then transformed to Markdown.
         * @param {HTMLDocument} document The document
         * @param {string} url The url of the page imported
         * @param {string} html The raw html (the document is cleaned up during preprocessing)
         * @param {object} params Object containing some parameters given by the import process.
         * @returns {HTMLElement} The root element to be transformed
         */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const main = document.querySelector('body');
    const dealerReviewContent = document.createElement('div');
    const h1 = document.createElement('h1');
    h1.innerHTML = main.querySelector('h2').innerHTML;
    dealerReviewContent.appendChild(h1);
    const description = main.querySelector('cac-credit-introduction');
    if (description) {
      dealerReviewContent.appendChild(document.createElement('hr'));
      dealerReviewContent.appendChild(description);
      const cells = [
        ['Section Metadata'],
        ['background', '#fcfcfa'],
      ];
      dealerReviewContent.append(WebImporter.DOMUtils.createTable(cells, document));
      dealerReviewContent.append(document.createElement('hr'));
    }
    const videoUrl = main.querySelector('iframe').getAttribute('src');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    const cells = [
      ['Embed(video-border)'],
      [a],
    ];
    dealerReviewContent.append(WebImporter.DOMUtils.createTable(cells, document));

    createMetadataBlock(dealerReviewContent, document, url);
    transformButtons(dealerReviewContent);
    // Fix URLs
    dealerReviewContent.querySelectorAll('a').forEach(fixUrl);
    formatLists(dealerReviewContent);
    WebImporter.DOMUtils.remove(dealerReviewContent, [
      'noscript',
    ]);

    return dealerReviewContent;
  },

  /**
         * Return a path that describes the document being transformed (file name, nesting...).
         * The path is then used to create the corresponding Word document.
         * @param {HTMLDocument} document The document
         * @param {string} url The url of the page imported
         * @param {string} html The raw html (the document is cleaned up during preprocessing)
         * @param {object} params Object containing some parameters given by the import process.
         * @return {string} The path
         */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
