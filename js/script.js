document.addEventListener('DOMContentLoaded', function() {
    const photoUpload = document.getElementById('photoUpload');
    const downloadBtn = document.getElementById('downloadBtn');
    const userPhoto = document.getElementById('userPhoto');
    const selectedFrame = document.getElementById('selectedFrame');
    const frameOptions = document.querySelectorAll('.frame-option');
    
    // Touch gesture variables
    let scale = 1;
    let posX = 0;
    let posY = 0;
    let lastX = 0;
    let lastY = 0;
    let isDragging = false;
    
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
    
    // Touch event handlers
    userPhoto.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            e.preventDefault();
        }
    });
    
    userPhoto.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - lastX;
            const deltaY = e.touches[0].clientY - lastY;
            
            posX += deltaX;
            posY += deltaY;
            
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            
            updatePhotoTransform();
            e.preventDefault();
        }
        else if (e.touches.length === 2) {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            if (this.lastDistance && currentDistance) {
                scale = Math.max(0.5, Math.min(3, 
                    scale * (currentDistance / this.lastDistance)
                );
                updatePhotoTransform();
            }
            
            this.lastDistance = currentDistance;
            e.preventDefault();
        }
    });
    
    userPhoto.addEventListener('touchend', function() {
        isDragging = false;
        this.lastDistance = null;
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        const canvas = document.createElement('canvas');
        const container = document.querySelector('.frame-preview-container');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Draw photo
        ctx.save();
        ctx.translate(posX + canvas.width/2, posY + canvas.height/2);
        ctx.scale(scale, scale);
        ctx.drawImage(
            userPhoto, 
            -userPhoto.naturalWidth/2, 
            -userPhoto.naturalHeight/2,
            userPhoto.naturalWidth,
            userPhoto.naturalHeight
        );
        ctx.restore();
        
        // Draw frame
        ctx.drawImage(selectedFrame, 0, 0, canvas.width, canvas.height);
        
        // Trigger download
        const link = document.createElement('a');
        link.download = 'whatsapp-status.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    // Initialize
    resetPhotoPosition();
});
