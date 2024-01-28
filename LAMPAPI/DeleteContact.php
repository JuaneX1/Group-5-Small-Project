<?php
    $inData = getRequestInfo();
    $contactID = $inData["contactID"];
    $userID = $inData["userID"];
    $err_list = "";

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        $err_list = "Connection failed: " . $conn->connect_error;
    } 
    else {
        validateUserID($conn, $userID, $err_list);

        if (empty($err_list)) {
            deleteContact($conn, $contactID, $err_list);
        }

        $conn->close();
    }

    returnWithInfo($err_list);

    function validateUserID($conn, $userID, &$err_list)
    {
        $stmt = $conn->prepare("SELECT id FROM Users WHERE ID=?");
        $stmt->bind_param("s", $userID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows != 1) {
            $err_list .= "This userID is invalid or does not belong to a current user. ";
        }

        $stmt->close();
    }

    function deleteContact($conn, $contactID, &$err_list)
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=?");
        $stmt->bind_param("i", $contactID);
        $stmt->execute();

        if ($stmt->affected_rows === 0) {
            $err_list .= "Contact with ID " . $contactID . " not found.";
        }

        $stmt->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithInfo($err_list)
    {
        $retValue = '{"error":"' . $err_list . '"}';
        sendResultInfoAsJson($retValue);
    }
?>
