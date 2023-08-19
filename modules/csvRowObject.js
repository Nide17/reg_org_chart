// FUNCTION TO GET THE CSV ROW OBJECT AS JAVASCRIPT OBJECT
const getCsvRowEmployee = (row) => {

    const rowObject = {
        "id": row.ID,
        "name": row["Employee Name"],
        "title": row["Job Position"],
        "role_type": row["Role Type"],
        "email": row["Work Email"],
        "phone": row["Work Phone"] ? row["Work Phone"].replace(/'/g, "") : 'N/A', // IF THE PHONE NUMBER IS NOT AVAILABLE, SET IT TO 'N/A
        "manager_id": row["Manager/ID"] ? row["Manager/ID"] : 'N/A', // IF THE MANAGER ID IS NOT AVAILABLE, SET IT TO 'N/A
        "manager_name": row["Manager/Employee Name"],
        "department_name": row["Department/Department Name"],
        "department_type": row["Department/Department Type"],
        "department_manager_type": row["Manager/Role Type"],
        "related_leads_opportunities": row["Related Contact/Lead/Opportunity"] && [row["Related Contact/Lead/Opportunity"]],
        "value": 1
    };
    return rowObject;
}

const getCsvRowLead = (row) => {

    const rowObject = {
        "id": row.ID,
        "name": row["Employee Name"],
        "title": row["Job Position"],
        "role_type": row["Role Type"],
        "email": row["Work Email"],
        "phone": row["Work Phone"] ? row["Work Phone"].replace(/'/g, "") : 'N/A', // IF THE PHONE NUMBER IS NOT AVAILABLE, SET IT TO 'N/A
        "manager_id": row["Manager/ID"] ? row["Manager/ID"] : 'N/A', // IF THE MANAGER ID IS NOT AVAILABLE, SET IT TO 'N/A
        "manager_name": row["Manager/Employee Name"],
        "department_name": row["Department/Department Name"],
        "department_type": row["Department/Department Type"],
        "department_manager_type": row["Manager/Role Type"],
        "related_leads_opportunities": row["Related Contact/Lead/Opportunity"],
        "value": 1
    };
    return rowObject;
}

export { getCsvRowEmployee, getCsvRowLead }