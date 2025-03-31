document.addEventListener('DOMContentLoaded', function() {
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
            if (cropper) {
                cropper.destroy();
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedPhoto.src = event.target.result;
                
                cropper = new Cropper(uploadedPhoto, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                    responsive: true
                });
                
                cropBtn.disabled = false;
                downloadBtn.disabled = true;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Crop button
    cropBtn.addEventListener('click', function() {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 1080,
                height: 1080,
                minWidth: 256,
                minHeight: 256,
                fillColor: '#fff',
                imageSmoothingQuality: 'high',
            });
            
            currentImageUrl = canvas.toDataURL('image/png');
            uploadedPhoto.src = currentImageUrl;
            cropper.destroy();
            cropper = null;
            downloadBtn.disabled = false;
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (currentImageUrl) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1080;
            canvas.height = 1920;
            
            const frameImg = new Image();
            const photoImg = new Image();
            
            frameImg.onload = function() {
                ctx.drawImage(frameImg, 0, 0, 1080, 1920);
                
                photoImg.onload = function() {
                    // Adjust these values to position the photo in your frame
                    const photoX = 270;
                    const photoY = 480;
                    const photoWidth = 540;
                    const photoHeight = 540;
                    
                    ctx.drawImage(photoImg, photoX, photoY, photoWidth, photoHeight);
                    
                    const link = document.createElement('a');
                    link.download = 'whatsapp-status.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                };
                photoImg.src = currentImageUrl;
            };
            frameImg.src = selectedFrame.src;
        }
    });
});
