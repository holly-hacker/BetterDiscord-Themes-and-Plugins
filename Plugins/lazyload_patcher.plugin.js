//META{"name":"lazyload_patcher"}*//

var lazyload_patcher = function() {
	this.pluginName = 'LazyLoad Patcher';

	this.getName = 			function()	{return this.pluginName;};
	this.getDescription = 	function()	{return 'LazyLoad Patcher - Patches Discord\'s lazy loading to allow for themes that modify channel heights.</br></br>Credits to noodlebox#0155 for their help and code on react objects.';};
	this.getVersion = 		function()	{return '. preview';};
	this.getAuthor = 		function()	{return '<a href="http://JustM3.net">HoLLy#2750</a>';};

	this.patches = [{selector: ".guild-channels", funcName: "getRowHeight", storageName: "channelRowHeight", default: 36}];

	this.load = function()	{
		this.Log("Loaded");

		//TODO: dynamic
		if (bdPluginStorage.get(this.pluginName, 'channelRowHeight') == null) {
			bdPluginStorage.set(this.pluginName, 'channelRowHeight', 36);	//default value (for cozy, atleast)
		}
	};

	this.start = function() {
		this.Log("Started");

		for (var i = 0; i < this.patches.length; i++) {
			var patch = this.patches[i];
			this.patchSomething(patch["selector"], patch["funcName"], patch["storageName"]);
		}
		
	};

	this.stop = function()	{ 	this.Log("Stopped");	};
	this.unload = function(){	this.Log("Unloaded");	};

	this.onMessage = function() {};
	this.onSwitch = function()  {};
	this.observer = function(e) {};

	this.getSettingsPanel = function () {
		var str = '<b>Enter new channel height: </b><input type="number" id="llInputChannelHeight" \
		value="' + bdPluginStorage.get(this.pluginName, 'channelRowHeight') + '" /><br>\
		<!-- more options go here, some day <br> -->\
		<br><button onClick="llSave()">Save new settings</button><br>';
		var js = '<script>\
				function llSave() { \
					var ch = parseInt($(\'#llInputChannelHeight\').val()); \
					if (ch != null && ch != "") { \
						bdPluginStorage.set("' + this.pluginName + '", "channelRowHeight", ch); \
						alert("Please restart the plugin to apply changes.") \
					} \
				}</script>';
		var js = '';
		var info = 'Channel height is 36 by default, 28(?) for minimal mode.';

		return str+js+info;

	};	//TODO: make proper

	//BUG: does not work when in /channels/@me
	this.patchSomething = function(selector, funcName, storageName) {
		try {
			//get stuff, make stuff
			var inst = getOwnerInstance($(selector)[0]);
			var newVar = (bdPluginStorage.get(this.pluginName, storageName));
			var patchedFunc = function() {return newVar;};

			//patch current instance
			inst[funcName] = patchedFunc;

			//patch new instances, credits to noodlebox
			var index = inst.__reactAutoBindPairs.findIndex(n => n === funcName);
			if (index == -1) throw "couldn't find " + funcName + " in __reactAutoBindPairs for " + selector;
			inst.constructor.prototype[funcName] = inst.constructor.prototype.__reactAutoBindPairs[index+1] = patchedFunc;

			//success
			this.Log("Patched " + funcName);
		} catch(err) {
			//something went wrong. should make this mroe verbose
			this.Log("Failed to patch " + funcName + ": " + err.message, "error");
		}
	}

	this.Log = function(msg, method = "log") {
		console[method]("%c[" + this.pluginName + "]%c " + msg, "color: #DABEEF; font-weight: bold;", "");
	};

	//code by noodlebox
	this.getOwnerInstance = function(e, {include, exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]} = {}) {
	    if (e === undefined) {
	        return undefined;
	    }

	    // Set up filter; if no include filter is given, match all except those in exclude
	    const excluding = include === undefined;
	    const filter = excluding ? exclude : include;

	    // Get displayName of the React class associated with this element
	    // Based on getName(), but only check for an explicit displayName
	    function getDisplayName(owner) {
	        const type = owner._currentElement.type;
	        const constructor = owner._instance && owner._instance.constructor;
	        return type.displayName || constructor && constructor.displayName || null;
	    }
	    // Check class name against filters
	    function classFilter(owner) {
	        const name = getDisplayName(owner);
	        return (name !== null && !!(filter.includes(name) ^ excluding));
	    }

	    const getInternalInstance = e => e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];

	    // Walk up the hierarchy until a proper React object is found
	    for (let prev, curr=getInternalInstance(e); !_.isNil(curr); prev=curr, curr=curr._hostParent) {
	        // Before checking its parent, try to find a React object for prev among renderedChildren
	        // This finds React objects which don't have a direct counterpart in the DOM hierarchy
	        // e.g. Message, ChannelMember, ...
	        if (prev !== undefined && !_.isNil(curr._renderedChildren)) {
	            /* jshint loopfunc: true */
	            let owner = Object.values(curr._renderedChildren)
	                .find(v => !_.isNil(v._instance) && v.getHostNode() === prev.getHostNode());
	            if (!_.isNil(owner) && classFilter(owner)) {
	                return owner._instance;
	            }
	        }

	        if (_.isNil(curr._currentElement)) {
	            continue;
	        }

	        // Get a React object if one corresponds to this DOM element
	        // e.g. .user-popout -> UserPopout, ...
	        let owner = curr._currentElement._owner;
	        if (!_.isNil(owner) && classFilter(owner)) {
	            return owner._instance;
	        }
	    }

	    return null;
	}
};
