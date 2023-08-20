import { getNodeColor } from "./getNodeColor.js";
import { showTooltip, hideTooltip } from "./employeeTooltip.js";
import { showTopRightInfoBox, hideTopRightInfoBox } from "./topRightInfoBox.js";

// EXPORTED TO BE USED IN OTHER FILES LIKE showLeadsButton.js TO UPDATE THIS CHART
export let root;
export let svgContainer;
export let gNode;
export let gLink;
export let diagonal;
export let tree;

// SPECIFYING THE DIMENSIONS OF THE CHART AND THE MARGINS
export const width = 1366, marginTop = 100, marginRight = 20, marginBottom = 10, marginLeft = 50;

export function createChart(rootData) {
    root = rootData;

    // DEFINING THE DIMENSIONS OF THE CHART
    const dx = 30;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // DEFINING THE TREE LAYOUT AND THE SHAPE FOR LINKS OF THE CHART
    tree = d3.tree().nodeSize([dx, dy]);
    diagonal = d3.linkHorizontal().x(dt => dt.y).y(dt => dt.x);

    // CREATING THE SVG CONTAINER AND THE LAYERS FOR LINKS AND NODES OF THE CHART
    svgContainer = d3.create("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("id", "chart-view")
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    // ADDING THE LINKS TO THE SVG CONTAINER
    gLink = svgContainer.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.15)
        .attr("stroke-width", 2);

    // ADDING THE NODES TO THE SVG CONTAINER 
    gNode = svgContainer.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    // FIRST UPDATE TO THE INITIAL CONFIGURATION OF THE TREE - WHERE A NUMBER OF NODES ARE OPEN
    // SELECTED AS THE ROOT, PLUS NODES WITH 1 LETTERS
    root.x0 = dy / 2;
    root.y0 = 0;

    // OPENING THE ROOT AND THE NODES WITH AT LEAST 1 LETTER IN THEIR NAME BY DEFAULT
    root.descendants().forEach((d, index) => {
        d.id = index;
        d._children = d.children;
        if (d.depth && d.data.name.length > 1) d.children = null;
    });

    // For the root node, set _children instead of children
    if (root.children) {
        root._children = root.children;
        root.children = null;
    }

    // SELECT THE SVG CONTAINER AND APPEND THE SVG ELEMENT TO IT
    d3.select("#chart-container").node().append(svgContainer.node());

    // UPDATING THE TREE TO THE INITIAL STATE - THE ROOT IS OPEN BY DEFAULT
    updateChart(null, root);
}

