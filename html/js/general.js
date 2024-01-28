const urlBase = 'http://nauticalnexus.site/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
const ids = [];

// fine
function doLogin(){

	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	//var hash = md5(password);
	
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

// fine
function doRegister(){  

    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    let login = document.getElementById("login").value;
    let password = document.getElementById("password").value;
    let passwordCheck = document.getElementById("confirm_password").value;

    if(password != passwordCheck){
        document.getElementById("signupMessage").innerHTML = "Passwords do not match";
        return;
    }

	if(firstName == "" || lastName == "" || login == "" || password == "" || passwordCheck == ""){
		document.getElementById("signupMessage").innerHTML = "Field(s) are blank";
        return;
	}

    let tmp = {firstName, lastName, login:login, password:password, confirm_password:passwordCheck};
	//var tmp = {login:login,password:hash};
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
                    document.getElementById("signupMessage").innerHTML = "Registration failed";
                    return;
                }
				
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

                document.getElementById("signupMessage").innerHTML = "Successfully added user!";
            }
			else if(this.status == 409) {
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

// fine
function saveCookie(){
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

// fine
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

    if(userId < 0){
        window.location.href = "../landing.html";
    }
    else{
        document.getElementById("loggedUser").innerHTML = "Welcome, " + firstName + " " + lastName + "!";
    }
}

// fine
function doLogout(){
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "../index.html";
}   
