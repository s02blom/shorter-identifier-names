(function (window) {

    function Pane(selector) {
        var self = this;
        self.element = $(selector);
        this.height = function () {
            return self.element.height();
        }
        this.bottom = function () {
            return Math.round(self.top() + self.element.height());
        }
        this.top = function () {
            return self.element.offset().top;
        }
    }

    function Letterbox (options) {
        options = options || {};
        var editor = options.editor || '#code';
        var LINE_HEIGHT = 20;
        var UP = -LINE_HEIGHT;
        var DOWN = LINE_HEIGHT;

        function cover () {
            $('.shield').show();
        }

        function uncover () {
            $('.shield').hide();
        }

        function currentLine () {
            var visibleArea = new Pane('.clear');
            var firstLine = (visibleArea.top() - new Pane(editor).top()) / LINE_HEIGHT;
            var linesVisible = (visibleArea.height() / LINE_HEIGHT);
            var lastLine = firstLine + linesVisible;
            return [Math.round(firstLine + 1), Math.round(lastLine)];
        }

        function code () {

        }

        function scrollShield(direction) {
            if (!canScroll(direction)) {
                return;
            }
            $('.shield').each(function (index, element) {
                scrollElement(element, direction);
            });
        }

        function canScroll (direction) {
            var visibleArea = new Pane('.clear');
            if(goingUp(direction)){
                return visibleArea.top() - LINE_HEIGHT >= new Pane(editor).top();
            }
            if(goingDown(direction)){
                return visibleArea.bottom() + LINE_HEIGHT <= (new Pane(editor).bottom() + 2);
            }
        }

        function clearHighlight () {
            $('.line').removeClass('active');
        }

        function goingUp(direction) { return (direction < 0); }
        function goingDown(direction) { return (direction > 0); }

        function highlightLine(number) {
            function findLine (number) {
                return $('*[data-line="' + number.toString() + '"]');
            }
            function highlight (line) {
                line.addClass('active');
                return line.find('span.sourcecode').text().trim();
            }
            function isInVisibleRange (number) {
                var visibleArea = currentLine();
                var first = visibleArea[0];
                var last = visibleArea[1];
                return (number >= first && number <= last);
            }
            clearHighlight();
            if(number > 0 && isInVisibleRange(number)) {
                var line = findLine(number);
                return highlight(line);
            }
            return '';
        }

        function scrollElement(element, amountInPixel) {
            $element = $(element);
            var offset = $element.offset();
            offset.top += amountInPixel;
            $element.offset(offset);
        }

        function reset () {
            var delta = new Pane(".shield").top() - new Pane(".clear").top();
            delta = Math.abs(delta);
            var codePane = new Pane(editor);
            var target = codePane.top() - delta;
            $('.shield').offset({top: target});
        }

        return {
            clearHighlight: clearHighlight,
            cover: cover,
            currentLine: currentLine,
            highlight: highlightLine,
            reset: reset,
            scrollDown: function () { scrollShield(DOWN); },
            scrollUp: function () { scrollShield(UP); },
            uncover: uncover
        }
    };
    window.Letterbox = Letterbox;
})(window);