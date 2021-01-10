// initialize database
const db;

// new db request for budgetTracker database
const request = indexedDB.open("budgetTracker", 1);
// new object store
request.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true});
};
// read from database if app is online
request.onsuccess = event => {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};
// if error, console.log error
request.onerror = event => {
    console.log("Sorry, error with your request" + event.target.errorCode);
};
// save record to object store
const saveDataRecord = data => {
    const transaction = db.transaction(["pending"], "readwrite");
    const dbStore = transaction.objectStore("pending");
    dbStore.add(data);
}
// read data from database
const readDatabase = () => {
    const transaction = db.transaction(["pending"], "readwrite");
    const dbStore = transaction.objectStore("pending");
    const getData = dbStore.getAllData();

    // get all data from database
    getAllData.onsuccess = () => {
        if(getData.result.length > 0) {
            fetch("/api/transaction/bundle", {
                method: "POST",
                body: JSON.stringify(getData.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(result => result.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const dbStore = transaction.objectStore("pending");
            //    clear items in store
                dbStore.clear();
            });
        };
        
    };
};

// when app comes back online, read database
window.addEventListener("online", readDatabase);
