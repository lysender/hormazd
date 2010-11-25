/** 
 * Hormazd - JavaScript Game Library
 * 
 * @requires jQuery
 * @requires jquery.sha256.js
 */

/** 
 * Random helper for numbers and list / arrays
 * 
 */
var HormazdRandom = {
	/** 
	 * Returns a random set of n number of indices
	 * from a list (array). This makes an assumption
	 * that list has a sorted numeric keys from 0 - {length -1}
	 * 
	 * If duplicate is specified, it allows x number of duplicate
	 * for a single value where x is the value of duplicate
	 * 
	 * @param Array list
	 * @param int n
	 * @param int duplicate
	 * 
	 * @return Array
	 */
	getFromList: function(list, n, duplicate)
	{
		var listCopy = list;
		var upperBound = listCopy.length - 1;
		
		
	}
};

/**
 * Network object used when communicating to the server
 * This is used often to submit incremental and final score
 * Also used for synching player's action to the server
 */
var HormazdNetwork = {
	/**
	 * Sync timer
	 *
	 * @var resource
	 */
	timer: null,
	
	/**
	 * In milliseconds, the time interval for the next network ping
	 *
	 * @var int
	 */
	syncInterval: 30000,
	
	/**
	 * Maintains a TS for synching
	 */
	previousTimestamp: null,
	
	/**
	 * @var string
	 */
	serverUrl: "/gamenetwork/",
	
	/**
	 * @var string
	 */
	token: null,
	
	/**
	 * @var boolean
	 */
	isRegistered: null,
	
	/**
	 * @var boolean
	 */
	isSynced: null,
	
	/**
	 * Ping the server to get a new token
	 */
	ping: function()
	{
		if (!this.isSynced || !this.isRegistered)
		{
			this.isSynced = false;
			this.stopSync();
			alert("You are out of sync from the sever. Your score will not be submitted.");
			return false;
		}
		
		// Set as not sync
		this.isSynced = false;
		var url = this.serverUrl + 'ping/' + this.token + "/" + GamePlay.score;

		$.getJSON(url, function(data){
			if (data.token)
			{
				HormazdNetwork.isSynced = true;
				HormazdNetwork.token = data.token;
				
				// Resync
				clearInterval(HormazdNetwork.timer);
				HormazdNetwork.previousTimestamp = new Date().getTime();
				HormazdNetwork.timer = setTimeout("HormazdNetwork.ping()", HormazdNetwork.syncInterval);
			}
			else
			{
				HormazdNetwork.isSynced = false;
				HormazdNetwork.stopSync();
				alert("You are out of sync from the sever. Your score will not be submitted.");
			}
		});
		
		return this;
	},
	
	/**
	 * Get the initial token to get started of the game
	 */
	register: function()
	{
		$.getJSON(this.serverUrl + "register", function(data){
			if (data.token)
			{
				HormazdNetwork.isRegistered = true;
				HormazdNetwork.isSynced = true;
				HormazdNetwork.token = data.token;
				HormazdNetwork.previousTimestamp = new Date().getTime();

				// Start synching
				HormazdNetwork.timer = setTimeout("HormazdNetwork.ping()", HormazdNetwork.syncInterval);
			}
			else
			{
				HormazdNetwork.stopSync();
				alert("Network problem: Cannot register your game session.");
			}
		});
	},
	
	/**
	 * Stops synching to the sever
	 */
	stopSync: function()
	{
		this.isSynced = false;
		clearTimeout(this.timer);
		
		return this;
	},
	
	/**
	 * Submits score
	 * 
	 * @todo Make this method indenpendent of the game setup
	 * Perhaps making this one a callback or something
	 */
	submitScore: function()
	{
		var url = this.serverUrl + "submitscore";
		var playerName = $.trim($("#player_name").val());
		$.post(
			url,
			{
				token: this.token,
				name: playerName,
				score: GamePlay.score
			},
			function(data){
				if (data.success)
				{
					alert("Your score has been submitted.");
					$("#submit_score").hide();
				}
				else
				{
					alert("There was a problem while submitting your score.");
				}
			},
			"json"
		);
	}
};
