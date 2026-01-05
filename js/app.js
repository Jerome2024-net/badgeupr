/**
 * Badge Generator - UP Le Renouveau
 * JavaScript Application
 */

// DOM Elements
const badgeForm = document.getElementById('badgeForm');
const prenomInput = document.getElementById('prenom');
const nomInput = document.getElementById('nom');
const photoInput = document.getElementById('photo');
const photoUpload = document.getElementById('photoUpload');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const photoPreview = document.getElementById('photoPreview');
const badgeSection = document.getElementById('badgeSection');
const badgePhoto = document.getElementById('badgePhoto');
const badgeName = document.getElementById('badgeName');
const badge = document.getElementById('badge');
const downloadBtn = document.getElementById('downloadBtn');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const newBadgeBtn = document.getElementById('newBadgeBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const formSection = document.querySelector('.form-section');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const badgePhotoZone = document.getElementById('badgePhotoZone');

// Gallery Elements
const galleryPreview = document.getElementById('galleryPreview');
const galleryPreviewScroll = document.getElementById('galleryPreviewScroll');
const galleryPreviewEmpty = document.getElementById('galleryPreviewEmpty');
const badgeCounter = document.getElementById('badgeCounter');
const seeAllBadgesBtn = document.getElementById('seeAllBadgesBtn');
const galleryFull = document.getElementById('galleryFull');
const closeGalleryBtn = document.getElementById('closeGalleryBtn');
const galleryGrid = document.getElementById('galleryGrid');
const galleryEmpty = document.getElementById('galleryEmpty');
const galleryLoading = document.getElementById('galleryLoading');
const galleryBadgeCount = document.getElementById('galleryBadgeCount');
const publishBtn = document.getElementById('publishBtn');

// Store the generated image
let generatedImageBlob = null;
let generatedImageUrl = null;

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = 'dn8ed1doa';
const CLOUDINARY_UPLOAD_PRESET = 'badge_up_renouveau';

// Image adjustment state
let currentScale = 1;
let currentX = 0;
let currentY = 0;
let isDragging = false;
let startX, startY;
let badgePublishedToGallery = false;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    setupImageAdjustment();
    loadGalleryPreview();
}

function setupEventListeners() {
    // Photo upload click handler
    photoUpload.addEventListener('click', (e) => {
        if (e.target !== photoInput) {
            photoInput.click();
        }
    });
    
    // Photo input change handler
    photoInput.addEventListener('change', handlePhotoSelect);
    
    // Form submission
    badgeForm.addEventListener('submit', handleFormSubmit);
    
    // Download button
    downloadBtn.addEventListener('click', handleDownload);
    
    // Share buttons
    shareWhatsApp.addEventListener('click', handleWhatsAppShare);
    shareFacebook.addEventListener('click', handleFacebookShare);
    
    // New badge button
    newBadgeBtn.addEventListener('click', resetForm);
    
    // Publish button
    if (publishBtn) {
        publishBtn.addEventListener('click', handlePublish);
    }

    // Gallery events
    seeAllBadgesBtn.addEventListener('click', openFullGallery);
    closeGalleryBtn.addEventListener('click', closeFullGallery);

    // Drag and drop support
    photoUpload.addEventListener('dragover', handleDragOver);
    photoUpload.addEventListener('dragleave', handleDragLeave);
    photoUpload.addEventListener('drop', handleDrop);
}

// Photo handling
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processPhoto(file);
        // Reset input to allow selecting the same file again
        e.target.value = '';
    }
}

function handleDragOver(e) {
    e.preventDefault();
    photoUpload.style.borderColor = 'var(--primary-color)';
    photoUpload.style.background = 'rgba(26, 95, 42, 0.1)';
}

function handleDragLeave(e) {
    e.preventDefault();
    photoUpload.style.borderColor = '';
    photoUpload.style.background = '';
}

function handleDrop(e) {
    e.preventDefault();
    photoUpload.style.borderColor = '';
    photoUpload.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processPhoto(file);
    }
}

