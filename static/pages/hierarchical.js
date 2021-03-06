function drawCirclePack(root) {
  const canvasPaddingLeft = 10;
  const canvasPaddingTop = 10;

  const svg = d3.select('svg#circlepack');

  const circleFill = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(['#364f6b', '#3fc1c9', '#f5f5f5', '#fc5185']);

  const circleRoot = d3.pack()
    .size([700, 700])
    .padding(5)(root);
  // console.log(circleRoot);

  const allPackG = svg.selectAll('g.pack').data(circleRoot.descendants());
  
  allPackG.enter()
    .append('g')
    .attr('class', 'pack')
    .attr('transform', (d) => `translate(${canvasPaddingLeft + d.x} ${canvasPaddingTop + d.y})`)
    .each(function(d, i) {
      const circle = d3.select(this).append('circle');
      circle
        .attr('r', d.r)
        .attr('fill', circleFill(d.depth));
      if (d.data.content) {
        const text = d3.select(this).append('text');
        const content = (d.data.content.length > 15)
          ? d.data.content.slice(0, 12) + '...'
          : d.data.content;
        text
          .attr('text-anchor', 'middle')
          .attr('font-size', '13px')
          .text(content);
      }
    });

  allPackG.exit().remove();
}

function drawTree(root) {
  const canvasPaddingTop = 10;
  const canvasPaddingLeft = 10;
  const canvasWidth = 700;
  const canvasHeight = 700;

  const svg = d3.select('svg#tree');

  const nodeFill = d3.scaleOrdinal()
    .domain([0, 1, 3, 2])
    .range(['#364f6b', '#3fc1c9', '#f5f5f5', '#fc5185']);

  const treeRoot = d3.radialTree().radius(75)(root);
  // console.log(treeRoot);

  const canvas = svg.select('g#treecanvas')
    .attr('transform', `translate(${canvasPaddingLeft + canvasWidth / 2}, ${canvasPaddingTop + canvasHeight / 2})`);

  const allLink = canvas.selectAll('path.link').data(treeRoot.descendants());
  const allNode = canvas.selectAll('g.node').data(treeRoot.descendants());

  allLink.enter()
    .append('path')
    .attr('class', 'link')
    .attr('stroke', (d) => nodeFill(d.depth))
    .attr('fill', 'none')
    .attr('d', (d) => {
      if (d.parent) {
        return d3.linkVertical()({
          source: [d.x, d.y], 
          target: [d.parent.x, d.parent.y],
        });
      }
      return '';
    }); 

  allNode.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (d) => `translate(${d.x} ${d.y})`)
    .each(function(d, i) {
      const circle = d3.select(this).append('circle');
      circle
        .attr('r', 5)
        .attr('fill', nodeFill(d.depth));
    });

  allLink.exit().remove();
  allNode.exit().remove();
}

window.addEventListener('load', function() {
  d3.json('/static/data/tweets.json').then((data) => {
    const tweets = data.tweets;
    const nestedTweets = d3.group(tweets, (d) => d.user);
    const root = d3.hierarchy(nestedTweets, (d) => d[1]).sum(() => 1);
    console.log(root);

    // drawCirclePack(root);
    drawTree(root);
  }, (err) => {
    console.error(err);
  });
});
