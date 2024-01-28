<?php

    $inData = getRequestInfo();

    $contactID = 0;

    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];

    $firstName_err = "";
    $lastName_err = "";

    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];

    $phone_err = "";
    $email_err = "";
    $userID_err = "";

    $duplicate_err = "";

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

        validatePhone($phone, $phone_err);

        validateEmail($email, $email_err);

        validateUserID($conn, $userID, $userID_err);

        checkDuplicateContact($conn, $firstName, $lastName, $phone, $email, $userID, $duplicate_err);

        if (empty($firstName_err) && empty($lastName_err) && empty($phone_err) && empty($email_err) && empty($userID_err) && empty($duplicate_err))
        {
            createContact($conn, $firstName, $lastName, $phone, $email, $userID, $contactID);
        }
        concatErrors($conn_err, $firstName_err, $lastName_err, $phone_err, $email_err, $userID_err, $duplicate_err, $err_list);

        returnWithInfo($contactID, $firstName, $lastName, $phone, $email, $userID, $err_list);

        $conn->close();
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

    function validatePhone($phone, &$phone_err)
    {
        if (!preg_match("/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/i", $phone))
        {
            $phone_err = "Invalid phone number. ";
        }

    }

    function validateEmail($email, &$email_err)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL))
        {
            $email_err = "Invalid email. ";
        }

    }

    function validateUserID(&$conn, $userID, &$userID_err)
    {
       $stmt = $conn->prepare("SELECT id FROM Users WHERE ID=?");
       $stmt->bind_param("s", $userID);
       $stmt->execute();
       $result = $stmt->get_result();

       if ($result->num_rows != 1)
       {
            $userID_err = "This userID is invalid or does not belong to a current user. ";
       }

       $stmt->close();

    }

    function createContact(&$conn, $firstName, $lastName, $phone, $email, $userID, &$contactID)
    {
        $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userID);
        $stmt->execute();

        $contactID = $conn->insert_id;

        $stmt->close();
    }

    function checkDuplicateContact(&$conn, $firstName, $lastName, $phone, $email, $userID, &$duplicate_err)
    {
        $stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName = ? AND LastName = ? AND Phone = ? AND Email = ? AND UserID = ?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userID);
        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows == 1)
        {
            $duplicate_err = "Cannot create duplicate contact. ";
        }

        $stmt->close();
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

    function returnWithInfo($contactID, $firstName, $lastName, $phone, $email, $userID, $err_list)
    {
        if (empty($err_list))
        {
			$retValue = '{"contactID":' . $contactID . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","phone":"' . $phone . '","email":"' . $email . '","userID":' . $userID . ',"error":""}';
        }
        else
        {
			$retValue = '{"contactID":0,"firstName":"","lastName":"","phone":"","email":"","userID":0,"error":"' . $err_list . '"}';
        }
        sendResultInfoAsJson($retValue);
    }

    function concatErrors($conn_err, $firstName_err, $lastName_err, $phone_err, $email_err, $userID_err, $duplicate_err, &$err_list)
    {
        $err_list .= $conn_err;
        $err_list .= $firstName_err;
        $err_list .= $lastName_err;
        $err_list .= $phone_err;
        $err_list .= $email_err;
        $err_list .= $userID_err;
        $err_list .= $duplicate_err;
    }

?>