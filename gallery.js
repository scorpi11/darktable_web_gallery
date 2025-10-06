document.addEventListener('DOMContentLoaded', function () {
    currentIndex = 1;
    window.onclick = function (event) {
        event.stopPropagation();
        const slider = document.getElementById('slider1');
        if (event.target === slider) {
            exitFullscreen(document.documentElement);
            const gallery = document.getElementById('gallery');
            slider.style.display = 'none';
            gallery.style.display = 'flex';
        }
    };

    function updateCounter(index) {
        const counter = document.getElementById('counter');
        counter.textContent = (currentIndex) + ' / ' + images.length;
    }

    function showModal(e) {
        const thumbbox = e.target.parentElement;
        const gallery = thumbbox.parentElement;
        index = [...gallery.children].indexOf(thumbbox);
        var slides = document.getElementsByClassName('slides')[0];
        console.log(index, slides)
        updateCounter(index);
        document.getElementById('slider1').style.display = 'grid';
        document.getElementById('gallery').style.display = 'none';
        document.getElementById('heading1').style.display = 'none';
        if(index > 0)
            slides.scroll(index * slides.scrollWidth / slides.childElementCount, 0);
        else
            setTimeout(() => {slides.scroll({ top: 0, left: 0, behavior: "auto" });}, 5);
    }

    function arrowClicked(event, direction) {
        var slides = document.getElementsByClassName('slides')[0];
        slides.scrollLeft += direction * slides.scrollWidth / slides.childElementCount;
        updateCounter(currentIndex + direction);
    }

    // adjust visibility of left/right arrows
    function scrolled(event) {
        var id = event.target.parentElement.id;
        var slides = document.getElementById(id).getElementsByClassName('slides')[0];
        var scrollRatio = slides.scrollLeft / slides.scrollWidth;
        var size = slides.childElementCount;

        position = 1 + Math.round(scrollRatio * size);
        if (position == currentIndex) {
            return;
        }

        if (position == 1) {
            document.getElementById('previous').style.visibility = "hidden";
        } else {
            document.getElementById('previous').style.visibility = "visible";
        }

        if (position == size) {
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

    images.forEach(function (imageObj) {
        var slimg = document.createElement('img');
        slimg.loading = 'lazy'
        slimg.src = imageObj.filename;
        slimg.className = 'slideimg';
        var slidecontent = document.createElement('div');
        slidecontent.className = 'content';
        slidecontent.appendChild(slimg);
        var slide = document.createElement('div');
        slide.className = 'slide';
        slide.appendChild(slidecontent);
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
    }

    document.getElementById('close').onclick = function (e) {
        e.stopPropagation
        exitFullscreen(document.documentElement);
        document.getElementById('slider1').style.display = 'none';
        document.getElementById('gallery').style.display = 'flex';
        document.getElementById('heading1').style.display = 'grid';
    };

    // Keyboard navigation using left/right arrow keys
    document.onkeyup = function (e) {
        if (e.keyCode == 37) {
            arrowClicked(e, -1);
        } else if (e.keyCode == 39) {
            arrowClicked(e, 1);
        }
    };

    slider = document.querySelector('.slider');
    slider.getElementsByClassName('slides')[0].addEventListener(
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
