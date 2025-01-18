let chart; 
let incomeTotal = 0;
let expensesTotal = 0
let removeBtn, editBtn, addBtn, clearBtn;
let filteredTransactions;
let editTransactionId = null; 
let settings = {};

//Overall thoughts - did pretty solid would give myself around 4 or 5 out of 10, would say i handled it much better than any previous time

// !!! AT THE TOP ARE ALL THE CHANGED FUNCTIONS, EVERYTHING THAT WAS FURTHER ADDED OR MODIFIED WILL BE SHOWN !!!

//In case you are unable to load the project for whatever reason like last time I want you to know that this project has been sent to you with everything working
//If I was unable to do something I would have expicitly mentioned it here or somewhere around or messaged you about it so if you don't find anything like that, everything works
//And so if that happens we can just check the end results on my PC again like last time, have a fun read (I wrote too much yes...)

// Also one good note for the future is that in case we do something similar to this again we could pick up a totally new project from the start so I can do some js and stuff again
// I would also love to work on new stuff on the frontend stuff just out of curiosity but also to practice it so I don't forget it
// Just a recommendation tho, you know the best boss! *praying emoji*

//I am adding this code first (the one below) at the very top bcs it was super hard to understand, like the whole connections things, this is where it finally killed me xD
//Rereading this entire code i understand it's nothing special but trying to type it and imagine it for the first time just had me giga confused even though it's just vanilla js 99%
//I would for sure say that the more I do it the less confused I will be and the more I will know what to expect pretty much
//I did do this somewhat alone but I needed AI to literally tell me "a bro just fucking make the inner html empty and repopulate it again"
//Overall I do see and understand now why it can be useful and how the HTML can get very small and readable for a change xd

async function loadCategories() {
    try {
        const response = await fetch("http://localhost:5002/categories");
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        const json = await response.json();
        const categories = json.data;

        const categoriesDropdown = document.getElementById("categories");
        const categoriesAddPopupDropdown = document.getElementById("addPopupCategory");
        const categoriesEditPopupDropdown = document.getElementById("popupCategory");
        categoriesDropdown.innerHTML = ""; 
        categoriesAddPopupDropdown.innerHTML = "";
        categoriesEditPopupDropdown.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "ignore";
        defaultOption.textContent = "Search by Category";
        //categoriesDropdown.appendChild(defaultOption); - in case it's only one element being populated
        categoriesDropdown.appendChild(defaultOption.cloneNode(true));
        categoriesAddPopupDropdown.appendChild(defaultOption.cloneNode(true));
        categoriesEditPopupDropdown.appendChild(defaultOption.cloneNode(true));

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.category;
            option.textContent = category.category;
            //categoriesDropdown.appendChild(option); - in case it's only one element being populated
            categoriesDropdown.appendChild(option.cloneNode(true));
            categoriesAddPopupDropdown.appendChild(option.cloneNode(true));
            categoriesEditPopupDropdown.appendChild(option.cloneNode(true));
        });

        console.log("Categories loaded successfully!");
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadCategories);


