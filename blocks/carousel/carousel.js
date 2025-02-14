const isDesktop = window.matchMedia('(min-width: 960px)');
let carouselId = 0;
let step = 0;

function observeElementSize(element, callback) {
  if (!element || typeof callback !== 'function') return;
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => callback(entry.contentRect));
  });
  resizeObserver.observe(element);
}

function getSlidesPerView(block) {
  const slidesPerViewRegex = /slides-per-view-(\d+)(?:-(mobile|desktop))?/g;
  let slidesPerView = 1;
  block.classList.value.replace(slidesPerViewRegex, (_, num, device) => {
    if ((device === 'desktop' && isDesktop.matches)
      || (device === 'mobile' && !isDesktop.matches)
      || !device) {
      slidesPerView = parseInt(num, 10);
    }
  });
  return slidesPerView;
}

function updateNavButtons(block, slideIndex, slidesCount) {
  const slideNext = block.querySelector('.slide-next');
  const slidePrev = block.querySelector('.slide-prev');
  slideNext.toggleAttribute('disabled', slideIndex + getSlidesPerView(block) === slidesCount);
  slidePrev.toggleAttribute('disabled', slideIndex === 0);
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });
  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
  updateNavButtons(block, slideIndex, slides.length);
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  step = slides[0].getBoundingClientRect().width;
  const realSlideIndex = slideIndex < 0 ? 0 : slideIndex;
  if (realSlideIndex + getSlidesPerView(block) > slides.length) return;
  const activeSlide = slides[realSlideIndex];
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  const slider = block.querySelector('.carousel-slides');
  block.dataset.activeSlide = realSlideIndex;
  slider.style.left = `${-realSlideIndex * step}px`;
  updateActiveSlide(activeSlide);
}

function bindArrows(block) {
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });
}

function bindIndicators(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;
  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });
}

function createSlide(row, slideIndex, cId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${cId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');
  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });
  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }
  return slide;
}

function createSlideIndicators(slideIndicators, rows, block) {
  Array.from({ length: (rows.length - getSlidesPerView(block) + 1) }).forEach((v, i) => {
    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = i;
      indicator.innerHTML = `<button type="button" aria-label="${'Show Slide'} ${i} of ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
  });
}

function handleDisplayArrows(block) {
  const slidesCount = block.querySelectorAll('.carousel-slide').length;
  const slidesPerView = getSlidesPerView(block);
  block.setAttribute('data-arrows', slidesCount > slidesPerView);
}

export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.setAttribute('data-slides-per-view', getSlidesPerView(block));
  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);
  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="Previous Slide">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="33" viewBox="0 0 21 33" fill="none">
          <path d="M1.33687 18.4414C0.221046 17.3676 0.221046 15.6238 1.33687 14.55L15.6194 0.805351C16.7352 -0.268448 18.5473 -0.268448 19.6631 0.805351C20.779 1.87915 20.779 3.623 19.6631 4.6968L7.39802 16.5L19.6542 28.3032C20.77 29.377 20.77 31.1209 19.6542 32.1947C18.5384 33.2684 16.7263 33.2684 15.6105 32.1947L1.32794 18.45L1.33687 18.4414Z" fill="#2B4361"/>
        </svg>
      </button>
      <button type="button" class="slide-next" aria-label="Next Slide">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="33" viewBox="0 0 21 33" fill="none">
          <path d="M19.6631 14.5586C20.779 15.6324 20.779 17.3762 19.6631 18.45L5.38061 32.1946C4.26479 33.2684 2.45269 33.2684 1.33687 32.1946C0.22105 31.1208 0.22105 29.377 1.33687 28.3032L13.602 16.5L1.34579 4.6968C0.229972 3.623 0.229971 1.87915 1.34579 0.805349C2.46162 -0.26845 4.27371 -0.26845 5.38953 0.805349L19.6721 14.55L19.6631 14.5586Z" fill="#2B4361"/>
        </svg>
      </button>
    `;
    block.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);
    row.remove();
  });
  handleDisplayArrows(block);
  createSlideIndicators(slideIndicators, rows, block);
  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    const slides = block.querySelectorAll('.carousel-slide');
    bindArrows(block);
    bindIndicators(block);
    showSlide(block, 0);
    isDesktop.addEventListener('change', () => {
      block.setAttribute('data-slides-per-view', getSlidesPerView(block));
      slideIndicators.innerHTML = '';
      createSlideIndicators(slideIndicators, rows, block);
      showSlide(block, 0);
      handleDisplayArrows(block);
      bindIndicators(block);
    });
    observeElementSize(block, () => {
      step = slides[0].getBoundingClientRect().width;
      slidesWrapper.style.left = `${-block.dataset.activeSlide * step}px`;
      const slideImage = slides[0].querySelector('picture');
      const buttons = block.querySelector('.carousel-navigation-buttons');
      const buttonHeight = buttons.getBoundingClientRect().height / 2;
      buttons.style.top = `${(slideImage.getBoundingClientRect().height / 2) - buttonHeight}px`;
    });
  }
}
