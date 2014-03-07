Database designer plugin for phpPgAdmin
=======================================

Installation
------------

1. You need a copy of the latest phpPgAdmin version on github.

2. Place this plugin as a subfolder of the directory plugins/ (The name "DBDesigner" must be preserved).

3. Go to the file sql/erdiagrams-pgsql and run the sql commands to create a the database responsible for storing the ER Diagrams.

4. Enable the plugin by adding and entry in the phpPgAdmin's file config/config.php.inc. It should look something like this: $conf['plugins'] = array('DBDesigner');

5. Navigate to the schema where you want to create the ER Diagram and you're done!.