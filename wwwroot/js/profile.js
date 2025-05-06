const uri = '/User';
let user = null;
let token = '';

function getProfile() {
    
    token = localStorage.getItem('token');

    if (!token){
        alert("You must sign uin first");
        window.location.href = "index.html";
        return;
    }

    
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log(payload);
    const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    console.log(userId);

    fetch(`${uri}/${userId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        user = data;
        console.log(data);
        document.getElementById('userName').textContent  = data.userName;
        document.getElementById('email').textContent  = data.email;
        document.getElementById('role').textContent  = data.role;
        document.getElementById('password').textContent  = data.password;})
    .catch(error => console.error('Unable to get users.', error));
}

function displayEditForm() {
    console.log(user);
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('edit-username').value = user.userName;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-role').value = user.role;
    document.getElementById('edit-password').value = user.password;

    document.getElementById('editForm').style.display = 'block';
}

function updateUser() {
    console.log(user);
    const userId = user.id;

    const editUser = {
        id: userId,
        userName: document.getElementById('edit-username').value,
        email: document.getElementById('edit-email').value,
        role: document.getElementById('role').textContent,
        password: document.getElementById('edit-password').value
    };

    console.log(editUser);
    fetch(`${uri}/${userId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editUser)
    })
    .then(data => {
        console.log('Updated user:', data);
        getProfile();
    })   
    .then(() => closeInput()) 
        .catch(error => console.error('Unable to update user.', error));

    
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

const signout=()=>{
    localStorage.removeItem("token");
    window.location.href="index.html";
}