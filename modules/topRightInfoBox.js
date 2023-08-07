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
    // const topRightInfoBoxWidth = 150;
    // const mouseX = event.pageX;
    // const mouseY = event.pageY;

    // // CALCUATE THE POSITION OF THE DETAILS BOX
    // let topRightInfoBoxX = mouseX + 10; // ADDING AN OFFSET TO AVOID OVERLAPPING THE MOUSE POINTER
    // let topRightInfoBoxY = mouseY - 10; // SUBTRACTING AN OFFSET TO ADJUST THE DETAILS BOX POSITION

    // // IF THE DETAILS BOX EXCEEDS THE RIGHT BOUNDARY, REPOSITION IT TO THE LEFT OF THE MOUSE POINTER
    // if (topRightInfoBoxX + topRightInfoBoxWidth > window.innerWidth) {
    //     topRightInfoBoxX = mouseX - topRightInfoBoxWidth - 10;
    // }

    topRightInfoBox.html(`
    ${d.data.related_leads_opportunities.length > 0 ? `<b style="margin-left: 20px;">LEADS</b><br>
            <ul>
            ${d.data.related_leads_opportunities.map((item) => `<li>${item}</li>`)}
            </ul>
            ` : `THIS EMPLOYEE HAS NO LEADS<br><br>`}
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