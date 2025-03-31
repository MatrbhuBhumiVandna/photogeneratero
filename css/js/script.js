document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const photoUpload = document.getElementById('photoUpload');
    const cropBtn = document.getElementById('cropBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadedPhoto = document.getElementById('uploadedPhoto');
    const selectedFrame = document.getElementById('selectedFrame');
    const frameOptions = document.querySelectorAll('.frame-option');
    
    let cropper;
    let currentImageUrl = null;
    
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
            // Destroy previous cropper if exists
            if (cropper) {
                cropper.destroy();
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedPhoto.src = event.target.result;
                
                // Initialize cropper
                cropper = new Cropper(uploadedPhoto, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                    responsive: true,
                    guides: false
                });
                
                // Enable buttons
                cropBtn.disabled = false;
                downloadBtn.disabled = true;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Crop button
    cropBtn.addEventListener('click', function() {
        if (cropper) {
            // Get cropped canvas
            const canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500,
                minWidth: 256,
                minHeight: 256,
                maxWidth: 4096,
                maxHeight: 4096,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });
            
            // Convert canvas to image and update preview
            currentImageUrl = canvas.toDataURL('image/png');
            uploadedPhoto.src = currentImageUrl;
            
            // Destroy cropper
            cropper.destroy();
            cropper = null;
            
            // Enable download button
            downloadBtn.disabled = false;
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (currentImageUrl) {
            // Create a temporary canvas with frame and photo
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const frameImg = new Image();
            const photoImg = new Image();
            
            frameImg.onload = function() {
                canvas.width = frameImg.width;
                canvas.height = frameImg.height;
                
                // Draw frame
                ctx.drawImage(frameImg, 0, 0);
                
                // Draw photo
                photoImg.onload = function() {
                    // Position photo in the frame (adjust these values to match your frame)
                    const photoWidth = frameImg.width * 0.5;
                    const photoHeight = frameImg.height * 0.5;
                    const photoX = frameImg.width * 0.25;
                    const photoY = frameImg.height * 0.2;
                    
                    ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);
                    
                    // Trigger download
                    const link = document.createElement('a');
                    link.download = 'framed-photo.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                };
                photoImg.src = currentImageUrl;
            };
            frameImg.src = selectedFrame.src;
        }
    });
});