function processPhoto(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide.');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Taille maximale : 10 Mo.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.classList.add('active');
        uploadPlaceholder.style.display = 'none';
        
        // Auto-adjust preview position
        photoPreview.onload = () => {
            if (photoPreview.naturalHeight > photoPreview.naturalWidth) {
                photoPreview.style.objectPosition = 'center 15%';
            } else {
                photoPreview.style.objectPosition = 'center center';
            }
        };
    };
    reader.onerror = () => {
        alert('Erreur lors de la lecture du fichier.');
    };
    reader.readAsDataURL(file);
}

// Form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const prenom = prenomInput.value.trim();
    const nom = nomInput.value.trim();
    const photoSrc = photoPreview.src;
    
    // Validation
    if (!prenom || !nom) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    if (!photoSrc || !photoPreview.classList.contains('active')) {
        alert('Veuillez ajouter une photo.');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Switch views immediately to ensure dimensions are available for calculation
    formSection.style.display = 'none';
    badgeSection.style.display = 'block';

    // Update badge content
    badgeName.textContent = `${prenom} ${nom.toUpperCase()}`;
    badgePhoto.src = photoSrc;
    
    // Reset adjustments
    currentScale = 1;
    currentX = 0;
    currentY = 0;
    updateImageTransform();
    
    // Wait for image to load and adjust position
    await new Promise((resolve) => {
        const adjustAndResolve = () => {
            fitImageToZone();
            resolve();
        };

        if (badgePhoto.complete) {
            adjustAndResolve();
        } else {
            badgePhoto.onload = adjustAndResolve;
        }
    });
    
    // Generate image
    await generateBadgeImage();
    
    // Hide download/share buttons initially
    downloadBtn.style.display = 'none';
    shareWhatsApp.style.display = 'none';
    shareFacebook.style.display = 'none';
    if (publishBtn) publishBtn.style.display = 'block';
    
    // Hide loading
    hideLoading();
    
    // Scroll to badge
    badgeSection.scrollIntoView({ behavior: 'smooth' });
}

// Generate badge image using html2canvas - 1080x1080px HD
async function generateBadgeImage() {
    try {
        // Calculate scale to get 800px output (Optimized for speed)
        const badgeWidth = badge.offsetWidth;
        const targetSize = 800;
        const scale = targetSize / badgeWidth;
        
        const canvas = await html2canvas(badge, {
            scale: scale,
            useCORS: true,
            backgroundColor: null,
            logging: false,
            width: badgeWidth,
            height: badgeWidth // Square format
        });
        
        // Convert to blob and wait for it
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                generatedImageBlob = blob;
                if (generatedImageUrl) {
                    URL.revokeObjectURL(generatedImageUrl);
                }
                generatedImageUrl = URL.createObjectURL(blob);
                resolve(blob);
            }, 'image/jpeg', 0.8);
        });
        
    } catch (error) {
        console.error('Error generating badge:', error);
        alert('Une erreur est survenue lors de la génération du badge.');
        return null;
    }
}

// Download handler
async function handleDownload() {
    if (!generatedImageBlob) {
        await generateBadgeImage();
    }
    
    if (!generatedImageUrl) {
        alert('Impossible de générer le badge. Veuillez réessayer.');
        return;
    }
    
    const prenom = prenomInput.value.trim();
    const nom = nomInput.value.trim();
    const filename = `badge_UP_${prenom}_${nom}.png`.replace(/\s+/g, '_');
    
    // Create download link
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// WhatsApp share handler
async function handleWhatsAppShare() {
    const prenom = prenomInput.value.trim();
    const nom = nomInput.value.trim();
    const message = `🗳️ *Moi ${prenom} ${nom.toUpperCase()}, je maintiens le CAP !*

✅ Je soutiens UP – Le Renouveau pour les élections législatives et communales 2025.

💚 Rejoignez le mouvement !

#UPLeRenouveau #JeMaintiensLeCap #Elections2025 #Benin`;
    
    // Try Web Share API first (mobile)
    if (navigator.canShare && generatedImageBlob) {
        try {
            const file = new File([generatedImageBlob], `badge_UP_${prenom}_${nom}.png`, { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Mon badge UP – Le Renouveau',
                    text: message
                });
                return;
            }
        } catch (error) {
            console.log('Web Share failed, using WhatsApp URL');
        }
    }
    
    // Fallback: Open WhatsApp with message
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message + '\n\n📲 Créez votre badge : ' + window.location.href)}`;
    window.open(whatsappUrl, '_blank');
}

// Facebook share handler
async function handleFacebookShare() {
    const prenom = prenomInput.value.trim();
    const nom = nomInput.value.trim();
    const message = `🗳️ Moi ${prenom} ${nom.toUpperCase()}, je maintiens le CAP !

