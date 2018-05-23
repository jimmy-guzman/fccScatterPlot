import styles from "./scss/index.scss";
import * as d3 from "d3";
import d3Tip from "d3-tip";

function formatMinutes(d) {
  const mins = Math.floor(d / 60),
    secs = d % 60;
  const mm = mins < 10 ? `0${mins}` : `${mins}`,
    ss = secs < 10 ? `${secs}0` : `${secs}`;
  return `${mm}:${ss}`;
}

const dataUrl =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const margin = {
  top: 100,
  right: 150,
  bottom: 100,
  left: 75
};

const tip = d3Tip()
  .attr("class", "d3-tip ")
  .offset([-10, 0])
  .html(
    d => `
    <span> ${d.Name}(${d.Nationality})</span> </br>
    <span> Year: ${d.Year} Time: ${d.Time}(${d.Place})</span> </br>
    <hr>
    <span> ${d.Doping}</span>
  `
  );

const width = 800 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const g = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`);

const yAxisGroup = g.append("g").attr("class", "y axis");

const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([0, height]);
const colorScale = d3.scaleOrdinal(["green", "red"]);

const title = g
  .append("text")
  .attr("class", "chart__title")
  .attr("x", width / 2)
  .attr("y", -50)
  .attr("font-size", "32px")
  .attr("text-anchor", "middle")
  .text("Doping in Professional Bicycle Racing");

const xLabel = g
  .append("text")
  .attr("class", "x axis-Label")
  .attr("x", width / 2)
  .attr("y", height + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Minutes Behind Fastest Time");

const yLabel = g
  .append("text")
  .attr("class", "y axis-Label")
  .attr("x", 0)
  .attr("y", -30)
  .attr("font-size", "20px")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .text("Ranking");

const legendTitles = [
  "No doping allegations",
  "Riders with doping allegations"
];

const legend = g
  .append("g")
  .attr("transform", `translate(${width + 100}, ${height - 125})`);

legendTitles.forEach((title, i) => {
  const legendRow = legend
    .append("g")
    .attr("transform", `translate(0, ${i * 20})`);

  legendRow
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", colorScale(title));

  legendRow
    .append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(title);
});

d3.json(dataUrl).then(response => {
  console.log(response);
  update(response);
});

function update(data) {
  yScale.domain([1, 36]);
  xScale.domain([210, 0]);

  const yAxisCall = d3.axisLeft(yScale);
  yAxisGroup.call(yAxisCall);

  const xAxisCall = d3
    .axisBottom(xScale)
    .ticks(3)
    .tickFormat(formatMinutes);
  xAxisGroup.call(xAxisCall);

  g.call(tip);

  // JOIN new data with old elements
  const circles = g.selectAll("circle").data(data, d => d.Place);

  // EXIT old elements not present in new data
  circles
    .exit()
    .attr("class", "exit")
    .remove();

  // ENTER new elements present in new data
  circles
    .enter()
    .append("circle")
    .attr("class", "enter")
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    // And UPDATE old elements present in new data
    .merge(circles)
    .attr("fill", d => (d.Doping.length > 0 ? "red" : "green"))
    .attr("r", 5)
    .attr("cx", d => xScale(d.Seconds - data[0].Seconds))
    .attr("cy", d => yScale(d.Place));

  circles
    .enter()
    .append("text")
    .merge(circles)
    .attr("fill", d => (d.Doping.length > 0 ? "red" : "green"))
    .attr("x", d => xScale(d.Seconds - data[0].Seconds) + 10)
    .attr("dy", d => yScale(d.Place) + 5)
    .text(d => d.Name);
}
