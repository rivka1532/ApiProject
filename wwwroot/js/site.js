const uri = '/book';
let books = [];

const getBooks = () => {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayBooks(data))
        .catch(error => console.error('Unable to get books.', error));
}

const addBook = () => {
    const addNameTextbox = document.getElementById('addName');

    const book = {
        Name: addNameTextbox.value.trim(),
        Author: ""
    };

    fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        })
        .then(response => response.json())
        .then(() => {
            getBooks();
            addNameTextbox.value = '';
        })
        .catch(error => console.error('Unable to get books.', error));
}

const deleteBook = (id) => {
    fetch(`${uri}/${id}`, {
            method: 'DELETE'
        })
        .then(() => getBooks())
        .catch(error => console.error('Unable to get books.', error));
}

const displayEditForm = (id) => {
    const book = books.find(book => book.id === id);

    document.getElementById('editId').value = book.id;
    document.getElementById('editName').value = book.name;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editBook').style.display = 'block';

}

const updateBook = () => {
    const bookId = document.getElementById('editId').value;
    const book = {
        Id: parseInt(bookId, 10),
        Name: document.getElementById('editName').value.trim(),
        Author: document.getElementById('editAuthor').value.trim(),
    };

    fetch(`${uri}/${bookId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        })
        .then(() => getBooks())
        .catch(error => console.error('Unable to get books.', error));

    closeInput();

    return false;
}

const closeInput = () => {
    document.getElementById('editBook').style.display = 'none';
}

const _displayCount = (bookCount) => {
    const name = (bookCount === 1) ? 'book': 'books kinds';
    document.getElementById('counter').innerText= `${bookCount} ${name}`;
}

const _displayBooks = (data) => {
    console.log(data);
    const tBody = document.getElementById('books');
    tBody.innerHTML = '';

    _displayCount(data.length);

    const button = document.createElement('button');

    data.forEach(book => {
        // let NameTextbox = document.createElement('input');
        // NameTextbox.type = 'text';
        // NameTextbox.disabled = true;
        // NameTextbox.value = book.Name;

        let editButton = button.cloneNode(false);
        editButton.innerText = 'Edit';
        editButton.setAttribute('onclick', `displayEditForm(${book.id})`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('onclick', `deleteBook(${book.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let nameTextbox = document.createTextNode(book.name);
        td1.appendChild(nameTextbox);

        let td2 = tr.insertCell(1);
        let authorTextbox = document.createTextNode(book.author);
        td2.appendChild(authorTextbox);

        let td3 = tr.insertCell(2);
        td3.appendChild(editButton);

        let td4 = tr.insertCell(3);
        td4.appendChild(deleteButton);
    });

    books = data;
}