✅ Je soutiens UP – Le Renouveau pour les élections législatives et communales 2025.

💚 Rejoignez le mouvement !

#UPLeRenouveau #JeMaintiensLeCap #Elections2025`;
    
    // Try Web Share API first (mobile)
    if (navigator.canShare && generatedImageBlob) {
        try {
            const file = new File([generatedImageBlob], `badge_UP_${prenom}_${nom}.png`, { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Mon badge UP – Le Renouveau',
                    text: message
                });
                return;
            }
        } catch (error) {
            console.log('Web Share failed, using Facebook URL');
        }
    }
    
    // Fallback: Open Facebook share dialog
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    
    // Also download the image so user can add it manually
    setTimeout(() => {
        if (confirm('Votre badge a été téléchargé.\\n\\nSur Facebook, cliquez sur "Photo/Vidéo" pour ajouter votre badge à la publication.')) {
            handleDownload();
        }
    }, 500);
}

// Reset form
function resetForm() {
    // Reset form fields
    badgeForm.reset();
    
    // Reset photo preview
    photoPreview.src = '';
    photoPreview.classList.remove('active');
    uploadPlaceholder.style.display = '';
    
    // Reset generated image
    if (generatedImageUrl) {
        URL.revokeObjectURL(generatedImageUrl);
    }
    generatedImageBlob = null;
    generatedImageUrl = null;
    
    // Reset publish state
    badgePublishedToGallery = false;
    
    // Show form, hide badge
    formSection.style.display = '';
    badgeSection.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Loading overlay
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Image Adjustment Logic
let initialPinchDistance = null;
let initialScale = null;

function setupImageAdjustment() {
    // Zoom buttons
    zoomInBtn.addEventListener('click', () => updateZoom(0.1));
    zoomOutBtn.addEventListener('click', () => updateZoom(-0.1));

    // Dragging events for Mouse
    badge.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // Touch events (Drag + Pinch)
    badge.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

function updateZoom(delta) {
    currentScale += delta;
    if (currentScale < 0.1) currentScale = 0.1; // Min zoom
    if (currentScale > 5) currentScale = 5;     // Max zoom
    updateImageTransform();
}

// Mouse Drag
function startDrag(e) {
    // Only allow dragging if we are clicking on the badge area
    // We don't check for specific target because overlays might block it
    
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    badgePhotoZone.style.cursor = 'grabbing';
}

// Touch Handlers
function handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        isDragging = false; // Stop dragging if pinching
        initialPinchDistance = getPinchDistance(e);
        initialScale = currentScale;
    } else if (e.touches.length === 1) {
        // Drag start
        e.preventDefault(); // Prevent scrolling
        isDragging = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 2 && initialPinchDistance) {
        // Pinch move
        e.preventDefault();
        const currentDistance = getPinchDistance(e);
        const scaleDiff = currentDistance / initialPinchDistance;
        currentScale = initialScale * scaleDiff;
        
        // Clamp scale
        if (currentScale < 0.1) currentScale = 0.1;
        if (currentScale > 5) currentScale = 5;
        
        updateImageTransform();
    } else if (e.touches.length === 1 && isDragging) {
        // Drag move
        e.preventDefault();
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        
        currentX = clientX - startX;
        currentY = clientY - startY;
        
        updateImageTransform();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        initialPinchDistance = null;
    }
    if (e.touches.length === 0) {
        isDragging = false;
    }
}

