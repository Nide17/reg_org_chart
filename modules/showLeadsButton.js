import { updateChart } from "./chart.js";

const showLeadsButton = (root, showTopRightInfoBox, hideTopRightInfoBox) => {
    // ADDING THE SHOW LEADS BUTTON
    const topLeftShowLeadsButton = d3.select("#chart-container")
        .append("button")
        .attr("id", "top-left-leads-button")
        .text("Show Leads")
        .style("position", "absolute")
        .style("visibility", "visible")
        .style("border", "1px solid #641E16")
        .style("width", "80px")
        .style("height", "32px")
        .style("padding", "4px")
        .style("left", "10px")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .style("background-color", 'gray');

    // TOGGLE THE STATE OF THE BUTTON
    let allExpanded = false;

    // ON CLICK, SHOW THE LEADS AND OPPORTUNITIES
    topLeftShowLeadsButton.on("click", () => {

        // EXPAND & COLLAPSE ALL NODES
        allExpanded = !allExpanded;

        // FUNCTION TO TOGGLE THE NODES FROM THE SECOND NODE
        function toggleNode(node) {
            if (node.children) {
                node._children = node.children;
                node.children = null;
            } else {
                node.children = node._children;
                node._children = null;
            }

            // toggle both
            if (node._children) {
                node._children.forEach(toggleNode);
            }
            if (node.children) {
                node.children.forEach(toggleNode);
            }
        }

        // CALLING THE TOGGLE FUNCTION ON THE NODE NEXT TO THE ROOT TO TOGGLE ALL NODES NEXT TO IT
        toggleNode(root.children[0]);

        // UPDATING THE CHART WITH THE NEW DATA ON CLICK
        updateChart(null, root);


        // TOGGLE THE TOP-RIGHT INFO BOX ON CLICK OF THE NODE
        if (root.children[0].data.title !== "") {
            showTopRightInfoBox(null, root.children[0]);
        }

        // TOGGLE THE TOP-RIGHT INFO BOX ON CLICK OF THE NODE
        else {
            hideTopRightInfoBox(null, root.children[0]);
        }

        // TOGGLE THE STATE OF THE BUTTON
        if (allExpanded) {
            topLeftShowLeadsButton.style("background-color", "green");
        }

        else {
            topLeftShowLeadsButton.style("background-color", "gray");
        }
    });

}
export { showLeadsButton }