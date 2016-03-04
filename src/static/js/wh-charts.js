(function (){
angular.module('charts', [])
.directive('barChart', function () {
    return {
        replace: true,
        restict: 'E',
        scope: {
            url: '@'
        },
        template: "<div></div>",
        link: function (scope, element, attributes) {

            function display(data) {

                var bottomPadding = 15;
                var padding = 1;
                var width = 600;
                var height = 200;

                var biggest = d3.max(data, function (d) { return d; });
                var color = d3.scale.category10();
                var scale = d3
                    .scale
                    .linear()
                    .range([height, 0])
                    .domain([0, biggest]);

                var svg = d3
                    .select(element[0])
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                var barWidth = width / data.length;

                var bar = svg.selectAll("g")
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) {
                        return "translate(" + i * barWidth + ",0)";
                    });

                svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("x", function (d, i){
                        return i * barWidth + padding;
                    })
                    .attr("y", function (d, i){
                        return scale(d);
                    })
                    .attr("width", function (d, i) {
                        return barWidth - padding;
                    })
                    .attr("height", function (d, i) {
                        return height - scale(d);
                    })
                    .attr("fill", function (d, i) {
                        if(d === biggest) {
                            return color(1);
                        }
                        return color(0);
                    });

                var tf = svg.selectAll("rect");

                svg.selectAll("text")
                    .data(data)
                    .enter()
                    .append("text")
                    .text(function (d) {
                        return d;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("fill", "red")
                    .attr("fill", "white")
                    .attr("font-family", "sans-serif")
                    .attr("text-anchor", "middle")
                    .attr("x", function (d, i) {
                        // Set to center of the bar
                        return i * (width / data.length) + (width / data.length - padding) / 2;
                    })
                    .attr("y", function (d, i) {
                        return scale(d) + bottomPadding;
                    });
            };

            d3.json(scope.url, function(error, json) {
                if (error) return console.warn(error);
                var data = json.data;
                var data = data.map(function (d) { return d.issued; })
                display(data);
            });
        }
    };
})
.directive('pieChart', function () {
    return {
        replace: true,
        restict: 'E',
        scope: {
            url: '@'
        },
        template: "<div></div>",
        link: function (scope, element, attributes) {
            function display(data) {
                var width = 200;
                var height = 200;

                var outerRadius = width / 2;
                var innerRadius = 0;

                var pie = d3
                    .layout
                    .pie()
                    .value(function(d) {
                        return d.value;
                    });

                var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);

                var color = d3.scale.category10();

                var svg = d3
                    .select(element[0])
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                var arcs = svg.selectAll("g.arc")
                    .data(pie(data))
                    .enter()
                    .append("g")
                    .attr("class", "arc")
                    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")

                arcs.append("path")
                    .attr("fill", function (d, i) { return color(i); })
                    .attr("d", arc);

                arcs.append("text")
                    .attr("transform", function (d) {
                        return "translate(" + arc.centroid(d) + ")"
                    })
                    .attr("fill", "white")
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .attr("font-size", "14")
                    .text(function (d) {
                        return d.data.key + " (" + d.data.value + ")" ;
                    });
            };
            d3.json(scope.url, function(error, json) {
                if (error) return console.warn(error);
                var data = json.data;
                var entries = d3.entries({
                    Open: data.all - data.finished,
                    Done: data.finished
                });
                display(entries);
            });
        }
    };
}); // chart

})();// ns shield