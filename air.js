var margin = {top: 20, right: 20, bottom: 30, left: 50}
var foot = {height: 30}
var width = 960 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom

var parseDate = d3.time.format("%Y-%m-%d %X").parse

var xScale = d3.time.scale()
  .range([0, width])

var yScale = d3.scale.linear()
  .range([height, 0])

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient('bottom')

var yAxis = d3.svg.axis()
  .scale(yScale)
  .orient('left')

var line = d3.svg.line()
  .interpolate('basis')
  .x(function(d) { return xScale(d.date) })
  .y(function(d) { return yScale(d.aqi) })

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

d3.csv('data/shanghai_air.csv', function(data) {
  var data = data.filter(function(d) {
    return d['监测点'] === ''
  })

  data.forEach(function(d) {
    d.date = parseDate(d['时间'])
    d.aqi = +d['AQI']
  })

  xScale.domain([data[0].date, data[data.length - 1].date])
  yScale.domain(d3.extent(data, function(d) { return d.aqi }))

  svg.append('clipPath')
    .attr('id', 'clip-above')
    .append('rect')
    .attr('width', width)
    .attr('height', yScale(100))

  svg.append('clipPath')
    .attr('id', 'clip-below')
    .append('rect')
    .attr('y', yScale(100))
    .attr('width', width)
    .attr('height', height - yScale(100))

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('AQI')

  svg.selectAll('.line')
    .data(['above', 'below'])
    .enter()
    .append('path')
    .attr('class', function(d) { return 'line ' + d})
    .attr('clip-path', function(d) { return 'url(#clip-' + d + ')' })
    .datum(data)
    .attr('d', line)
})

// footer
var footer = d3.select('body')
  .append('svg')
  .attr('width', 960)
  .attr('height', foot.height)

footer.append('text')
  .attr('x', margin.left)
  .attr('y', foot.height/2)
  .text('上海市12月空气质量')
  .style('font-size', 18)

footer.append('rect')
  .attr('x', 960 - 100*2 - 50*2)
  .attr('y', 10)
  .attr('width', 50)
  .attr('height', 10)
  .attr('fill', '#f00')

footer.append('text')
  .attr('x', 960 - 100*2 - 40)
  .attr('y', foot.height/2 + 3)
  .text('不健康（或更差）')

footer.append('rect')
  .attr('x', 960 - 100 - 50)
  .attr('y', 10)
  .attr('width', 50)
  .attr('height', 10)
  .attr('fill', '#000')

footer.append('text')
  .attr('x', 960 - 100 + 10)
  .attr('y', foot.height/2 + 3)
  .text('良好（或更好）')