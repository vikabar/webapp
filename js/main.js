window.onload = function()
{
	document.location.hash = "#quick-reports";
	UTILS.addEvent(window,"hashchange",selectTab);
	readNotificationFromFile();
}

function unselectCurrTab() 
{
	//make current tab button unactive
	var currTab = UTILS.qs(".curr-tab");
	currTab.classList.remove("curr-tab");

	//hide the current tab's body
	var currTabName = currTab.id;
	currTabName = currTabName.substring(0, currTabName.length-4);
	var currTabBody = UTILS.qs("#" + currTabName + "-body");
	currTabBody.classList.add("hidden");
}

function selectTab()
{
	//get elements associated with the selected tab
	var selectedTabName = (document.location.hash).substring(1);
	var selectedTabButton = selectedTabName + "-btn";
	var selectedTabBody = selectedTabName + "-body";

	//unselect prev. tab and hide it's body
	unselectCurrTab();

	//make selected tab active and display its body
	UTILS.qs("#" + selectedTabButton).classList.add("curr-tab");
	UTILS.qs("#" + selectedTabBody).classList.remove("hidden");
}

var doneFunction =  function(res)
{
	alert("Hello world!");
};

function readNotificationFromFile()
{
	var options = {done : function(xhr, res)
						  {
							alert("hello world!");
						  },
				   fail : function(xhr, err)
				   		  {
				   		  	alert(err);
				   		  },
				   type : "json"
				  };

	 UTILS.ajax("data/config.json", {done: doneFunction});
}

