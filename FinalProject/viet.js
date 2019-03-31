
//Set margins and define dimensions
var margin = {top: 20, right: 65, bottom: 85, left: 80};
var width = 1200 - margin.right - margin.left;
var height = 500 - margin.top - margin.bottom;

//Create functions to parse date and coerce incoming data to numbers
var parser = d3.timeParse("%b-%Y");
var converter = function(d){
  return {
    Casualties: +d.Casualties,
    Date: parser(d.Date),
    text: d.Text,
    image: d.Images
    //Images: d.Images
  };
};

//Create SVG canvas using M. Bostock's Margin Conventions
var svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .style('background-color', 'lightblue')
  .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Import initial data feed using pre-built data converter function
d3.csv("data/time_data.csv", converter, function(error, data){
  if (error) {
    console.log(error);
  } //console.log(data);

  //Create X-axis scale
  var xscale = d3.scaleTime()
      .domain([d3.min(data, function(d){return d.Date;}),
               d3.max(data, function(d){return d.Date;})])
      .range([0, width]);

  //Create first Y-scale (for Casualties)
  var yscale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d){return d.Casualties;})])
    .range([height, 0]);

//Define Axis Calls for all three axes
var xAxisCall  = d3.axisBottom(xscale).ticks(30);
var yAxisCall  = d3.axisLeft(yscale);

//Create X-axis
var xAxis =
    svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    //Ensure to label ticks in simple day/month format
    .call(xAxisCall.tickFormat(d3.timeFormat("%b-%Y")))
  .selectAll("text")
    .style("text-anchor", "end")
    .style('fontweight', 'bold')
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

//Create Y-axis
var yAxis =
  svg
  .append('g')
  .attr('class', 'y-axis')
  .call(yAxisCall);

//Create line
var line = d3.line()
   .x(function(d) { return xscale(d.Date); })
   .y(function(d) { return yscale(d.Casualties); });

var area = d3.area()
    .x(function(d) { return xscale(d.Date); })
    .y0(function() { return yscale.range()[0]; })
    .y1(function(d) { return yscale(d.Casualties); });

//Embed line onto chart
var casLine =
 svg
  .append("path")
  .datum(data)
  .attr('class', 'line')
  .attr("fill", "black")
  .attr("stroke", "red")
  .attr("stroke-linejoin", "round")
  .attr("stroke-linecap", "round")
  .attr("stroke-width", 0)
  .attr("d", area)

//Set X-axis label
var xLabel =
 svg
  .append("text")
  .attr("transform", "translate(" + (width/2) + " ," + (height + margin.bottom - 15) + ")")
  .style("text-anchor", "center")
  .text("Date")
  .style('font-size', 20)
  .style('fontweight', 'bold');

//Set Y-label
var yLabel =
  svg
    .append('g')
    .attr('class', 'y-label')
    .attr('transform', 'translate(-45,' + (height/2) + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Casualties')
    .style('fontweight', 'bold')
    .style('font-size', 28);
});

d3.csv("data/events.csv", converter, function(error, data){
      if (error) {
        console.log(error);
      }
  var myTool = d3.select("body")
                .append("div")
                .attr("class", "mytooltip")
                .style("opacity", "0")
                .style("display", "none");
                //Create X-axis scale
  var parseTime = d3.timeParse("%b-%Y");

  var new_xscale = d3.scaleTime()
                     .domain([parseTime("Jun-1956"),
                             parseTime("May-1975")])
                     .range([0, width]);


                //Create first Y-scale (for Casualties)
  var yscale = d3.scaleLinear()
                 .domain([0, d3.max(data, function(d){return d.Casualties;})])
                 .range([height, 0]);

  var points =
      svg.selectAll('circle')
        .data(data).enter()
        .append('circle')
        .attr('class', 'points')
        .attr('cx', function(d) { return new_xscale(d.Date); })
        .attr('cy', function(d) { return yscale(d.Casualties); })
        .attr('r', 4)
        .style('fill', 'red')
        .on("mouseover", function(d){  //Mouse event
          d3.select(this)
            .transition()
            .duration(500)
            .attr("r", 10)
            .style("cursor", "pointer")
            .style("opacity", .25)
          myTool
            .transition()  //Opacity transition when the tooltip appears
            .duration(500)
            .style("opacity", 1)
            .style("display", "block") //The tooltip appears
          myTool
            .html("<div><span>" + d.text + "</span><img  id='thumbnail' src='" + d.image + "' /></div>")
            .style("left", function () {
                  if (d3.event.pageX > 1140) {
                    return (d3.event.pageX - 250) + "px";
                  }
                  else if (d3.event.pageX < 250) {
                      return (d3.event.pageX + 20) + "px";
                  }
                  else {
                    return (d3.event.pageX - 113) + "px";
                  }
              })
              .style("top", function () {

                  console.log(d3.event.pageX, d3.event.pageY);

                  if (d3.event.pageY < 105) {
                      return (d3.event.pageY + 20) + "px"
                  }
                  else if (d3.event.pageY > 480) {
                      return (d3.event.pageY - 200) + "px"
                  }
                  else {
                      return (d3.event.pageY - 200) + "px";
                  }
              }
              );
          })
         .on("mouseout", function (d) {
            d3.select(this)
              .transition()
              .duration(500)
              .style("cursor", "normal`")
              .attr("r", 4)
              .style('opacity', 1)
            myTool.transition()
                  .duration(125)
                  .style("opacity", "0")
                  .style("display", "none")});
});
