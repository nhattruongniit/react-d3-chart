/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react'
import * as d3 from "d3";
import { getColorText } from "../helpers/getColorText";


const convertData = (variant) => {
	const lowerBound = variant?.confidentialInternal?.lowerBound ?? 0;
	const upperBound = variant?.confidentialInternal?.upperBound ?? 0;
	const midpoint = variant?.confidentialInternal?.changes ?? 0;

	// get color line track
	let colorTrack = "#a0a0a0";
	if (lowerBound < 0 && upperBound < 0) {
		colorTrack = "#f00";
	}
	if (lowerBound > 0 && upperBound > 0) {
		colorTrack = "#239126";
	}

	// get color of dot
	const colorTextLow = getColorText(lowerBound);
	const colorTextMid = getColorText(midpoint);
	const colorTextUpper = getColorText(upperBound);

	return {
		name: variant.name,
		low: lowerBound,
		mid: (lowerBound + upperBound) / 2,
		upper: upperBound,
		colorTrack,
		colorTextLow,
		colorTextMid,
		colorTextUpper
	}
}

function DotPlot({ variants = [] }) {
	const dataviz = useRef();

	const { lowestBound, highestBound } = variants.reduce(
		(acc, variant) => {
			const lowerBound = variant?.confidentialInternal?.lowerBound ?? 0;
			const upperBound = variant?.confidentialInternal?.upperBound ?? 0;
			if (lowerBound < acc.lowestBound) {
				acc.lowestBound = lowerBound;
			}
			if (upperBound > acc.highestBound) {
				acc.highestBound = upperBound;
			}
			return acc;
		},
		{ lowestBound: 0, highestBound: 0 }
	);

	useEffect(() => {
		// calculate label width
		const labels = variants.map(v => v.name);
		const longestLabel = labels.sort((a, b) => b.length - a.length)[0];
		const newDiv = document.createElement("div");
		newDiv.append(longestLabel);
		const fontSize = "12px";
		newDiv.style.cssText = `position:absolute;visibility:hidden;height:auto;width:auto;white-space:nowrap;font-size:${fontSize}`
		document.body.append(newDiv);
		const labelWidth = newDiv.clientWidth + 1;
		newDiv.remove();

		const plotData = variants.map(v => convertData(v));

		// set the dimensions and margins of the graph
		const margin = { top: 30, right: 30, bottom: 30, left: labelWidth + 20 },
			width = dataviz.current.clientWidth - margin.left - margin.right,
			height = labels.length * 50 - margin.top - margin.bottom;

		// append the svg object to the body of the page
		const svg = d3.select(dataviz.current)
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", `translate(${margin.left}, ${margin.top})`);

		// Add X axis
		const x = d3.scaleLinear()
			.domain([lowestBound, highestBound])
			.range([0, width])
			.nice();
		svg.append("g")
			.call(d3.axisTop(x).tickSize(-1 * height))

		// Y axis
		const y = d3.scaleBand()
			.range([0, height])
			.domain(plotData.map(function (d) { return d.name; }))
			.padding(1);
		svg.append("g")
			.style("font-size", `${fontSize}`)
			.call(d3.axisLeft(y))

		const hasData = plotData.filter(p => p.upper - p.low > 0)

		// Lines
		const stk_w = "4px";
		svg.selectAll("myline")
			.data(hasData)
			.join("line")
			.attr("x1", function (d) { return x(d.low); })
			.attr("x2", function (d) { return x(d.mid); })
			.attr("y1", function (d) { return y(d.name); })
			.attr("y2", function (d) { return y(d.name); })
			.attr("stroke", function (d) { return d.colorTrack; })
			.attr("stroke-width", stk_w)

		svg.selectAll("myline")
			.data(hasData)
			.join("line")
			.attr("x1", function (d) { return x(d.mid); })
			.attr("x2", function (d) { return x(d.upper); })
			.attr("y1", function (d) { return y(d.name); })
			.attr("y2", function (d) { return y(d.name); })
			.attr("stroke", function (d) { return d.colorTrack; })
			.attr("stroke-width", stk_w)

		const r = "5";
		// Circles of variable 1
		svg.selectAll("mycircle")
			.data(hasData)
			.join("circle")
			.attr("cx", function (d) { return x(d.low); })
			.attr("cy", function (d) { return y(d.name); })
			.attr("r", r)
			.style("fill", function (d) { return d.colorTrack; })

		// Circles of variable 2
		svg.selectAll("mycircle")
			.data(hasData)
			.join("circle")
			.attr("cx", function (d) { return x(d.mid); })
			.attr("cy", function (d) { return y(d.name); })
			.attr("r", r)
			.style("fill", function (d) { return d.colorTrack; })

		// Circles of variable 3
		svg.selectAll("mycircle")
			.data(hasData)
			.join("circle")
			.attr("cx", function (d) { return x(d.upper); })
			.attr("cy", function (d) { return y(d.name); })
			.attr("r", r)
			.style("fill", function (d) { return d.colorTrack; })

	}, []);

	return (
		<div ref={dataviz} />
	);
}

export default DotPlot;
