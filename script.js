// IMPORTING FUNCTIONS AND VARIABLES FROM OTHER FILES TO USE THEM IN THIS FILE
import { showDepartmentAndRoleLegend } from "./modules/chartLegends.js";
import { getCsvRowEmployee, getCsvRowLead } from "./modules/csvRowObject.js";
import { createChart } from "./modules/chart.js";
import { createHierarchy } from "./modules/createHierarchy.js";
import { selectLeadsDropdown } from './modules/selectLeads.js'
import { showLeadsButton } from "./modules/showLeadsButton.js";
import { showTopRightInfoBox, hideTopRightInfoBox } from "./modules/topRightInfoBox.js";

const allEmployees = []; // JSON ARRAY OF OBJECTS TO STORE THE DATA FROM THE CSV FILE
const leadsData = []; // JSON ARRAY OF OBJECTS TO STORE THE DATA FROM THE CSV FILE
d3.csv("Employee (hr.employee).csv", function (row) {

    // MAKING AN OBJECT OUT OF EACH ROW OF THE CSV FILE
    var empRowObject = getCsvRowEmployee(row);
    var leadRowObject = getCsvRowLead(row);

    // ############### LEADS OPPORTUNITIES DATA ######################
    // PUSHING THE OBJECT INTO THE DATA ARRAY IF IT HAS A RELATED LEAD OR OPPORTUNITY
    if (leadRowObject.related_leads_opportunities && leadRowObject.related_leads_opportunities !== "") {
        // IF THE leadRowObject.related_leads_opportunities NOT EMPTY, BUT OTHERS ARE EMPTY, USE THE ITEMS OF THE ROW OF THE PREVIOUS OBJECT WHILE ADDING OR CREATING A NEW OBJECT WHILE ADDING THE leadRowObject.related_leads_opportunities
        if (!leadRowObject.id) {
            const previousRowObject = leadsData[leadsData.length - 1];
            const lead = leadRowObject.related_leads_opportunities;
            const new_id = previousRowObject.id + '_' + 1;

            leadRowObject = { ...previousRowObject, id: new_id, related_leads_opportunities: lead };
        }
        leadsData.push(leadRowObject);
    }

    // ############### EMPLOYEES DATA ######################
    // IF THE empRowObject.related_leads_opportunities NOT EMPTY, BUT OTHERS ARE EMPTY, ADD ITS VALUE TO THE "related_leads_opportunities" ARRAY OF THE PREVIOUS OBJECT
    if (empRowObject.related_leads_opportunities && empRowObject.related_leads_opportunities[0] !== "" && !empRowObject.id) {
        allEmployees[allEmployees.length - 1].related_leads_opportunities.push(empRowObject.related_leads_opportunities[0]);
        return;
    }

    // ADDING THE OBJECT TO THE JSON ARRAY OF OBJECTS
    allEmployees.push(empRowObject);

}).then(() => {

    // ROWS ARE SEPARATED BY dx PIXELS, COLUMNS BY dy PIXELS. THIS BECAUSE THE TREE MUST BE VIEWED WITH THE ROOT AT THE “BOTTOM”, IN THE DATA DOMAIN. 
    // THE WIDTH OF A COLUMN SHOULD BE BASED ON THE TREE’S HEIGHT.
    var currHierarchy = createHierarchy(allEmployees);

    // CREATING THE HIERARCHY FROM THE JSON STRUCTURE
    var root = d3.hierarchy(currHierarchy);

    // CALLING THE FUNCTION TO CREATE THE CHART
    createChart(root, leadsData, allEmployees);

    // ADDING THE SHOW LEADS BUTTON TO THE TOP-LEFT CORNER OF THE CHART
    showLeadsButton(root, showTopRightInfoBox, hideTopRightInfoBox)
    selectLeadsDropdown(leadsData, allEmployees);

    // CALLING THE FUNCTION TO DRAW THE LEGENDS
    showDepartmentAndRoleLegend();
})
    // CATCH ANY ERROR AND LOG IT TO THE CONSOLE
    .catch(error => { console.log(error); });