//First connection I made! Would lie if I said I didn't completely steal it from the internet + my previous assignment, hopefully it gets better
async function loadFromDataBase() {
    try {
        const response = await fetch('http://localhost:5002/transactions');
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        transactions = json.data;
        createTable(transactions);
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

// Found the way to handle post randomly online tho i did need ai to correct me on the way i'd end up declaring the response when fetching it 
// (mostly the fact that headers was necessary and how to handle it)
async function addButton() {

    try {

        const type = document.getElementById('addPopupType').value;
        const amount = parseFloat(document.getElementById('addPopupAmount').value);
        const category = document.getElementById('addPopupCategory').value;
        const date = document.getElementById('addPopupDate').value;
        const description = document.getElementById('addPopupDescription').value;
    

        if (!type || isNaN(amount) || !category || !date || !description) {
            alert("All fields must be filled out.");
            return;
        }

        // Added part
        // Also had to keep this long part above because something else in the code wouldn't work without it
        // I'm pretty sure had that not been the case this would've been fine with just the post below

        const response = await fetch('http://localhost:5002/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: type,
                amount: amount,
                category: category,
                date: date,
                description: description
            })
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        transactions.push(json.data);
        createTable(transactions);
        closePopup();

    } catch (error) {
        console.error("Error posting a transaction.", error);
    }
}

async function confirmEdit() {
    try {
        const type = document.getElementById('popupType').value;
        const amount = parseFloat(document.getElementById('popupAmount').value);
        const category = document.getElementById('popupCategory').value;
        const date = document.getElementById('popupDate').value;
        const description = document.getElementById('popupDescription').value;

        if (!type || isNaN(amount) || !category || !date || !description) {
            alert("All fields must be filled out.");
            return;
        }

        const response = await fetch(`http://localhost:5002/transactions/${editTransactionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editTransactionId,
                type: type,
                amount: amount,
                category: category,
                date: date,
                description: description,
            }),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        //OKAY ALL THE WAY FROM HERE TO THE COMMENT AT THE END OF THE CODE IS AI WORK (you will find the comment)
        // So pretty much what was happening is that the transactions would be fine updating in the backend, but on the frontend they wouldn't want to update themselves and I had no idea why
        // So I used Claude cuz GPT was acting stupid and it gave me the code below pretty much saying that it most likely didn't work due to the sync between local array and server data
        // And that it worked better with addButton bcs that one is a simpler operation
        // So instead of trying to manually update the local array this just makes a copy of all transactions after the backend update is done and it prints that on the frontend (or so i think)
        // Well in case I am correct this is kinda an inefficient solution but I don't know what the better one could be 
        // Perhaps better solution would be checking the id of the updated item and then pasting only that one instead of an entire list back on? I'm not sure, so let me know :D

        console.log("Before update - transactions:", [...transactions]);

        console.log("Received data from server:", json.data);
        console.log("Looking for transaction with ID:", editTransactionId);

        const index = transactions.findIndex(t => t.id === editTransactionId);
        console.log("Found index:", index);

        if (index !== -1) {
            transactions[index] = json.data;
            console.log("After update - transactions:", [...transactions]); 

        } else {
            console.error("Transaction not found in array!");
        }

        const refreshResponse = await fetch('http://localhost:5002/transactions');
        if (!refreshResponse.ok) {
            throw new Error(`Response status: ${refreshResponse.status}`);
        }
        const refreshJson = await refreshResponse.json();
        transactions = refreshJson.data;

        //All the way to here
        //Well outside of this AI part i did everything and the backend part did work but I had no idea what to do about the frontend part

        createTable(transactions);
        closePopup();
    } catch (error) {
        console.error("Error updating transaction:", error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const addBtn = document.getElementById("addBtn");
    const removeBtn = document.getElementById("removeBtn");
    const editBtn = document.getElementById("editBtn");

    addBtn.onclick = function () {
        openPopup('add');
    };

    // Added, or rather, edited part (replaced the old code with this one)
    // In all honesty this one had me fucked the most, more than any other crud, was it because I was already 8 hours into working? Because I just couldn't understand what to do? 
    // Because there was already a lot of previous code that overwhelmed me? I don't know.
    // But yeah I needed a lot of AI help which also resulted in it being remodeled quite a lot by AI in order for it to work well
    // At least I understand it better now and it's not like Ai did ALL the work, but for sure the most important parts and the majority of it

    removeBtn.onclick = async function () {
        try {
            const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");
    
            if (selectedRows.length === 0) {
                alert("Please select at least one row to remove.");
                return;
            }
    
            const ids = Array.from(selectedRows).map(row => row.querySelector("td").textContent);// this one had me fucked up so much I had no idea how to type this for some reason
    
            const confirmMessage = selectedRows.length > 1
                ? `Are you sure you want to delete the selected ${selectedRows.length} rows?`
                : "Are you sure you want to delete the selected row?"; //Ay at least I did this part on my own and I have never written the 'if' cases like this so that's something!
            //     // I also wanted to replace popup with alert for this one case to see what they work like since I was curious, but I didn't remove the old remove popup
    
            const confirmDelete = confirm(confirmMessage);
            if (!confirmDelete) return;
    
            const response = await fetch("http://localhost:5002/transactions", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to delete transactions: ${response.status}`);
            }
    
            transactions = transactions.filter(transaction => !ids.includes(String(transaction.id))); //this one is also just zzzzzzzzzzzzz
            // Some of these are really just gonna take time, expirience, and a lot of GPT to remember xD
    
            selectedRows.forEach(row => row.remove());
    
            createTable(transactions);
            closePopup();
    
            alert("Transaction(s) deleted successfully!");
        } catch (error) {
            console.error("Error deleting transaction(s):", error);
            alert("Failed to delete transaction(s). Please try again.");
        }
    };

    // Until here

    editBtn.onclick = function () {
        const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");
        if (selectedRows.length === 1) {
            editButton(selectedRows[0]);
        } else {
            alert("Please select only one row to edit.");
        }
    };
});