function getPinchDistance(e) {
    return Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
    );
}

function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    currentX = clientX - startX;
    currentY = clientY - startY;
    
    updateImageTransform();
}

function stopDrag() {
    isDragging = false;
    badgePhotoZone.style.cursor = 'move';
}

function updateImageTransform() {
    badgePhoto.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
}

function fitImageToZone() {
    const zoneWidth = badgePhotoZone.offsetWidth;
    const zoneHeight = badgePhotoZone.offsetHeight;
    const imgWidth = badgePhoto.naturalWidth;
    const imgHeight = badgePhoto.naturalHeight;
    
    if (!zoneWidth || !zoneHeight || !imgWidth || !imgHeight) return;
    
    const zoneRatio = zoneWidth / zoneHeight;
    const imgRatio = imgWidth / imgHeight;
    
    if (imgRatio > zoneRatio) {
        // Image is wider than zone: fit height
        badgePhoto.style.height = '100%';
        badgePhoto.style.width = 'auto';
    } else {
        // Image is taller than zone: fit width
        badgePhoto.style.width = '100%';
        badgePhoto.style.height = 'auto';
    }
}

// ==========================================
// API & CLOUDINARY FUNCTIONS
// ==========================================

// Firebase Configuration
const FIREBASE_DB_URL = 'https://up-le-renouveau-default-rtdb.europe-west1.firebasedatabase.app';

// Fetch badges from Firebase (Optimized)
async function fetchBadges(limit = 50) {
    try {
        // Fetch badges with dynamic limit
        const response = await fetch(`${FIREBASE_DB_URL}/badges.json?orderBy="$key"&limitToLast=${limit}`);
        
        if (response.ok) {
            const data = await response.json();
            if (!data) return [];
            
            // Convert object to array and reverse (newest first)
            return Object.keys(data)
                .map(key => ({
                    id: key,
                    ...data[key]
                }))
                .filter(item => item.imageUrl && !item.imageUrl.startsWith('data:')) // Filter out base64 images
                .reverse();
        }
        return [];
    } catch (error) {
        console.error('Error fetching badges:', error);
        return [];
    }
}

