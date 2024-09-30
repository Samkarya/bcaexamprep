(function () {
    // Create a new style element
    const style = document.createElement('style');
    style.textContent = `
        .cta-widget-123 {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
        }
        .cta-banner-123 {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
            max-width: 800px;
            position: relative;
        }
        .cta-banner-123 h1 {
            font-size: 36px;
            margin-bottom: 15px;
            letter-spacing: 0.5px;
        }
        .cta-banner-123 p {
            font-size: 18px;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        .cta-button-123 {
            display: inline-block;
            padding: 15px 30px;
            font-size: 20px;
            color: #fff;
            background-color: #ff6b6b;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 0.3s, transform 0.3s;
        }
        .cta-button-123:hover {
            background-color: #ff8787;
            transform: translateY(-2px);
        }
        .close-button-123 {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            color: white;
            background: none;
            border: none;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s;
        }
        .close-button-123:hover {
            opacity: 1;
        }
        @media (max-width: 600px) {
            .cta-banner-123 h1 {
                font-size: 28px;
            }
            .cta-banner-123 p {
                font-size: 16px;
            }
            .cta-button-123 {
                font-size: 18px;
                padding: 12px 24px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create the widget HTML structure
    const widget = document.createElement('div');
    widget.classList.add('cta-widget-123');
    widget.innerHTML = `
        <div id="ctaBanner123" class="cta-banner-123">
            <button id="closeButton123" class="close-button-123">&times;</button>
            <h1 id="ctaTitle123">Ready to Level Up Your Skills?</h1>
            <p id="ctaText123">Join thousands of learners transforming their careers with our expert-led courses.</p>
            <a id="ctaButton123" href="#" class="cta-button-123">Start Learning Today</a>
        </div>
    `;
    document.body.appendChild(widget);

    // JavaScript logic to change content dynamically
    const ctaBanner123 = document.getElementById('ctaBanner123');
    const ctaTitle123 = document.getElementById('ctaTitle123');
    const ctaText123 = document.getElementById('ctaText123');
    const ctaButton123 = document.getElementById('ctaButton123');
    const closeButton123 = document.getElementById('closeButton123');

    const ctaTypes123 = [
        {
            title: 'New feature alert! Check out our latest update.',
            text: 'Explore our cutting-edge tools designed to enhance your learning experience.',
            cta: 'Try Now',
            action: '/new-feature'
        },
        {
            title: 'Fresh content added! Explore our new articles.',
            text: 'Dive into our latest articles covering trending topics in your field.',
            cta: 'Read More',
            action: '/blog'
        },
        {
            title: 'Exclusive partner deals just for you!',
            text: 'Take advantage of special offers from our trusted partners.',
            cta: 'View Deals',
            action: '/partners'
        },
        {
            title: 'Sign up now for personalized content!',
            text: 'Get tailored learning recommendations and unlock premium features.',
            cta: 'Sign Up',
            action: '/sign-up'
        }
    ];

    const globalCTA123 = {
        title: 'Welcome to our Learning Platform!',
        text: 'Discover a world of knowledge and boost your skills with our expert-led courses.',
        cta: 'Explore Now',
        action: '/explore'
    };

    const urlSpecificCTAs123 = {
        '/partners': {
            title: 'Exclusive Partner Offers',
            text: 'Access special deals and discounts from our trusted partners.',
            cta: 'Claim Deals',
            action: '/partners-deals'
        },
        '/blog': {
            title: 'New Articles Just Added',
            text: 'Stay ahead of the curve with our latest industry insights and tutorials.',
            cta: 'Read Now',
            action: '/blog-new'
        }
    };

    function updateCTA123(type) {
        ctaTitle123.textContent = type.title;
        ctaText123.textContent = type.text;
        ctaButton123.textContent = type.cta;
        ctaButton123.href = type.action;
    }

    // Automatically change CTA content every 8 seconds
    let ctaIndex123 = 0;
    function cycleCTA123() {
        ctaIndex123 = (ctaIndex123 + 1) % ctaTypes123.length;
        updateCTA123(ctaTypes123[ctaIndex123]);
    }
    const cycleInterval123 = setInterval(cycleCTA123, 8000); // Changes every 8 seconds

    // Check URL and display specific CTA
    const currentPath123 = window.location.pathname;
    if (urlSpecificCTAs123[currentPath123]) {
        updateCTA123(urlSpecificCTAs123[currentPath123]);
    } else {
        updateCTA123(globalCTA123);
    }

    // Close button functionality
    closeButton123.addEventListener('click', () => {
        ctaBanner123.style.display = 'none';
        clearInterval(cycleInterval123); // Stop cycling when banner is closed
    });
})();
