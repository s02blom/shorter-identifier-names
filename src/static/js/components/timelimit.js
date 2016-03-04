(function (window) {

  function seconds (number) {
    return number * 1000;
  };

  function minutes (number) {
    return  60 * seconds(number);
  };

  function after(time, func) {
    return new Step(time, func);
  }

  function Step(limit, action) {
    function isDue (elapsed) {
      return (elapsed > limit);
    }
    return {
      action: action,
      isDue: isDue,
      limit: limit
    }
  }

  function TimeLimit (steps, timer) {
    var self = this;
    var current_step = 0;
    timer.register(checkLimit);

    function performStep () {
      var step = steps[current_step];
      if(step.isDue(timer.elapsed())) {
        current_step++;
        step.action(timer.elapsed());
      }
    }

    function checkLimit () {
      if(current_step == steps.length) {
        stop();
        return;
      }
      performStep();
    }

    return {
      start: timer.start,
      stop: timer.stop
    }
  }
  window.after = after;
  window.minutes = minutes;
  window.seconds = seconds;
  window.TimeLimit = TimeLimit;
})(window);