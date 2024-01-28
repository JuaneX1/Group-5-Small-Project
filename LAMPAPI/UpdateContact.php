<?php

    $inData = getRequestInfo();

    $contactID = $inData["contactID"];
    $id_err = "";

    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];

    $firstName_err = "";
    $lastName_err = "";

    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = 0;

    $phone_err = "";
    $email_err = "";

    $contact_err = "";
    $conn_err = "";
    $err_list = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		$conn_err = $conn->connect_error;
	}
	else
    {
        validateID($conn, $contactID, $userID, $id_err);

        validateFirstAndLastName($firstName, $lastName, $firstName_err, $lastName_err);

        validatePhone($phone, $phone_err);

        validateEmail($email, $email_err);

        if (empty($id_err) && empty($firstName_err) && empty($lastName_err) && empty($phone_err) && empty($email_err))
        {
            updateContact($conn, $firstName, $lastName, $phone, $email, $contactID);
        }
        concatErrors($conn_err, $firstName_err, $lastName_err, $phone_err, $email_err, $id_err, $err_list);

        returnWithInfo($contactID, $firstName, $lastName, $phone, $email, $userID, $err_list);

        $conn->close();
    }

    function updateContact(&$conn, $firstName, $lastName, $phone, $email, $contactID)
    {
        $stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=?");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $contactID);
        $stmt->execute();

        $stmt->close();
    }

    function validateID(&$conn, $contactID, &$userID, &$id_err)
    {
        $stmt = $conn->prepare("SELECT UserID FROM Contacts WHERE ID=?");
        $stmt->bind_param("i", $contactID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1)
        {
            $row = $result->fetch_assoc();
            $userID = $row["UserID"] ;
        }
        else
        {
            $id_err = "ID is not associated with any contact. ";
        }


        $stmt->close();

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

    function concatErrors($conn_err, $firstName_err, $lastName_err, $phone_err, $email_err, $id_err, &$err_list)
    {
        $err_list .= $conn_err;
        $err_list .= $firstName_err;
        $err_list .= $lastName_err;
        $err_list .= $phone_err;
        $err_list .= $email_err;
        $err_list .= $id_err;
    }
?>