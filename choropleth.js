/**
 * Build the choropleth
 * @param {Object} json    The data
 * @param {Object} options The options for the chart
 */
var Choropleth = function(json, options) {
  var container = options.container || 'body'
  var projection = options.projection
  var w = options.width || 960
  var h = options.height || 600
  var domain = options.domain
  var colors = options.colors
  var path = options.path
  var formatNumber = d3.format(",f")

  var tooltip
  var colorScale = d3.scale.quantize()
    .range(colors)
    .domain(domain)

  var svg = d3.select(container)
    .append('svg')
    .attr('width', w)
    .attr('height', h)

  svg.selectAll('path')
    .data(json.features)
    .enter()
    .append('path')
    .attr('class', 'province')
    .attr('d', path)
    .style('fill', function(d) {
      var total = d.properties.total
      if (total) {
        return colorScale(total)
      } else {
        return '#ccc'
      }
    })
    .on('mouseover', function(d) {
      d3.select(this).transition().duration(300).style('opacity', 1)
      d3.select('body').selectAll('div.tooltip').remove()
      tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip choropleth')
        .style('opacity', 0)
    })
    .on('mousemove', function(d) {
      tooltip.transition().duration(300).style('opacity', 1)

      var bodyNode = d3.select('body').node()
      var absoluteMousePos = d3.mouse(bodyNode)
      tooltip.html('<span>' + d.properties.name + ' : ' + formatNumber(d.properties.total) + '</span>')
        .style('left', (absoluteMousePos[0] + 10) + 'px')
        .style('top', (absoluteMousePos[1] - 25) + 'px')
    })
    .on('mouseout', function() {
      d3.select(this)
        .transition().duration(300)
        .style('opacity', 0.8)
      tooltip.transition().duration(300)
        .remove()
    })

  // legend
  var legend  = svg.selectAll('g.legend')
    .data(colors)
    .enter()
    .append('g')
    .attr('class', 'legend')

  var ls_w = 20, ls_h = 20

  legend.append('rect')
    .attr('x', 20)
    .attr('y', function(d, i) { return h - (i*ls_h) - 2*ls_h })
    .attr('width', ls_w)
    .attr('height', ls_h)
    .style('fill', function(d) { return d })

  legend.append('text')
    .attr('x', 50)
    .attr('y', function(d, i){ return h - (i*ls_h) - ls_h - 4})
    .text(function(d, i){
      return formatNumber(colorScale.invertExtent(d)[0])  + ' - ' + formatNumber(colorScale.invertExtent(d)[1])
    })
}

// Prepare the data and render the graph
d3.csv('data/population.csv', function(data) {
  d3.json('data/china_provinces.json', function(json) {
    for (var i = 0; i < data.length; i++) {
      var dataProvince = data[i].name
      var total = parseInt(data[i].total)
      var male = parseInt(data[i].male)
      var female = parseInt(data[i].female)
      for (var j = 0; j < json.features.length; j++) {
        var jsonProvince = json.features[j].properties.name
        if (jsonProvince == dataProvince) {
          json.features[j].properties.total = total
          json.features[j].properties.male = male
          json.features[j].properties.female = female
          break
        }
      }
    }

    var w = 960
    var h = 600
    var projection = d3.geo.mercator().center([105, 38]).scale(750).translate([w/2, h/2])
    var path = d3.geo.path().projection(projection)

    Choropleth(json, {
      container: 'body',
      domain: [ d3.min(data, function(d) { return d.total }), d3.max(data, function(d) { return d.total })],
      width: w,
      height: h,
      path: path,
      colors: ['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)', 'rgb(49,163,84)','rgb(0,109,44)']
    })

  })
})
