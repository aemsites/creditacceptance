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

/**
 * Returns the relative path from a given path.
 * If the path is a URL, it extracts the pathname.
 * @param {string} path - The path to get the relative path from.
 * @returns {string} - The relative path.
 */
export function getRelativePath(path) {
  let relPath = path;
  try {
    const url = new URL(path);
    relPath = url.pathname;
  } catch (error) {
    // do nothing
  }
  return relPath;
}

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

const createMetadataBlock = (main, document) => {
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

function createSectionMetadata(document, key, value) {
  const cells = [
    ['Section Metadata'],
    [key, value],
  ];
  return WebImporter.DOMUtils.createTable(cells, document);
}

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
    const main = document.querySelector('#main-content');
    // if (!main && document.querySelector('blog-article')) {
    //   return importNewDesing(document, url, html, params);
    // }
    if (!main) {
      console.log(url);
    }

    const heroSection = main.querySelector('cac-hero-image');
    let desktopImage; let mobileImage; let
      tabletImage;
    if (heroSection) {
      const mobImage = heroSection.querySelector('img').getAttribute('src');
      if (mobImage) {
        mobileImage = document.createElement('img');
        mobileImage.src = mobImage;
        console.log('mobileImage ==========>>>>', mobImage);
        if (mobImage.includes('MobileHero')) {
          desktopImage = document.createElement('img');
          desktopImage.src = mobImage.replace('MobileHero', 'DesktopHero');
          console.log(desktopImage);
          tabletImage = document.createElement('img');
          tabletImage.src = mobImage.replace('MobileHero', 'TabletHero');
        } else
          if (mobImage.includes('DesktopHero')) {
            desktopImage = document.createElement('img');
            desktopImage.src = mobImage;
            mobileImage = document.createElement('img');
            mobileImage.src = mobImage.replace('DesktopHero', 'MobileHero');
            console.log(desktopImage);
            tabletImage = document.createElement('img');
            tabletImage.src = mobImage.replace('DesktopHero', 'TabletHero');
          }
      }
    }
    const marqueeCells = [['Marquee']];
    const row2 = [];
    if (mobileImage) row2.push(mobileImage);
    if (tabletImage) row2.push(tabletImage);
    if (desktopImage) row2.push(desktopImage);
    marqueeCells.push(row2);
    const rows3 = [];
    const heroSubtitle = main.querySelector('.bgc-credit-white');
    if (heroSubtitle) {
      const div = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = `${heroSubtitle.textContent}{brand-blue}`;
      div.append(p);
      div.append(main.querySelector('h1'));
      rows3.push(div);
    }
    marqueeCells.push(rows3);
    const marqueeTable = WebImporter.DOMUtils.createTable(marqueeCells, document);
    // append h1 .body-description of main to blogContent
    heroSection.replaceWith(marqueeTable);

    const blueSection = main.querySelector('.background-skyblue');
    if (blueSection) {
      const div = document.createElement('div');
      // add a hr befor and after the blue section
      div.append(document.createElement('hr'));
      div.append(createSectionMetadata(document, 'background', '#f1fbfd'));
      div.append(blueSection);
      div.append(document.createElement('hr'));
      blueSection.replaceWith(div);
    }
    transformButtons(main);
    formatLists(main);
    // append a fragment block table
    createMetadataBlock(main, document);
    // Fix URLs
    main.querySelectorAll('a').forEach(fixUrl);
    WebImporter.DOMUtils.remove(main, [
      'noscript',
      'app-header',
      'app-sitemap',
      'app-footer',
    ]);

    return main;
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
