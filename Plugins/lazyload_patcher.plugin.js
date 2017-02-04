//META{"name":"lazyload_patcher"}*//

//jshint esversion: 6

//TODO: somehow reload/redraw the Channels object, for seamless patching
//TODO: find Channels prototype without it being added to the DOM, also for seamless patching

var lazyload_patcher = function() {
	this.pluginName = 'LazyLoad Patcher';

	this.getName = 			function()	{return this.pluginName;};
	this.getDescription = 	function()	{return 'LazyLoad Patcher - Patches Discord\'s lazy loading to allow for themes that modify channel heights.</br></br>Credits to noodlebox#0155 for their help and code on react objects.';};
	this.getVersion = 		function()	{return '1.0';};
	this.getAuthor = 		function()	{return '<a href="http://JustM3.net">HoLLy#2750</a>';};

	this.patches = [{selector: ".guild-channels", funcName: "getRowHeight", storageName: "channelRowHeight", default: 36}];

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
	this.onSwitch = function()  {};
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

	};	//TODO: make proper

	this.doChatPatch = function() {

		//this.Log('in doChatPatch right now, this is ' + this.constructor.name);
		for (var i = 0; i < this.patches.length; i++) {
			var patch = this.patches[i];
			this.patchSomething(patch.selector, patch.funcName, patch.storageName);
		}
		this.Log('finished doChatPatch');
	};

	this.patchSomething = function(selector, funcName, storageName) {
		try {
			//get stuff, make stuff
			var instList = $(selector);
			if (instList.length === 0) throw "Could not find selector.";
			var inst = getOwnerInstance(instList[0]);

			var newVar = (bdPluginStorage.get(this.pluginName, storageName));
			var patchedFunc = function() {return newVar;};

			//patch current instance
			inst[funcName] = patchedFunc;

			//patch new instances, credits to noodlebox
			var index = inst.__reactAutoBindPairs.findIndex(n => n === funcName);
			if (index == -1) throw "couldn't find " + funcName + " in __reactAutoBindPairs for selector" + selector;
			inst.constructor.prototype[funcName] = inst.constructor.prototype.__reactAutoBindPairs[index+1] = patchedFunc;

			//success
			this.Log("Patched " + funcName);
		} catch(err) {
			//something went wrong. I should make this more verbose
			this.Log("Failed to patch " + funcName + ": " + err.message, "error");
		}
	};

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
	};
};
