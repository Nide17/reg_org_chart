// PARSING THE CSV DATA AND CONVERTING IT INTO A JSON ARRAY OF OBJECTS
const data = [];
d3.csv("data.csv", function (row) {
    const obj = {
        "id": row.Employee_ID,
        "name": row.Name,
        "title": row.Title,
        "manager_id": row.Manager_ID,
        "value": 1
    };
    data.push(obj);
}).then(() => {

    // TRANSFORMING THE JSON ARRAY OF OBJECTS INTO A HIERARCHICAL JSON STRUCTURE
    function get_hierarchy(data) {
        const hierarchy = {
            "name": "REG",
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
            } else {
                // WHEN THE MANAGER IS THE ROOT NODE (REG) 
                hierarchy.children.push(obj);
            }
        });
        return hierarchy;
    }

    // SPECIFYING THE DIMENSIONS OF THE CHART AND THE MARGINS
    const width = 1366;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 10;
    const marginLeft = 50;

    // ROWS ARE SEPARATED BY dx PIXELS, COLUMNS BY dy PIXELS. THESE NAMES CAN BE COUNTER-INTUITIVE
    // (dx IS A HEIGHT, AND dy A WIDTH). THIS BECAUSE THE TREE MUST BE VIEWED WITH THE ROOT AT THE
    // “BOTTOM”, IN THE DATA DOMAIN. THE WIDTH OF A COLUMN IS BASED ON THE TREE’S HEIGHT.
    const root = d3.hierarchy(get_hierarchy(data));
    const dx = 20;
    const dy = (width - marginRight - marginLeft) / (1 + root.height);

    // DEFINING THE TREE LAYOUT AND THE SHAPE FOR LINKS OF THE CHART
    const tree = d3.tree().nodeSize([dx, dy]);
    const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    // CREATING THE SVG CONTAINER AND THE LAYERS FOR LINKS AND NODES OF THE CHART
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", dx)
        .attr("viewBox", [-marginLeft, -marginTop, width, dx])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    const gLink = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    function update(event, source) {
        const duration = event?.altKey ? 2500 : 250; // WHEN THE ALT KEY IS PRESSED, THE TRANSITION IS SLOWER
        const nodes = root.descendants().reverse();
        const links = root.links();

        // COMPUTING THE NEW TREE LAYOUT
        tree(root);

        let left = root;
        let right = root;
        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        const height = right.x - left.x + marginTop + marginBottom;

        const transition = svg.transition()
            .duration(duration)
            .attr("height", height)
            .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
            .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

        // UPDATING THE NODES
        const node = gNode.selectAll("g")
            .data(nodes, d => d.id);

        // THIS IS THE ENTER SELECTION AND IT RETURNS THE ENTERING DOM ELEMENTS (CIRCLES)
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${source.y0},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            .on("click", (event, d) => {
                d.children = d.children ? null : d._children;
                update(event, d);
            });

        // ADDING THE CIRCLES AND THE TEXTS TO THE ENTER SELECTION
        nodeEnter.append("circle")
            .attr("r", 2.5)
            .attr("fill", d => d._children ? "#555" : "#999")
            .attr("stroke-width", 10);

        // ADDING THE TEXTS TO THE ENTER SELECTION
        nodeEnter.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d._children ? -6 : 6)
            .attr("text-anchor", d => d._children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white");

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
    // (ARBITRARILY SELECTED AS THE ROOT, PLUS NODES WITH 7 LETTERS)
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length !== 7) d.children = null;
    });

    // UPDATING THE TREE TO THE INITIAL STATE - NOTE THAT THE ROOT IS OPEN BY DEFAULT
    update(null, root);

    // SELECT THE SVG CONTAINER AND APPEND THE SVG ELEMENT TO IT
    d3.select("#chart-container").node().append(svg.node());
})
    // CATCH ANY ERROR AND LOG IT TO THE CONSOLE
    .catch(error => { console.log(error); });
