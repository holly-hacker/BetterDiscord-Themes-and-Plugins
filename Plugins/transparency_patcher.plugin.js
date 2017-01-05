//META{"name":"transparency_patcher"}*//

var transparency_patcher = function() {
	this.pluginName = 'Transparency Patcher';

	this.getName = 			function()	{return this.pluginName;};
	this.getDescription = 	function()	{return 'Transparency Patcher - Patches your Discord installation to allow for transparent themes.</br>You don\'t need this plugin after installation is finished.</br></br>Press "Settings" to apply.';};
	this.getVersion = 		function()	{return '2.1';};
	this.getAuthor = 		function()	{return '<a href="http://JustM3.net">HoLLy#2750</a>';};

	this.load = function()	{ 	this.Log("Loaded");		};
	this.start = function() { 	this.Log("Started");	};
	this.stop = function()	{ 	this.Log("Stopped");	};
	this.unload = function(){	this.Log("Unloaded");	};

	this.onMessage = function() {};
	this.onSwitch = function()  {};
	this.observer = function(e) {};

	this.getSettingsPanel = function () {
		var string = "<h3>Settings Panel</h3>";
		var js1 = 'BdApi.getPlugin("' + this.getName() + '").patchForTransparency(false);';
		var js2 = 'BdApi.getPlugin("' + this.getName() + '").patchForTransparency(true);';
		string += "Use these buttons to apply or remove the patch: </br>";
		string += "<button onclick='" + js1 + "'>Enable patch</button>";
		string += "<button onclick='" + js2 + "'>Disable patch</button>";

	    return string;
	};

	this.Log = function(msg) {
		console.log("%c[" + this.pluginName + "]%c " + msg, "color: #DABEEF; font-weight: bold;", "");
	};

	this.patchForTransparency = function(undo) {
		var errors = "";

		var file = require('electron').remote.app.getAppPath() + "/index.js";

		var line1Pattern = "transparent: ";
		var line1Original = "transparent: false";
		var line1New = "transparent: true";

		var line2Pattern = "var app = _electron2.default.app;";
		var line2ToAdd = "app.commandLine.appendSwitch('enable-transparent-visuals');";

		//open file
		fs = require("fs");
		fs.readFile(file, "utf8", function (err,data) {
			if (err) {
				alert("Unable to read file " + file + ". See console for error object.");
				console.error("Error while reading file: ", err);
				return;
			}

			//We can easily just replace our patterns with our new lines, 
			//but that's just too easy, so let's loop through every line
			//and do unneeded error checks.
			//Yes, I wrote this afer finishing the code below.

			//cut into a billion little pieces
			var split = data.split('\r\n');

			//find the right lines
			for (var i = 0; i < split.length; i++) {
				if (split[i].indexOf(line1Pattern) !== -1) {
					var origaa = split[i];
					if (!undo) {	//false to true
						if (split[i].indexOf(line1Original) !== -1) {
							split[i] = split[i].replace(line1Original, line1New);
							console.log("Patched 'transparent: false' to true on line " + (i+1));
						} else {
							//already enabled
							console.warn("Already patched transparent: false!");
							errors += 'Already patched "transparent: false"!\n';
						}
					} else {	//true to false, undo patch
						if (split[i].indexOf(line1New) !== -1) {
							split[i] = split[i].replace(line1New, line1Original);
							console.log("Patched 'transparent: true' to false on line " + (i+1));
						} else {
							//already enabled
							console.warn("Already patched transparent: false!");
							errors += 'Already patched "transparent: false"!\n';
						}
					}
				} 
				if (split[i].indexOf(line2Pattern) !== -1) {	//found line to patch
					if (!undo) {
						if (split[i].indexOf(line2ToAdd) === -1) {	//patch not added yet
							split[i] += line2ToAdd;
							console.log("Added enable-transparent-visuals on line " + (i+1));
						} else {
							//already added
							console.warn("Already added enable-transparent-visuals!");
							errors += 'Already added "enable-transparent-visuals"!\n';
						}
					} else {
						if (split[i].indexOf(line2ToAdd) !== -1) {	//patch already added
							split[i] = line2Pattern;
							console.log("Removed enable-transparent-visuals on line " + (i+1) + " by restoring the original.");
						} else {
							//already removed
							console.warn("enable-transparent-visuals was not present on line " + (i+1) + "!");
							errors += "enable-transparent-visuals was not present on line " + (i+1) + "!\n";
						}
					}
				}
			}

			//join everything again
			var toWrite = split.join('\r\n');

			//write
			fs.writeFile(file, toWrite, function(err2) {
			    if(err2) {
					//alert("Unable to write file to " + file + ". See console for error object.");
					errors += "Unable to write file to " + file + ". See console for error object.";
					console.error("Error while writing file: ", err2);
			    }

			    console.log("The file was saved!");

			    if (errors !== "")
			    	alert(errors, "We may or may not have some problems...\n\n" + errors);
			    else
			    	alert("Edited config file has been written!\n\nPlease restart Discord and then reload using CTRL+R to complete the patch.", "Success!");
			}); 
		});
	};
};
