var data = [
	{
	"value": 6.4,
	"label": "Bankfinanzierung<br><b>6,4 Mio. €</b>",
	"color": "#5DA9D3",
	"highlight": "#7DC9F3"
	},
	{
	"value": 4,
	"label": "Eigenkapital<br><b>3 Mio. €</b>",
	"color": "#C3E693",
	"highlight": "#E3F6A3"
	},
	{
	"value": 2.1,
	"label": "Geplantes Crowdfunding<br><b>bis zu 1,1 Mio. €</b>",
	"color": "#99DBDE",
	"highlight": "#A9FBFE"
	},
	{
	"value": 6.4,
	"label": "Bankfinanzierung<br><b>6,4 Mio. €</b>",
	"color": "#ee7972",
	"highlight": "#ee9980"
	},
	{
	"value": 1.1,
	"label": "Geplantes Crowdfunding<br><b>bis zu 1,1 Mio. €</b>",
	"color": "#f886ac",
	"highlight": "#f89ac6"
	},
	{
	"value": 3,
	"label": "Eigenkapital<br><b>3 Mio. €</b>",
	"color": "#f8e28c",
	"highlight": "#f8ed91"
	}
];

var DonutChart = function (holderName, data, params) {
	"use strict";
	var width = d3.select(holderName)[0][0].getBoundingClientRect().width || 1000,
	height = (params && (params.height * width)) || 2 / 3 * width,
	radius = (params && (params.radius * width)) || 1 / 6 * width,
	innerRadius = (params && (params.innerRadius * radius)) || 2 / 3 * radius,
	labelPositions = [],
	spacing = 5,
	alpha = 5,	
	labelX,
	labelY;
	console.log(radius);

	var total = d3.sum(data, function (d) {
		return d.value;
	});

	var svg = d3.select(holderName)
		.style("position", "relative")
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
			return getLabelPositions(self, d, i).top + "px";
		})
		.style("left", function (d, i) {
			var self = this;
			return getLabelPositions(self, d, i).left + "px";
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

	var resizeTimer;

	d3.select(window).on("resize", function (d) {
		clearTimeout(resizeTimer);
		var currWidth =  parseInt(d3.select(holderName).style("width"));
		var currHeight = params.height * currWidth; 
		var currRadius = params.radius * currWidth;

    	d3.select("svg")
    		.attr("width", function (d) {			
				return currWidth;
			})
    		.attr("height", function (d) {
    			return currHeight;
    		})

		arc.outerRadius(currRadius)
			.innerRadius(function (d) {
				return params.innerRadius * currRadius;
			});
		arcs.attr("transform", "translate(" + currWidth / 2 + "," + currHeight / 2 + ")");
		
		paths.attr("d", arc);

		polyline.attr("points", function (d, i) {			
	        return getPolylinePoints(d, i, currRadius);
		});

		labels.style("top", function (d, i) {
				var self = this;				

				return  getLabelPositions(self, d, i).top + "px";
			})
			.style("left", function (d, i) {
				var self = this;

				return getLabelPositions(self, d, i).left + "px";
			})
		
		resizeTimer = setTimeout(pushTheLabels, 200);
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
        	x3 = x - 50;
        	labelPositions[i] = {
        		"align": "right"
        	};
        } else {
        	x2 = x + 10;
        	x3 = x + 50;
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
		var holderRect = d3.select(holderName)[0][0].getBoundingClientRect();
		polyline.each(function (d, i) {
			labelPositions[i].left = this.getBoundingClientRect().left - holderRect.left;
			labelPositions[i].top = this.getBoundingClientRect().top - holderRect.top;
			labelPositions[i].width = this.getBoundingClientRect().width;
			labelPositions[i].height = this.getBoundingClientRect().height;
		});
	}

	function getLabelPositions (elem, d, i) {
		var result = {};
		getLinePosition(labelPositions[i]);
		if (labelPositions[i].align == "left") {			
			result.left = Math.floor(labelPositions[i].left) + labelPositions[i].width + 5;
		} else {
			result.left = Math.floor(labelPositions[i].left) - elem.getBoundingClientRect().width - 5;
		}

		if (labelPositions[i].vertAlign == "top") {
			result.top =  Math.floor(labelPositions[i].top) - elem.getBoundingClientRect().height / 2;
		} else {
			result.top =  Math.floor(labelPositions[i].top + labelPositions[i].height) - elem.getBoundingClientRect().height / 2;
		}

		return result;
	}

	function pushTheLabels () {
		var again = false;
		var holderRect = d3.select(holderName)[0][0].getBoundingClientRect();

		labels.each(function (d, i) {
			var a = this;
			var label_1 = d3.select(this);
			var label_1BottomPoint = this.getBoundingClientRect().top - holderRect.top+ this.getBoundingClientRect().height;
			var label_1TopPoint = this.getBoundingClientRect().top - holderRect.top;

			labels.each(function (d, i) {
				var b = this;
				var label_2 = d3.select(this);

				if (a == b) {
					return;
				}

				if (label_1.style("text-align") !== label_2.style("text-align")) {
					return;
				}

				var label_2TopPoint = this.getBoundingClientRect().top - holderRect.top;
				var label_2BottomPoint = this.getBoundingClientRect().top - holderRect.top + this.getBoundingClientRect().height;
				
				label_2TopPoint > label_1TopPoint && label_2TopPoint < label_1BottomPoint;

				if (label_2TopPoint - label_1BottomPoint >= spacing) {
					return;
				} else if (label_2TopPoint > label_1TopPoint && label_2TopPoint < label_1BottomPoint) {
					again = true;

					label_1.style("top", label_1TopPoint - alpha + "px");
					label_2.style("top", label_2TopPoint + alpha + "px");
				}
			});
		});

		if (again) {
			pushTheLabels();
		}
	}

	pushTheLabels();
}
window.onload = function () {
	var params = {
		height: 0.4,
		radius: 0.15,
		innerRadius: 0.6
	}
	var chart = new DonutChart(".chart", data, params);
};