// Upload image to Cloudinary
async function uploadToCloudinary(imageDataUrl) {
    try {
        const formData = new FormData();
        
        // Convert base64 to blob
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        
        formData.append('file', blob);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Removed folder parameter to avoid permission issues with unsigned presets
        // formData.append('folder', 'badges_up_renouveau');
        
        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (uploadResponse.ok) {
            const data = await uploadResponse.json();
            console.log('Cloudinary upload success:', data);
            return data.secure_url;
        }
        const errorData = await uploadResponse.json();
        console.error('Cloudinary error:', errorData);
        
        // Check for common errors
        if (errorData.error?.message?.includes('unsigned')) {
            throw new Error('Configuration Cloudinary incorrecte : Le "Upload Preset" doit être en mode "Unsigned".');
        }
        
        throw new Error(errorData.error?.message || 'Upload failed');
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

// Save badge to Firebase
async function saveBadgeToGallery(imageDataUrl, prenom, nom) {
    try {
        // 1. Compress image for storage (720px, 85% quality)
        const compressedImage = await compressImage(imageDataUrl, 720, 0.85);
        
        // 2. Upload to Cloudinary
        console.log('Uploading to Cloudinary...');
        let cloudinaryUrl;
        try {
            cloudinaryUrl = await uploadToCloudinary(compressedImage);
        } catch (e) {
            throw new Error('Erreur Cloudinary: ' + e.message);
        }

        if (!cloudinaryUrl || cloudinaryUrl.startsWith('data:')) {
            throw new Error('Cloudinary upload failed or returned invalid URL');
        }
        
        // 3. Save to Firebase
        console.log('Saving to Firebase...');
        const response = await fetch(`${FIREBASE_DB_URL}/badges.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prenom,
                nom,
                imageUrl: cloudinaryUrl,
                createdAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) throw new Error('Firebase save failed');
        
        // Refresh gallery
        loadGalleryPreview();
        return true;
    } catch (error) {
        console.error('Error saving badge:', error);
        throw error;
    }
}

// Compress image
function compressImage(dataUrl, maxWidth = 540, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
    });
}

// Fetch badge count
async function fetchBadgeCount() {
    try {
        const response = await fetch(`${FIREBASE_DB_URL}/badges.json?shallow=true`);
        if (response.ok) {
            const data = await response.json();
            if (!data) return 0;
            return Object.keys(data).length;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching count:', error);
        return 0;
    }
}

// ==========================================
// GALLERY UI FUNCTIONS
// ==========================================

// Load preview badges
async function loadGalleryPreview() {
    // Fetch only 20 badges for preview to be fast
    const badges = await fetchBadges(20);
    
    // Initial count update
    updateBadgeCount();
    
    // Start polling for count updates every 10 seconds
    setInterval(updateBadgeCount, 10000);
    
    // Clear and populate preview
    galleryPreviewScroll.innerHTML = '';
    
    if (badges.length === 0) {
        galleryPreviewScroll.appendChild(galleryPreviewEmpty);
        galleryPreviewEmpty.classList.remove('hidden');
        return;
    }
    
    galleryPreviewEmpty.classList.add('hidden');
    
    // Show badges
    badges.forEach(badge => {
        const item = createPreviewItem(badge);
        galleryPreviewScroll.appendChild(item);
    });
}

async function updateBadgeCount() {
    const count = await fetchBadgeCount();
    // Display both "Supporters" and "Badges générés" as requested
    badgeCounter.textContent = `${count} Supporters | ${count} Badges générés`;
    
    // Also update the full gallery count if it's open
    if (galleryBadgeCount) {
        galleryBadgeCount.textContent = `${count} badge${count > 1 ? 's' : ''}`;
    }
}

function createPreviewItem(badge) {
    const item = document.createElement('div');
    item.className = 'gallery-preview-item';
    
    item.innerHTML = `
        <img src="${badge.imageUrl}" alt="${badge.prenom}" loading="lazy">
        <span class="preview-name">${badge.prenom}</span>
    `;
    
    item.addEventListener('click', () => {
        openGalleryModal(badge);
    });
    
    return item;
}

// Open full gallery
function openFullGallery() {
    galleryFull.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadFullGallery();
}

// Close full gallery
function closeFullGallery() {
    galleryFull.classList.remove('active');
    document.body.style.overflow = '';
}

// Load full gallery content
async function loadFullGallery() {
    galleryGrid.innerHTML = '';
    galleryLoading.classList.remove('hidden');
    galleryEmpty.classList.remove('visible');
    
    // Fetch up to 100000 badges as requested
    const badges = await fetchBadges(100000);
    const count = await fetchBadgeCount();
    
    galleryLoading.classList.add('hidden');
    galleryBadgeCount.textContent = `${count} badge${count > 1 ? 's' : ''}`;
    
    if (badges.length === 0) {
        galleryEmpty.classList.add('visible');
        return;
    }
    
    // Render in chunks to prevent UI freeze
    const CHUNK_SIZE = 50;
    let currentIndex = 0;
    
    function renderChunk() {
        const chunk = badges.slice(currentIndex, currentIndex + CHUNK_SIZE);
        if (chunk.length === 0) return;
        
        const fragment = document.createDocumentFragment();
        chunk.forEach(badge => {
            const item = createGalleryItem(badge);
            fragment.appendChild(item);
        });
        
        galleryGrid.appendChild(fragment);
        currentIndex += CHUNK_SIZE;
        
        if (currentIndex < badges.length) {
            // Schedule next chunk
            requestAnimationFrame(renderChunk);
        }
    }
    
    renderChunk();
}

function createGalleryItem(badge) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    const date = new Date(badge.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    item.innerHTML = `
        <img src="${badge.imageUrl}" alt="Badge de ${badge.prenom} ${badge.nom}" loading="lazy">
        <div class="gallery-item-overlay">
            <p class="gallery-item-name">${badge.prenom} ${badge.nom.toUpperCase()}</p>
            <p class="gallery-item-date">${formattedDate}</p>
        </div>
        <div class="gallery-item-actions">
            <button class="gallery-item-btn download" title="Télécharger">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
    `;
    
    item.querySelector('.gallery-item-btn.download').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadGalleryBadge(badge);
    });
    
    item.addEventListener('click', (e) => {
        if (!e.target.closest('.gallery-item-btn')) {
            openGalleryModal(badge);
        }
    });
    
    return item;
}

function downloadGalleryBadge(badge) {
    const filename = `badge_UP_${badge.prenom}_${badge.nom}.png`.replace(/\s+/g, '_');
    const link = document.createElement('a');
    link.href = badge.imageUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openGalleryModal(badge) {
    let modal = document.getElementById('galleryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'galleryModal';
        modal.className = 'gallery-modal';
        document.body.appendChild(modal);
    }
    
    const date = new Date(badge.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    modal.innerHTML = `
        <div class="gallery-modal-content">
            <button class="gallery-modal-close">&times;</button>
            <img src="${badge.imageUrl}" alt="Badge de ${badge.prenom} ${badge.nom}">
            <div class="gallery-modal-info">
                <h3>${badge.prenom} ${badge.nom.toUpperCase()}</h3>
                <p>Publié le ${formattedDate}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    const closeBtn = modal.querySelector('.gallery-modal-close');
    const closeModal = () => {
        modal.classList.remove('active');
    };
    
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// ==========================================
// PUBLISH FUNCTIONS
// ==========================================

async function handlePublish() {
    console.log('handlePublish called');
    if (badgePublishedToGallery) {
        alert('Votre badge est déjà publié dans la galerie !');
        return;
    }

    try {
        showLoading();
        console.log('Generating badge for publish...');
        const blob = await generateBadgeWithAdjustments();
        console.log('Badge generated, blob size:', blob ? blob.size : 'null');
        
        if (!blob) {
            throw new Error('La génération du badge a échoué.');
        }

        console.log('Publishing to gallery...');
        await publishToGallery(blob);
        console.log('Published successfully');
        hideLoading();
        
        // Show download/share buttons after successful publish
        downloadBtn.style.display = 'flex';
        shareWhatsApp.style.display = 'flex';
        shareFacebook.style.display = 'flex';
        
        // Hide publish button
        if (publishBtn) publishBtn.style.display = 'none';

        alert('✅ Votre badge a été validé et publié dans la galerie avec succès ! Vous pouvez maintenant le télécharger et le partager.');
    } catch (error) {
        hideLoading();
        console.error('Error publishing badge:', error);
        alert('Erreur lors de la publication: ' + error.message);
    }
}

function publishToGallery(blob) {
    return new Promise((resolve, reject) => {
        if (badgePublishedToGallery) {
            resolve(true);
            return;
        }

        const prenom = prenomInput.value.trim();
        const nom = nomInput.value.trim();
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await saveBadgeToGallery(reader.result, prenom, nom);
                badgePublishedToGallery = true;
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper to generate blob with adjustments (reusing existing logic but ensuring it returns blob)
async function generateBadgeWithAdjustments() {
    console.log('generateBadgeWithAdjustments called');
    // If we already have a generated blob and no changes were made, return it
    // But for safety, let's regenerate to be sure we capture latest state
    
    // We can reuse the existing generateBadgeImage logic but we need it to return the blob
    // The existing function sets global variables. Let's modify it or wrap it.
    
    try {
        const blob = await generateBadgeImage();
        console.log('generateBadgeImage returned blob:', blob);
        return blob;
    } catch (e) {
        console.error('Error in generateBadgeWithAdjustments:', e);
        return null;
    }
}
