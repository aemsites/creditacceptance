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
import { blogs, oldNewUrls } from './expressBlogs.mjs';

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
    href = `https://main--creditacceptance--aemsites.hlx.page/${href}`;
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
  const relativePath = getRelativePath(url);
  // format of oldNewUrls is: [
  //   {
  //     old: 'https://www.creditacceptance.com/blog/consumer/how-it-works-getting-financed-through-a-dealer-enrolled-with-credit-acceptance',
  //     new: 'https://www.creditacceptance.com/blog/consumer/how-it-works-getting-financed-through-a-dealer-enrolled-with-credit-acceptance',
  //     Date: '45166',
  //   },
  // ]

  // match relativePath with new url and get the corresponding old url
  const pathArray = relativePath.split('/');
  const pathArrayLastElement = pathArray[pathArray.length - 2];
  const oldUrlObject = oldNewUrls.find((oldNewUrl) => oldNewUrl.new.includes(pathArrayLastElement));
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
  if (oldUrlObject) {
    const oldUrl = oldUrlObject.old;
    const date = oldUrlObject.Date;
    console.log('date: ', date);
    // convert above excel date to format 'MM/DD/YYYY'
    const dateObj = new Date((date - 25567) * 86400 * 1000);
    dateObj.setUTCDate(dateObj.getUTCDate() - 2); // Adjust for the discrepancy
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();
    const newdate = `${month}/${day}/${year}`;
    console.log('new date: ', newdate);
    blogs.forEach((blog) => {
      blog.tabContent.cardData.forEach((card) => {
        if (oldUrl.includes(card.cardButton.url)) {
          console.log(url, 'blog url: ', card.cardButton.url);
          meta.category = blog.tabTitle;
          if (card.imgURL) {
            const mobileImageUrl = card.imgURL.replace('AWS_BUCKET_URL', 'https://wwwbucket.static.creditacceptance.com');
            const mobileImage = document.createElement('img');
            mobileImage.src = mobileImageUrl;
            meta.mobileImage = mobileImage;
          }
          if (card.tabletImgUrl) {
            const tabletImageUrl = card.tabletImgUrl.replace('AWS_BUCKET_URL', 'https://wwwbucket.static.creditacceptance.com');
            const tabletImage = document.createElement('img');
            tabletImage.src = tabletImageUrl;
            meta.tabletImage = tabletImage;
          }
          meta.date = newdate;
          meta.imageAlt = card.imgAlt;
        }
      });
    });
  }

  meta.tags = [];

  // helper to create the metadata block
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);

  // append the block to the main element
  main.append(block);

  // returning the meta object might be useful to other rules
  return meta;
};

const importNewDesing = (document, url, html, params) => {
  const main = document.querySelector('blog-article');
  const heroSection = main.querySelector('cac-hero-image');
  let desktopImage; let mobileImage; let
    tabletImage;
  if (heroSection) {
    const dtImage = heroSection.querySelector('img').getAttribute('src');
    if (dtImage) {
      desktopImage = document.createElement('img');
      desktopImage.src = dtImage;
      if (dtImage.includes('DesktopHero')) {
        mobileImage = document.createElement('img');
        mobileImage.src = dtImage.replace('DesktopHero', 'MobileHero');
        tabletImage = document.createElement('img');
        tabletImage.src = dtImage.replace('DesktopHero', 'TabletHero');
      }
    }
  }
  const marqueeCells = [['Marquee']];
  const row2 = [];
  if (desktopImage) row2.push(desktopImage);
  if (mobileImage) row2.push(mobileImage);
  if (tabletImage) row2.push(tabletImage);
  marqueeCells.push(row2);

  const blogContent = document.createElement('div');
  blogContent.append(main.querySelector('h1'));
  blogContent.append(main.querySelector('.body-description'));
  transformButtons(blogContent);
  const a = document.createElement('a');
  a.href = 'https://main--creditacceptance--aemsites.aem.page/car-buyers/express-lane/fragments/express-lane-cards';
  a.textContent = 'https://main--creditacceptance--aemsites.aem.page/car-buyers/express-lane/fragments/express-lane-cards';
  const cells = [
    ['Fragment'],
    [a],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  blogContent.append(table);
  createMetadataBlock(blogContent, document, url);
  blogContent.querySelectorAll('a').forEach(fixUrl);
  WebImporter.DOMUtils.remove(blogContent, [
    'noscript',
  ]);

  return blogContent;
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
    const main = document.querySelector('legacy-blog-article');
    // if (!main && document.querySelector('blog-article')) {
    //   return importNewDesing(document, url, html, params);
    // }
    if (!main) {
      return null;
    }
    const blogContent = document.createElement('div');
    // append h1 .body-description of main to blogContent
    blogContent.append(main.querySelector('h1'));
    blogContent.append(main.querySelector('.body-description'));
    transformButtons(blogContent);
    formatLists(blogContent);
    // append a fragment block table
    const a = document.createElement('a');
    a.href = 'https://main--creditacceptance--aemsites.aem.page/car-buyers/express-lane/fragments/express-lane-cards';
    a.textContent = 'https://main--creditacceptance--aemsites.aem.page/car-buyers/express-lane/fragments/express-lane-cards';
    const cells = [
      ['Fragment'],
      [a],
    ];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    blogContent.append(table);
    createMetadataBlock(blogContent, document, url);
    // Fix URLs
    blogContent.querySelectorAll('a').forEach(fixUrl);
    WebImporter.DOMUtils.remove(blogContent, [
      'noscript',
    ]);

    return blogContent;
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
