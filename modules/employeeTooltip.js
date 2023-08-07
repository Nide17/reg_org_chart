var tooltipBackgroundColour = "#EAEDED";  // TOOLTIP BACKGROUND COLOUR

// CREATING A TOOLTIP AND ADDING PROPERTIES TO IT 
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

// FUNCTION TO SHOW TOOLTIP ON MOUSEOVER A POSITION
function showTooltip(event, d) {
    const tooltipWidth = 150; // SETTING THE WIDTH OF THE TOOLTIP
    const mouseX = event.pageX; // GETTING THE X COORDINATE OF THE MOUSE POINTER
    const mouseY = event.pageY; // Y COORDINATE OF THE MOUSE POINTER

    // Calculate the position of the tooltip
    // CALCULATING THE TOOLTIP POSITION
    let tooltipX = mouseX + 10; // ADDING AN OFFSET TO AVOID OVERLAPPING THE MOUSE POINTER
    let tooltipY = mouseY - 10; // SUBTRACTING AN OFFSET TO ADJUST THE TOOLTIP POSITION

    // IF THE TOOLTIP EXCEEDS THE RIGHT BOUNDARY, REPOSITION IT TO THE LEFT OF THE MOUSE POINTER
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
            tooltipBackgroundColour = "#2ecc71";
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
            tooltipBackgroundColour = "Sienna";
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

    // SET THE TEXT OF THE TOOLTIP AND MAKE IT VISIBLE AS HTML
    tooltip.html(`
            Name: ${d.data.name ? d.data.name : "N/A"}<br>
            Position: ${d.data.title ? d.data.title : "N/A"}<br>
            Role Type: ${d.data.role_type ? d.data.role_type : "N/A"}<br>
            Manager: ${d.data.manager_name ? d.data.manager_name : "N/A"}<br>
            Phone: ${d.data.phone ? d.data.phone : "N/A"}<br>
            Email: ${d.data.email ? d.data.email : "N/A"}<br>
            Department Type: ${d.data.department_type ? d.data.department_type : "N/A"}<br>
            Department Name: ${d.data.department_name ? d.data.department_name : "N/A"}
            `)

        // SETTING THE PROPERTIES
        .style("left", `${tooltipX}px`)
        .style("top", `${tooltipY}px`)
        .style("visibility", "visible")
        .style("background-color", tooltipBackgroundColour);
}

// FUNCTION TO HIDE THE TOOLTIP ON MOUSEOUT
function hideTooltip() {
    tooltip.style("visibility", "hidden");
}

// EXPORTING THE FUNCTIONS 
export { showTooltip, hideTooltip };