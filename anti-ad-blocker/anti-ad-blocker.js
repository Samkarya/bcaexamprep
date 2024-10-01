(function() {
    const n = document,
          o = n.head;
    const adMessage = document.getElementById('adblock-message');
    const secMessage = document.getElementById('secondary-message');
    const widget_anti_ad = document.getElementbyId('ad-blocker-blocker');

    var t = "pointer-events: none; height: 1px; width: 0; opacity: 0; visibility: hidden; position: fixed; bottom: 0;";
    const a = n.createElement("div"),
          s = n.createElement("div"),
          d = n.createElement("ins");

    a.id = "div-gpt-ad-3061307416813-0";
    a.style = t;
    s.className = "textads banner-ads banner_ads ad-unit ad-zone ad-space adsbox ads";
    s.style = t;
    d.className = "adsbygoogle";
    d.style = "display: none;";

    const i = { allowed: null, elements: [a, s, d] };

    this.checkAdsStatus = function(t) {
        const e = n.body;
        if (typeof t === "function") {
            if (typeof i.allowed === "boolean") {
                t(i);
            } else {
                e.appendChild(a);
                e.appendChild(s);
                e.appendChild(d);
                setTimeout(function() {
                    if (a.offsetHeight === 0 || s.offsetHeight === 0 || d.firstElementChild) {
                        i.allowed = false;
                        t(i);
                    } else {
                        const e = n.createElement("script");
                        e.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
                        e.async = true;
                        e.crossOrigin = "anonymous";
                        e.onload = function() { i.allowed = true; t(i); };
                        e.onerror = function() { i.allowed = false; t(i); };
                        o.appendChild(e);
                    }
                    a.remove();
                    s.remove();
                    d.remove();
                }, 40);
            }
        }
    };

    function antiAdBlockerHandler() {
        if (sessionStorage.getItem('adblockDismissed') === 'true') {
            return; 
        }
        
        window.checkAdsStatus(function(ads) {
            if (!ads.allowed) {
                 widget_anti_ad.style.display = 'block';
                adMessage.classList.add('show');
            } else {
                console.log("%c[ADS]", "color:#43a047;", "Allowed");
            }
        });
        document.removeEventListener("DOMContentLoaded", antiAdBlockerHandler);
    }

    if (document.readyState === "complete" || document.readyState !== "loading") {
        antiAdBlockerHandler();
    } else {
        document.addEventListener("DOMContentLoaded", antiAdBlockerHandler);
    }

    window.closeAdblockMessage = function() {
        adMessage.classList.remove('show');
        secMessage.classList.add('show');
    }

    window.checkAgain = function() {
        location.reload();
    }

    window.closeAllMessages = function() {
        adMessage.classList.remove('show');
        secMessage.classList.remove('show');
        widget_anti_ad.style.display = 'none';
        sessionStorage.setItem('adblockDismissed', 'true');
    }
}).call(this);
