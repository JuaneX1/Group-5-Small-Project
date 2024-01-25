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
	var hash = md5(password);
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
	//var tmp = {login:login,password:hash};
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

function saveCookie(){
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}





/*
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const loginUser = document.getElementById("loginUser").value;
    const loginPassword = document.getElementById("loginPassword").value;

    const loginData = {
        "login": loginUser,
        "password": loginPassword
    };

    fetch('http://nauticalnexus.site/LAMPAPI/Login.php', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => response.json())
    .then(data => {
        const loginMessage = document.getElementById("loginMessage");
        if (data.error) {
            loginMessage.textContent = 'Failed to login. Try again. ' + data.error;
        } else if (data.ID > 0) {
            document.cookie = `userId=${data.ID}; expires=Thu, 01 Jan 2099 00:00:00 UTC; path=/`;
            loginMessage.textContent = 'Login successful! Welcome, ' + data.FirstName + ' ' + data.LastName + '!';
            window.location.href = 'landing.html';
        } else {
            loginMessage.textContent = 'Failed to login. No records found.';
        }
        
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
});
*/