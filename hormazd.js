/** 
 * Hormazd - JavaScript Game Library
 */

/**
 * Network object used when communicating to the server
 * This is used often to submit incremental and final score
 */
var GameNetwork = {
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
			GameNetwork.isSynced = false;
			GameNetwork.stopSync();
			alert("You are out of sync from the sever. Your score will not be submitted.");
			return false;
		}
		
		// set as not sync
		this.isSynced = false;
		var url = this.serverUrl + 'ping/' + this.token + "/" + GamePlay.score;

		$.getJSON(url, function(data){
			if (data.token)
			{
				GameNetwork.isSynced = true;
				GameNetwork.token = data.token;
				// resync
				clearInterval(GameNetwork.timer);
				GameNetwork.previousTimestamp = new Date().getTime();
				GameNetwork.timer = setTimeout("GameNetwork.ping()", GameNetwork.syncInterval);
			}
			else
			{
				GameNetwork.isSynced = false;
				GameNetwork.stopSync();
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
				GameNetwork.isRegistered = true;
				GameNetwork.isSynced = true;
				GameNetwork.token = data.token;
				GameNetwork.previousTimestamp = new Date().getTime();
				// start synching
				GameNetwork.timer = setTimeout("GameNetwork.ping()", GameNetwork.syncInterval);
			}
			else
			{
				GameNetwork.stopSync();
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

