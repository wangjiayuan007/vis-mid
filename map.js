//Width and height
var w = 800;
var h = 600;

//Define map projection


// var projection = d3.geo.mercator() //utiliser une projection standard pour aplatir les pôles, voir D3 projection plugin
// 	.center([13, 52]) //comment centrer la carte, longitude, latitude
// 	.translate([w / 2, h / 2]) // centrer l'image obtenue dans le svg
// 	.scale([w / 1.5]); // zoom, plus la valeur est petit plus le zoom est gros 

var projection = d3.geo.azimuthal()
	.mode("equidistant")
	.origin([12, 52])
	.scale([w / 1])
	.translate([w / 2, h / 2]);

//Define path generator
var path = d3.geo.path()
	.projection(projection);


//Create SVG
var svg = d3.select("#container").insert("svg:svg", "h2")
	.attr("width", w)
	.attr("height", h);

var states = svg.append("svg:g")
	.attr("id", "states");

var g = svg.append("g");
var circles = svg.append("svg:g")
	.attr("id", "circles");
var l_circles = svg.append("svg:g")
	.attr("id", "lcircles");
var cells = svg.append("svg:g")
	.attr("id", "cells");

var arcGroup = g.append('g');

var currentKey = "NULL";
var currentV = d3.select("#select-time").node().value; 
console.log(currentV);
//Load in GeoJSON data
d3.json("ne_50m_admin_0_countries_simplified.json", function(json) {

	//Bind data and create one path per GeoJSON feature
	states.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("stroke", "rgba(153, 76, 0, 0.2)")
		.attr("fill", "rgba(153, 76, 0, 0.3)");

});
var links = [];
var linkFile = "data/Link_1800.csv";
var nodeFile = "data/Node_1800.csv";


d3.csv(nodeFile, typeNode, renderNode);

// update
d3.select('#select-time').on('change', function() {
	d3.selectAll("circle").remove();
	currentV = d3.select(this).property('value');
	linkFile = "data/Link_".concat(currentV, ".csv");
	nodeFile = "data/Node_".concat(currentV, ".csv");
	d3.csv(nodeFile, typeNode, renderNode);
});


function draw_arc(flights) {
	links = [];
	for (var i = 0, len = flights.length; i < len; i++) {
		// (note: loop until length - 1 since we're getting the next
		//  item with i+1)
		if (flights[i].deathCityID == currentKey) {
			links.push({
				type: "LineString",
				coordinates: [
					[flights[i].lon1, flights[i].lat1],
					[flights[i].lon2, flights[i].lat2]
				],
				count: flights[i].count
			});
		}
	}
	//console.log(links);
	var pathArcs = arcGroup.selectAll(".arc")
		.data(links);

	//enter
	pathArcs.enter()
		.append("path")
		.attr({
			'class': 'arc'
		})
		.style({
			fill: 'none',
		});

	//update
	pathArcs.attr({
			//d is the points attribute for this path, we'll draw
			//  an arc between the points using the arc function
			d: path
		})
		.style({
			stroke: 'black',
		})
		.style("opacity", "0.5")
		.attr("stroke-width", function(flights) {
			console.log(flights.count);
			return flights.count;
		})

}

function renderNode(airports) {
	d3.csv(linkFile, typeLink, function(flights) {
		var positions = [];
		// Only consider airports with at least one flight.
		airports = airports.filter(function(airport) {
			var location = [+airport.longitude, +airport.latitude];
			positions.push(projection(location));
			return true;
		});

		circles.selectAll("circle")
			.data(airports)
			.enter().append("circle")
			.attr("cx", function(d, i) {
				return positions[i][0];
			})
			.attr("cy", function(d, i) {
				return positions[i][1];
			})
			.attr("r", function(d, i) {
				if (d.bir_sour == 1) {
					return Math.sqrt(d.birth);
				} else {
					return Math.sqrt(d.death);
				}
			})
			.style("opacity", "0.5")
			.attr("fill", function(d) {
				if (d.bir_sour == 1) {
					return 'blue';
				} else {
					return 'red';
				}
			})
			.on("mouseover", function(d, i) {
				currentKey = d.cityID;
				console.log(currentKey);
				draw_arc(flights);
				g.append("text")
					.attr("id", "cityName")
					.attr("x", 100) //positions[i][0]
					.attr("y", 300) //positions[i][1]
					.text(d.city)
					.attr("font-family", "sans-serif")
					.attr("font-size", 20);
				// (note: loop until length - 1 since we're getting the next
				//  item with i+1)
			})
			.on("mouseout", function(d) {
				currentKey = 0;
				console.log(currentKey);
				d3.selectAll(".arc").remove();
				d3.select("#cityName").remove();
			})
	})
}

function typeNode(d) {
	d.bir_sour = +d.bir_sour;
	d.birth = +d.birth;
	d.death = +d.death;
	return d;
}

function typeLink(d) {
	d.count = +d.count;
	return d;
}

function FUpdate() {
	d3.selectAll("circle").remove();
	linkFile = "data/Link_".concat(currentV, "F",".csv");
	nodeFile = "data/Node_".concat(currentV, "F",".csv");
	d3.csv(nodeFile, typeNode, renderNode);
}

function MUpdate() {
	d3.selectAll("circle").remove();
	linkFile = "data/Link_".concat(currentV, "M",".csv");
	nodeFile = "data/Node_".concat(currentV, "M",".csv");
	d3.csv(nodeFile, typeNode, renderNode);
}

function AUpdate() {
	d3.selectAll("circle").remove();
	linkFile = "data/Link_".concat(currentV,".csv");
	nodeFile = "data/Node_".concat(currentV,".csv");
	d3.csv(nodeFile, typeNode, renderNode);
}


