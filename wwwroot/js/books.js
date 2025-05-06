const uri = '/Book';
let books = [];
let token = '';// = localStorage.getItem("token");
let payload = '';

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
    const addName = document.getElementById('add-name');
    const addAuthor = document.getElementById('add-author');

    const userName = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

    const item = {
        Id: 0,
        Name: addName.value,
        Author: addAuthor.value.trim(),
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

function displayEditForm(id) {
    const item = books.find(item => item.id === id);

    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-author').value = item.author;
    document.getElementById('editForm').style.display = 'block';
}

async function updateItem() {
    const itemid = document.getElementById('edit-id').value;
    const userName = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    let userId=0;
    await fetch(`${uri}/${itemid}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    }).then(response=> response.json())
    .then(data=>{userId=data.userId
    console.log(data)
    console.log(userId)
    })
    .catch(error => console.error('Unable to get item.', error))
    console.log(userId)
    const item = {
        id: parseInt(itemid, 10),
        name: document.getElementById('edit-name').value,
        author: document.getElementById('edit-author').value,
        userName:userName   
    };

    fetch(`${uri}/${itemid}`, {
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