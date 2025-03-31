document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const userImage = document.getElementById('userImage');
    const frameImage = document.getElementById('frameImage');
    const imageContainer = document.getElementById('imageContainer');
    const framesScroll = document.getElementById('framesScroll');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Frame options
    const frameOptions = [
        'frames/frame1.png',
        'frames/frame2.png',
        'frames/frame3.png'
    ];

    // Variables for transformations
    let initialScale = 1;
    let currentScale = 1;
    let initialDistance = 0;
    let posX = 0;
    let posY = 0;
    let initialX = 0;
    let initialY = 0;
    let isDragging = false;
    let keyPressInterval;

    // Initialize frame options
    function initFrames() {
        frameOptions.forEach((frame, index) => {
            const frameOption = document.createElement('img');
            frameOption.src = frame;
            frameOption.classList.add('frame-option');
            frameOption.dataset.index = index;
            
            if (index === 0) {
                frameOption.classList.add('active');
            }
            
            frameOption.addEventListener('click', function() {
                document.querySelectorAll('.frame-option').forEach(f => {
                    f.classList.remove('active');
                });
                this.classList.add('active');
                frameImage.src = this.src;
            });
            
            framesScroll.appendChild(frameOption);
        });
    }

    // Show loading indicator
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // Hide loading indicator
    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }

    // Reset image position and scale
    function resetImagePosition() {
        posX = 0;
        posY = 0;
        currentScale = 1;
        updateImageTransform();
    }

    // Update image transform
    function updateImageTransform() {
        userImage.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
    }

    // Handle touch start
    function handleTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            isDragging = true;
            initialX = e.touches[0].clientX - posX;
            initialY = e.touches[0].clientY - posY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialDistance = getDistance(
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            );
            initialScale = currentScale;
        }
    }

    // Handle touch move
    function handleTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging) {
            posX = e.touches[0].clientX - initialX;
            posY = e.touches[0].clientY - initialY;
            updateImageTransform();
        } else if (e.touches.length === 2) {
            isDragging = false;
            const currentDistance = getDistance(
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            );
            
            if (initialDistance !== 0) {
                currentScale = initialScale * (currentDistance / initialDistance);
                currentScale = Math.max(0.5, Math.min(currentScale, 3));
                updateImageTransform();
            }
        }
    }

    // Handle touch end
    function handleTouchEnd() {
        initialDistance = 0;
        isDragging = false;
    }

    // Calculate distance between two points
    function getDistance(x1, y1, x2, y2) {
       
