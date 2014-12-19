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
  d3.select('#area')
    .on('change', function() {
      redraw(data, this.value)
    })
    .selectAll('option')
    .data(data
      .map(function(d) { return d['监测点'] })
      .filter(function(e, i, arr) {
        return arr.lastIndexOf(e) === i
    }))
    .enter().append('option')
    .attr('value', function(d) { return d })
    .attr('selected', function(d) { if (d === '') return true})
    .text(function(d) {
      if (d === '') {
        return '全市'
      } else {
        return d
      }
    })

  redraw(data)
})

function redraw(data, area) {
  svg.html('')
  area = area || ''
  var data = data.filter(function(d) {
    return d['监测点'] === area
  })

  data.forEach(function(d) {
    d.date = parseDate(d['时间'])
    d.aqi = +d['AQI']
  })

  xScale.domain([data[0].date, data[data.length - 1].date])
  yScale.domain(d3.extent(data, function(d) { return d.aqi }))

  svg.append('linearGradient')
    .attr('id', 'aqi-gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0).attr('y1', yScale(d3.min(data, function(d) { return d.aqi })))
    .attr('x2', 0).attr('y2', yScale(d3.max(data, function(d) { return d.aqi })))
    .selectAll('stop')
    .data([
      {offset: '0%', color: 'green'},
      {offset: '25%', color: 'yellow'},
      {offset: '50%', color: 'orange'},
      {offset: '75%', color: 'red'},
      {offset: '100%', color: 'purple'}
    ])
    .enter()
    .append('stop')
    .attr('offset', function(d) { return d.offset })
    .attr('stop-color', function(d) { return d.color })

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

  svg.append('path')
    .datum(data)
    .attr('class', 'line gradient')
    .attr('d', line)
}

// footer
var footer = d3.select('body')
  .append('svg')
  .attr('width', 960)
  .attr('height', foot.height)

footer.append('text')
  .attr('x', width/2)
  .attr('y', foot.height/2)
  .text('上海市12月空气质量')
  .style('font-size', 18)
