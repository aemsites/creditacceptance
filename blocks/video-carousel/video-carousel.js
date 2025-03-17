/* eslint-disable no-console */

import { buildBlock, loadBlock, loadCSS } from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';
import { embedVimeo } from '../embed/embed.js';

async function populateCarousel(videoLinks) {
  if (!videoLinks || videoLinks.length === 0) {
    console.error('No video links provided');
    return null;
  }

  const cells = [];
  const promises = Array.from(videoLinks).map((link, index) => {
    if (!link || !link.href) {
      console.error('Invalid video link');
      return Promise.resolve();
    }

    return fetch(`https://vimeo.com/api/oembed.json?url=${link.href}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch metadata for video ID');
        }
        return response.json();
      })
      .then((metadata) => {
        const cell = createTag('div');
        const img = createTag('img', { src: metadata.thumbnail_url, alt: metadata.title });
        // create a picture tag with the image without using createoptimizedpicture
        const picture = createTag('picture', null, [img]);
        cell.append(picture);
        const h4 = createTag('h4');
        h4.textContent = metadata.title;
        cell.append(h4);
        const p = createTag('p');
        p.textContent = metadata.description;
        cell.append(p);
        const a = createTag('a', { href: link.href });
        a.textContent = 'Watch Video';
        cell.append(a);
        cells[index] = [cell];
      })
      .catch((error) => {
        console.error(error);
      });
  });

  await Promise.all(promises);
  const carousel = buildBlock('carousel', cells);
  carousel.dataset.blockName = 'carousel';
  carousel.classList.add('slides-per-view-4-desktop', 'slides-per-view-4-mobile', 'aspect-ratio-rectangle');
  const carouselBlock = await loadBlock(carousel);
  return carouselBlock;
}

async function loadVideo(link) {
  const embedWrapper = createTag('div', { class: 'embed block' });
  const url = new URL(link.href.replace(/%5C%5C_/, '_'));
  embedWrapper.innerHTML = await embedVimeo(url);
  return embedWrapper;
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/embed/embed.css`);
  block.classList.add('showcase-video');
  const links = block.querySelectorAll('a');
  if (!links || links.length === 0) {
    console.error('No links found in block');
    return;
  }

  block.innerHTML = '';
  const embedWrapper = await loadVideo(links[0]);
  block.replaceChildren(embedWrapper);
  const carousel = await populateCarousel(links);
  if (carousel) {
    block.append(carousel);
    const h4Clone = carousel.querySelector('h4').cloneNode(true);
    const pClone = carousel.querySelector('p').cloneNode(true);
    block.append(h4Clone);
    block.append(pClone);
  }

  // Add click event listener to each slide
  const carouselSlides = carousel.querySelectorAll('.carousel-slide');
  carouselSlides.forEach((slide) => {
    const a = slide.querySelector('a');
    if (a) {
      slide.addEventListener('click', async (event) => {
        event.preventDefault();
        block.querySelector('.embed').replaceWith(await loadVideo(a));
        block.querySelectorAll(':scope > h4, :scope > p').forEach((el) => el.remove());
        const h4 = slide.querySelector('h4').cloneNode(true);
        const p = slide.querySelector('p').cloneNode(true);
        block.append(h4);
        block.append(p);
      });
    }
  });

  // Check if videoId is in URL and click the corresponding slide
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('videoId');
  if (videoId) {
    // scroll page to this block
    setTimeout(() => {
      block.closest('.section').scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }, 500);
    const slideIndex = Array.from(carouselSlides).findIndex((slide) => {
      const a = slide.querySelector('a');
      return a.href.includes(videoId);
    });
    if (slideIndex !== -1) {
      carouselSlides[slideIndex].click();
    }
  }
}
