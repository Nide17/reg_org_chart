// FUNCTION TO DISPLAY LEGENDS UNDER THE CHART
export const showDepartmentAndRoleLegend = () => {

    // LEGEND TO BE APPENDED TO THE BOTTOM OF THE CHART AT #chart-chart-department-legend
    const legendColors = ["#C70039", "#FFC300", "#2ecc71", "#2874a6", "#f1948a", "#0b5345 ", "#5b2c6f", "#aed6f1"];
    const legendLabels = ["Board of Directors", "Holding Company", "Subsidiary", "Department", "Project Program", "Unit", "Section", "University"];

    // CREATE THE SVG CONTAINER FOR THE LEGEND AND APPEND IT TO THE #chart-department-legend DIV
    const legendSvg = d3.select("#chart-department-legend")
        .append("svg")
        .attr("width", 1366)
        .attr("height", 100)
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
    // #########################################

    // LEGEND TO BE APPENDED TO THE BOTTOM OF THE CHART AT #chart-role-legend:
    const legendColorsRole = ["red", "orange", "green", "SteelBlue", "YellowGreen", "purple", "yellow", "Sienna", "LightCoral", "Magenta", "aqua"];
    const legendLabelsRole = ["Chairperson of the Board", "Chief Executive Officer", "Managing Director", "Director", "Head", "Manager", "Specialist", "Officer", "Technician", "Support Staff", "Intern"];

    // CREATE THE SVG CONTAINER FOR THE LEGEND AND APPEND IT TO THE #chart-role-legend DIV 
    const legendSvgRole = d3.select("#chart-role-legend")
        .append("svg")
        .attr("width", 1366)
        .attr("height", 60)
        .attr("viewBox", [0, 0, 1366, 50])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

    // ADD THE LEGEND TO THE BOTTOM OF THE PAGE - ITEMS ARE CIRCLE DOTS WITH THE ROLE TYPE TEXT NEXT TO THEM
    const legendRole = legendSvgRole.append("g")
        .attr("transform", `translate(50, 0)`);

    const legendCellWidthRole = 120;
    const legendCellHeightRole = 20;

    const legendEntryRole = legendRole.selectAll(".legend-entry")
        .data(legendColorsRole)
        .enter().append("g")
        .attr("class", "legend-entry")
        .attr("transform", (d, i) => `translate(${i * (legendCellWidthRole + 5)}, 0)`); // ADDING 5 PIXELS BETWEEN THE CIRCLES AND THE TEXT

    legendEntryRole.append("circle")
        .attr("r", 5)
        .attr("fill", (d, i) => legendColorsRole[i]);

    legendEntryRole.append("text")
        .attr("x", (legendCellWidthRole / 20)) // MODIFYING THE X POSITION OF THE TEXT TO BE NEXT TO THE CIRCLE
        .attr("y", legendCellHeightRole / 120)
        .attr("dy", "0.3em")
        .attr("text-anchor", "left")
        .attr("weight", "bold")
        .attr("fill", "black")
        .text((d, i) => legendLabelsRole[i]);
}