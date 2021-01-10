let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
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
  console.log("Woops! " + event.target.errorCode);
  db = event.target.result;
};

// save new transaction to indexedDB while app is offline
function saveRecord(record) {
  const transaction = db.transaction(["pendingTransactions"], "readwrite");
  const store = transaction.objectStore("pendingTransactions");
  store.add(record);
}

// query database
function checkDatabase() {
  const transaction = db.transaction(["pendingTransactions"], "readwrite");
  const store = transaction.objectStore("pendingTransactions");
  const getAll = store.getAll();

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
        const store = transaction.objectStore("pendingTransactions");

        // clear all items in your store
        db = request.result;
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
