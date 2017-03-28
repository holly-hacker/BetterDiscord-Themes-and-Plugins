//META{"name":"lazyload_patcher"}*//

//jshint esversion: 6

// This is not the cleanest code, as we now have hardcoded the path to the getRowHeight function, but it will get the job done for now


var lazyload_patcher = function() {
	this.pluginName = 'LazyLoad Patcher';

	this.getName = 			function()	{return this.pluginName;};
	this.getDescription = 	function()	{return 'LazyLoad Patcher - Patches Discord\'s lazy loading to allow for themes that modify channel heights.</br></br>Credits to noodlebox#0155 for their help and code on react objects. 3/25 fix by Mydayyy#0344';};
	this.getVersion = 		function()	{return '1.1';};
	this.getAuthor = 		function()	{return '<a href="http://JustM3.net">HoLLy#2750</a>';};

	this.patches = [{selector: ".guild-channels", funcName: "getRowHeight", storageName: "channelRowHeight", default: 36, patchFunction: function(selector, funcName, storageName) {this.patchRowHeight(selector, funcName, storageName);}.bind(this)}];

	var ctr = 0;

	this.load = function()	{
		this.Log("Loaded");

		//set default settings
		for (var i = 0; i < this.patches.length; i++) {
			if (bdPluginStorage.get(this.pluginName, this.patches[i].storageName) === null)
				bdPluginStorage.set(this.pluginName, this.patches[i].storageName, this.patches[i].default);
		}
	};

	this.start = function() {
		this.Log("Started");


		//if we start up to the friends page, channels won't be loaded
		if (location.pathname.startsWith('/channels/@me')) {

			//so, we run our patching code once, when we click a guild icon
			$('.guild').has('.avatar-small').on('click.llpPatcher', () => {

				//run after 1000ms, to make sure it is loaded
				setTimeout(() => this.doChatPatch(), 1000);
				$('.guild').off('click.llpPatcher');
			});
		} else {
			this.doChatPatch();
		}
	};

	this.stop = function()	{ 	this.Log("Stopped");	};
	this.unload = function(){	this.Log("Unloaded");	};

	this.onMessage = function() {};
	this.onSwitch = function()  {
		// Discord deletes the guild-channel node when switching to DM's. We need to watch onSwitch and reapply our fix.
		if (location.pathname.startsWith('/channels/@me')) {
			ctr = 1;
		} else {
			if (ctr > 0 ) {
				this.doChatPatch();
				ctr = 0;
			}
		}
	};

	this.observer = function(e) {};

	this.getSettingsPanel = function () {
		var str = `<b>Enter new channel height: </b><input type="number" id="llInputChannelHeight"
		value="${bdPluginStorage.get(this.pluginName, 'channelRowHeight')}" /><br>
		<!-- more options go here, some day <br> -->
		<br><button onClick="llSave()">Save new settings</button><br>`;
		var js = `<script>
				function llSave() {
					var ch = parseInt($('#llInputChannelHeight').val());
					if (ch != null && ch != "") {
						bdPluginStorage.set("${this.pluginName}", "channelRowHeight", ch);
						alert("Please restart the plugin to apply changes.")
					}
				}</script>`;
		var info = 'Channel height is 36 by default, 28 for minimal mode.';

		return str+js+info;

	};

	this.doChatPatch = function() {
		for (var i = 0; i < this.patches.length; i++) {
			var patch = this.patches[i];
			this.patchSomething(patch.selector, patch.funcName, patch.storageName, patch.patchFunction);
		}
		this.Log('finished doChatPatch');
	};

	this.patchSomething = function(selector, funcName, storageName, patchFunction) {
		try {
			patchFunction(selector, funcName, storageName);
			this.Log("Patched " + funcName);
		} catch(err) {
			this.Log("Failed to patch " + funcName + ": " + err.message, "error");
		}
	};

	this.Log = function(msg, method = "log") {
		console[method]("%c[" + this.pluginName + "]%c " + msg, "color: #DABEEF; font-weight: bold;", "");
	};

	this.patchRowHeight = function(selector, funcName, storageName) {
		var instList = $(selector);
		if (instList.length === 0) throw "Could not find selector.";

		var newVar = (bdPluginStorage.get(this.pluginName, storageName));
		var patchedFunc = function() {return newVar;};

		const getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
		var inst = getInternalInstance(instList[0]);
		inst._currentElement._owner._currentElement._owner._currentElement._owner._instance.getRowHeight =  patchedFunc; // We hardcoded the path here.. probably need to adjust that more often now
		inst._currentElement._owner._currentElement._owner._currentElement._owner._instance.handleListScroll(); // This will force a refresh. Otherwise we would have to scroll once in order for the missing channels to show up

	};
};
