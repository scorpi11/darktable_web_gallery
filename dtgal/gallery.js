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

    function updateCounter(index) {
        const counter = document.getElementById('counter');
        counter.textContent = (index) + ' / ' + imageCount;
    }

    function showModal(e) {
        const thumbbox = e.target.parentElement;
        const gallery = thumbbox.parentElement;
        index = [...gallery.children].indexOf(thumbbox);
        var slides = document.getElementById('slides1');
        document.getElementById('slider1').style.display = 'grid';
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('heading1').style.display = 'none';
        const scrollpos = index * slides.scrollWidth / slides.childElementCount;
        if(index > 0)
            slides.scroll({ top: 0, left: scrollpos, behavior: 'instant' });
        else
            setTimeout(() => {slides.scroll({ top: 0, left: 0, behavior: "instant" });}, 5);
    }

    function arrowClicked(event, direction) {
        var slides = document.getElementById('slides1');
        scrollBy = direction * slides.scrollWidth / imageCount;
        slides.scrollBy({ top: 0, left: scrollBy, behavior: 'smooth' });
    }

    // adjust visibility of left/right arrows
    function scrolled(event) {
        var slides = document.getElementById('slides1');
        var scrollRatio = slides.scrollLeft / slides.scrollWidth;

        position = 1 + Math.round(scrollRatio * imageCount);
        if (position == currentIndex) {
            return;
        }

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

    var file = new XMLHttpRequest();
    file.open("GET", "images.json", false);
    file.send();
    var json_data = JSON.parse(file.responseText);
    var images = json_data.images;

    var gallery = document.getElementById('gallery');
    var slides = document.getElementById('slides1');

    var title = document.getElementById('gallery-title');
    var pageTitle = document.getElementById('page-title');
    if (json_data.name) {
        title.textContent = json_data.name;
        pageTitle.textContent = json_data.name;
    }

    imageCount = images.length;
    images.forEach(function (imageObj) {
        var slimg = document.createElement('img');
        slimg.loading = 'lazy'
        slimg.src = imageObj.filename;
        slimg.className = 'slideimg';
        var slide = document.createElement('div');
        slide.className = 'slide';
        slide.appendChild(slimg);
        slides.appendChild(slide);
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
        var img = document.createElement('img');
        img.src = thumb;
        img.alt = filename;
        img.className = 'thumb';
        img.addEventListener('click', function (e) { e.stopPropagation(); showModal(e); });
        box.appendChild(img);
        gallery.appendChild(box);
    });

    document.getElementById('fullscreen').onclick = function (e) {
        e.stopPropagation();
        toggleFullscreen(document.documentElement);
    };

    function closeModal() {
        exitFullscreen(document.documentElement);
        document.getElementById('slider1').style.display = 'none';
        document.getElementById('gallery').style.display = 'flex';
        document.getElementById('heading1').style.display = 'grid';
    };

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

    slider = document.querySelector('.slider');
    document.getElementById('slides1').addEventListener(
        'scroll', event => scrolled(event)
    );


    document.getElementById('previous').style.visibility = "hidden";

    if (slider.childElementCount < 1) {
        document.getElementById('next').style.visibility = "hidden";
    }

    document.getElementById('previous').addEventListener(
        'click', event => arrowClicked(event, -1)
    );

    document.getElementById('next').addEventListener(
        'click', event => arrowClicked(event, 1)
    );
    updateCounter(1);
});
