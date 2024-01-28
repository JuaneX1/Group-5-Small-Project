<?php

    $inData = getRequestInfo();

    $userSearch = $inData["search"];
    $userID = $inData["userID"];

    $searchResults = "";
    $searchCount = 0;

    $search_err = "";

    $conn_err = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithInfo($searchResults, $conn->connect_error);
	}
	else
    {
        searchContacts($conn, $userSearch, $userID, $searchResults, $searchCount, $search_err);

        returnWithInfo($searchResults, $search_err);
        $conn->close();
    }

    function searchContacts(&$conn, $userSearch, $userID, &$searchResults, &$searchCount, &$search_err)
    {
        $stmt = $conn->prepare("SELECT * FROM Contacts WHERE 
        (FirstName LIKE ? OR 
        LastName LIKE ? OR 
        Phone LIKE ? OR 
        Email LIKE ?) AND UserID=?");

        $userSearchParam = "%" . $userSearch . "%";
        $stmt->bind_param("ssssi", $userSearchParam, $userSearchParam, $userSearchParam, $userSearchParam, $userID);
        $stmt->execute();

        $result = $stmt->get_result();

        while($row = $result->fetch_assoc())
        {
            if ($searchCount > 0)
            {
                $searchResults .= ",";
            }

            $searchCount++;
            $searchResults .= '{"contactID" : "' . $row["ID"] . '","firstName" : "' . $row["FirstName"] . '", "lastName" : "' . $row["LastName"] . '", "phone" : "' . $row["Phone"] . '", "email" : "' . $row["Email"] . '"}';
        }

        if ($searchCount == 0)
        {
            $search_err = "No Records Found.";
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

	function returnWithInfo( $searchResults, $search_err )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":"' . $search_err . '"}';
		sendResultInfoAsJson( $retValue );
	}


?>