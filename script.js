// PARSING THE CSV DATA AND CONVERTING IT INTO A JSON ARRAY OF OBJECTS
const data = [];
d3.csv("Employee (hr.employee).csv", function (row) {
    const obj = {
        "id": row.ID,
        "name": row["Employee Name"],
        "title": row["Job Position"],
        "role_type": row["Role Type"],
        "email": row["Work Email"],
        "phone": row["Work Phone"] ? row["Work Phone"].replace(/'/g, "") : 'N/A', // IF THE PHONE NUMBER IS NOT AVAILABLE, SET IT TO 'N/A
        "manager_id": row["Manager/ID"] ? row["Manager/ID"] : 'N/A', // IF THE MANAGER ID IS NOT AVAILABLE, SET IT TO 'N/A
        "manager_name": row["Manager/Employee Name"],
        "department_name": row["Department/Department Name"],
        "department_type": row["Department/Department Type"],
        "department_manager_type": row["Manager/Role Type"],
        "value": 1
    };
    data.push(obj);
}).then(() => {

    // TRANSFORMING THE JSON ARRAY OF OBJECTS INTO A HIERARCHICAL JSON STRUCTURE
    function get_hierarchy(data) {
        const hierarchy = {
            "name": "Rwanda Energy Group",
            "title": "REG",
            "children": []
        };

        // CREATING A LOOKUP TABLE FOR THE JSON ARRAY OF OBJECTS
        const lookup = {};
        data.forEach(obj => {
            lookup[obj.id] = obj;
            obj.children = [];
        });

        // ADDING THE CHILDREN TO THE HIERARCHY JSON STRUCTURE
        data.forEach(obj => {

            // WHEN THE MANAGER IS NOT THE ROOT NODE (REG) 
            if (obj.manager_id && lookup[obj.manager_id]) {
                lookup[obj.manager_id].children.push(obj);
            }

            // IF THE CURRENT HAS NO PARENT (MANAGER), SKIP IT
            else if (obj.manager_id && !lookup[obj.manager_id] && obj.title !== "Chairperson of the Board") {
                return;
            }

            else {
                // WHEN THE MANAGER IS THE ROOT NODE (REG) 
                hierarchy.children.push(obj);
            }
        });

        // RETURNING THE HIERARCHY JSON STRUCTURE
        console.log(hierarchy)
        return hierarchy;
    }

    // SPECIFYING THE DIMENSIONS OF THE CHART AND THE MARGINS
    const width = 1366;
    const marginTop = 100;
    const marginRight = 20;
    const marginBottom = 10;
    const marginLeft = 50;

    // ROWS ARE SEPARATED BY dx PIXELS, COLUMNS BY dy PIXELS. THESE NAMES CAN BE COUNTER-INTUITIVE
    // (dx IS A HEIGHT, AND dy A WIDTH). THIS BECAUSE THE TREE MUST BE VIEWED WITH THE ROOT AT THE
    // “BOTTOM”, IN THE DATA DOMAIN. THE WIDTH OF A COLUMN IS BASED ON THE TREE’S HEIGHT.
    const root = d3.hierarchy(get_hierarchy(data)); // CREATING THE HIERARCHY FROM THE JSON STRUCTURE 
    const dx = 30;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // DEFINING THE TREE LAYOUT AND THE SHAPE FOR LINKS OF THE CHART
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(dt => dt.y).y(dt => dt.x);

    // CREATING THE SVG CONTAINER AND THE LAYERS FOR LINKS AND NODES OF THE CHART
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    // ADDING THE LINKS AND THE NODES TO THE SVG CONTAINER AND SPECIFYING THE TRANSITION
    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.15)
        .attr("stroke-width", 2);

    // ADDING THE NODES TO THE SVG CONTAINER AND SPECIFYING THE TRANSITION
    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    // UPDATING THE CHART WHEN THE USER CLICKS ON A NODE 
    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250; // WHEN THE ALT KEY IS PRESSED, THE TRANSITION IS SLOWER
        const nodes = root.descendants().reverse();
        const links = root.links();

        // COMPUTING THE NEW TREE LAYOUT
        tree(root);

        let left = root;
        let right = root;

        // UPDATING THE LINKS 
        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        // COMPUTING THE NEW DIMENSIONS OF THE SVG CONTAINER ON USER CLICK
        const height = right.x - left.x + marginTop + marginBottom;

        // SPECIFYING THE TRANSITION FOR THE SVG CONTAINER 
        const transition = svg.transition()
            .duration(duration)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

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
                update(event, dt);
            });

        // ADDING THE CIRCLES AND THE TEXTS TO THE ENTER SELECTION
        nodeEnter.append("circle")
            .attr("r", 5)
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
            .attr("dy", "0.3em")
            .attr("x", dt => dt._children ? -24 : 24)
            .attr("text-anchor", dt => dt._children ? "end" : "start")
            .text(d => d.data.title)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 0)
            .attr("stroke", "white")
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip);


        // ###############################
        // TOOLTIP FUNCTIONS
        var tooltipBackgroundColour = "#EAEDED"; // Set the background colour of the tooltip
        const tooltip = d3.select("#chart-container")
            .append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("border", "1px solid #641E16")
            .style("padding", "8px")
            .style("font-family", "sans-serif")
            .style("font-size", "11px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("color", "#fff")
            .style("background-color", tooltipBackgroundColour);

        function showTooltip(event, d) {
            const tooltipWidth = 150; // Set the desired width of the tooltip
            const mouseX = event.pageX; // Get the x-coordinate of the mouse pointer
            const mouseY = event.pageY; // Get the y-coordinate of the mouse pointer

            // Calculate the position of the tooltip
            let tooltipX = mouseX + 10; // Add an offset to avoid overlapping the mouse pointer
            let tooltipY = mouseY - 10; // Subtract an offset to adjust the tooltip position

            // If the tooltip would exceed the right boundary, reposition it to the left of the mouse pointer
            if (tooltipX + tooltipWidth > window.innerWidth) {
                tooltipX = mouseX - tooltipWidth - 10;
            }

            // SET THE BACKGROUND COLOUR OF THE TOOLTIP BASED ON THE ROLE TYPE
            switch (d.data.role_type) {
                case "Chairperson of the Board":
                    tooltipBackgroundColour = "red";
                    break;

                case "Chief Executive Officer":
                    tooltipBackgroundColour = "orange";
                    break;

                case "Managing Director":
                    tooltipBackgroundColour = "green";
                    break;

                case "Director":
                    tooltipBackgroundColour = "SteelBlue";
                    break;

                case "Head":
                    tooltipBackgroundColour = "YellowGreen";
                    break;

                case "Manager":
                    tooltipBackgroundColour = "purple";
                    break;

                case "Specialist":
                    tooltipBackgroundColour = "yellow";
                    break;

                case "Officer":
                    tooltipBackgroundColour = "gray";
                    break;

                case "Technician":
                    tooltipBackgroundColour = "LightCoral";
                    break;

                case "Support Staff":
                    tooltipBackgroundColour = "Magenta";
                    break;

                case "Intern":
                    tooltipBackgroundColour = "aqua";
                    break;

                default:
                    break;
            }

            tooltip.html(`
            Name: ${d.data.name ? d.data.name : "N/A"}<br>
            Position: ${d.data.title ? d.data.title : "N/A"}<br>
            Role Type: ${d.data.role_type ? d.data.role_type : "N/A"}<br>
            Manager: ${d.data.manager_name ? d.data.manager_name : "N/A"}<br>
            Phone: ${d.data.phone ? d.data.phone : "N/A"}<br>
            Email: ${d.data.email ? d.data.email : "N/A"}<br>
            Department Type: ${d.data.department_type ? d.data.department_type : "N/A"}<br>
            Department Name: ${d.data.department_name ? d.data.department_name : "N/A"}
            `) // Set the text of the tooltip
                .style("left", `${tooltipX}px`) // Set the x-position of the tooltip
                .style("top", `${tooltipY}px`) // Set the y-position of the tooltip
                .style("visibility", "visible")
                .style("background-color", tooltipBackgroundColour); // Make the tooltip visible
        }

        console.log(tooltipBackgroundColour)

        function hideTooltip() {
            tooltip.style("visibility", "hidden");
        }

        // ###############################

        // THIS IS THE UPDATE SELECTION AND IT RETURNS THE UPDATING DOM ELEMENTS (CIRCLES)
        const nodeUpdate = node.merge(nodeEnter).transition(transition)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1);

        // THIS IS THE EXIT SELECTION AND IT RETURNS THE EXITING DOM ELEMENTS (CIRCLES)
        const nodeExit = node.exit().transition(transition).remove()
            .attr("transform", d => `translate(${source.y},${source.x})`)
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
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;

        // OPENING THE ROOT AND THE NODES WITH 1 LETTERS IN THEIR NAME BY DEFAULT
        if (d.depth && d.data.name.length !== 15) d.children = null;
    });

    // UPDATING THE TREE TO THE INITIAL STATE - NOTE THAT THE ROOT IS OPEN BY DEFAULT
    update(null, root);

    // SELECT THE SVG CONTAINER AND APPEND THE SVG ELEMENT TO IT
    d3.select("#chart-container").node().append(svg.node());
})
    // CATCH ANY ERROR AND LOG IT TO THE CONSOLE
    .catch(error => { console.log(error); });


