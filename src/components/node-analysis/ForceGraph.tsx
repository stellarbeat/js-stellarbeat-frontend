import * as d3 from "d3"; //todo only import what is needed
import { GraphData, GraphNode, GraphLink } from "../../services/core-node-admin-panel/Types/GraphTypes";
import { HaltingFailure } from "@stellar/halting-analysis"
import {Selection} from 'd3';

const SimValues = {
  ManyBodyStrength: -700
};

const NodeStyles = {
  radius: 6,
  className: (n: SimNode) => {
    const classes = ["node"];
    if (n.data.distance === 0) classes.push("self");
    if (n.vulnerable) classes.push("vulnerable");
    classes.push(n.live ? "live" : "dead");
    return classes.join(" ");
  }
};

const LinkStyles = {
  className: (l: SimLink) => {
    const classes = ["link"];
    classes.push(l.live ? "live" : "dead");
    return classes.join(" ");
  }
};

interface SimNode extends d3.SimulationNodeDatum {
  x: number;
  y: number;
  fx?: number;
  fy?: number;
  id: string;
  active?: boolean;
  data: GraphNode;
  live: boolean;
  vulnerable: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  active?: boolean;
  live: boolean;
}

const ForceGraph = (
  el: SVGSVGElement,
  data: GraphData,
  failure?: HaltingFailure
) => {
  if (!data) return;
  const svg = d3.select(el);
  svg.html("");
  const w = parseInt(svg.attr("width"));
  const h = parseInt(svg.attr("height"));
  const container = svg.append("g");
  const zoom: d3.ZoomBehavior<SVGSVGElement, unknown> = d3.zoom();
  zoom.scaleExtent([1 / 2, 8]).on("zoom", function() {
    container.attr("transform", d3.event.transform);
  });
  svg.call(zoom as any);

  const links: SimLink[] = data.links.map((l: GraphLink) => {
    const link = {
      source: l.source,
      target: l.target,
      live: true
    };
    if (failure) {
      if (failure.affectedNodes.find(n => n.node === link.target)) {
        link.live = false;
      }
    }
    return link;
  });
  const nodes: SimNode[] = data.nodes.map((n: GraphNode) => {
    const simNode = {
      x: w / 2 + Math.random() * 50 - 25,
      y: h / 2 + Math.random() * 50 - 25,
      id: n.id,
      data: n,
      live: true,
      vulnerable: false
    };

    if (failure) {
      if (failure.affectedNodes.find(n => n.node === simNode.id)) {
        simNode.live = false;
      }
      if (failure.vulnerableNodes.find(n => n.node === simNode.id)) {
        simNode.vulnerable = true;
      }
    }

    return simNode;
  });
console.log(links);
  const simulation: d3.Simulation<SimNode, SimLink> = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink<SimNode, SimLink>(links).id(n => n.id))
    .force("charge", d3.forceManyBody().strength(SimValues.ManyBodyStrength))
    .force("x", d3.forceX(w / 2))
    .force("y", d3.forceY(h / 2));

  const drag = (sim: d3.Simulation<SimNode, SimLink>) => {
    const dragStart = (d: SimNode, i: number) => {
      if (!d3.event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x; // fix position to mouse
      d.fy = d.y;
    };

    const dragged = (d: SimNode) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    const dragEnd = (d: SimNode) => {
      if (!d3.event.active) sim.alphaTarget(0);
      delete d.fx;
      delete d.fy;
    };

    return d3
      .drag<SVGElement, SimNode>()
      .on("start", dragStart)
      .on("drag", dragged)
      .on("end", dragEnd);
  };

  const link = container
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("class", LinkStyles.className);

  const labels = container
    .append("g")
    .selectAll("text")
    .data<SimNode>(nodes)
    .join("text")
    .text(n => n.id)
    .attr("pointer-events", "none");

  const nodeGroup = container
    .append("g")
    .selectAll<SVGElement, SimNode>("circle")
    .data<SimNode>(nodes)
    .join("g");

  nodeGroup
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .call(drag(simulation))
    .append("circle")
    .attr("r", NodeStyles.radius)
    .attr("class", NodeStyles.className)
    .attr("data-vulnerable", (n: SimNode) => n.vulnerable);

  nodeGroup
    .select(".node.self")
    .select(function() {
      // @ts-ignore this possibly being null.  We will always have a self node.
      return this.parentNode;
    })
    .append("text")
    .text(n => (n.live ? "😀" : "😭"));

  simulation.on("tick", () => {
    link
      .attr("x1", d => (d.source as SimNode).x)
      .attr("y1", d => (d.source as SimNode).y)
      .attr("x2", d => (d.target as SimNode).x)
      .attr("y2", d => (d.target as SimNode).y);

    nodeGroup
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .selectAll<SVGCircleElement, SimNode>("circle")
      .attr("class", NodeStyles.className);

    labels
      .attr("transform", d => `translate(${d.x + 10}, ${d.y - 10})`)
      .attr("visibility", n =>
        n.active || n.data.distance === 0 ? "visible" : "visible"
      );
  });
};

export default ForceGraph;
