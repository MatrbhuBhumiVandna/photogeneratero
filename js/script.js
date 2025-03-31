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
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Handle keyboard controls
    function handleKeyDown(e) {
        if (userImage.src.includes('default-user.png')) return;
        
        clearInterval(keyPressInterval);
        const moveStep = 10;
        const scaleStep = 0.1;
        
        switch(e.key) {
            case 'ArrowUp': posY += moveStep; break;
            case 'ArrowDown': posY -= moveStep; break;
            case 'ArrowLeft': posX += moveStep; break;
            case 'ArrowRight': posX -= moveStep; break;
            case '+':
            case '=': currentScale = Math.min(3, currentScale + scaleStep); break;
            case '-':
            case '_': currentScale = Math.max(0.5, currentScale - scaleStep); break;
            default: return;
        }
        
        updateImageTransform();
        
        keyPressInterval = setInterval(() => {
            switch(e.key) {
                case 'ArrowUp': posY += moveStep; break;
                case 'ArrowDown': posY -= moveStep; break;
                case 'ArrowLeft': posX += moveStep; break;
                case 'ArrowRight': posX -= moveStep; break;
            }
            updateImageTransform();
        }, 100);
    }

    // Initialize the app
    function init() {
        initFrames();
        
        // Event listeners
        uploadBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                showLoading();
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    userImage.src = event.target.result;
                    resetImagePosition();
                    setTimeout(hideLoading, 500); // Hide after processing
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        downloadBtn.addEventListener('click', function() {
            showLoading();
            
            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 1080;
                canvas.height = 1920;
                const ctx = canvas.getContext('2d');
                
                const userImg = new Image();
                const frameImg = new Image();
                
                userImg.src = userImage.src;
                frameImg.src = frameImage.src;
                
                Promise.all([
                    new Promise((resolve) => { userImg.onload = resolve; }),
                    new Promise((resolve) => { frameImg.onload = resolve; })
                ]).then(() => {
                    ctx.save();
                    const transform = window.getComputedStyle(userImage).transform;
                    const matrix = transform !== 'none' ? 
                        transform.match(/^matrix\((.+)\)$/)[1].split(/, /).map(Number) : 
                        [1, 0, 0, 1, 0, 0];
                    
                    ctx.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4] + 540, matrix[5] + 960);
                    ctx.drawImage(userImg, -userImg.width/2, -userImg.height/2, userImg.width, userImg.height);
                    ctx.restore();
                    
                    ctx.drawImage(frameImg, 0, 0, 1080, 1920);
                    
                    const link = document.createElement('a');
                    link.download = 'whatsapp-status.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    hideLoading();
                });
            }, 300);
        });
        
        // Touch events
        imageContainer.addEventListener('touchstart', function(e) {
            document.body.classList.add('no-scroll');
            handleTouchStart(e);
        }, { passive: false });
        
        imageContainer.addEventListener('touchmove', function(e) {
            handleTouchMove(e);
        }, { passive: false });
        
        imageContainer.addEventListener('touchend', function() {
            document.body.classList.remove('no-scroll');
            handleTouchEnd();
        });
        
        // Keyboard events
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', () => clearInterval(keyPressInterval));
    }

    init();
});
