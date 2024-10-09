let currentIndex = 0;
        let startX = 0;
        let isDragging = false;
        let autoSwitchInterval = 5000; // 5 seconds
        let autoSwitchTimer;
        let progressBar;
        let pauseAnimation = false;

        const carouselContainer = document.querySelector('.carousel-container');
        const prevButton = document.querySelector('.nav-button.prev');
        const nextButton = document.querySelector('.nav-button.next');
        progressBar = document.querySelector('.progress');

        function createItemCards() {
            items.forEach(item => {
                const itemCard = document.createElement('a');
                itemCard.href = item.url;
                itemCard.className = `item-card ${item.category}`;
                itemCard.innerHTML = `
                    <img src="${item.icon}" alt="${item.title} icon" class="item-icon">
                    <div class="item-info">
                        <div class="item-category">${item.category}</div>
                        <h2 class="item-title">${item.title}</h2>
                        <p class="item-cta">Click to explore!</p>
                    </div>
                `;
                carouselContainer.appendChild(itemCard);
            });
        }

        function updateCarouselPosition() {
            const itemWidth = carouselContainer.children[0].clientWidth;
            carouselContainer.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            resetProgressBar();
        }

        function resetProgressBar() {
            if (pauseAnimation) return;
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.transition = `width ${autoSwitchInterval}ms linear`;
                progressBar.style.width = '100%';
            }, 10);
        }

        function prevItem() {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
            updateCarouselPosition();
        }

        function nextItem() {
            currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
            updateCarouselPosition();
        }

        function startAutoSwitch() {
            clearInterval(autoSwitchTimer);
            autoSwitchTimer = setInterval(() => {
                if (!pauseAnimation) nextItem();
            }, autoSwitchInterval);
            resetProgressBar();
        }

        function stopAutoSwitch() {
            clearInterval(autoSwitchTimer);
        }

        function stopAnimationTemporarily() {
            pauseAnimation = true;
            setTimeout(() => {
                pauseAnimation = false;
                startAutoSwitch();
            }, 10000); // Pause for 10 seconds
        }

        prevButton.addEventListener('click', () => {
            prevItem();
            stopAnimationTemporarily();
        });

        nextButton.addEventListener('click', () => {
            nextItem();
            stopAnimationTemporarily();
        });

        createItemCards();
        updateCarouselPosition();
        startAutoSwitch();
