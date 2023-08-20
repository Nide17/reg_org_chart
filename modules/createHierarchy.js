// FUNCTION TO TRANSFORM THE JSON ARRAY OF OBJECTS INTO A HIERARCHICAL JSON STRUCTURE
const createHierarchy = (data) => {

    // THE ROOT NODE OF THE HIERARCHY JSON STRUCTURE
    const hierarchy = {
        "name": "Rwanda Energy Group",
        "title": "REG",
        "email": "info@reg.rw",
        "children": [],
        "id": "-1",
        "value": 1
    };

    // CREATING A LOOKUP TABLE FOR THE JSON ARRAY OF OBJECTS
    // LOOKUP TABLE HELPS TO FIND THE PARENT OF EACH NODE
    const lookup = {};

    // POPULATING THE LOOKUP TABLE AND CREATING THE CHILDREN ARRAY
    data.forEach(obj => {

        // ATTACH THE NODE TO THE ROOT NODE IF IT HAS NO MANAGER
        if (obj.title === "Chairperson of the Board") {
            obj.manager_id = "-1";
            obj.manager_name = "Rwanda Energy Group";
        }

        lookup[obj.id] = obj; // REFERENCING EACH NODE BY ITS ID INTO THE LOOKUP TABLE
        obj.children = []; // CREATING THE CHILDREN ARRAY FOR EACH NODE
    });

    // ADDING THE CHILDREN TO THE HIERARCHY JSON STRUCTURE
    data.forEach(obj => {

        // ADDING THE CHILDREN TO THE PARENT NODE
        // HAS A MANAGER & MANAGER IS NOT THE ROOT NODE (REG) - IS IN THE LOOKUP TABLE
        if (obj.manager_id && lookup[obj.manager_id]) {
            lookup[obj.manager_id].children.push(obj);
        }

        // IF THE CURRENT HAS NO PARENT (MANAGER), SKIP IT
        else if (obj.manager_id && !lookup[obj.manager_id] && obj.title !== "Chairperson of the Board") {
            return;
        }

        else {
            // WHEN THE MANAGER IS THE ROOT NODE (REG) 
            hierarchy.children.push(obj);
        }
    });

    // RETURNING THE HIERARCHY JSON STRUCTURE
    return hierarchy;
}

export { createHierarchy }