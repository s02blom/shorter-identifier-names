(function (window) {
  // The functions <seconds> and <minutes> are defined in timelimit.js
  function Clock (options) {
    // Coordinates a timer, timelimit and a clockface.
    // Every 50 Seconds a slice piece will be filled (12 Slices)
    // After 8 Minutes the user will be warned.
    // After 10 Minutes the clock resets and the time is over.
    options = options || {};
    var clockface = new ClockFace(options.element);
    var self = this;
    self.timer = new Timer();
    self.steps = [];
    self.onStart = options.onStart || function (date) {};
    self.onWarn = options.onWarn || function (timer) {};
    self.onTick = options.onTick || function (timer) {};
    self.onElapsed = options.onElapsed || function (timer) {};
    self.onStop  = options.onStop || function (date) {};

    function start () {
      var steps = prepareSteps();
      self.timelimit = new TimeLimit(steps, self.timer);
      self.onStart(new Date());
      self.timelimit.start();
    }

    function tick () {
      clockface.next();
      self.onTick(self.timer);
    }

    function elapsed () {
      self.timelimit.stop();
      self.onElapsed(self.timer);
      clockface.reset();
      self.steps = [];
    }

    function warn () {
      self.onWarn(self.timer)
    }

    function stop () {
      self.timelimit.stop();
      self.onStop(new Date());
      clockface.reset();
      self.steps = [];
    }

    function appendWaring (slice, steps) {
      if(slice >= seconds(450) && slice < seconds(500)) {
        steps.push(after(minutes(8), warn));
      }
    }

    function appendEnd (steps) {
      steps.push(after(minutes(10), elapsed));
    }

    function prepareSteps () {
      // The user has 10 minutes time
      // There will be a warning after 8 minutes
      // The clock will tick every 50 seconds (12 slices to fill)
      var steps = [];
      for (var slice = seconds(50); slice < minutes(10)+1; slice += seconds(50)) {
        steps.push(after(slice, tick));
        appendWaring(slice, steps);
      };
      appendEnd(steps);
      return steps;
    }

    return {
      start: start,
      stop: stop
    }
  }
  window.Clock = Clock;
})(window);
