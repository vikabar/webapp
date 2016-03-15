var reports = [];
var folders = [];

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

	UTILS.qs("#rep-save").onclick = saveQuickReports;

	//define required dependencies between pairs of form inputs
	var inputs = UTILS.qsa(".settings-panel input");
	for (var i = 0; i < inputs.length; i++)
	{
		inputs[i].onblur = function(ev)
		{
			//find the name of the current input and the name of its neighbour input
			var currField = ev.target;
			var otherField = UTILS.qs("#" + currField.id.substring(0, 7) + ((currField.id.endsWith("name")) ? "URL" : "name"));

			//check whether we left the input empty
			//empty input
			if (currField.value == "")
			{
				//make the neighbour input not required
				if (otherField.hasAttribute('required'))
				{
					otherField.removeAttribute('required');
				}
			}
			//not empty input
			else
			{
				//make the neighbour input required
				if (!otherField.hasAttribute('required'))
				{
					otherField.setAttribute('required', 'true');
				}
			}
		};
	}

	readLocalSt();
}


function keyListener(ev)
{
	var key = ev.keyCode;
	var tabsNames = ["quick-reports", "my-folders", "my-team-folders", "public-folders"];
	var currTab = tabsNames.indexOf(document.location.hash.substring(1));

	//ESC is pressed inside the panel of quick reports
	if ((key == 27) && (UTILS.qs("#quick-reports-body .settings-panel #" + event.target.id)))
	{
		//hide panel
		UTILS.qs("#quick-reports-body .settings-panel").classList.add("hidden");
	}
	else
	{
		var tabDiff = 38 - key;
		var newTab = currTab - tabDiff;

		if ((newTab <= 3) && (newTab >= 0))
		{
			document.location.hash = "#" + tabsNames[newTab];
		}
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

	writeToLocalSt();
}


function saveQuickReports()
{
	if (validateForm("quick-reports-body"))
	{
		//hide panel
		UTILS.qs("#quick-reports-body .settings-panel").classList.add("hidden");

		reports = [];

		//collect data from quick reports form
		for (var i = 1; i <= 3; i++)
		{
			var repName = UTILS.qs("#rep_0" + i + "_name").value;

			//check if the row is empty
			if (repName != "")
			{
				//collect report row
				var repURL = UTILS.qs("#rep_0" + i + "_URL").value;
				var report = {value: repURL, text: repName};
				reports.push(report);
			}
		}

		writeToLocalSt();

		var combo = UTILS.qs("#quick-reports-body .saved-links");

		//remove all current options from combobox
		while (combo.firstChild)
		{
		    combo.removeChild(combo.firstChild);
		}

		fillSavedLinksCombo(combo, reports);

		return false;
	}
}


function readNotificationFromFile()
{
	var doneFunction =  function(res)
	{
		if (res.notification)
		{
			var notif = UTILS.qs(".notifications");
			notif.innerHTML = res.notification;
			notif.classList.remove("hidden");
		}
	};

	UTILS.ajax("data/config.json", {done: doneFunction});
}


//check the validity of the form inside the given tab
function validateForm(tab)
{
	var goodInputs = UTILS.qsa("#" + tab + " input:valid");

	//remove error marking from good inputs
	for (var i = 0; i < goodInputs.length; i++)
	{
		goodInputs[i].classList.remove("input-error");
	}

	//check form validity
	if (UTILS.qs("#" + tab + " form:valid"))
	{
		return true;
	}

	var badInputs = UTILS.qsa("#" + tab + " input:invalid");

	//mark all bad inputs
	for (var i = 0; i < badInputs.length; i++)
	{
		badInputs[i].classList.add("input-error");
	}

	return false;
}


function fillSavedLinksCombo(combo, values)
{
	//put new values into the combobox
	for (var i = 0; i < values.length; i++)
	{
		var optionElement = document.createElement("option");
		optionElement.setAttribute("value", values[i].value);
		optionElement.innerHTML = values[i].text;
		combo.appendChild(optionElement);
	}
}

function fillSettingsPanel(panelName, values)
{
	var inputPrefix = (panelName == "quickReports") ? "rep_0" : "fol_0";

	for (var i = 0; i < values.length; i++)
	{
		var nameField = UTILS.qs("#" + inputPrefix + (i+1) + "_name");
		var urlField = UTILS.qs("#" + inputPrefix + (i+1) + "_URL");

		nameField.value = values[i].text;
		urlField.value = values[i].value;

		//make the inputs required
		if (!nameField.hasAttribute('required'))
		{
			nameField.setAttribute('required', 'true');
		}
		
		if (!urlField.hasAttribute('required'))
		{
			urlField.setAttribute('required', 'true');
		}
	}
}


function writeToLocalSt()
{
	var reportsStr = JSON.stringify(reports);
	var foldersStr = JSON.stringify(folders);
	var lastTab = document.location.hash;

	localStorage.setItem("reports", reportsStr);
	localStorage.setItem("folders", foldersStr);
	localStorage.setItem("tab", lastTab);
}


function readLocalSt()
{
	//load saved links
	reports = JSON.parse(localStorage.getItem("reports"));
	folders = JSON.parse(localStorage.getItem("folders"));

	//if there was a previous tab - switch to it
	var lastTab = localStorage.getItem("tab");
	if (lastTab)
	{
		document.location.hash = lastTab;
	}

	//fill both saved links combos
	fillSavedLinksCombo(UTILS.qs("#quick-reports-body .saved-links"), reports);
	fillSavedLinksCombo(UTILS.qs("#my-team-folders-body .saved-links"), folders);

	//fill both settings panel forms
	fillSettingsPanel("quickReports", reports);
	fillSettingsPanel("myTeamFolders", folders);
}

