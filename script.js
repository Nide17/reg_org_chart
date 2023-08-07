// IMPORTING FUNCTIONS AND VARIABLES FROM OTHER FILES TO USE THEM IN THIS FILE
import { showTooltip, hideTooltip } from "./modules/employeeTooltip.js";
import { showTopRightInfoBox, hideTopRightInfoBox } from "./modules/topRightInfoBox.js";
import { showDepartmentAndRoleLegend } from "./modules/chartLegends.js";
import { createHierarchy } from "./modules/createHierarchy.js";
import { getCsvRowObject } from "./modules/csvRowObject.js";

// PARSING THE CSV DATA AND CONVERTING IT INTO A JSON ARRAY OF OBJECTS
const data = [];
d3.csv("Employee (hr.employee).csv", function (row) {

    // MAKING AN OBJECT OUT OF EACH ROW OF THE CSV FILE
    const rowObject = getCsvRowObject(row);

    // IF THE rowObject.related_leads_opportunities NOT EMPTY, BUT OTHERS ARE EMPTY, ADD ITS VALUE TO THE "related_leads_opportunities" ARRAY OF THE PREVIOUS OBJECT
    if (rowObject.related_leads_opportunities && rowObject.related_leads_opportunities[0] !=="" && !rowObject.id) {
        data[data.length - 1].related_leads_opportunities.push(rowObject.related_leads_opportunities[0]);
        return;
    }

    // ADDING THE OBJECT TO THE JSON ARRAY OF OBJECTS
    data.push(rowObject);
}).then(() => {

    // SPECIFYING THE DIMENSIONS OF THE CHART AND THE MARGINS
    const width = 1366, marginTop = 100, marginRight = 20, marginBottom = 10, marginLeft = 50;

    // ROWS ARE SEPARATED BY dx PIXELS, COLUMNS BY dy PIXELS. THESE NAMES CAN BE COUNTER-INTUITIVE
    // (dx IS A HEIGHT, AND dy A WIDTH). THIS BECAUSE THE TREE MUST BE VIEWED WITH THE ROOT AT THE
    // “BOTTOM”, IN THE DATA DOMAIN. THE WIDTH OF A COLUMN IS BASED ON THE TREE’S HEIGHT.
    const root = d3.hierarchy(createHierarchy(data)); // CREATING THE HIERARCHY FROM THE JSON STRUCTURE 

    // DEFINING THE DIMENSIONS OF THE CHART
    const dx = 30;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // DEFINING THE TREE LAYOUT AND THE SHAPE FOR LINKS OF THE CHART
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(dt => dt.y).y(dt => dt.x);

    // CREATING THE SVG CONTAINER AND THE LAYERS FOR LINKS AND NODES OF THE CHART
    const svgContainer = d3.create("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    // ADDING THE LINKS AND THE NODES TO THE SVG CONTAINER AND SPECIFYING THE TRANSITION
    const gLink = svgContainer.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.15)
        .attr("stroke-width", 2);

    // ADDING THE NODES TO THE SVG CONTAINER AND SPECIFYING THE TRANSITION
    const gNode = svgContainer.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    // UPDATING THE CHART WHEN THE USER CLICKS ON A NODE 
    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250; // WHEN THE ALT KEY IS PRESSED, THE TRANSITION GETS SLOWER
        
        // COMPUTING THE NEW DIMENSIONS OF THE SVG CONTAINER ON USER CLICK
        const nodes = root.descendants().reverse(); // DESCENDANTS ARE THE NODES OF THE TREE
        const links = root.links(); // LINKS ARE THE CONNECTIONS BETWEEN THE NODES
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

        // ADDING THE NODES TO THE ENTER SELECTION (THE DOM ELEMENTS TO BE ADDED TO THE CURRENT SELECTION)
        const nodeEnter = node.enter().append("g")
            .attr("transform", dt => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            // TOGGLE CHILDREN ON CLICK OF THE NODE TO DISPLAY OR HIDE THEM
            .on("click", (event, dt) => {
                dt.children = dt.children ? null : dt._children;
                update(event, dt); // UPDATING THE CHART WITH THE NEW DATA ON CLICK
                // TOGGLE THE TOP-RIGHT INFO BOX ON CLICK OF THE NODE
                if (dt.data.title !== "") {
                    showTopRightInfoBox(event, dt);
                }
                else {
                    hideTopRightInfoBox(event, dt);
                }
            });

        // ADDING THE CIRCLES AND THE TEXTS TO THE ENTER SELECTION
        nodeEnter.append("circle")
            .attr("r", 8)
            .attr("fill", dt =>
                dt._children && dt.data.department_type === "Board of Directors" ? "#C70039" :
                    dt._children && dt.data.department_type === "Holding Company" ? "#FFC300" :
                        dt._children && dt.data.department_type === "Subsidiary" ? "#2ecc71" :
                            dt._children && dt.data.department_type === "Project Program" ? "#f1948a" :
                                dt._children && dt.data.department_type === "Department" ? "#2874a6" :
                                    dt._children && dt.data.department_type === "Unit" ? "#0b5345" :
                                        dt._children && dt.data.department_type === "Section" ? "#5b2c6f" :
                                            dt._children && dt.data.department_type === "University" ? "#aed6f1" : "#999")
            .attr("stroke-width", 20)
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);

        // ADDING THE TEXTS TO THE ENTER SELECTION
        nodeEnter.append("text")
            .attr("dy", dt => dt._children ? "-1.0em" : "0em")
            .attr("x", dt => dt._children ? -24 : 12)
            .attr("text-anchor", dt => dt._children ? "middle" : "start")
            .text(d => d.data.title)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 0)
            .attr("stroke", "white")
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);

        // THIS IS THE UPDATE SELECTION AND IT RETURNS THE UPDATING DOM ELEMENTS (CIRCLES)
        node.merge(nodeEnter).transition(transition)
            .attr("transform", dta => `translate(${dta.y},${dta.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // THIS IS THE EXIT SELECTION AND IT RETURNS THE EXITING DOM ELEMENTS (CIRCLES)
        node.exit().transition(transition).remove()
            .attr("transform", dt => `translate(${source.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);

        // THIS IS THE UPDATE SELECTION AND IT RETURNS THE UPDATING DOM ELEMENTS (PATHS)
        const link = gLink.selectAll("path")
            .data(links, d => d.target.id);

        // THIS IS THE ENTER SELECTION AND IT RETURNS THE ENTERING DOM ELEMENTS (PATHS)
        const linkEnter = link.enter().append("path")
            .attr("d", d => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            });

        // THIS IS THE UPDATE SELECTION AND IT RETURNS THE UPDATING DOM ELEMENTS (PATHS)
        link.merge(linkEnter).transition(transition)
            .attr("d", diagonal);

        // WHEN THE EXIT SELECTION IS MERGED WITH THE UPDATE SELECTION, THE EXITING DOM ELEMENTS
        link.exit().transition(transition).remove()
            .attr("d", d => {
                const o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            });

        // STARTING FROM THE ROOT, WE GO THROUGH ALL THE NODES AND WE STORE THE CURRENT POSITION
        // STASHING THE OLD POSITIONS FOR TRANSITION
        root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // DOING THE FIRST UPDATE TO THE INITIAL CONFIGURATION OF THE TREE - WHERE A NUMBER OF NODES ARE OPEN
    // (ARBITRARILY SELECTED AS THE ROOT, PLUS NODES WITH 1 LETTERS)
    root.x0 = dy / 2;
    root.y0 = 0;

    // OPENING THE ROOT AND THE NODES WITH 1 LETTERS IN THEIR NAME BY DEFAULT
    root.descendants().forEach((d, index) => {
        d.id = index;
        d._children = d.children;
        if (d.depth && d.data.name.length > 1) d.children = null;
    });

    // UPDATING THE TREE TO THE INITIAL STATE - NOTE THAT THE ROOT IS OPEN BY DEFAULT
    update(null, root);

    // SELECT THE SVG CONTAINER AND APPEND THE SVG ELEMENT TO IT
    d3.select("#chart-container").node().append(svgContainer.node());
})
    // CATCH ANY ERROR AND LOG IT TO THE CONSOLE
    .catch(error => { console.log(error); });


// ADDING THE DEPARTMENT TYPE AND ROLE TO THE CHART
showDepartmentAndRoleLegend();