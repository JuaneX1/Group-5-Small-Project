<?php

	$inData = getRequestInfo();

	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];

	$firstName_err = "";
	$lastName_err = "";

    $username = trim($inData["login"]);
    $password = trim($inData["password"]);
	$confirm_password = trim($inData["confirm_password"]);

	$username_err = "";
	$password_err = "";
	$confirm_password_err = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
    {
		// Check if username is already in the database
		validateFirstAndLastName($firstName, $lastName, $firstName_err, $lastName_err);

		validateUsername($conn, $username, $username_err);

		validatePassword($password, $confirm_password, $password_err, $confirm_password_err);

		if ( empty($firstName_err) && empty($lastName_err) && empty($username_err) && empty($password_err) && empty($confirm_password_err))
		{
			registerUser($conn, $firstName, $lastName, $username, $password);
		}

		returnWithRegisterErrors($conn_err, $firstName_err, $lastName_err, $username_err, $password_err, $confirm_password_err);

		$conn->close();
		
    }

	function registerUser(&$conn, $firstName, $lastName, $username, $password)
	{
		$hashed_password = password_hash($password, PASSWORD_BCRYPT);
		$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
		$stmt->bind_param("ssss", $firstName, $lastName, $username, $hashed_password);
		$stmt->execute();
		
		$stmt->close();
	}

	function validateUsername(&$conn, $username, &$username_err)
	{

        $stmt = $conn->prepare("SELECT id FROM Users WHERE Login=?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
		$result = $stmt->get_result();

        if( $result->num_rows == 1)
        {
            $username_err = "This username is already taken.";
        }

		$stmt->close();

	}

	function validatePassword($password, $confirm_password, &$password_err, &$confirm_password_err)
	{

		if( empty($password) )
		{
			$password_err = "Please enter a password.";
		}
		else
		{
			if(strlen($password) < 5)
			{
				$password_err .= "Password must have at least 5 characters. ";
			}
			if(!preg_match("/[A-Z]/", $password))
			{
				$password_err .= "Password must have at least one uppercase character. ";
			}
			if(!preg_match("/[0-9]/", $password))
			{
				$password_err .= "Password must have at least one number. ";
			}

		}

		// Validate Confirm Password
		if (empty($confirm_password))
		{
			$confirm_password_err = "Please confirm password.";
		}
		else
		{
			if (empty($password_err) && ($password != $confirm_password))
			{
				$confirm_password_err = "Passwords do not match.";
			}
		}

	}

	function validateFirstAndLastName($firstName, $lastName, &$firstName_err, &$lastName_err)
	{
		if(!preg_match("/^[a-z ,.'-]+$/i", $firstName))
		{
			$firstName_err = "Invalid first name.";
		}

		if(!preg_match("/^[a-z ,.'-]+$/i", $lastName))
		{
			$lastName_err = "Invalid last name.";
		}
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithRegisterErrors($conn_err, $firstName_err, $lastName_err, $username_err, $password_err, $confirm_password_err)
	{
		$retValue = '{"connection_error":"' . $conn_err . '",';
		$retValue .= '"firstName_error":"' . $firstName_err . '",';
		$retValue .= '"lastName_error":"' . $lastName_err . '",';
		$retValue .= '"username_error":"' . $username_err . '",';
		$retValue .= '"password_error":"' . $password_err . '",';
		$retValue .= '"confirm_password_error":"' . $confirm_password_err . '"}';

		sendResultInfoAsJson( $retValue );
	}

?>