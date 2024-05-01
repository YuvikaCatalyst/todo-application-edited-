
const todoList = document.querySelector(".todoItems");
const displayItemsButton = document.querySelector(".displayItems");
const addItemButton = document.querySelector(".addItem");
const todoTask = document.querySelector(".todoTask");
const task = document.querySelector(".task");
const findTask = document.querySelector(".findTask");
//added event listener to display button
displayItemsButton.addEventListener("click", async () => {
    await todoItems();
});

//added event listener to additem button,incrementing the id value  each time  anew item is added ,changes stored to localhost and createlist function called
addItemButton.addEventListener("click", async () => {
    if (todoTask.value.trim() === "") {
        alert("Kindly enter some task");
    } else {
        try {
           
            let todos = JSON.parse(localStorage.getItem('todos')) || [];
            const maxId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) : 0;
            const newId = maxId + 1;
            const newTodo = {
                userId: 1,
                id: newId, 
                title: todoTask.value.trim(),
                completed: false
            };

            todos.unshift(newTodo);
            localStorage.setItem('todos', JSON.stringify(todos));

            await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify(newTodo),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            const listItem = createTodoListItem(newTodo);
            todoList.appendChild(listItem);

            todoTask.value = ""; 

        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
});

//function to display todo items
async function todoItems() {
    try {
        let firstTenTodos = JSON.parse(localStorage.getItem('todos'));
        
        if (!firstTenTodos) {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos');
            firstTenTodos = await response.json();
            firstTenTodos = firstTenTodos.slice(0, 10);
            localStorage.setItem('todos', JSON.stringify(firstTenTodos));
        }

        if (firstTenTodos.length === 0) {
            const listItem = document.createElement("li");
            listItem.innerText = "No elements in the todo currently";
            todoList.appendChild(listItem);
        } else {
            firstTenTodos.forEach(task => {
                const listItem = createTodoListItem(task, firstTenTodos);
                todoList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

//function to create a list item of todo ,adding checkbox ,title of task,edit button and delete button
function createTodoListItem(task) {
    const listItem = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", async () => {
        task.completed = checkbox.checked;
        listItem.style.background = task.completed ? "red" : "green"; 

        try {
            await fetch(`https://jsonplaceholder.typicode.com/todos/${task.id}`, {
                method: 'PUT',
                body: JSON.stringify(task),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            let todos = JSON.parse(localStorage.getItem('todos')) || [];
            todos.forEach(todo => {
                if (todo.id === task.id) {
                    todo.completed = task.completed;
                }
            });
            localStorage.setItem('todos', JSON.stringify(todos));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    });

    const textSpan = document.createElement("span");
    textSpan.innerText = task.title;

    
    const editButton = createButton("Edit", async () => {
        const newTitle = prompt("Enter new title:", task.title);
        if (newTitle !== null) {
            task.title = newTitle;
            textSpan.innerText = newTitle;
    
            try {
                await fetch(`https://jsonplaceholder.typicode.com/todos/${task.id}`, {
                    method: 'PATCH', 
                    body: JSON.stringify({ title: newTitle }), 
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                });
    
                let todos = JSON.parse(localStorage.getItem('todos')) || [];
                todos.forEach(todo => {
                    if (todo.id === task.id) {
                        todo.title = newTitle;
                    }
                });
                localStorage.setItem('todos', JSON.stringify(todos));
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }
    });
    

    const deleteButton = createButton("Delete", async () => {
        try {
         
            listItem.remove();

            await fetch(`https://jsonplaceholder.typicode.com/todos/${task.id}`, {
                method: 'DELETE',
            });

            let todos = JSON.parse(localStorage.getItem('todos')) || [];
            todos = todos.filter(todo => todo.id !== task.id);
            localStorage.setItem('todos', JSON.stringify(todos));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    });
   

    listItem.appendChild(checkbox);
    listItem.appendChild(textSpan);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    listItem.style.background = task.completed ? "red" : "green"; 

    return listItem;
}
//general function to create a button
function createButton(text, onClick) {
    const button = document.createElement("button");
    button.innerText = text;
    button.addEventListener("click", onClick);
    return button;
}
// function to find any specic task by using title 
findTask.addEventListener("click", async () => {
    try {
        let taskInput = task.value.trim().toLowerCase();
        let todos = JSON.parse(localStorage.getItem('todos'));

        let searchResults = document.getElementById("searchResults"); 
        searchResults.innerHTML = "";

        let renderedItems = todos.filter(item => {
            return item.title.trim().toLowerCase() === taskInput; 
        });

        if (renderedItems.length > 0) {
            renderedItems.forEach(task => {
                let displayedItem = document.createElement("p");
                displayedItem.innerText = task.title;
                searchResults.appendChild(displayedItem);
            });
        } else {
            let displayedItem = document.createElement("p");
            displayedItem.innerText = "No such item exists";
            searchResults.appendChild(displayedItem);
        }
        task.value="";
    } catch (error) {
        console.log(error);
    }
});
