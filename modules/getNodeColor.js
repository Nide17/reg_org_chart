function getNodeColor(node) {
    if (!node.children && !node._children) {
        return "gray";
    } else if (node.data.title === "REG") {
        return "black"; // Gray out nodes with no children
    } else if (node.data.department_type === "Board of Directors") {
        return "#C70039";
    } else if (node.data.department_type === "Holding Company") {
        return "#FFC300";
    } else if (node.data.department_type === "Subsidiary") {
        return "#2ecc71";
    } else if (node.data.department_type === "Project Program") {
        return "#f1948a";
    } else if (node.data.department_type === "Department") {
        return "#2874a6";
    } else if (node.data.department_type === "Unit") {
        return "#0b5345";
    } else if (node.data.department_type === "Section") {
        return "#5b2c6f";
    } else if (node.data.department_type === "University") {
        return "#aed6f1";
    } else {
        return "#999"; // Default color for other nodes
    }
}

export { getNodeColor }