// UPDATING THE CHART WHEN THE USER CLICKS ON A NODE 
export function updateChart(event, source) {
    const duration = event?.altKey ? 2500 : 250; // WHEN THE ALT KEY IS PRESSED, THE TRANSITION GETS SLOWER

    // COMPUTING THE NEW DIMENSIONS OF THE SVG CONTAINER ON USER CLICK
    const nodes = root.descendants().reverse(); // DESCENDANTS = NODES OF THE TREE
    const links = root.links(); // LINKS = CONNECTIONS BETWEEN THE NODES
    tree(root); // CALLING THE TREE LAYOUT ON THE ROOT NODE TO COMPUTE THE NEW DIMENSIONS OF THE SVG CONTAINER
    let left = root, right = root; // INITIALIZING THE LEFT AND RIGHT NODES TO THE ROOT NODE 

    // UPDATING THE LINKS WHEN THE USER CLICKS ON A NODE 
    root.eachBefore(node => { // EACHBEFORE TRAVERSES THE HIERARCHY IN PRE-ORDER TRAVERSAL
        if (node.x < left.x) left = node; // UPDATING THE LEFT NODE BY COMPARING THE X COORDINATES OF THE NODES
        if (node.x > right.x) right = node; // UPDATING THE RIGHT NODE
    });

    // COMPUTING THE NEW DIMENSIONS OF THE SVG CONTAINER ON USER CLICK
    const height = right.x - left.x + marginTop + marginBottom;

    // SPECIFYING THE TRANSITION FOR THE SVG CONTAINER 
    const transition = svgContainer.transition()
        .duration(duration)
        .attr("height", height)
        .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
        .tween("resize", window.ResizeObserver ? null : () => () => svgContainer.dispatch("toggle")); // TOGGLE THE TOP-RIGHT INFO BOX ON CLICK OF THE NODE

    // UPDATING THE NODES
    const node = gNode.selectAll("g")
        .data(nodes, dt => dt.id);

    // ADDING THE NODES TO THE ENTER SELECTION (DOM ELEMENTS TO BE ADDED TO THE CURRENT SELECTION)
    const nodeEnter = node.enter().append("g")
        .attr("transform", dt => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)

        // TOGGLE CHILDREN ON CLICK OF THE NODE TO DISPLAY OR HIDE THEM
        .on("click", (event, dt) => {
            // dt._children is the children array of the node before it was expanded - current node's hidden children (those that are collapsed).
            // dt.children is the children array of the node after it was expanded - current node's direct children. 
            dt.children = dt.children ? null : dt._children; // TOGGLE THE CHILDREN OF THE NODE ON CLICK

            // UPDATING THE CHART WITH THE NEW DATA ON CLICK
            updateChart(event, dt);

            // TOGGLE THE TOP-RIGHT INFO BOX ON CLICK OF THE NODE
            if (dt.data.title !== "") {
                showTopRightInfoBox(event, dt);
            }
            else {
                hideTopRightInfoBox(event, dt);
            }
        });

    // ADDING THE RECTANGLES TO THE ENTER SELECTION 
    nodeEnter.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", dt => dt.data.related_leads_opportunities && dt.data.related_leads_opportunities.length > 0 ? "#fff" : "none")
        .attr("stroke", dt => dt.data.related_leads_opportunities && dt.data.related_leads_opportunities.length > 0 ? "#186A3B" : "none")
        .attr("stroke-width", 3)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    // ADDING THE CIRCLES AND THE TEXTS TO THE ENTER SELECTION
    nodeEnter.append("circle")
        .attr("r", 8)
        .attr("fill", getNodeColor)
        .attr("stroke", "none") // Set to "none" to remove the default circle border
        .attr("stroke-width", 0) // Set stroke width to 0 to remove the default circle border
        .attr("pointer-events", "none"); // Disable pointer events on the circle

    // ADDING THE TEXTS TO THE ENTER SELECTION
    nodeEnter.append("text")
        .attr("dy", dt => dt._children ? "-1.50em" : "0em")
        .attr("x", dt => (dt._children && dt.data.title.length > 20) ? 50 : 16) 
        .attr("text-anchor", dt => dt._children ? "middle" : "start")
        .text(d => d.data.title)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 0)
        .attr("stroke", "white")
        .attr("style", "overflow: visible;")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    // UPDATE SELECTION - RETURNS THE UPDATING DOM ELEMENTS (CIRCLES)
    node.merge(nodeEnter).transition(transition)
        .attr("transform", dta => `translate(${dta.y},${dta.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .attr("fill", getNodeColor);

    // EXIT SELECTION - RETURNS THE EXITING DOM ELEMENTS (CIRCLES)
    node.exit().transition(transition).remove()
        .attr("transform", dt => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

    // UPDATE SELECTION - RETURNS THE UPDATING DOM ELEMENTS (PATHS)
    const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

    // ENTER SELECTION - RETURNS THE ENTERING DOM ELEMENTS (PATHS)
    const linkEnter = link.enter().append("path")
        .attr("d", d => {
            const o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
        });

    // UPDATE SELECTION - RETURNS THE UPDATING DOM ELEMENTS (PATHS)
    link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

    // EXIT SELECTION - RETURNS THE EXITING DOM ELEMENTS (PATHS)
    link.exit().transition(transition).remove()
        .attr("d", d => {
            const o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        });

    // START FROM THE ROOT, GO THROUGH ALL THE NODES AND STORE THE CURRENT POSITION
    // STASHING THE OLD POSITIONS FOR TRANSITION
    root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}