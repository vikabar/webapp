window.onload = function()
{
	document.location.hash = "#quick-reports";
	UTILS.addEvent(window,"hashchange",selectTab);
	readNotificationFromFile();
	document.onkeydown = keyListener;

	//toggle visibility of settins panel when the wheel btn is pressed (quick-reports) 
	UTILS.qs("#quick-reports-body .settings-toggle").onclick = function()
	{
		var panel = UTILS.qs("#quick-reports-body .settings-panel");
		//check current visibility state
		var isHidden = panel.classList.contains("hidden");
		//toggle state
		if (isHidden)
		{
			panel.classList.remove("hidden");
		}
		else
		{
			panel.classList.add("hidden");
		}
	}

	//toggle visibility of settins panel when the wheel btn is pressed (my-team-folders) 
	UTILS.qs("#my-team-folders-body .settings-toggle").onclick = function()
	{
		var panel = UTILS.qs("#my-team-folders-body .settings-panel");

		//check current visibility state
		var isHidden = panel.classList.contains("hidden");
		//toggle state
		if (isHidden)
		{
			panel.classList.remove("hidden");
		}
		else
		{
			panel.classList.add("hidden");
		}
	}

	UTILS.qs("#rep-cancel").onclick = function()
	{
		UTILS.qs("#quick-reports-body .settings-panel").classList.add("hidden");
		return false;
	}

	UTILS.qs("#fol-cancel").onclick = function()
	{
		UTILS.qs("#my-team-folders-body .settings-panel").classList.add("hidden");
		return false;
	}

	//UTILS.qs("#rep-save").onclick = saveQuickReports;
}

function keyListener(ev)
{
	var key = ev.keyCode;
	var tabsNames = ["quick-reports", "my-folders", "my-team-folders", "public-folders"];

	var currTab = tabsNames.indexOf(document.location.hash.substring(1));
	var tabDiff = 38 - key;
	var newTab = currTab - tabDiff;

	if ((newTab <= 3) && (newTab >= 0))
	{
		document.location.hash = "#" + tabsNames[newTab];
	}
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

/*function saveQuickReports()
{
	var reports = [];

	//collect data from quick reports form
	for (var i = 1; i <= 3; i++)
	{
		var repName = UTILS.qs("#rep_0" + i + "_name").value;

		//check if the row is empty
		if (repName != "")
		{
			//collect report row
			var repURL = UTILS.qs("#rep_0" + i + "_URL").value;
			var report = {value:repURL, text:repName};
			reports.push(report);
		}
	}

	var combo = UTILS.qs("#quick-reports-body .saved-links");

	//put values into the combobox
	for (var i = 0; i < reports.length; i++)
	{
		combo.appendChild(reports(i));
	}

	return false;
	
}*/


var doneFunction =  function(res)
{
	if (res.notification)
	{
		var notif = UTILS.qs(".notifications");
		notif.innerHTML = res.notification;
		notif.classList.remove("hidden");
	}
	
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

