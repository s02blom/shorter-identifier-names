(function (window) {
  // The timer ticks every <options.tickInterval> Number of seconds and performs
  // the <options.onTick> Operation
  function Timer (options) {
    var self = this;
    options = options || {};
    var tickInterval = options.tickInterval || 1000;
    var onTick = options.onTick || function () {};

    var lastTick = new Date();

    function now () {
      return new Date();
    }

    function tick () {
      var timeSinceLastTick = now() - lastTick;
      if(timeSinceLastTick >= tickInterval){
        lastTick = now();
        onTick();
      }
    }

    function update() {
      tick();
    };

    function elapsed () {
      // Returns the elapsed duration in Milliseconds
      return (now() - self.timerStarted);
    }

    function start () {
      self.timerStarted = now();
      self.id = window.setInterval(update, 100);
    }

    function stop () {
      self.timerStopped = now();
      window.clearInterval(self.id);
    }

    function register (func) {
      onTick = func;
    };

    return {
      start: start,
      stop:  stop,
      elapsed: elapsed,
      register: register
    };
  }
  window.Timer = Timer;
})(window);
