const uri = '/User';
let users = [];
let books = [];
let token = '';



function getUsers() {
    token = localStorage.getItem('token');

    if (!token){
        alert("You must sign uin first");
        window.location.href = "index.html";
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (role != "Admin") {
        alert("You are not authorized to this page. You must be an admin to access this page. Please log in again.");
        window.location.href = "profile.html";
    }
    fetch(uri, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => _displayUsers(data))
    .catch(error => console.error('Unable to get users.', error));
}

const addUser = () => {
    const userNameTextbox = document.getElementById('add-userName');
    const emailTextbox = document.getElementById('add-email');
    const passwordTextbox = document.getElementById('add-password');
    const roleTextbox = document.getElementById('add-role');

    const user = {
        id: 0,
        userName: userNameTextbox.value.trim(),
        email: emailTextbox.value.trim(),
        password: passwordTextbox.value.trim(),
        role: roleTextbox.value.trim()
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(() => {
        getUsers();
        userNameTextbox.value = '';
        emailTextbox.value = '';
        passwordTextbox.value = '';
        roleTextbox.value = 'User';
    })
    .catch(error => console.error('Unable to add user.', error));
}

function deleteUser(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(() => getUsers())
        .catch(error => console.error('Unable to delete user.', error));
}

function displayEditForm(id) {
    const user = users.find(user => user.id === id);
    document.getElementById('edit-Id').value = user.id;
    document.getElementById('edit-Name').value = user.userName;
    document.getElementById('edit-Email').value = user.email;
    document.getElementById('edit-Role').value = user.role;
    document.getElementById('edit-Password').value = user.password;
    document.getElementById('editForm').style.display = 'block';
}

function updateUser() {
    const userId = document.getElementById('edit-Id').value;
    const user = {
        id: parseInt(userId, 10),
        userName: document.getElementById('edit-Name').value,
        email: document.getElementById('edit-Email').value,
        role: document.getElementById('edit-Role').value,
        password: document.getElementById('edit-Password').value
    };
    fetch(`${uri}/${userId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(user)
    })
        .then(() => getUsers())
        .catch(error => console.error('Unable to update user.', error));

    closeInput();
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('editBookForm').style.display = 'none';
}

function _displayUsers(data) {
    const tBody = document.getElementById('users');
    tBody.innerHTML = '';
    _displayCount(data.length);
    const button = document.createElement('button');

    data.forEach(user => {
        let booksButton = button.cloneNode(false);
        booksButton.innerText = 'Books';
        booksButton.setAttribute('onclick', `getBooks(${user.id})`);

        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${user.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteUser(${user.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(document.createTextNode(user.userName));

        let td2 = tr.insertCell(1);
        td2.appendChild(document.createTextNode(user.id));

        let td3 = tr.insertCell(2);
        td3.appendChild(document.createTextNode(user.email));

        let td4 = tr.insertCell(3);
        td4.appendChild(document.createTextNode(user.role));

        let td5 = tr.insertCell(4);
        td5.appendChild(booksButton);

        let td6 = tr.insertCell(5);
        td6.appendChild(editButton);
        
        let td7 = tr.insertCell(6);
        td7.appendChild(deleteButton);
    });

    users = data;
}

function _displayCount(count) {
    const name = (count === 1) ? 'user' : 'users';
    document.getElementById('counter').innerText = `${count} ${name}`;
}

const signout = () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
};

function goToMyProfile() {
    window.location.href = 'profile.html';
}

let isUsernameAvailable = false;
let isEmailAvailable = false;

const addUserName = document.getElementById('add-userName');
const addEmail = document.getElementById('add-email');
const addUserBtn = document.getElementById('add-user');
const addPassword = document.getElementById("add-password");
window.addEventListener('DOMContentLoaded', function () {
    // const addUserBtn = document.getElementById('add-user');
    addUserBtn.disabled = true;
});

function validateForm() {
    const username = addUserName.value.trim();
    const email = addEmail.value.trim();
    const password = addPassword.value.trim();

    const allFilled = username !== "" && email !== "" && password !== "";
    if (allFilled && isUsernameAvailable && isEmailAvailable) {
        addUserBtn.disabled = false;
    } else {
        addUserBtn.disabled = true;
    }
}

addUserName.addEventListener('input', async function () {
    const username = this.value;
    const existingUser = users.find(user => user.userName === username);
    if (existingUser) {
        const feedback = document.getElementById("usernameFeedback");
        feedback.textContent = "Already taken";
        feedback.style.color = "red";
        isUsernameAvailable = false;
        return;
    }   
    else {
        const feedback = document.getElementById("usernameFeedback");
        feedback.textContent = "Available";
        feedback.style.color = "green";
        isUsernameAvailable = true;
    }
    validateForm();
})

addEmail.addEventListener('input', async function () {
    const email = this.value;
    const existingEmail = users.find(user => user.email === email);
    if (existingEmail) {
        const feedback = document.getElementById("emailFeedback");
        feedback.textContent = "Already taken";
        feedback.style.color = "red";
        isEmailAvailable = false;
        return;
    }   
    else {
        const feedback = document.getElementById("emailFeedback");
        feedback.textContent = "Available";
        feedback.style.color = "green";
        isEmailAvailable = true;
    }
    validateForm();
})

addPassword.addEventListener('input', validateForm);

const getBooks = (id) => {
    document.getElementById('add-book-UserId').value = id;
    fetch(`Book/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => displayBooks(data))
    .catch(error => console.error('Unable to get books.', error));

}

const displayBooks = (data) => {
    const tBody = document.getElementById('books');
    tBody.innerHTML = '';
    const button = document.createElement('button');

    data.forEach(book => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditBookForm(${book.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteBook(${book.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        td1.appendChild(document.createTextNode(book.id));

        let td2 = tr.insertCell(1);
        td2.appendChild(document.createTextNode(book.name));

        let td3 = tr.insertCell(2);
        td3.appendChild(document.createTextNode(book.author));

        let td4 = tr.insertCell(3);
        td4.appendChild(editButton);
        
        let td5 = tr.insertCell(4);
        td5.appendChild(deleteButton);
    });

    document.getElementById('booksForm').style.display = 'block';
    books = data;
    console.log(books);
}

const addBook = () => {
    const book = {
        id: 0,
        name: document.getElementById('add-book-Name').value,
        author: document.getElementById('add-book-Author').value,
        userId: document.getElementById('add-book-UserId').value
    }

    fetch('/Book', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(book)
    })
        .then(response => response.json())
        .then(() => {
            getBooks(document.getElementById('add-book-UserId').value);
            document.getElementById('add-book-Name').value = "";
            document.getElementById('add-book-Author').value = "";
        })
        .catch(error => console.error('Unable to add item.', error));
}

function deleteBook(id) {
    fetch(`Book/${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(() => getBooks(document.getElementById('add-book-UserId').value))
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditBookForm(Id) {
    const book = books.find(item => item.id === Id);

    document.getElementById('edit-book-Id').value = book.id;
    document.getElementById('edit-book-Name').value = book.name;
    document.getElementById('edit-book-Author').value = book.author;
    document.getElementById('edit-book-UserId').value = book.userId;
    document.getElementById('editBookForm').style.display = 'block';
}

async function updateItem() {
    const bookId = document.getElementById('edit-book-Id').value;
    const book = {
        id: parseInt(bookId, 10),
        name: document.getElementById('edit-book-Name').value,
        author: document.getElementById('edit-book-Author').value,
        userId:document.getElementById('edit-book-UserId').value   
    };

    fetch(`/Book/${bookId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(book)
    })
        .then(() => getBooks(document.getElementById('add-book-UserId').value))
        .catch(error => console.error('Unable to update item.', error));

    closeInput();

    return false;

}