async function masterFilter() {
    filteredTransactions = transactions.slice();

    const type = document.getElementById("type").value;
    const categories = document.getElementById("categories").value;
    const amount = document.getElementById("amount").value;
    const input = document.querySelector(".input-wrapper .input").value.toUpperCase();

    console.log("Dropdown selection value:", type);
    console.log("Dropdown selection value:", categories);
    console.log("Dropdown selection value:", amount);
    console.log("Dropdown selection value:", input);


    // From here was edited until the end

    if (type !== "ignore") {
        filteredTransactions = filteredTransactions.filter(transaction => 
            type === "Expenses" 
                ? transaction.type === "expense" 
                : transaction.type === "income"
        );
    }

    if (categories !== "ignore") {
        filteredTransactions = filteredTransactions.filter(transaction => transaction.category === categories);
    }

    if (amount !== "ignore") {
        try {
            const sort = amount === "ascAmount" ? "asc" : "desc";
            const response = await fetch(`http://localhost:5002/transactions?sort=${sort}`);
            if (!response.ok) {
                throw new Error("Failed to fetch sorted transactions");
            }
            const json = await response.json();
            filteredTransactions = json.data; 
        } catch (error) {
            console.error("Error fetching sorted transactions:", error);
        }
    } else {
        filteredTransactions = filteredTransactions.sort((a, b) => a.id - b.id);
    }

    //Now I did keep this as it is for one reason
    //Prove me if I am wrong, but I believe that if I'm pulling everything from the table which is being backend generated, then checking for a thing like this shouldn't matter if it's done on the front or backend
    //Maybe I am too sleep deprived because i've been working on this the entire night, but somehow, in my own weird way, i believe this is fine being done here also
    //In case I'm wrong I won't mind coming back to this to fix it 

    if (input !== "") {
        filteredTransactions = filteredTransactions.filter(transaction => {
            return (
                transaction.type.toUpperCase().includes(input) ||
                transaction.category.toUpperCase().includes(input) ||
                transaction.description.toUpperCase().includes(input) ||
                transaction.date.includes(input) || 
                String(transaction.amount).includes(input) 
            );
        });
    }

    console.log("Filtered Transactions after selection:", filteredTransactions);
    createTable(filteredTransactions);
}

