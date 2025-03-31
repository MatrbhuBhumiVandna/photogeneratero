// Update the frame initialization code to this:

function initFrames() {
    framesScroll.innerHTML = ''; // Clear existing frames
    
    frameOptions.forEach((frame, index) => {
        const frameOption = document.createElement('img');
        frameOption.src = frame;
        frameOption.classList.add('frame-option');
        
        // Set first frame as active by default
        if (index === 0) {
            frameOption.classList.add('active');
        }
        
        frameOption.addEventListener('click', function() {
            // Remove active class from all frames
            document.querySelectorAll('.frame-option').forEach(f => {
                f.classList.remove('active');
            });
            
            // Add active class to clicked frame
            this.classList.add('active');
            
            // Change frame
            frameImage.src = this.src;
            showLoading();
            
            // Refresh transparent area detection
            setTimeout(() => {
                detectTransparentAreas(frameImage);
                hideLoading();
            }, 300);
        });
        
        framesScroll.appendChild(frameOption);
    });
}
