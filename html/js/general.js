const urlBase = 'http://nauticalnexus.site/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
const ids = [];

function doLogin(){

	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try{
		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;
		
				if(userId < 1){		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "../landing.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err){
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doRegister(){  

    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    let login = document.getElementById("login").value;
    let password = document.getElementById("password").value;
    let passwordCheck = document.getElementById("confirm_password").value;

    if(firstName == "" || lastName == "" || login == "" || password == "" || passwordCheck == ""){
        document.getElementById("signupMessage").style = "color: red; margin-top: 5px;";
	document.getElementById("signupMessage").innerHTML = "Field(s) are blank.";
        return;
    }

    if(!(validateName(firstName)) || !(validateName(lastName))){
        document.getElementById("signupMessage").style = "color: red; margin-top: 5px;";
	document.getElementById("signupMessage").innerHTML = "Name should only contain letters.";
        return;
    }

    if(!(validatePassword(password))){
        document.getElementById("signupMessage").style = "color: red; margin-top: 5px;";
	document.getElementById("signupMessage").innerHTML = "Password requires at least six characters, one capital letter, and one number.";
        return;
    }

    if(password != passwordCheck){
        document.getElementById("signupMessage").style = "color: red; margin-top: 5px;";
        document.getElementById("signupMessage").innerHTML = "Passwords do not match.";
        return;
    }

    let tmp = {firstName, lastName, login:login, password:password, confirm_password:passwordCheck};
    let jsonPayload = JSON.stringify(tmp);
    
    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try{
        xhr.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
        
                if(userId < 1){
		    document.getElementById("signupMessage").style = "color: red; margin-top: 5px;";
                    document.getElementById("signupMessage").innerHTML = "Registration failed";
                    return;
                }
				
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

		document.getElementById("signupMessage").style = "color: green; margin-top: 5px;";    
                document.getElementById("signupMessage").innerHTML = "Successfully added user!";
            }
	    else if(this.status == 409) {
		document.getElementById("signupMessage").style = "color: red; margin-top: 5px;";    
                document.getElementById("signupMessage").innerHTML = "User already exists";
                return;
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err){
    	console.log("Registration failed: " + err.message);
    }
}

function validateName(name){
    const regex = /^[a-zA-Z]{1,20}$/;
    return regex.test(name);
}

function validatePassword(password){
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    return regex.test(password);
}

function saveCookie(){
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie(){

    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");

    for(var i = 0; i < splits.length; i++){

        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");

        if (tokens[0] == "firstName"){
            firstName = tokens[1];
        }
        else if (tokens[0] == "lastName"){
            lastName = tokens[1];
        }
        else if (tokens[0] == "userId"){
            userId = parseInt(tokens[1].trim());
        }
    }

    let lowerFirst = firstName.toLowerCase();
    let lowerLast = lastName.toLowerCase();

    if(userId < 0){
        window.location.href = "../landing.html";
    }
    else{
        document.getElementById("loggedUser").innerHTML = "Welcome, " + 
        (lowerFirst.charAt(0).toUpperCase() + lowerFirst.slice(1)) + " " + 
        (lowerLast.charAt(0).toUpperCase() + lowerLast.slice(1)) + "!";
    }
}

function doLogout(){
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "../index.html";
}   


function addContact() {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let phone = document.getElementById("phone").value;
    let email = document.getElementById("email").value;

    if (firstName == "" || lastName == "" || email == "" || phone == "") {
        document.getElementById("addContactMessage").innerHTML = "missing fields.";
        return;
    }

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        userID: userId
    };

    // Print the contact information to the console
    console.log("Adding contact:", tmp);

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/CreateContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("addContactMessage").innerHTML = "Successfully added contact.";
                document.getElementById("addContactForm").reset();
                loadContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}


function loadContacts(){
    let tmp = {
        search: "",
        userID: userId
    };

    console.log("loadcontact:", tmp);

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
                    console.log(jsonObject.error);
                    return;
                }
                let text = "<table border='1'>"
                for (let i = 0; i < jsonObject.results.length; i++) {
                    ids[i] = jsonObject.results[i].contactID
                    text += "<tr id='row" + i + "'>"
                    text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].firstName + "</span></td>";
                    text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].lastName + "</span></td>";
                    text += "<td id='email" + i + "'><span>" + jsonObject.results[i].email + "</span></td>";
                    text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].phone + "</span></td>";
                    text += "<td>" +
                        "<button type='button' id='edit_button" + i + "' class='btn btn-dark' onclick='edit_row(" + i + ")' style='margin-right: 5px'>" + 
                            "<span>" + 
                                "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' color='white' class='bi bi-pencil-square' viewBox='0 0 16 16'>" +
                                    "<path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/>" +
                                    "<path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z'/>" +
                                "</svg>" +
                            "</span>" + 
                        "</button>" +

                        "<button type='button' id='save_button" + i + "' value='Save' class='btn btn-success' onclick='save_row(" + i + ")' style='display: none; margin-right: 5px'>" +
                            "<span>" + 
                                "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' color='white' class='bi bi-floppy' viewBox='0 0 16 16'>" +
                                    "<path d='M11 2H9v3h2z'/>" +
                                    "<path d='M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z'/>" +
                                "</svg>" +
                            "</span>" + 
                        "</button>" +

                        "<button type='button' onclick='delete_row(" + i + ")' class='btn btn-danger'>" + 
                            "<span>" + 
                                "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' color='white' class='bi bi-trash' viewBox='0 0 16 16'>" +
                                    "<path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z'/>" +
                                    "<path d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z'/>" +
                                "</svg>" +   
                            "</span>" + 
                        "</button>" + 
                        "</td>";
                    text += "</tr>"
                }
                text += "</table>"
                document.getElementById("tb").innerHTML = text;
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function edit_row(id) {
    document.getElementById("edit_button" + id).style.display = "none";
    document.getElementById("save_button" + id).style.display = "inline-block";

    var firstNameI = document.getElementById("first_Name" + id);
    var lastNameI = document.getElementById("last_Name" + id);
    var email = document.getElementById("email" + id);
    var phone = document.getElementById("phone" + id);

    var namef_data = firstNameI.innerText;
    var namel_data = lastNameI.innerText;
    var email_data = email.innerText;
    var phone_data = phone.innerText;

    firstNameI.innerHTML = "<input type='text' id='namef_text" + id + "' value='" + namef_data + "'>";
    lastNameI.innerHTML = "<input type='text' id='namel_text" + id + "' value='" + namel_data + "'>";
    email.innerHTML = "<input type='text' id='email_text" + id + "' value='" + email_data + "'>";
    phone.innerHTML = "<input type='text' id='phone_text" + id + "' value='" + phone_data + "'>"
}

function save_row(no) {
    var namef_val = document.getElementById("namef_text" + no).value;
    var namel_val = document.getElementById("namel_text" + no).value;
    var email_val = document.getElementById("email_text" + no).value;
    var phone_val = document.getElementById("phone_text" + no).value;
    var id_val = ids[no]

    document.getElementById("first_Name" + no).innerHTML = namef_val;
    document.getElementById("last_Name" + no).innerHTML = namel_val;
    document.getElementById("email" + no).innerHTML = email_val;
    document.getElementById("phone" + no).innerHTML = phone_val;

    document.getElementById("edit_button" + no).style.display = "inline-block";
    document.getElementById("save_button" + no).style.display = "none";

    let tmp = {
        phoneNumber: phone_val,
        emailAddress: email_val,
        newFirstName: namef_val,
        newLastName: namel_val,
        id: id_val
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/UpdateContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact has been updated");
                loadContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}
