# REG Organizational Tree

This is a JavaScript application that parses CSV data and converts it into a hierarchical JSON structure representing an organizational tree. It uses the D3.js library to visualize the tree structure as an interactive chart.

## How to Run

**To run the application, follow these steps:**
Make sure you have the latest version of D3.js library by including the following script tag in your HTML file:

`<script src="https://d3js.org/d3.v7.min.js"></script>`

Save the JavaScript code in a file named script.js.

Create an HTML file and include the necessary markup. Copy and paste the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REG Organizational Tree</title>
</head>
<body>
    <div id="chart-container"></div>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

### NOTABLE FILES, VARIABLES AND FUNCTIONS

#### FILES

- script.js: The main file that process the csv file for employees and leads.
- chart.js: File with functions and varibales used for creating and updating the chart.
- chartLegends.js: File with function "showDepartmentAndRoleLegend" used to create and show the legends for the charts.
- createHiarchy.js: File for creating a JSON structure of the csv data to be used while creating the hierarchy.
- csvRowObject.js: File with two functions: "getCsvRowEmployee" and "getCsvRowLead" used to parse one row in the csv file to facilitate in making the JSON structure.
- employeeTooltip.js: File for displaying and hiding employee's details on hover via showTooltip, and hideTooltip functions.
- getNodeColor.js: File with function "getNodeColor" used to calculate the color of the Node of employee.
- selectLeads.js: File with function "selectLeadsDropdown" used to show a chart with the customer as the root of the chart.
- showLeadsButton.js: File with function "showLeadsButton" used to show the button to show and hide the whole chart details.
- topRightInfoBox.js: File with functions "showTopRightInfoBox" and "hideTopRightInfoBox" used to show and hide the box that has information about the leads of the selected employee.

#### VARIABLES

##### script.js

- allEmployees: Contains the chart details for all employees.
- leadsData: Contains the chart details for employees with leads.

#### FUNCTIONS

Create a CSV file named data.csv and populate it with the employee data. Each row should contain the following fields: **Employee_ID, Name, Title, Manager_ID, Role_Type.** Make sure the CSV file is in the same directory as your HTML and JavaScript files.

Open the HTML file in a web browser. The organizational tree chart will be displayed in the browser.

## How to Test

To test the application, you need to ensure that the data.csv file contains valid employee data. The CSV file should have a header row with the field names mentioned above.

Once you have the CSV file ready, follow the steps mentioned in the **"How to Run"** section to visualize the organizational tree chart. If there are any errors, you can check the browser console for error messages by opening the developer tools and selecting the "Console" tab.

**Note:** The script assumes that the D3.js library is accessible via the URL provided. If you prefer to use a local copy of the library, make sure to update the script tag accordingly.

Feel free to modify the code and CSS styles to customize the appearance and functionality of the organizational tree chart to suit your needs.
