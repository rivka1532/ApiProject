const uri = '/User';
let users = [];
let token = '';

function getUsers() {
    token = localStorage.getItem('token');

    if (!token){
        alert("You must sign uin first");
        window.location.href = "index.html";
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    console.log(role);
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
    console.log("in add user");
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
    document.getElementById('edit-Role').value = user.role || "user";
    document.getElementById('edit-Password').value = user.password;

    document.getElementById('editForm').style.display = 'block';
}

function updateUser() {
    const userId = document.getElementById('edit-Id').value;

    const user = {
        id: parseInt(userId, 10),
        userName: document.getElementById('edit-Name').value.trim(),
        email: document.getElementById('edit-Email').value.trim(),
        role: document.getElementById('edit-Role').value,
        password: document.getElementById('edit-Password').value.trim()
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
}

function _displayUsers(data) {
    const tBody = document.getElementById('users');
    tBody.innerHTML = '';
    _displayCount(data.length);
    const button = document.createElement('button');

    data.forEach(user => {
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
        td2.appendChild(document.createTextNode(user.email));

        let td3 = tr.insertCell(2);
        td3.appendChild(document.createTextNode(user.role));

        let td4 = tr.insertCell(3);
        td4.appendChild(editButton);

        let td5 = tr.insertCell(4);
        td5.appendChild(deleteButton);
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