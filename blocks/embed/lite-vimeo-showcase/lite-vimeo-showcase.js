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

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    this.style.backgroundImage = `url("https://i.vimeocdn.com/video/890210899-6233116ba7d36ab8ec2f147081aaf6e315c622e3fe012df7e2e7289b45d6bb4d-d_${width}x${height}")`;
    if (showcaseUrl) {
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
      this.addEventListener('click', () => this.loadIframe(showcaseUrl));
    }
  }

  loadIframe(showcaseUrl) {
    if (this.classList.contains('ltv-activated')) return;
    this.classList.add('ltv-activated');
    const iframeEl = document.createElement('iframe');
    iframeEl.width = "100%";
    iframeEl.height = "100%";
    iframeEl.title = this.playLabel;
    iframeEl.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframeEl.src = `${showcaseUrl}?autoplay=1`;
    iframeEl.allowFullscreen = true;
    this.shadowRoot.append(iframeEl);
    iframeEl.addEventListener('load', iframeEl.focus, { once: true });

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => this.initializePlayer();
    document.head.appendChild(script);
  }

  initializePlayer() {
    const iframe = this.shadowRoot.querySelector('iframe');
    if (iframe) {
      const player = new Vimeo.Player(iframe);

      player.on('loaded', () => {
        player.getVideoId().then((videoId) => {
          fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
            .then((response) => response.json())
            .then((data) => {
              console.log('Video Metadata:', data);
              // You can use the metadata as needed
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