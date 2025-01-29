class LiteVimeoShowcase extends HTMLElement {
  static get observedAttributes() {
    return ['showcase-url'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'showcase-url' && oldValue !== newValue) {
      this.loadIframe(newValue);
    }
  }

  connectedCallback() {
    const showcaseUrl = this.getAttribute('showcase-url');
    if (showcaseUrl) {
      this.loadIframe(showcaseUrl);
    }
  }

  loadIframe(showcaseUrl) {
    this.shadowRoot.innerHTML = `
      <style>
        iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
      </style>
      <iframe src="${showcaseUrl}" allowfullscreen frameborder="0" title="Vimeo Showcase"></iframe>
    `;

    // Load the Vimeo Player API script
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
        player.getVideoId().then(videoId => {
          fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`)
            .then(response => response.json())
            .then(data => {
              console.log('Video Metadata:', data);
              // You can use the metadata as needed
            });
        });
      });
    }
  }
}

customElements.define('lite-vimeo-showcase', LiteVimeoShowcase);