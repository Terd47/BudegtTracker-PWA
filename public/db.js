let db;
// db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
   // create object store 
  db = event.target.result;
  db.createObjectStore("pendingTransactions", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  db = event.target.result;
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pendingTransactions"], "readwrite");
  const pendingTransactions = transaction.objectStore("pendingTransactions");
  pendingTransactions.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pendingTransactions"], "readwrite");
  const pendingTransactions = transaction.objectStore("pendingTransactions");
  const getAll = pendingTransactions.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pendingTransactions"], "readwrite");
        // access your pending object store
        const pendingTransactions = transaction.objectStore("pendingTransactions");
        db = request.result;
        pendingTransactions.clear();
      });
    }
  };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);
