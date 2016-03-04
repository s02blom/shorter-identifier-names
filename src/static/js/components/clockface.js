(function (window) {
function Slice (index) {
  var self = this;
  self.element = element(index);

  function element (index) {
    return $('#path_' + index * 5);
  }

  function fill (color) {
    if(color === undefined){
      return self.element.attr('fill');
    }
    self.element.attr('fill', color);
  }

  return {
    fill: fill
  }
}

function ClockFace (element) {
  var self = this;
  self.svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="75" width="75"><g fill="none"><path id="path_20" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M56,37L74.994289,38.154465A37,37,0,0,1,70.298239,55.680361L54.555084,46.953788A19,19,0,0,0,56.997030,37.840322Z"></path><path id="path_25" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M54,47L69.643774,56.813928A37,37,0,0,1,56.813928,69.643774L47.543242,54.214762A19,19,0,0,0,54.214762,47.543242Z"></path><path id="path_30" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M46,54L55.680361,70.298239A37,37,0,0,1,38.154465,74.994289L37.840322,56.997030A19,19,0,0,0,46.953788,54.555084Z"></path><path id="path_35" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M37,56L36.845535,74.994289A37,37,0,0,1,19.319639,70.298239L28.046212,54.555084A19,19,0,0,0,37.159678,56.997030Z"></path><path id="path_40" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M27,54L18.186072,69.643774A37,37,0,0,1,5.356226,56.813928L20.785238,47.543242A19,19,0,0,0,27.456758,54.214762Z"></path><path id="path_45" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M20,46L4.701761,55.680361A37,37,0,0,1,0.005711,38.154465L18.002970,37.840322A19,19,0,0,0,20.444916,46.953788Z"></path><path id="path_50" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M18,37L0.005711,36.845535A37,37,0,0,1,4.701761,19.319639L20.444916,28.046212A19,19,0,0,0,18.002970,37.159678Z"></path><path id="path_55" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M20,27L5.356226,18.186072A37,37,0,0,1,18.186072,5.356226L27.456758,20.785238A19,19,0,0,0,20.785238,27.456758Z"></path><path id="path_0" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M28,20L19.319639,4.701761A37,37,0,0,1,36.845535,0.005711L37.159678,18.002970A19,19,0,0,0,28.046212,20.444916Z"></path><path id="path_5" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M37,18L38.154465,0.005711A37,37,0,0,1,55.680361,4.701761L46.953788,20.444916A19,19,0,0,0,37.840322,18.002970Z"></path><path id="path_10" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M47,20L56.813928,5.356226A37,37,0,0,1,69.643774,18.186072L54.214762,27.456758A19,19,0,0,0,47.543242,20.785238Z"></path><path id="path_15" height="75" width="75" stroke="#eee" stroke-width="2" fill="#aaa" d="M54,28L70.298239,19.319639A37,37,0,0,1,74.994289,36.845535L56.997030,37.159678A19,19,0,0,0,54.555084,28.046212Z"></path><ellipse height="37.5" width="37.5" stroke="red" stroke-width="2" fill="red" top="18.75" left="18.75" id="Plate"></ellipse></g></svg>';
  self.element = element || $('#clock');
  var COLOR_EMPTY = '#aaa';
  var COLOR_PRIMARY = '#00b7ff';
  var current_slice = 0;
  var NUM_SLICES = 12;

  self.install = function () {
    $(self.element).html(self.svg);
  };

  function nextSlice () {
   current_slice += 1;
   current_slice = current_slice % NUM_SLICES;
  };

  function sliceNumber(index) {
    return new Slice(index);
  }

  function current() {
    return sliceNumber(current_slice);
  }

  function next () {
    nextSlice();
    paint(current());
  };

  function paint(slice) {
    if(slice.fill() === COLOR_EMPTY){
      slice.fill(COLOR_PRIMARY);
      return;
    }
    slice.fill(COLOR_EMPTY);
  }

  function reset () {
    current_slice = 0;
    for(var index = 0; index < NUM_SLICES; index++) {
      sliceNumber(index).fill(COLOR_EMPTY);
    }
  };

  self.install();

  return {
    next: next,
    reset: reset
  }
};
window.ClockFace = ClockFace;
})(window);