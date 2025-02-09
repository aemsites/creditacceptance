import { buildBlock, loadBlock, loadCSS } from '../../scripts/aem.js';

async function populateCarousel(videoLinks) {
  const cells = [];
  const promises = Array.from(videoLinks).map((link, index) => fetch(`https://vimeo.com/api/oembed.json?url=${link.href}`)
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
      a.href = `#${metadata.video_id}`;
      a.textContent = 'Watch Video';
      cell.append(a);
      cells[index] = [cell];
    })
    .catch((error) => {
      console.error(error);
    }));

  await Promise.all(promises);
  console.log(cells);
  const carousel = buildBlock('carousel', cells);
  console.log(carousel);
  carousel.dataset.blockName = 'carousel';
  return loadBlock(carousel);
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/embed/embed.css`);
  block.classList.add('showcase-video');
  const links = block.querySelectorAll('a');
  block.innerHTML = '';
  const firstVideo = links[0].cloneNode(true);
  const embed = buildBlock('embed', { elems: [firstVideo] });
  embed.dataset.blockName = 'embed';
  const loadedEmbed = await loadBlock(embed);
  block.append(loadedEmbed);
  const carousel = await populateCarousel(links);
  carousel.classList.add('slides-per-view-4');
  carousel.classList.add('aspect-ratio-rectangle');
  block.append(carousel);
}
