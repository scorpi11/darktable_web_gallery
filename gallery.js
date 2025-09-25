// Load and parse JSON synchronously as requested
var file = new XMLHttpRequest();
file.open("GET", "images.json", false);
file.send();
var json_data = JSON.parse(file.responseText);
var images = json_data.images;

function showModal(imageSrc) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const modalImgFade = document.getElementById('modal-img-fade');
  // Set fade image to black
  modalImgFade.src = '';
  modalImgFade.style.background = '#000';
  modalImgFade.style.opacity = 1;
  // Preload next image
  var preloadImg = new Image();
  preloadImg.src = imageSrc;
  preloadImg.onload = function () {
    // Set new image src
    modalImg.src = imageSrc;
    modalImg.style.opacity = 0;
    setTimeout(function () {
      modalImg.style.opacity = 1;
      modalImgFade.style.opacity = 0;
      modalImgFade.style.background = 'none';
    }, 40); // Short delay for crossfade
  };
  modal.style.display = 'flex';
    currentIndex = images.findIndex(function (img) { return (img.filename) === imageSrc; });
  updateNavButtons();
  updateCounter();
  // Preload previous and next images for instant navigation
  if (currentIndex > 0) {
    var prevImg = new Image();
      prevImg.src = images[currentIndex - 1].filename;
  }
  if (currentIndex < images.length - 1) {
    var nextImg = new Image();
    nextImg.src = images[currentIndex + 1].filename;
  }
}

function updateCounter() {
  const counter = document.getElementById('counter');
  counter.textContent = (currentIndex + 1) + ' / ' + images.length;
}
function updateNavButtons() {
  document.getElementById('prev-btn').style.display = (currentIndex > 0) ? 'block' : 'none';
  document.getElementById('next-btn').style.display = (currentIndex < images.length - 1) ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function () {
  var gallery = document.getElementById('gallery');
  var title = document.getElementById('gallery-title');
  var pageTitle = document.getElementById('page-title');
  if (json_data.name) {
    title.textContent = json_data.name;
    pageTitle.textContent = json_data.name;
  }
  images.forEach(function (imageObj) {
    var filename = imageObj.filename;
    var width = parseInt(imageObj.width);
    var height = parseInt(imageObj.height);
    var thumb = imageObj.filename.replace(/images\/(.*)$/i, 'images/thumb_$1');
    var aspect = height / width;
    var box = document.createElement('div');
    var boxsize = 150;
    var sum = width + height;
    var scalefactor = sum / (boxsize * 2.0);
    box.style.width = (width / scalefactor) + 'px';
    box.style.height = (height / scalefactor) + 'px';
    box.className = 'thumb-box';
    box.style.display = 'flex';
    box.style.alignItems = 'center';
    box.style.objectFit = 'contain';
    box.style.justifyContent = 'center';
    box.style.background = 'none';
    box.style.boxShadow = '0 8px 32px 8px rgba(0,0,0,0.35)';
    var img = document.createElement('img');
    img.src = thumb;
    img.alt = filename;
    img.className = 'thumb';
    img.style.objectFit = 'contain';

    img.style.flexShrink = '0';
    img.style.minWidth = '100%';
    img.style.minHeight = '100%';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.addEventListener('click', function (e) { e.stopPropagation(); showModal(filename); });
    box.appendChild(img);
    gallery.appendChild(box);
  });

  document.getElementById('prev-btn').onclick = function (e) {
    e.stopPropagation();
    if (currentIndex > 0) {
      currentIndex--;
      showModal(images[currentIndex].filename);
    }
  };
  document.getElementById('next-btn').onclick = function (e) {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      currentIndex++;
      showModal(images[currentIndex].filename);
    }
  };

  document.getElementById('fullscreen').onclick = function (e) {
    e.stopPropagation();
    toggleFullscreen(document.documentElement);
  }

  document.getElementById('close').onclick = function (e) {
    e.stopPropagation
    exitFullscreen(document.documentElement);
    document.getElementById('modal').style.display = 'none';
    // Reset both modal images to black for next open
    var modalImg = document.getElementById('modal-img');
    var modalImgFade = document.getElementById('modal-img-fade');
    modalImg.src = '';
    modalImg.style.opacity = 0;
    modalImgFade.src = '';
    modalImgFade.style.background = '#000';
    modalImgFade.style.opacity = 1;
  };

  window.onclick = function (event) {
    event.stopPropagation();
    const modal = document.getElementById('modal');
    if (event.target === modal) {
      exitFullscreen(document.documentElement);
      modal.style.display = 'none';
    }
  };
});
