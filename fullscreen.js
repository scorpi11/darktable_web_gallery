var isFullscreen = false;

var toggleFullscreen = function (ele) {
    if(isFullscreen == false) {
		requestFullscreen(ele);
    } else {
		exitFullscreen(ele);
    }
};

var requestFullscreen = function (ele) {
	isFullscreen = true;
	if (ele.requestFullscreen) {
		ele.requestFullscreen();
	} else if (ele.webkitRequestFullscreen) {
		ele.webkitRequestFullscreen();
	} else if (ele.mozRequestFullScreen) {
		ele.mozRequestFullScreen();
	} else if (ele.msRequestFullscreen) {
		ele.msRequestFullscreen();
	} else {
		console.log('Fullscreen API is not supported.');
	}
};

var exitFullscreen = function () {
	isFullscreen = false;
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	} else {
		console.log('Fullscreen API is not supported.');
	}
};

//function startup() {
//    var text = document.body;

//    text.addEventListener("click", function(e) {
//	e.preventDefault();
//	toggleFullscreen(document.documentElement);
//    });
//};

//document.addEventListener("DOMContentLoaded", startup);
