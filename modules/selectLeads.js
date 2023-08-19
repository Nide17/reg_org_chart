import { createChart } from "./chart.js";
import { createHierarchy } from "./createHierarchy.js";

const selectLeadsDropdown = (leadsData, allEmployees) => {

    // ADDING SELECT DROPDOWN WITH A LABEL
    const topLeftselectLeadsDropdown = d3.select("#chart-container")
        .append("select")
        .attr("id", "top-left-leads-dropdown")
        .attr("name", "top-left-leads-dropdown")
        .style("position", "absolute")
        .style("visibility", "visible")
        .style("border", "1px solid #641E16")
        .style("width", "320px")
        .style("height", "32px")
        .style("padding", "4px")
        .style("left", "100px")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .style("background-color", 'gray')

    // ADDING THE OPTIONS TO THE SELECT DROPDOWN FOR EACH OF leadsOpportunities
    const options = topLeftselectLeadsDropdown.selectAll("option")
        .data([{ related_leads_opportunities: "Select a Lead to view the chart", id: "" }, ...leadsData]) // Adding the default option
        .enter()
        .append("option")
        .text(d => d.related_leads_opportunities)
        .attr("value", d => d.id);

    // Set the default option as selected initially
    options.filter(d => d.id === "").attr("selected", "selected");


    // ON CHANGE OF THE SELECT DROPDOWN, SHOW THE LEAD OR OPPORTUNITY
    topLeftselectLeadsDropdown.on("change", () => {

        // GETTING THE ID OF THE SELECTED LEAD OR OPPORTUNITY
        const selectedLeadOpportunityId = d3.select("#top-left-leads-dropdown").property("value");

        // GETTING THE OBJECT OF THE SELECTED LEAD OR OPPORTUNITY
        const selectedLeadOpportunity = leadsData.find(d => d.id === selectedLeadOpportunityId);

        // EMPLOYEES ROOT
        var empHierarchy = createHierarchy(allEmployees);

        // CREATING THE HIERARCHY FROM THE JSON STRUCTURE
        var empRoot = d3.hierarchy(empHierarchy);

        // FIND THE NODE WITH THE ID
        var newHierarchy = findNodeById(empRoot.data, selectedLeadOpportunity.id.split('_')[0]);

        let newRoot = d3.hierarchy(newHierarchy); // CREATING THE HIERARCHY FROM THE JSON STRUCTURE

        // chart-view id selection
        const chartView = d3.select("#chart-view");

        // REMOVE IT
        chartView.remove();

        // CALLING THE FUNCTION TO CREATE THE CHART
        createChart(newRoot, leadsData, allEmployees);
    });
}

// CREATE A NEW HIERARCHY BY TRAVERSING THE CHILDREN AND FIND ONE WITH THIS ID, THEN MAKE IT AS ROOT OF THE NEW HIERARCHY
function findNodeById(node, id) {
    if (node.id === id) {
        return node;
    }
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            var found = findNodeById(node.children[i], id);
            if (found) {
                return found;
            }
        }
    }
}

export { selectLeadsDropdown, findNodeById }