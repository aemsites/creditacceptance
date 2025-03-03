/* eslint-disable  */
class LiteVimeoShowcase extends HTMLElement {
  static _warmConnections() {
    if (LiteVimeoShowcase.preconnected) return;
    LiteVimeoShowcase.preconnected = true;

    // The iframe document and most of its subresources come right off player.vimeo.com
    addPrefetch('preconnect', 'https://player.vimeo.com');
    // Images
    addPrefetch('preconnect', 'https://i.vimeocdn.com');
    // Files .js, .css
    addPrefetch('preconnect', 'https://f.vimeocdn.com');
    // Metrics
    // addPrefetch('preconnect', 'https://fresnel.vimeocdn.com');
  }

  static get observedAttributes() {
    return ['showcase-url'];
  }

  connectedCallback() {
    /**
     * Lo, the vimeo placeholder image!  (aka the thumbnail, poster image, etc)
     * We have to use the Vimeo API.
     */
    let { width, height } = getThumbnailDimensions(this.getBoundingClientRect());
    let devicePixelRatio = window.devicePixelRatio || 1;
    if (devicePixelRatio >= 2) devicePixelRatio *= .75;
    width = Math.round(width * devicePixelRatio);
    height = Math.round(height * devicePixelRatio);

    const showcaseUrl = this.getAttribute('showcase-url');
    const imageUrl = this.getAttribute('image-url');
    if (!imageUrl || imageUrl === 'undefined') {
      this.loadIframe(showcaseUrl, 0);
      return;
    }
    this.style.backgroundImage = `url("${imageUrl}_${width}x${height}")`;
    if (showcaseUrl) {
      const h3 = document.createElement('h3');
      h3.classList.add('video-title');
      const p = document.createElement('p');
      p.classList.add('video-description');
      this.parentElement.append(h3);
      this.parentElement.append(p);
      let playBtnEl = this.querySelector('.ltv-playbtn');
      // A label for the button takes priority over a [playlabel] attribute on the custom-element
      this.playLabel = (playBtnEl && playBtnEl.textContent.trim()) || this.getAttribute('playlabel') || 'Play video';

      if (!playBtnEl) {
        playBtnEl = document.createElement('button');
        playBtnEl.type = 'button';
        playBtnEl.setAttribute('aria-label', this.playLabel);
        playBtnEl.classList.add('ltv-playbtn');
        this.append(playBtnEl);
      }
      playBtnEl.removeAttribute('href');

      // On hover (or tap), warm up the TCP connections we're (likely) about to use.
      this.addEventListener('pointerover', LiteVimeoShowcase._warmConnections, {
        once: true,
      });
      //this.loadIframe(showcaseUrl);

      // Once the user clicks, add the real iframe and drop our play button
      // TODO: In the future we could be like amp-youtube and silently swap in the iframe during idle time
      //   We'd want to only do this for in-viewport or near-viewport ones: https://github.com/ampproject/amphtml/pull/5003
      this.addEventListener('click', () => {
        this.loadIframe(showcaseUrl, 1);
      });

      // Load the iframe after 3 seconds if not clicked
      setTimeout(() => {
        if (!this.classList.contains('ltv-activated')) {
          this.loadIframe(showcaseUrl, 0);
        }
      }, 3000);
    }
  }

  loadIframe(showcaseUrl, autoplay) {
    if (this.classList.contains('ltv-activated')) return;
    this.classList.add('ltv-activated');
    const iframeEl = document.createElement('iframe');
    iframeEl.width = "100%";
    iframeEl.height = "100%";
    iframeEl.title = this.playLabel;
    iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframeEl.src = `${showcaseUrl}?autoplay=${autoplay}`;
    iframeEl.allowFullscreen = true;
    this.prepend(iframeEl);
    iframeEl.addEventListener('load', iframeEl.focus, { once: true });

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => this.initializePlayer();
    document.head.appendChild(script);
  }

  initializePlayer() {
    const iframe = this.querySelector('iframe');
    if (iframe) {
      const player = new Vimeo.Player(iframe);

      player.on('loaded', () => {
        player.getVideoId().then((videoId) => {
          fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
            .then((response) => response.json())
            .then((data) => {
                const existingh3 = this.parentElement.querySelector('h3');
                const existingP = this.parentElement.querySelector('p');
                if (existingh3) existingh3.remove();
                if (existingP) existingP.remove();
                const h3 = document.createElement('h3');
                h3.innerHTML = data.title;
                this.parentElement.append(h3);
                h3.classList.add('video-title');
                const p = document.createElement('p');
                p.innerHTML = data.description;
                p.classList.add('video-description');
                this.parentElement.append(p);
            });
        });
      });
    }
  }
}

customElements.define('lite-vimeo-showcase', LiteVimeoShowcase);

/**
 * Add a <link rel={preload | preconnect} ...> to the head
 */
function addPrefetch(kind, url, as) {
  const linkElem = document.createElement('link');
  linkElem.rel = kind;
  linkElem.href = url;
  if (as) {
    linkElem.as = as;
  }
  linkElem.crossorigin = true;
  document.head.append(linkElem);
}

/**
 * Get the thumbnail dimensions to use for a given player size.
 *
 * @param {Object} options
 * @param {number} options.width The width of the player
 * @param {number} options.height The height of the player
 * @return {Object} The width and height
 */
function getThumbnailDimensions({ width, height }) {
  let roundedWidth = width;
  let roundedHeight = height;

  // If the original width is a multiple of 320 then we should
  // not round up. This is to keep the native image dimensions
  // so that they match up with the actual frames from the video.
  //
  // For example 640x360, 960x540, 1280x720, 1920x1080
  //
  // Round up to nearest 100 px to improve cacheability at the
  // CDN. For example, any width between 601 pixels and 699
  // pixels will render the thumbnail at 700 pixels width.
  if (roundedWidth % 320 !== 0) {
    roundedWidth = Math.ceil(width / 100) * 100;
    roundedHeight = Math.round((roundedWidth / width) * height);
  }

  return {
    width: roundedWidth,
    height: roundedHeight
  };
}