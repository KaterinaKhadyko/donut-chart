var data = [
	{
	"value": 6.4,
	"label": "Bankfinanzierung<br><b>6,4 Mio. €</b>",
	"color": "#5DA9D3",
	"highlight": "#7DC9F3"
	},
	{
	"value": 3,
	"label": "Eigenkapital<br><b>3 Mio. €</b>",
	"color": "#C3E693",
	"highlight": "#E3F6A3"
	},
	{
	"value": 1.1,
	"label": "Geplantes\nCrowdfunding<br><b>bis zu 1,1 Mio. €</b>",
	"color": "#99DBDE",
	"highlight": "#A9FBFE"
	},
	{
	"value": 6.4,
	"label": "Bankfinanzierung<br><b>6,4 Mio. €</b>",
	"color": "#5DA9D3",
	"highlight": "#7DC9F3"
	},
	{
	"value": 1.1,
	"label": "Geplantes\nCrowdfunding<br><b>bis zu 1,1 Mio. €</b>",
	"color": "#99DBDE",
	"highlight": "#A9FBFE"
	},
	{
	"value": 3,
	"label": "Eigenkapital<br><b>3 Mio. €</b>",
	"color": "#C3E693",
	"highlight": "#E3F6A3"
	}
];

var DonutChart = function (holderName, data, params) {
	"use strict";

	var width = d3.select(holderName)[0][0].getBoundingClientRect().width || 1000,
	height = 2 / 3 * width,
	radius = 1 / 6 * width,
	innerRadius = 2 / 3 * radius,
	labelPositions = [],
	labelX,
	labelY;

	var total = d3.sum(data, function (d) {
		return d.value;
	});

	var svg = d3.select(holderName)
		.append("svg")
	    .data([data])
		.attr("width", width)
	    .attr("height", height);    

	var donut = d3.layout.pie()
		.sort(null)
		.value(function (d) {
			return d.value;
		});

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(radius);

	var arcs = svg.selectAll("g.arc")
		.data(donut)
		.enter()
		.append("g")
		.attr("class", "arc")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var paths = arcs.append("path")
		.attr("class", "section")
		.attr("fill", function (d) {
			return d.data.color;
		});
		

	paths.transition()
    	.ease("ease-in")
    	.duration(600)
		.attrTween("d", tweenPie);

	var polyline = svg.selectAll(".arc")
		.append("polyline")
		.attr("stroke", "#ccc")
		.attr("fill", "none")
		.attr("points", function (d, i) {		
	        return getPolylinePoints(d, i, radius);
		});

	polyline.attr("opacity", "0")		
		.transition()
		.delay(600)
		.duration(300)
		.attr("opacity", "1");

	getLinePosition();

	var labels = d3.select(holderName)
		.selectAll("div.label")
		.data(data)
		.enter()
		.append("div")
		.attr("class", "label")
		.html(function (d) {
			return d.label + "<span> (" + (d.value / total * 100).toFixed(2) + "%)</span>";
		})
		.style("position", "absolute")
		.style("top", function (d, i) {
			var self = this;
			return getLabelPositions(self, d, i).top;
		})
		.style("left", function (d, i) {
			var self = this;
			return getLabelPositions(self, d, i).left;
		})
		.style("text-align", function (d, i) {
			return labelPositions[i].align;
		})
		.style("opacity", "0");

		labels.transition()
		.delay(600)
		.duration(300)
		.style("opacity", "1");	

	var sections = svg.selectAll(".section");

	sections.on("mouseover", function (d) {
			d3.select(this)
			.transition()
			.duration(300)
			.attr("fill", function (d) {
				return d.data.highlight;
			});
		});

	sections.on("mouseout", function (d) {
		d3.select(this)
			.transition()
			.duration(300)
			.attr("fill", function (d) {
				return d.data.color;
			})
	})

	d3.select(window).on("resize", function (d) {
		var currWidth =  parseInt(d3.select(holderName).style("width"));
		var currRadius = 1 / 6 * currWidth;

    	d3.select("svg")
    		.attr("width", function (d) {			
				return currWidth;
			})
    		.attr("height", function (d) {
    			return 2 / 3 * currWidth;
    		})

		arc.outerRadius(currRadius)
			.innerRadius(function (d) {
				return 2 / 3 * currRadius;
			});
		arcs.attr("transform", "translate(" + currWidth / 2 + "," + 2 / 3 * currWidth / 2 + ")");
		
		paths.attr("d", arc);

		polyline.attr("points", function (d, i) {
	        return getPolylinePoints(d, i, currRadius);
		});

		labels.style("top", function (d, i) {
				var self = this;

				return getLabelPositions(self, d, i).top;
			})
			.style("left", function (d, i) {
				var self = this;

				return getLabelPositions(self, d, i).left;
			})

    });

    function tweenPie (b) {
	  	b.innerRadius = 0;
	  	var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
	  	return function(t) { return arc(i(t)); };
	}

    function getMidAngle(d){
			var centroid = arc.centroid(d);
			return Math.atan2(centroid[1], centroid[0]);
		}

    function getPolylinePoints (d, i, radius) {
		var midAngle = getMidAngle(d);
        var x = Math.cos(midAngle) * radius,
        	y = Math.sin(midAngle) * radius,
        	x2,
        	x3,
        	y2;
        if (Math.abs(midAngle) > Math.PI / 2) {
        	x2 = x - 10;
        	x3 = x - 40;
        	labelPositions[i] = {
        		"align": "right"
        	};
        } else {
        	x2 = x + 10;
        	x3 = x + 40;
        	labelPositions[i] = {
        		"align": "left"
        	};
        }

        if (midAngle < 0) {
        	y2 = y - 10;
        	labelPositions[i].vertAlign = "top";
        } else {
        	y2 = y + 10;
        	labelPositions[i].vertAlign = "bottom";
        }

		return [x, y, x2, y2, x3, y2];
	}

	function getLinePosition () {
		polyline.each(function (d, i) {
			labelPositions[i].rect = this.getBoundingClientRect();
		});
	}

	function getLabelPositions (elem, d, i) {
		var result = {};
		getLinePosition();
		if (labelPositions[i].align == "left") {			
			result.left = Math.floor(labelPositions[i].rect.left) + labelPositions[i].rect.width + 5 + "px";
		} else {
			result.left = Math.floor(labelPositions[i].rect.left) - elem.getBoundingClientRect().width - 5 + "px";
		}

		if (labelPositions[i].vertAlign == "top") {
			result.top =  Math.floor(labelPositions[i].rect.top) - elem.getBoundingClientRect().height / 2 + "px";
		} else {
			result.top =  Math.floor(labelPositions[i].rect.bottom) - elem.getBoundingClientRect().height / 2 + "px";
		}

		return result;
	}
}

var chart = new DonutChart(".chart", data);