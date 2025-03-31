document.addEventListener('DOMContentLoaded', function() {
    const photoUpload = document.getElementById('photoUpload');
    const downloadBtn = document.getElementById('downloadBtn');
    const userPhoto = document.getElementById('userPhoto');
    const selectedFrame = document.getElementById('selectedFrame');
    const frameOptions = document.querySelectorAll('.frame-option');
    
    // Touch/Mouse gesture variables
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let lastX = 0;
    let lastY = 0;
    let isDragging = false;
    let startDistance = 0;
    
    // Frame selection
    frameOptions.forEach(option => {
        option.addEventListener('click', function() {
            frameOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedFrame.src = this.dataset.frame;
        });
    });
    
    // Photo upload
    photoUpload.addEventListener('change', function(e) {
        if (e.target.files.length) {
            const reader = new FileReader();
            reader.onload = function(event) {
                userPhoto.src = event.target.result;
                resetPhotoPosition();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Reset photo position and scale
    function resetPhotoPosition() {
        scale = 1;
        posX = 0;
        posY = 0;
        updatePhotoTransform();
    }
    
    // Update photo transform style
    function updatePhotoTransform() {
        userPhoto.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }
    
    // Touch/Mouse event handlers
    function handleStart(x, y) {
        isDragging = true;
        lastX = x;
        lastY = y;
    }
    
    function handleMove(x, y) {
        if (isDragging) {
            const deltaX = x - lastX;
            const deltaY = y - lastY;
            
            posX += deltaX;
            posY += deltaY;
            
            lastX = x;
            lastY = y;
            
            updatePhotoTransform();
        }
    }
    
    function handleEnd() {
        isDragging = false;
    }
    
    // Mouse events
    userPhoto.addEventListener('mousedown', function(e) {
        handleStart(e.clientX, e.clientY);
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        handleMove(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', handleEnd);
    
    // Touch events
    userPhoto.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            startDistance = getDistance(
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            );
        }
        e.preventDefault();
    });
    
    userPhoto.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            const currentDistance = getDistance(
                e.touches[0].clientX, e.touches[0].clientY,
                e.touches[1].clientX, e.touches[1].clientY
            );
            
            if (startDistance > 0) {
                scale = Math.max(0.5, Math.min(3, scale * (currentDistance / startDistance)));
                updatePhotoTransform();
            }
            startDistance = currentDistance;
        }
        e.preventDefault();
    });
    
    userPhoto.addEventListener('touchend', function(e) {
        if (e.touches.length === 0) {
            handleEnd();
        }
        startDistance = 0;
    });
    
    function getDistance(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2
