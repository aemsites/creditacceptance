import { buildBlock, loadBlock, loadCSS } from '../../scripts/aem.js';
import { createTag } from '../../libs/utils/utils.js';

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
        const cell = document.createElement('div');
        const img = document.createElement('img');
        img.src = metadata.thumbnail_url;
        cell.append(img);
        const h4 = document.createElement('h4');
        h4.textContent = metadata.title;
        cell.append(h4);
        const a = document.createElement('a');
        a.href = link.href;
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
  return loadBlock(carousel);
}

export default async function decorate(block) {
  if (!block) {
    console.error('Block is null or undefined');
    return;
  }

  await loadCSS(`${window.hlx.codeBasePath}/blocks/embed/embed.css`);
  block.classList.add('showcase-video');
  const links = block.querySelectorAll('a');
  if (!links || links.length === 0) {
    console.error('No links found in block');
    return;
  }

  block.innerHTML = '';
  const firstVideo = links[0].cloneNode(true);
  const embed = buildBlock('embed', { elems: [firstVideo] });
  embed.dataset.blockName = 'embed';
  const loadedEmbed = await loadBlock(embed);
  block.append(loadedEmbed);
  const carousel = await populateCarousel(links);
  if (carousel) {
    carousel.classList.add('slides-per-view-4');
    carousel.classList.add('aspect-ratio-rectangle');
    block.append(carousel);
  }

  // for each carousel-slide, on click, replace the embed block with the video
  const carouselSlides = carousel.querySelectorAll('.carousel-slide');
  carouselSlides.forEach((slide) => {
    const a = slide.querySelector('a');
    if (a) {
      a.addEventListener('click', async (event) => {
        event.preventDefault();
        const link = a.href;
        const anchor = createTag('a', { href: link });
        const videoBlock = buildBlock('embed', { elems: [anchor.cloneNode(true)] });
        videoBlock.dataset.blockName = 'embed';
        const clickedVideo = await loadBlock(videoBlock);
        block.querySelector('.embed').replaceWith(clickedVideo);
      });
    }
  });
}
