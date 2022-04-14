"use strict";

function initD3Graph(selector, nodes, links, groupColors, addTexts = false, manyBodyForceStrength = -1000, width = window.innerWidth, height = window.innerHeight) {
  // set params
  var highlightingColor = "#FFA500";
  var linkColor = "#E5E5E5";

  var nodeSize = 10;
  var markerHeight = 6;
  var markerWidth = 6;

  // init dragDrop
  var dragDrop = d3.drag().on('start', function(event, node) {
    node.fx = node.x;
    node.fy = node.y;
  }).on('drag', function(event, node) {
    simulation.alphaTarget(0.7).restart();
    node.fx = event.x;
    node.fy = event.y;
  }).on('end', function(event, node) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    node.fx = null;
    node.fy = null;
  });

  // build svg root
  var svg = d3.select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", function(event) {
      svg.attr("transform", event.transform);
    }));

  // add the links and arrows
  svg = svg.append("g");

  // build links and nodes with (tooltip) texts
  var linkElements = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
        .attr("stroke-width", function(link) {
          return link.strength ? link.strength : 1;
        })
        .attr("stroke", linkColor)
        .attr("class", "link");

  var nodeWrappers = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("g");

  var nodeElements = nodeWrappers.append("circle")
    .attr("r", nodeSize)
    .attr("fill", getNodeColor)
    .call(dragDrop).on('click', selectNode);
  nodeElements.append("svg:title")
    .text(function(node) {
        return node.id;
    });

  var textElements = null;
  if (addTexts) {
    textElements = nodeWrappers.append("svg:text");
    textElements.each(function(node) {
        let currentTextElement = d3.select(this);
        currentTextElement.text(function(node) {
            return node.text ? node.text : node.id;
        });
    });
  }

  // init simulation with forces
  var linkForce = d3.forceLink()
    .id(function(link) {
      return link.id;
    });

  var simulation = d3.forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(manyBodyForceStrength))
    .force('center', d3.forceCenter(width / 2, height / 2));

  simulation.nodes(nodes).on('tick', () => {
    nodeElements
      .attr('cx', function(node) {
        return node.x;
      })
      .attr('cy', function(node) {
        return node.y;
      });
    if (textElements != null) {
      textElements
        .attr('x', function(node) {
          return node.x + nodeSize;
        })
        .attr('y', function(node) {
          return node.y + nodeSize / 2;
        });
    }
    linkElements
      .attr('x1', function(link) {
        return link.source.x;
      })
      .attr('y1', function(link) {
        return link.source.y;
      })
      .attr('x2', function(link) {
        return link.target.x;
      })
      .attr('y2', function(link) {
        return link.target.y;
      });
  });

  simulation.force("link").links(links);


  // init local helper functions
  function selectNode(event, selectedNode) {
    var neighbors = getNeighbors(selectedNode);

    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function(node) {
      return getNodeColor(node, neighbors);
    });
    linkElements.attr('stroke', function(link) {
      return getLinkColor(selectedNode, link);
    });
  }

  function getNeighbors(node) {
    return links.reduce(function(neighbors, link) {
        if (link.target.id === node.id) {
          neighbors.push(link.source.id);
        } else if (link.source.id === node.id) {
          neighbors.push(link.target.id);
        }
        return neighbors;
      },
      [node.id]
    );
  }

  function isNeighborLink(node, link) {
    return link.target.id === node.id || link.source.id === node.id;
  }

  function getNodeColor(node, neighbors) {
    return groupColors[node.group];
  }


  function getLinkColor(node, link) {
    return isNeighborLink(node, link) ? highlightingColor : linkColor;
  }
}