//This one was mostly me
async function darkModeFunction() {
    try {
        const element = document.getElementById("body");
        const darkMode = !element.classList.contains("darkmode");

        if (darkMode) {
            element.classList.add("darkmode");
        } else {
            element.classList.remove("darkmode");
        }

        const response = await fetch('http://localhost:5002/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ darkMode }),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Dark mode updated in database:", json);

        settings.darkMode = darkMode;
    } catch (error) {
        console.error("Error updating dark mode:", error);
    }
}

//New function to load darkmode since previously I was just storing it in the local data
async function loadDarkMode() {
    try {
        const element = document.getElementById("body");
        const response = await fetch('http://localhost:5002/settings');
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        console.log(json);

        settings = json.data[0] || { darkMode: false }; //this one still confuses me, can't understand how it works

        if (settings.darkMode) {
            element.classList.add("darkmode");
        }
        else {
            element.classList.remove("darkmode");
        }
    }
    catch (error) {
        console.error("Error fetching settings:", error);
    }

    setChartBackground();
}

window.onload = async function() {
    await loadFromDataBase(); 
    await loadDarkMode();

    const type = document.getElementById("type");
    const categories = document.getElementById("categories");
    const amount = document.getElementById("amount");
    const input = document.querySelector(".input-wrapper .input");

    removeBtn = document.querySelector(".remove-selected button");
    editBtn = document.querySelector(".edit-selected button");
    addBtn = document.querySelector(".add-selected button");
    clearBtn = document.querySelector(".clear button");

    removeBtn.disabled = true;
    editBtn.disabled = true;
    addBtn.disabled = false;
    addBtn.classList.remove("disabled");
    clearBtn.disabled = true;

    type.addEventListener("change", () => {
        filterChecker();
        masterFilter(); 
    });
    categories.addEventListener("change", () => {
        filterChecker();
        masterFilter(); 
    });
    amount.addEventListener("change", () => {
        filterChecker();
        masterFilter(); 
    });
    input.addEventListener("input", () => {
        filterChecker();
        masterFilter(); 
    });

    filterChecker();
    clearButton(); 
}

// !!! FROM HERE AND DOWN ARE ALL THE UNCHANGED STUFF OR STUFF THAT HAS BARELY BEEN CHANGED !!!

//Straight up copied EVERYTHING from the project with vanilla js, no/little to no changes

//No need to check it.

function createTable(data = transactions) {
    const tbody = document.querySelector("#transactionsTable tbody");
    tbody.innerHTML = ""; 
    data.forEach(transaction => {
        var tr = document.createElement("tr");
        tr.addEventListener("click", selectRow);
        Object.values(transaction).forEach(cell => {
            var td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    color();
    income();
    expenses();
    balance();
    calculateAndDrawChart();
}


function openPopup(type, options = {}) {
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popupTitle");
    const addTransactionForm = document.getElementById("addTransactionForm");
    const editTransactionForm = document.getElementById("editTransactionForm");
    const removeTransactionForm = document.getElementById("removeTransactionForm");
    const confirmAction = document.getElementById("confirmAction");

    if (type === 'add') {
        popupTitle.textContent = "Remove Transaction";
        addTransactionForm.style.display = "block";
        removeTransactionForm.style.display = "none";
        editTransactionForm.style.display = "none";
    } 
    else if (type === 'remove') {
        popupTitle.textContent = "Remove Transaction";
        addTransactionForm.style.display = "none";
        removeTransactionForm.style.display = "block";
        editTransactionForm.style.display = "none";

        document.getElementById("confirmationText").textContent = options.message || "Are you sure?";

        confirmAction.onclick = function () {
            options.onConfirm();
            closePopup();
        };
    }
    else {
        popupTitle.textContent = "Edit Transaction";
        addTransactionForm.style.display = "none";
        removeTransactionForm.style.display = "none";
        editTransactionForm.style.display = "block";

        confirmAction.onclick = confirmEdit;
    }

    popup.style.display = "block";
}


function closePopup() {
    document.getElementById("popup").style.display = "none";
}


function editButton() {
    const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");

    if (selectedRows.length !== 1) {
        alert("Please select exactly one row to edit.");
        return;
    }

    const cells = selectedRows[0].querySelectorAll("td");
    editTransactionId = cells[0].textContent; 

    document.getElementById('popupType').value = cells[1].textContent;
    document.getElementById('popupAmount').value = parseFloat(cells[2].textContent);
    document.getElementById('popupCategory').value = cells[3].textContent;
    document.getElementById('popupDate').value = cells[4].textContent;
    document.getElementById('popupDescription').value = cells[5].textContent;

    openPopup('edit');
}


function filterChecker() {
    const input = document.querySelector(".input-wrapper .input").value.trim();
    const type = document.getElementById("type").value;
    const categories = document.getElementById("categories").value;
    const amount = document.getElementById("amount").value;

    console.log("Filter Values ->", { input, type, categories, amount });

    const isAnyFilterActive = input !== "" || type !== "ignore" || categories !== "ignore" || amount !== "ignore";

    if (isAnyFilterActive) {
        clearBtn.disabled = false;
        clearBtn.classList.remove("disabled");
        console.log("Clear button enabled because a filter is active.");
    } else {
        clearBtn.disabled = true;
        clearBtn.classList.add("disabled");
        console.log("Clear button disabled because no filters are active.");
    }
}


function selectRow() {
    this.classList.toggle("selected");
    const selectedRows = document.querySelectorAll("#transactionsTable tr.selected");

    if (selectedRows.length > 0) {
        console.log("Row selected!");
        removeBtn.disabled = false;
        editBtn.disabled = false;
        removeBtn.classList.remove("disabled");
        editBtn.classList.remove("disabled");
    } 
    else {
        console.log("No rows selected!");
        removeBtn.disabled = true;
        editBtn.disabled = true;
        removeBtn.classList.add("disabled");
        editBtn.classList.add("disabled");
    }
}


function income() {
    const incomeContainer = document.getElementsByClassName("income")[0];

    let text = incomeContainer.querySelector("p.income-total");

    if (!text) {
        text = document.createElement("p");
        text.classList.add("income-total"); 
        incomeContainer.appendChild(text);  
    }

    incomeTotal = 0;
    transactions.forEach(cell => {
        if (cell.type === "income") {
            incomeTotal += cell.amount;
        }
    });

    text.textContent = "$" + incomeTotal; 
}

function expenses(){
    const expenseContainer = document.getElementsByClassName("expenses")[0];

    let text = expenseContainer.querySelector("p.expense-total");
    
        if (!text) {
        text = document.createElement("p");
        text.classList.add("expense-total"); 
        expenseContainer.appendChild(text);  
    }

    expensesTotal = 0;
    transactions.forEach(cell => {
        if (cell.type === "expense") {
            expensesTotal += cell.amount;
        }
    });
    
    text.textContent = "$" + expensesTotal;
}

function balance(){
    const balanceContainer = document.getElementsByClassName("balance")[0];

    let text = balanceContainer.querySelector("p.balance-total");
    
    if (!text) {
        text = document.createElement("p");
        text.classList.add("balance-total"); 
        balanceContainer.appendChild(text);  
    }
    
    let balanceTotal = 0;
    balanceTotal = incomeTotal - expensesTotal;
    text.textContent = "$" + balanceTotal; 
}

function color(){
    const cells = document.querySelectorAll("#transactionsTable td")
    cells.forEach(cell => {
        if (cell.textContent == "income") {
            cell.style.color = "green";
        }
        else if(cell.textContent == "expense"){
            cell.style.color = "red"
        }
    });
}

function clearButton() {
    clearBtn = document.querySelector(".clear button");
    const input = document.querySelector(".input-wrapper .input");
    const amount = document.getElementById("amount");
    const type = document.getElementById("type");
    const categories = document.getElementById("categories");

    clearBtn.addEventListener("click", function() {
        input.value = "";
        amount.value = "ignore";
        type.value = "ignore";
        categories.value = "ignore";

        filterChecker();
        masterFilter();
        createTable(filteredTransactions);
    });
}

function clearChart() {
    //AI
    // Dispose of the chart if it exists to prevent duplication
    if (chart) {
        chart.dispose();
        chart = null;  // Clear the chart reference
    }
}

function setChartBackground() {
    //AI
    //Slightly modified by me
    if (!chart) {
        console.warn("Chart is not initialized.");
        return;
    }
    const isDarkMode = document.body.classList.contains("darkmode");
    chart.background().fill(isDarkMode ? "#1E201E" : "#dbdbdb");
}


function calculateAndDrawChart() {
    //Fully taken from inernet - Modified by AI
    // Clear the previous chart to avoid duplicates
    clearChart();

    // Calculate totals
    let incomeTotal = 0;
    let expensesTotal = 0;
    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            incomeTotal += transaction.amount;
        } else if (transaction.type === "expense") {
            expensesTotal += transaction.amount;
        }
    });

    // Create the chart
    const data = anychart.data.set([
        ["Income", incomeTotal],
        ["Expenses", expensesTotal],
    ]);

    chart = anychart.pie(data);  // Store the chart in the global variable

    const palette = anychart.palettes.distinctColors();
    palette.items([{ color: "#5D9C59" }, { color: "#DF2E38" }]);
    chart.palette(palette);

    chart.title("Income vs Expenses");

    setChartBackground();  // Set the initial background based on mode

    chart.container("chart-container");
    chart.draw();
}