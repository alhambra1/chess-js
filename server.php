<?PHP
define('HTTP_SERVER',"http://MyWebsite");

function getquery ($q) {
  $host = "MyHost";
  $db_name = "MyDatabaseName";
  $user = "MyUser";
  $pass = "MyPassword";

  if (!mysql_connect($host, $user, $pass)) { 
    return "Can't connect to sql."; 
    exit;
  }
  if (!mysql_select_db($db_name)) {
    return "Can't access $db_name"; 
    exit;
  }
  $result = mysql_query($q);
  return $result;
}

function escape($str) {
  $search=array("\\","\0","\n","\r","\Z","'",'"',"<",">","/","%","&","^","@");
  $replace="";
  return str_replace($search,$replace,$str);
}

if (isset($_POST['getGame']) && $_POST['getGame'] == "true") {
  $myq = "SELECT * FROM `chess` WHERE `board` = 'MyBoard'";
  $query = getquery ($myq);
  $row = mysql_fetch_array ($query, MYSQL_ASSOC);
  $game = $row['savedGame'];
  echo $game;
}

if (isset($_POST['saveGame']) && $_POST['saveGame'] == "true") {
  $myq = "UPDATE `chess` SET `savedGame` = '" . escape( $_POST['savedGame'] ) . "' WHERE `board` =  'MyBoard'";
  $query = getquery ($myq);

  $moveCount = $_POST['moveCount'];
  $white= $_POST['white'];
}
?>