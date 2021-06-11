// Make API calls.
// Make API call.
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json', true);
xhr.send();
xhr.onload = () => {
    const json = JSON.parse(xhr.responseText);
    const dataset = json;
    treeDiagram(dataset);
}

function treeDiagram(movieSales) {
    // SVG constants.
    const height = 400;
    const width = 800;
    
    // Color scale.
    const genres = movieSales.children.map((obj) => {
        return obj.name;
    });

    const colorScale = d3.scaleOrdinal()
                         .domain(genres)
                         .range(d3.schemePaired);

    // Create and append SVG.
    const svg = d3.select('.visContainer')
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height);

    // Tooltip.
    const tooltip = d3.select('.visContainer')
                      .append('div')
                      .attr('id', 'tooltip')
                      .style('opacity', 0);
    
    // Plot Data.
    const treemap = d3.treemap()
                      .size([width, height])
                      .paddingInner(1);

    const root = d3.hierarchy(movieSales)
                   .eachBefore((d) => {
                       d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
                   })
                   .sum((d) => d.value)
                   .sort((a, b) => {
                       return b.height - a.height || b.value - a.value;
                   });
    
    treemap(root);

    var cell = svg.selectAll('g')
                  .data(root.leaves())
                  .enter()
                  .append('g')
                  .attr('class', 'group')
                  .attr('transform', function (d) {
                    return 'translate(' + d.x0 + ',' + d.y0 + ')';
                  });
    
    cell.append('rect')
        .attr('id', (d) => d.data.id)
        .attr('class', 'tile')
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value)
        .attr('fill', (d) => colorScale(d.data.category))
        .on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip
                   .html(
                       'Name: ' + d.data.name + '<br>' + 
                       'Catergory: ' + d.data.category + '<br>' +
                       'Value: ' + d.data.value
                   )
                   .attr('data-value', d.data.value)
                   .style('left', event.pageX + 'px')
                   .style('top', event.pageY + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition().duration(200).style('opacity', 0);
        })
    
    cell.append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data(function (d) {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g);
        })
        .enter()
        .append('tspan')
        .attr('x', 4)
        .attr('y', (d, i) => {
            return 10 * i + 20;
        })
        .text((d) => d);
    
    // Legend.
    const legendContainer = d3.select('#legend').attr('width', width);
    legendContainer.selectAll('rect')
                   .data(genres)
                   .enter()
                   .append('rect')
                   .attr('class', 'legend-item')
                   .attr('x', (d, i) => i * 110 + 30)
                   .attr('y', 10)
                   .attr('width', 20)
                   .attr('height', 20)
                   .style('fill', (d) => colorScale(d));
    legendContainer.selectAll('text')
                   .data(genres)
                   .enter()
                   .append('text')
                   .attr('x', (d, i) => i  * 110 + 55)
                   .attr('y', (d, i) => 22)
                   .attr('text-anchor', 'left')
                   .attr('alignment-baseline', ' middle')
                   .text((d) => d);


}