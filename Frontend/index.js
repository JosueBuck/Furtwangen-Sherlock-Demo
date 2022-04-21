let showCollections = true;
let showSchema = true;

/* Collections */

const showAvailableCollections = async () => {

    const availableCollectionsJson = await getAvailableCollections();
    if (availableCollectionsJson == null) {
        return;
    }

    handleContentButtons(showCollections, setShowCollection, "show-collections-button", "hide-collections-button");

    const collectionsContainer = document.getElementById("available-collections-container");

    /* Create Collections Container Structure */

    for (let i = 0; i < availableCollectionsJson.length; i++) {

        // Collection Div
        const collection = document.createElement("div")
        collection.setAttribute("class", "collection")

        // Collection Name
        const collectionName = document.createElement("h3");
        collectionName.innerHTML = availableCollectionsJson[i].collectionName;
        collection.appendChild(collectionName);

        // Collection Systems
        const systems = document.createElement("h4");
        systems.innerHTML = "Collection Systems:";
        collection.appendChild(systems)

        for (let x = 0; x < availableCollectionsJson[i].systems.length; x++) {
            const system = document.createElement("div");
            system.setAttribute("class", "system");
            collection.appendChild(system);

            const ul = document.createElement("ul");
            system.appendChild(ul);

            for (let y = 0; y < availableCollectionsJson[i].systems[x].types.length; y++) {

                const li = document.createElement("li");
                li.innerHTML = availableCollectionsJson[i].systems[x].types[y];
                ul.appendChild(li);
            }
        }

        collectionsContainer.appendChild(collection)

    }


}

const getAvailableCollections = async () => {
    try {
        const response = await fetch('http://localhost:3000/getAvailableCollections', {
            method: 'GET',
        });
        const myJson = await response.json();
        return myJson;
    } catch (error) {
        alert("error: " + error);
        return;
    }
}

const hideAvailableCollections = () => {
    const collectionsContainer = document.getElementById("available-collections-container");
    collectionsContainer.innerHTML = "";
    handleContentButtons(showCollections, setShowCollection, "show-collections-button", "hide-collections-button");
}

const setShowCollection = (_value) => {
    showCollections = _value;
}



/* Schema */

const showCollectionSchema = async() => {
    const collectionName = getSchemaUserInput();

    if (collectionName == "") {
        alert("Please insert a collection name!");
        return;
    }

    const collectionSchema = await getCollectionSchema(collectionName);

    if (collectionSchema.status == 404) {
        alert(`There is no collection named ${collectionName}!`);
        return;
    }

    handleContentButtons(showSchema, setShowSchema, "show-collection-schema-button", "hide-collection-schema-button");

    const collectionSchemaContainer = document.getElementById("collection-schema-container");

    /* Create Schema Container Structure */

    const ul = document.createElement("ul");
    collectionSchemaContainer.appendChild(ul);

    const schemaPropertiesNames = Object.getOwnPropertyNames(collectionSchema.properties);

    for (let i = 0; i < schemaPropertiesNames.length; i++) {
        const li = document.createElement("li");
        li.innerHTML = schemaPropertiesNames[i];
        
        ul.appendChild(li);
    }

    
}

const getSchemaUserInput = () => {
    const schemaInputElement = document.getElementById("schemaCollectionName");
    const collectionName = schemaInputElement.value;
    return collectionName;
}

const getCollectionSchema = async (_collectionName) => {
    try {
        const response = await fetch(`http://localhost:3000/getCollectionSchema/${_collectionName}`, {
            method: 'GET'
        });
        const myJson = await response.json(); //extract JSON from the http response
        //const collections = JSON.stringify(myJson);  
        //console.log(myJson);
        return myJson;
    } catch (error) {
        alert("error: " + error);
        return;
    }
}

const hideCollectionSchema = () => {
    const collectionsContainer = document.getElementById("collection-schema-container");
    collectionsContainer.innerHTML = "";
    handleContentButtons(showSchema, setShowSchema, "show-collection-schema-button", "hide-collection-schema-button");
}

const setShowSchema = (_value) => {
    showSchema = _value;
}




/* Button Handling */
const handleContentButtons = (_currentShowValue, _changeShowValueFunction, _showButtonId, _hideButtonId) => {
    const showCollectionsButton = document.getElementById(_showButtonId);
    const hideCollectionsButton = document.getElementById(_hideButtonId);
    if (_currentShowValue) {
        showCollectionsButton.style.visibility = 'hidden';
        hideCollectionsButton.style.visibility = 'visible';
        _changeShowValueFunction(false);
    } else {
        showCollectionsButton.style.visibility = 'visible';
        hideCollectionsButton.style.visibility = 'hidden';
        _changeShowValueFunction(true);
    }
}