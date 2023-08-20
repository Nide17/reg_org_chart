// ###############################
// TOP RIGHT INFO BOX FUNCTIONS FOR EXPANDED NODE
// ###############################
const topRightInfoBox = d3.select("#chart-container")
    .append("div")
    .attr("id", "top-right-info-box")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("border", "1px solid #641E16")
    .style("width", "300px")
    .style("height", "150px")
    .style("padding", "8px")
    .style("right", "10px")
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("color", "#fff")
    .style("background-color", 'gray');

// FUNCTION TO SHOW DETAILS BOX ON MOUSEOVER A POSITION
function showTopRightInfoBox(event, d) {

    // SETTING THE CONTENT OF THE BOX
    topRightInfoBox.html(`
    ${d.data.related_leads_opportunities && d.data.related_leads_opportunities.length > 0 ? `<b style="margin-left: 20px;">ASSOCIATED LEADS/OPPORTUNITIES</b><br>
            <ul>
            ${d.data.related_leads_opportunities && d.data.related_leads_opportunities.map((item) => `<li>${item}</li>`)}
            </ul>
            ` : `NO LEADS/OPPORTUNITIES ASSOCIATED<br><br>`}
            `)
        // SETTING THE BOX VISIBLE
        .style("visibility", "visible")
        .style("background-color", 'grey');
}

// FUNCTION TO HIDE THE DETAILS BOX ON MOUSEOUT
function hideTopRightInfoBox() {
    topRightInfoBox.style("visibility", "hidden");
}

// EXPORTING THE FUNCTIONS
export { showTopRightInfoBox, hideTopRightInfoBox };