var w = 800
var h = 850
var tooltip
var margin = 40

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

    var maleData = {
      name: '男',
      value: json.features.map(function(provinceData) {
        return { province: provinceData.properties.name, count: provinceData.properties.male }
      })
    }

    var femaleData = {
      name: '女',
      value: json.features.map(function(provinceData) {
        return { province: provinceData.properties.name, count: provinceData.properties.female }
      })
    }

    var dataset = []
    dataset.push(maleData)
    dataset.push(femaleData)

    var sex = dataset.map(function(d) {
      return d.name
    })

    var dataset = dataset.map(function(d) {
      return d.value.map(function(o) {
        return {
          y: o.count,
          x: o.province
        }
      })
    })
    stack = d3.layout.stack()
    stack(dataset)

    dataset = dataset.map(function(group) {
      return group.map(function(d) {
        return {
          x: d.y,
          y: d.x,
          x0: d.y0
        }
      })
    })

    var width = w - 2 * margin
    var height = h - 2 * margin
    var formatNumber = d3.format(",f")

    var svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + margin + ',0)')

    var xMax = d3.max(dataset, function(group) {
      return d3.max(group, function(d) {
        return d.x + d.x0
      })
    })

    var xScale = d3.scale.linear()
      .domain([0, xMax])
      .range([0, width])
    var provinces = dataset[0].map(function(d) {
      return d.y
    })

    var yScale = d3.scale.ordinal()
      .domain(provinces)
      .rangeRoundBands([0, height - 2 * margin], .1)

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')

    var colours = d3.scale.category10()
    var groups = svg.selectAll('g')
      .data(dataset)
      .enter()
      .append('g')
      .style('fill', function (d, i) {
      return colours(i)
    })

    var rects = groups.selectAll('rect')
      .data(function (d) {
        return d;
      })
      .enter()
      .append('rect')
      .attr('x', function (d) {
        return xScale(d.x0) || 0
      })
      .attr('y', function (d, i) {
        return yScale(d.y)
      })
      .attr('height', function (d) {
        return yScale.rangeBand()
      })
      .attr('width', function (d) {
        return xScale(d.x) || 0
      })
      .on('mouseover', function(d) {
        d3.select('body').selectAll('div.tooltip').remove()
        tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .classed('img', true)
          .style('opacity', 0)
      })
      .on('mousemove', function(d) {

        tooltip.transition().duration(300)
          .style('opacity', 1)

        var bodyNode = d3.select('body').node()
        var absoluteMousePos = d3.mouse(bodyNode)
        var content
        if (d.x0 === 0) {
          content = '<img src="images/male.png" /><span>' + formatNumber(d.x) + '</span>'
        } else {
          content = '<img src="images/female.png" /><span>' + formatNumber(d.x) + '</span>'
        }

        tooltip.html(content)
        .style('left', (absoluteMousePos[0] + 10) + 'px')
        .style('top', (absoluteMousePos[1] - 25) + 'px')
      })
      .on('mouseout', function() {
        tooltip.transition().duration(300)
          .remove()
      })

    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - 2*margin) + ')')
      .call(xAxis)

    svg.append('g')
      .attr('class', 'axis')
      .call(yAxis)

    sex.forEach(function (s, i) {
      svg.append('text')
        .attr('fill', 'black')
        .attr('x', -margin/2)
        .attr('y', height - margin + i*20)
        .text(s)
      svg.append('rect')
        .attr('fill', colours(i))
        .attr('width', 60)
        .attr('height', 20)
        .attr('x', -margin/2 + 24)
        .attr('y', height - margin + i*20 - 14)
    })

    svg.append('text')
      .attr('fill', 'black')
      .attr('font-size', 20)
      .attr('x', margin*2)
      .attr('y', height - margin + 22)
      .text('中国各省市性别人口比例图')

  })

})

