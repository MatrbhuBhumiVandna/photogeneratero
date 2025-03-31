document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const fileInput = document.getElementById('photoUpload');
    const uploadBtn = document.getElementById('uploadBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const userPhoto = document.getElementById('userPhoto');
    const frame = document.getElementById('frame');
    const frameContainer = document.getElementById('frameContainer');
    const framesContainer = document.getElementById('frames');
    const frameCanvas = document.getElementById('frameCanvas');
    const ctx = frameCanvas.getContext('2d');
    
    // Touch variables
    let initialScale = 1;
    let currentScale = 1;
    let initialDistance = 0;
    let posX = 0;
    let posY = 0;
    let initialX = 0;
    let initialY = 0;
    let isDragging = false;
    let isPinching = false;
    let currentFrame = 'frames/frame1.png';
    let transparentAreas = [];
    
    // Frame options
    const frameOptions = [
        'frames/frame1.png',
        'frames/frame2.png',
        'frames/frame3.png'
    ];
    
    // Initialize the editor
    function init() {
        setupFrameSelection();
        loadFrame(currentFrame);
        setupEventListeners();
    }
    
    // Set up frame selection
    function setupFrameSelection() {
        frameOptions.forEach((framePath, index) => {
            const frameOption = document.createElement('img');
            frameOption.src = framePath;
            frameOption.classList.add('frame-thumbnail');
            if (index === 0) frameOption.classList.add('active');
            
            frameOption.addEventListener('click', function() {
                document.querySelectorAll('.frame-thumbnail').forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                currentFrame = framePath;
                loadFrame(framePath);
                resetImagePosition();
            });
            
            framesContainer.appendChild(frameOption);
        });
    }
    
    // Load frame and detect transparent areas
    function loadFrame(framePath) {
        const frameImg = new Image();
        frameImg.crossOrigin = 'Anonymous';
        frameImg.onload = function() {
            // Set canvas size
            frameCanvas.width = frameImg.width;
            frameCanvas.height = frameImg.height;
            
            // Draw frame to canvas
            ctx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
            ctx.drawImage(frameImg, 0, 0);
            
            // Detect transparent areas
            detectTransparentAreas(frameImg);
            
            // Update the visible frame
            frame.src = framePath;
        };
        frameImg.src = framePath;
    }
    
    // Detect transparent areas in the frame
    function detectTransparentAreas(frameImg) {
        transparentAreas = [];
        const imageData = ctx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
        const data = imageData.data;
        
        // Sample every 10th pixel for performance
        for (let y = 0; y < frameCanvas.height; y += 10) {
            for (let x = 0; x < frameCanvas.width; x += 10) {
                const index = (y * frameCanvas.width + x) * 4;
                const alpha = data[index + 3];
                
                if (alpha < 128) { // Semi-transparent or fully transparent
                    transparentAreas.push({
                        x: x / frameCanvas.width, // Normalized coordinates (0-1)
                        y: y / frameCanvas.height,
                        width: 10 / frameCanvas.width,
                        height: 10 / frameCanvas.height
                    });
                }
            }
        }
    }
    
    // Check if touch is in a transparent area
    function isInTransparentArea(touchX, touchY) {
        // Convert touch coordinates to normalized coordinates (0-1)
        const rect = frameContainer.getBoundingClientRect();
        const normalizedX = (touchX - rect.left) / rect.width;
        const normalizedY = (touchY - rect.top) / rect.height;
        
        // Check if the touch is in any transparent area
        return transparentAreas.some(area => 
            normalizedX >= area.x && 
            normalizedX <= area.x + area.width &&
            normalizedY >= area.y && 
            normalizedY <= area.y + area.height
        );
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
        userPhoto.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Upload button
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // File input
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    userPhoto.src = event.target.result;
                    resetImagePosition();
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        // Download button
        downloadBtn.addEventListener('click', function() {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext('2d');
            
            // Draw user photo
            const userImg = new Image();
            userImg.src = userPhoto.src;
            
            // Draw frame
            const frameImg = new Image();
            frameImg.src = frame.src;
            
            Promise.all([
                new Promise((resolve) => { userImg.onload = resolve; }),
                new Promise((resolve) => { frameImg.onload = resolve; })
            ]).then(() => {
                // Draw user image with transformations
                ctx.save();
                const transform = window.getComputedStyle(userPhoto).transform;
                const matrix = transform !== 'none' ? 
                    transform.match(/^matrix\((.+)\)$/)[1].split(/, /).map(Number) : 
                    [1, 0, 0, 1, 0, 0];
                
                // Adjust for canvas size
                const scaleX = canvas.width / frameContainer.offsetWidth;
                const scaleY = canvas.height / frameContainer.offsetHeight;
                
                ctx.setTransform(
                    matrix[0] * scaleX, 
                    matrix[1] * scaleY, 
                    matrix[2] * scaleX, 
                    matrix[3] * scaleY, 
                    matrix[4] * scaleX + canvas.width/2, 
                    matrix[5] * scaleY + canvas.height/2
                );
                
                ctx.drawImage(
                    userImg, 
                    -userImg.width/2, 
                    -userImg.height/2, 
                    userImg.width, 
                    userImg.height
                );
                ctx.restore();
                
                // Draw frame
                ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
                
                // Download
                const link = document.createElement('a');
                link.download = 'framed-photo.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
        
        // Touch events
        frameContainer.addEventListener('touchstart', function(e) {
            const touch = e.touches[0];
            if (!isInTransparentArea(touch.clientX, touch.clientY)) return;
            
            e.preventDefault();
            
            if (e.touches.length === 1) {
                isDragging = true;
                initialX = touch.clientX - posX;
                initialY = touch.clientY - posY;
            } else if (e.touches.length === 2) {
                isPinching = true;
                initialDistance = getDistance(
                    e.touches[0].clientX, e.touches[0].clientY,
                    e.touches[1].clientX, e.touches[1].clientY
                );
                initialScale = currentScale;
            }
        }, { passive: false });
        
        frameContainer.addEventListener('touchmove', function(e) {
            const touch = e.touches[0];
            if ((!isDragging && !isPinching) || 
                (e.touches.length === 1 && !isInTransparentArea(touch.clientX, touch.clientY))) {
                return;
            }
            
            e.preventDefault();
            
            if (isDragging && e.touches.length === 1) {
                posX = e.touches[0].clientX - initialX;
                posY = e.touches[0].clientY - initialY;
                updateImageTransform();
            } else if (isPinching && e.touches.length === 2) {
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
        }, { passive: false });
        
        frameContainer.addEventListener('touchend', function() {
            isDragging = false;
            isPinching = false;
            initialDistance = 0;
        });
    }
    
    // Helper function to calculate distance between two points
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Initialize the editor
    init();
});
