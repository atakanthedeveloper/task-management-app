

document.addEventListener("DOMContentLoaded", ()=>{
    
    const taskName = document.getElementById("taskname-input");
    const addTaskButton = document.getElementById("add-button");
    const taskList = document.getElementById("task-cards-list");
    const taskCount = document.getElementById("task-count");
    const remainingTask = document.getElementById("remaining-task");
    const clearCompletedButton = document.getElementById("clear-completed-button");
    const clearAllButton = document.getElementById("clear-all-button");
    const filterButtons = document.getElementsByClassName("filter-buttons");
    const sortSelect = document.getElementById("sort-selection"); // it can change
    const categorySelect = document.getElementById("task-category");
    const prioritySelect = document.getElementById("task-priority");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let currentFilter = "all";
    let currentSort = "newest";

    addTaskButton.addEventListener("click", addTasks);
    taskName.addEventListener("keypress", (e)=>{
        if(e.key === "Enter") {
            addTasks();
        }
    });

    function addTasks() {
        let taskHeading = taskName.value;
        if(taskHeading) {
            let newTask = {
                id: Date.now(),
                taskname: taskHeading,
                completed: false,
                createdAt: new Date(),
                category: categorySelect.value,
                priority: prioritySelect.value,
                isEditing: false
            };

            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateStats();
            taskName.value = "";
            taskName.focus();

        }

    }   

    function renderTasks() {
        taskList.innerHTML = "";
        let filteredTasks = filterAndSortTasks();

        if(filteredTasks.length === 0) {
            const emptyMessage = createEmptyStateElement();
            taskList.appendChild(emptyMessage);
        }
        else {
            filteredTasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }

        attachTaskEventListeners();
    }

   

    function filterAndSortTasks() {
        if(tasks.length === 0) {
            return []
        };

        let filtered = [...tasks];
        if(currentFilter === "active") {
            filtered = filtered.filter((task)=>{ return !task.completed});
        }
        else if(currentFilter === "completed") {
            filtered = filtered.filter((task)=>{ return task.completed});
        }

        return sortTasks(filtered);
    }

    function sortTasks(taskToSort) {
        switch(currentSort) {
            case "newest":
                return [...taskToSort].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
            
            case "oldest":
                return [...taskToSort].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );

            case "priority":
                const priorityOrder = {high: 3, medium: 2, low: 1};
                return [...taskToSort].sort(
                    (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
                );

            case "category":
                return [...taskToSort].sort(
                    (a, b) => (a.category || "").localeCompare(b.category || "")
                );

            default:
                return taskToSort;
        }        
    }

    function createEmptyStateElement() {
        let li = document.createElement("li");

        li.innerHTML = '<i class="fa-solid fa-list-check"></i><p style="margin: 0px;">No tasks yet</p>';
        li.style.display = "flex";
        li.style.justifyContent = "center";
        li.style.alignItems = "center";
        li.style.gap = "10px";
        li.style.margin = "50px 0px";

        return li;
    }

    function attachTaskEventListeners() {
        document.querySelectorAll(".checkbox").forEach((checkbox) => {
            checkbox.addEventListener("change", toggleTask);
        });

        document.querySelectorAll(".edit-button").forEach((editButton) => {
            editButton.addEventListener("click", editTask);
        });

        document.querySelectorAll(".save-edit-button").forEach((saveEditButton)=> {
            saveEditButton.addEventListener("click", saveEdit);
        });

        document.querySelectorAll(".cancel-edit-button").forEach((cancelEditButton)=> {
            cancelEditButton.addEventListener("click", cancelEdit);
        });

        document.querySelectorAll(".delete-button").forEach((deleteButton) => {
            deleteButton.addEventListener("click", deleteTask);
        });
        document.querySelectorAll(".task-priority-in-cards").forEach((select) => {
            select.addEventListener("change", changePrioritiesColors);
        });
    }

    function deleteTask(e) {
        let relatedTask = findTask(e);
        tasks = tasks.filter((t)=>{ return t.id !== relatedTask.id});
        saveTasks();
        renderTasks();
        updateStats();
   }

    function editTask(e) {
        let relatedTask = findTask(e);
        relatedTask.isEditing = true;
        renderTasks();
    } 
    
    function cancelEdit(e) {
        let relatedTask = findTask(e);
        relatedTask.isEditing = false;
        renderTasks();
    }

    function saveEdit(e) {
        let relatedTask = findTask(e);
        let taskCard = e.target.closest(".task-cards");
        let taskName = taskCard.querySelector(".edit-task-name").value;
        let taskCategory = taskCard.querySelector(".task-category-in-cards").value;
        let taskPriority = taskCard.querySelector(".task-priority-in-cards").value;

        relatedTask.taskname = taskName;
        relatedTask.category = taskCategory;
        relatedTask.priority = taskPriority;
        relatedTask.isEditing = false;

        saveTasks();
        renderTasks();
        updateStats();

    }

    function toggleTask(e) {
        
        let relatedTask = findTask(e);
        relatedTask.completed = e.target.checked;

        saveTasks();
        renderTasks();
        updateStats();
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateStats() {
        let allTasks = tasks.length;
        let completedTasks = tasks.filter((t)=>{ return t.completed === true}).length;
        let activeTasks = allTasks - completedTasks;
        remainingTask.textContent = `${activeTasks} ${activeTasks === 1 ? "active task" : "active tasks"} left`;
        taskCount.textContent = allTasks;
    }

    function findTask(e) {
        let taskCard = e.target.closest(".task-cards");
        let taskCardId = taskCard.getAttribute("data-task-id");
        let task = tasks.find((t)=>{
            return t.id === Number(taskCardId);
        });
        return task;
    }

    function createTaskElement(finalizeTask) {
        let li = document.createElement("li");
        if(finalizeTask.isEditing == true) {
            li.innerHTML = `
                <div class="task-cards ${!finalizeTask.completed ? "" : "completed-task task-complete-effect"}" data-task-id="${finalizeTask.id}">
                    <div class="task-cards-content">
                        <input type="checkbox" class="checkbox" ${!finalizeTask.completed ? "" : "checked"} disabled> 
                        <h2>
                        <input class="edit-task-name" type="text" value="${finalizeTask.taskname}">
                        </h2>
                        <div class="task-section-select-container">
                            <select name="" class="task-category-in-cards">
                                <option value="general" ${finalizeTask.category == "general" ? "selected" : ""}>General</option>
                                <option value="work" ${finalizeTask.category == "work" ? "selected" : ""}>Work</option>
                                <option value="personal" ${finalizeTask.category == "personal" ? "selected" : ""}>Personal</option>
                                <option value="shopping" ${finalizeTask.category == "shopping" ? "selected" : ""}>Shopping</option>
                                <option value="health" ${finalizeTask.category == "health" ? "selected" : ""}>Health</option>
                            </select>
                            <select name="" class="task-priority-in-cards ${finalizeTask.priority == "low" ? "priority-low" : finalizeTask.priority == "medium" ? "priority-medium" : finalizeTask.priority == "high" ? "priority-high" : ""}">
                                <option value="low" ${finalizeTask.priority == "low" ? "selected" : ""}>Low</option>
                                <option value="medium" ${finalizeTask.priority == "medium" ? "selected" : ""}>Medium</option>
                                <option value="high" ${finalizeTask.priority == "high" ? "selected" : ""}>High</option>
                            </select>
                        </div>
                            <p class="addition-date">${getTaskCreatedText(finalizeTask.createdAt)}</p>
                    </div>
                    <div class="task-cards-buttons">
                        <button class="save-edit-button">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="cancel-edit-button">
                            <i class="fa-solid fa-ban"></i>
                        </button>
                    </div>
                </div>     
        `;
        }
        else {
            li.innerHTML = `
                <div class="task-cards ${!finalizeTask.completed ? "" : "completed-task task-complete-effect"}" data-task-id="${finalizeTask.id}">
                    <div class="task-cards-content">
                        <input type="checkbox" class="checkbox" ${!finalizeTask.completed ? "" : "checked"}> 
                        <h2>${finalizeTask.taskname}</h2>
                        <div class="task-section-select-container">
                            <select name="" class="task-category-in-cards" disabled>
                                <option value="general" ${finalizeTask.category == "general" ? "selected" : ""}>General</option>
                                <option value="work" ${finalizeTask.category == "work" ? "selected" : ""}>Work</option>
                                <option value="personal" ${finalizeTask.category == "personal" ? "selected" : ""}>Personal</option>
                                <option value="shopping" ${finalizeTask.category == "shopping" ? "selected" : ""}>Shopping</option>
                                <option value="health" ${finalizeTask.category == "health" ? "selected" : ""}>Health</option>
                            </select>
                            <select name="" class="task-priority-in-cards ${finalizeTask.priority == "low" ? "priority-low" : finalizeTask.priority == "medium" ? "priority-medium" : finalizeTask.priority == "high" ? "priority-high" : ""}" disabled>
                                <option value="low" ${finalizeTask.priority == "low" ? "selected" : ""}>Low</option>
                                <option value="medium" ${finalizeTask.priority == "medium" ? "selected" : ""}>Medium</option>
                                <option value="high" ${finalizeTask.priority == "high" ? "selected" : ""}>High</option>
                            </select>
                        </div>
                            <p class="addition-date">${getTaskCreatedText(finalizeTask.createdAt)}</p>
                    </div>
                    <div class="task-cards-buttons">
                        <button class="edit-button">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="delete-button">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>     
        `;
        }
        return li;
    }

    function getTaskCreatedText(taskCreatedAt) {
        const createdDate = new Date(taskCreatedAt);
        const now = new Date();

        const createdDay = new Date(
            createdDate.getFullYear(),
            createdDate.getMonth(),
            createdDate.getDate()
        );

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const yesterday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
        );

        let hour = createdDate.getHours();
        let minute = createdDate.getMinutes();

        hour = hour < 10 ? "0" + hour : hour;
        minute = minute < 10 ? "0" + minute : minute;

        const timeText = `${hour}:${minute}`;

        if (createdDay.getTime() === today.getTime()) {
            return `Added today at ${timeText}`;
        }

        if (createdDay.getTime() === yesterday.getTime()) {
            return `Added yesterday at ${timeText}`;
        }

        let day = createdDate.getDate();
        let month = createdDate.getMonth() + 1;
        let year = createdDate.getFullYear();

        day = day < 10 ? "0" + day : day;
        month = month < 10 ? "0" + month : month;

        return `Added on ${day}.${month}.${year} at ${timeText}`;
    }

    function clearCompletedTasks() {
        tasks = tasks.filter((t)=>{return t.completed === false});
        saveTasks();
        renderTasks();
        updateStats();  
    }

    function clearAllTasks() {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();  
    }

    clearCompletedButton.addEventListener("click", clearCompletedTasks);
    clearAllButton.addEventListener("click", clearAllTasks);
    sortSelect.addEventListener("change", function(e){
        currentSort = e.target.value;
        renderTasks();
    });
    
    Array.from(filterButtons).forEach((btn) => {
        btn.addEventListener("click", function(e) {
            Array.from(filterButtons).forEach((b) => {
                b.classList.remove("selected-filter");
            });

            e.currentTarget.classList.add("selected-filter");
            currentFilter = e.currentTarget.getAttribute("data-filter");
            renderTasks();
        });
    });

    function changePrioritiesColors(e) {
        e.target.classList.remove("priority-low", "priority-medium", "priority-high");

        if (e.target.value === "low") {
            e.target.classList.add("priority-low");
        }
        else if (e.target.value === "medium") {
            e.target.classList.add("priority-medium");
        }
        else if (e.target.value === "high") {
            e.target.classList.add("priority-high");
        }
    }

    renderTasks();
    updateStats();
});