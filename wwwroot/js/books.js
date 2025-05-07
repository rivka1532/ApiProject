const uri = '/Book';
let books = [];
let token = '';// = localStorage.getItem("token");
let payload = '';

const addName = document.getElementById('add-name');
const addAuthor = document.getElementById('add-author');

function getItems() {

    token = localStorage.getItem("token");

    if (token) {
        payload = JSON.parse(atob(token.split('.')[1]));
        console.log(payload);
        // const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        const role=payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        console.log(role);
        if(role=="Admin")
        {
            const usersPageLink=document.getElementById('users-page-link');
            usersPageLink.style.display = 'block';
        }
    }
    else {
        alert("You must log in first");
        window.location.href = "/login.html";
    }

    fetch(uri, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}




const addItem = () => {
    console.log("in addItem");
    // const addCode = document.getElementById('add-code');
    // const addName = document.getElementById('add-name');
    // const addAuthor = document.getElementById('add-author');

    const userName = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

    const item = {
        id: 0,
        Name: addName.value,
        Author: addAuthor.value,
        UserName: userName
    };
    console.log(item);

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(() => {
            getItems();
            addName.value = "";
            addAuthor.value = "";
        })
        .catch(error => console.error('Unable to add item.', error));
}

function deleteItem(code) {
    fetch(`${uri}/${code}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(Id) {
    const item = books.find(item => item.id === Id);

    console.log(books);
    document.getElementById('edit-id').value = item.id;
    console.log(Id);
    document.getElementById('edit-name').value = item.name;
    console.log(item.name);
    document.getElementById('edit-author').value = item.author;
    document.getElementById('edit-username').value = item.userName;
    document.getElementById('editForm').style.display = 'block';
}

async function updateItem() {
    const itemId = document.getElementById('edit-id').value;
    console.log(itemId);
    const userName = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    const item = {
        id: parseInt(itemId, 10),
        name: document.getElementById('edit-name').value,
        author: document.getElementById('edit-author').value,
        userName:userName   
    };

    console.log(item);
    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(item)
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to update item.', error));

    closeInput();

    return false;

}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(itemCount) {
    const name = (itemCount === 1) ? 'book' : 'Types of books';

    if (itemCount === 0) {
        document.getElementById('counter').innerText = 'You have no books';
    }
    else
        document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function _displayItems(data) {
    const tBody = document.getElementById('books');
    tBody.innerHTML = '';

    _displayCount(data.length);

    const button = document.createElement('button');


    if (data.length > 0) {
        document.querySelector("table").style.display = "table";
    }

    data.forEach(item => {

        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let textNodeId = document.createTextNode(item.id);
        td1.appendChild(textNodeId);

        let td2 = tr.insertCell(1);
        let textNodeName = document.createTextNode(item.name);
        td2.appendChild(textNodeName);
        
        let td3 = tr.insertCell(2);
        let textNodeAuthor = document.createTextNode(item.author);
        td3.appendChild(textNodeAuthor);

        let td5 = tr.insertCell(3);
        td5.appendChild(editButton);

        let td6 = tr.insertCell(4);
        td6.appendChild(deleteButton);
    });

    books = data;
}
const signout=()=>{
    localStorage.removeItem("token");
    window.location.href="index.html";

}

let isNameAvailable = false;
let isAuthorAvailable = false;


const addBookBtn = document.getElementById('add-book'); 
addBookBtn.disabled = true;

function validateBookForm() {
    const name = addName.value.trim();
    const author = addAuthor.value.trim();

    const allFilled = name !== '' && author !== '';

    isDuplicateBook = books.some(book => 
        book.name === name && book.author === author
    );

    if (allFilled && !isDuplicateBook) {
        addBookBtn.disabled = false;
    } else {
        addBookBtn.disabled = true;
    }

    const feedback = document.getElementById('bookFeedback');
    if (isDuplicateBook) {
        feedback.textContent = 'Book already exists';
        feedback.style.color = 'red';
    } else {
        feedback.textContent = '';
    }
}

addName.addEventListener('input', validateBookForm);
addAuthor.addEventListener('input', validateBookForm);