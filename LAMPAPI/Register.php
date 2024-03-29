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

	$userID = 0;

	$conn_err = "";
	$err_list = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		$conn_err = $conn->connect_error;
	}
	else
    {
		validateFirstAndLastName($firstName, $lastName, $firstName_err, $lastName_err);

		validateUsername($conn, $username, $username_err);

		validatePassword($password, $confirm_password, $password_err, $confirm_password_err);

		if ( empty($firstName_err) && empty($lastName_err) && empty($username_err) && empty($password_err) && empty($confirm_password_err))
		{
			registerUser($conn, $firstName, $lastName, $username, $password);
			$userID = $conn->insert_id;
		}

		concatErrors($conn_err, $firstName_err, $lastName_err, $username_err, $password_err, $confirm_password_err, $err_list);

		returnWithInfo($userID, $firstName, $lastName, $username, $err_list);

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
            $username_err = "This username is already taken. ";
        }

		$stmt->close();

	}

	function validatePassword($password, $confirm_password, &$password_err, &$confirm_password_err)
	{

		if( empty($password) )
		{
			$password_err = "Please enter a password. ";
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
			$confirm_password_err = "Please confirm password. ";
		}
		else
		{
			if (empty($password_err) && ($password != $confirm_password))
			{
				$confirm_password_err = "Passwords do not match. ";
			}
		}

	}

	function validateFirstAndLastName($firstName, $lastName, &$firstName_err, &$lastName_err)
	{
		if(!preg_match("/^[a-z ,.'-]+$/i", $firstName))
		{
			$firstName_err = "Invalid first name. ";
		}

		if(!preg_match("/^[a-z ,.'-]+$/i", $lastName))
		{
			$lastName_err = "Invalid last name. ";
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

	function returnWithInfo($userID, $firstName, $lastName, $username, $err_list)
	{
		if (empty($err_list))
		{
			$retValue = '{"id":' . $userID . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","login":"' . $username . '","error":"' . $err_list . '"}';
		}
		else
		{
			$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err_list . '"}';
		}
		sendResultInfoAsJson($retValue);
	}

	function concatErrors($conn_err, $firstName_err, $lastName_err, $username_err, $password_err, $confirm_password_err, &$err_list)
	{
		$err_list .= $conn_err;
		$err_list .= $firstName_err;
		$err_list .= $lastName_err;
		$err_list .= $username_err;
		$err_list .= $password_err;
		$err_list .= $confirm_password_err;
	}

?>