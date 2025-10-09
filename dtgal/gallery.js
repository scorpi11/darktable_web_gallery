/*
    copyright (c) 2025 Tino Mettler

    darktable is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    darktable is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this software.  If not, see <http://www.gnu.org/licenses/>.
*/

document.addEventListener('DOMContentLoaded', function () {
    var currentIndex = 1;
    var imageCount = 0;
    const slides = document.getElementById('slides1');
    const slider = document.getElementById('slider1');
    const gallery = document.getElementById('gallery');

    function showModal(e) {
        const thumbbox = e.target.parentElement;
        const index = [...gallery.children].indexOf(thumbbox);

        gallery.style.display = 'none';
        document.getElementById('heading1').style.display = 'none';
        slider.style.display = 'grid';

        // Check if scrolling is needed
        if((index + 1) == currentIndex)
            return;

        const scrollpos = index * slides.scrollWidth / slides.childElementCount;
        if(index > 0)
            slides.scroll({ top: 0, left: scrollpos, behavior: 'instant' });
        else
            // -1 as scroll(0,0) does not work
            slides.scroll({ top: -1, left: 0, behavior: "instant" });
    }

    function arrowClicked(event, direction) {
        event.stopPropagation();
        scrollBy = direction * slides.scrollWidth / imageCount;
        slides.scrollBy({ top: 0, left: scrollBy, behavior: 'smooth' });
    }

    // adjust visibility of left/right arrows
    function scrolled(event) {
        var scrollRatio = slides.scrollLeft / slides.scrollWidth;

        // Debounce scroll event callback
        position = 1 + Math.round(scrollRatio * imageCount);
        if (position == currentIndex)
            return;

        if (position == 1) {
            document.getElementById('previous').style.visibility = "hidden";
        } else {
            document.getElementById('previous').style.visibility = "visible";
        }

        if (position == imageCount) {
            document.getElementById('next').style.visibility = "hidden";
        } else {
            document.getElementById('next').style.visibility = "visible";
        }

        currentIndex = position;
        updateCounter(currentIndex);
    }

    function closeModal() {
        exitFullscreen(document.documentElement);
        slider.style.display = 'none';
        document.getElementById('heading1').style.display = 'grid';
        gallery.style.display = 'flex';
    };

    function updateCounter(index) {
        const counter = document.getElementById('counter');
        counter.textContent = (index) + ' / ' + imageCount;
    }

    function createSliderElement(imageObj) {
        const slimg = document.createElement('img');

        slimg.className = 'slideimg';
        slimg.loading = 'lazy'
        slimg.src = imageObj.filename;

        const slide = document.createElement('div');
        slide.className = 'slide';

        slide.appendChild(slimg);
        slides.appendChild(slide);
    }

    function createThumbnailElement(imageObj) {
        const frame = document.createElement('div');
        frame.className = 'thumb-box';
        const framesize = 18;

        const width = parseInt(imageObj.width);
        const height = parseInt(imageObj.height);
        const aspect = height / width;
        const sum = width + height;
        const scalefactor = sum / (framesize * 2.0);
        frame.style.width = (width / scalefactor) + 'vw';
        frame.style.height = (height / scalefactor) + 'vw';

        const img = document.createElement('img');
        img.className = 'thumb';
        img.src = imageObj.filename.replace(/images\/(.*)$/i, 'images/thumb_$1');
        img.alt = imageObj.filename;
        img.addEventListener('click', function (e) { e.stopPropagation(); showModal(e); });

        frame.appendChild(img);
        gallery.appendChild(frame);
    }

    const images = gallery_data.images;

    const title = document.getElementById('gallery-title');
    const pageTitle = document.getElementById('page-title');
    if (gallery_data.name) {
        title.textContent = gallery_data.name;
        pageTitle.textContent = gallery_data.name;
    }

    imageCount = images.length;
    // Populate thumbnail gallery and modal slider
    images.forEach(function (imageObj) {
        createThumbnailElement(imageObj);
        createSliderElement(imageObj);
    });

    nextButton = document.getElementById('next');
    previousButton = document.getElementById('previous');

    previousButton.style.visibility = "hidden";

    if (slider.childElementCount < 1) {
        nextButton.style.visibility = "hidden";
    }

    previousButton.addEventListener('click', event => arrowClicked(event, -1));
    nextButton.addEventListener('click', event => arrowClicked(event, 1));

    slides.addEventListener('scroll', event => scrolled(event));

    document.getElementById('close').onclick = function (e) {
        e.stopPropagation();
        closeModal();
    };

    // Keyboard navigation using left/right arrow keys
    document.onkeyup = function (e) {
        e.stopPropagation();
        switch(e.key) {
        case "Escape":
            closeModal();
            break;
        case "ArrowLeft":
            arrowClicked(e, -1);
            break;
        case "ArrowRight":
            arrowClicked(e, 1);
            break;
        }
    };

    document.getElementById('fullscreen').onclick = function (e) {
        e.stopPropagation();
        toggleFullscreen(document.documentElement);
    };

    updateCounter(1);
});