// LEGEND TO BE APPENDED TO THE BOTTOM OF THE CHART AT #chart-legend
const legendColors = ["#C70039", "#FFC300", "#2ecc71", "#2874a6", "#f1948a", "#0b5345 ", "#5b2c6f", "#aed6f1"];
const legendLabels = ["Board of Directors", "Holding Company", "Subsidiary", "Department", "Project Program", "Unit", "Section", "University"];

// CREATE THE SVG CONTAINER FOR THE LEGEND AND APPEND IT TO THE #chart-legend DIV
const legendSvg = d3.select("#chart-legend")
    .append("svg")
    .attr("width", 1366)
    .attr("height", 200)
    .attr("viewBox", [0, 0, 1366, 50])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

// ADD THE LEGEND TO THE BOTTOM OF THE PAGE
const legend = legendSvg.append("g")
    .attr("transform", `translate(50, 0)`);

const legendCellWidth = 120;
const legendCellHeight = 20;

const legendEntry = legend.selectAll(".legend-entry")
    .data(legendColors)
    .enter().append("g")
    .attr("class", "legend-entry")
    .attr("transform", (d, i) => `translate(${i * legendCellWidth}, 0)`);

legendEntry.append("rect")
    .attr("width", legendCellWidth)
    .attr("height", legendCellHeight)
    .attr("fill", (d, i) => legendColors[i]);

legendEntry.append("text")
    .attr("x", legendCellWidth / 2)
    .attr("y", legendCellHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("weight", "bold")
    .attr("fill", "white")
    .text((d, i) => legendLabels[i]);