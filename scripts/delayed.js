// delay loading of GTM script until after the page has loaded

const GTM_SCRIPT = `
  window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}
  gtag('set', 'linker', {"domains":["www.famous-smoke.com"]} );
  gtag("js", new Date());
  gtag("set", "developer_id.dZTNiMT", true);
  gtag("config", "GT-PHR6L87");
`;

function loadGTM() {
    const tag = document.createElement('script');
    tag.type = 'text/javascript';
    tag.async = true;
    tag.id = 'google-gtagjs-js';
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=GT-PHR6L87';
    document.querySelector('head').append(tag);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'google_gtagjs-js-after';
    script.innerHTML = GTM_SCRIPT;
    tag.insertAdjacentElement('afterend', script);
}

if (window.location.hostname !== 'localhost') {
    loadGTM();
}