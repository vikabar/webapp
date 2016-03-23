var reports = [];
var folders = [];

//initialize site
window.onload = function()
{
	//choose first tab
	document.location.hash = "#quick-reports";
	UTILS.addEvent(window,"hashchange",selectTab);
	//read notification from json file
	readNotificationFromFile();
	//load saved links and last tab from local storage
	readLocalSt();
	//register keyboard navigation
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
			//focus the first input
			UTILS.qs("#rep_01_name").focus();
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
			//focus the first input
			UTILS.qs("#fol_01_name").focus();
		}
		else
		{
			panel.classList.add("hidden");
		}
	}

	//register click events
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

	UTILS.qs("#rep-save").onclick = function()
	{
		saveLinks("quick-reports-body");
		return false;
	}

	UTILS.qs("#fol-save").onclick = function()
	{
		saveLinks("my-team-folders-body");
		return false;
	}

	//register search submission event
	var searchField = UTILS.qs("#searchField");
	searchField.onkeydown = function(ev)
	{
		var key = ev.keyCode;
		//Check if ENTER was pressed
		if (key == 13)
		{
			//search string and clean field
			ev.preventDefault();
			search();
			searchField.value = "";
		}
	}

	//don't submit form
	UTILS.qs(".search-box").onsubmit = function(ev)
	{
		ev.preventDefault();
	}

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

	//define combobox change event behaviour for both tabs
	var quickReportsCombo = UTILS.qs("#quick-reports-body .saved-links");
	var teamFoldersCombo = UTILS.qs("#my-team-folders-body .saved-links");
	quickReportsCombo.onchange = function(){ displaySavedSite("quick-reports-body", quickReportsCombo.value); };
	teamFoldersCombo.onchange = function(){ displaySavedSite("my-team-folders-body", teamFoldersCombo.value); };
}


//display a saved link inside the iframe
function displaySavedSite(tabBodyName, link)
{
	UTILS.qs("#" + tabBodyName + " iframe").setAttribute("src", link);
    UTILS.qs("#" + tabBodyName + " > a").setAttribute("href", link);
}


//Keyboard navigation listener
function keyListener(ev)
{
	var key = ev.keyCode;
	var tabsNames = ["quick-reports", "my-folders", "my-team-folders", "public-folders"];
	var currTab = tabsNames.indexOf(document.location.hash.substring(1));

	//ESC is pressed inside the panel of quick reports
	if ((key == 27) && (UTILS.qs("#quick-reports-body .settings-panel #" + ev.target.id)))
	{
		//hide panel
		UTILS.qs("#quick-reports-body .settings-panel").classList.add("hidden");
	}
	//ESC is pressed inside the panel of team folders
	else if ((key == 27) && (UTILS.qs("#my-team-folders-body .settings-panel #" + ev.target.id)))
	{
		//hide panel
		UTILS.qs("#my-team-folders-body .settings-panel").classList.add("hidden");
	}
	//ENTER is pressed inside the panel of quick reports
	else if ((key == 13) && (UTILS.qs("#quick-reports-body .settings-panel #" + ev.target.id)))
	{
		ev.target.blur();
		
		//save links
		saveLinks("quick-reports-body");
	}
	//ENTER is pressed inside the panel of team folders
	else if ((key == 13) && (UTILS.qs("#my-team-folders-body .settings-panel #" + ev.target.id)))
	{
		ev.target.blur();

		//save links
		saveLinks("my-team-folders-body");
	}
	//arrow key tab navigation
	else
	{
		//check which arrow was pressed and target tab
		var tabDiff = 38 - key;
		var newTab = currTab - tabDiff;

		//check tab range limits
		if ((newTab <= 3) && (newTab >= 0))
		{
			//open new tab
			document.location.hash = "#" + tabsNames[newTab];
		}
	}
}


//make all tabs unselected
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


//make a tab selected and display its body
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


//save the links form in local storage
function saveLinks(tabBodyName)
{
	//define current tab input names
	var inputPrefix = (tabBodyName == "quick-reports-body") ? "rep_0" : "fol_0";

	for (var i = 1; i <= 3; i++)
	{
		var URLInput = UTILS.qs("#" + inputPrefix + i + "_URL");

		//add protocol before the URL
		if ((URLInput.value != "") && (!URLInput.value.startsWith("http")))
		{
			URLInput.value = "http://" + URLInput.value;
		}

		//if URL exists and not valid
		if ((URLInput.value != "") && (!isUrlValid(URLInput.value)))
		{
			URLInput.classList.add("input-error");
			URLInput.setCustomValidity("The URL is not valid");
		}
		else
		{
			URLInput.setCustomValidity("");
			if ((URLInput.value != "") || (!URLInput.hasAttribute("required")))
			{
				URLInput.classList.remove("input-error");
			}
		}
	}

	//validate the form
	if (validateForm(tabBodyName))
	{
		//hide panel
		UTILS.qs("#" + tabBodyName + " .settings-panel").classList.add("hidden");

		//empty corresponding saved links
		if (tabBodyName == "quick-reports-body")
		{
			reports = [];	
		}
		else
		{
			folders = [];
		}

		
		var numOfEntries = 0;

		//collect data from the form
		for (var i = 1; i <= 3; i++)
		{
			var entryName = UTILS.qs("#" + inputPrefix + i + "_name").value;

			//check if the row is empty
			if (entryName != "")
			{
				//collect row information
				var entryURL = UTILS.qs("#" + inputPrefix + i + "_URL").value;
				var entry = {value: entryURL, text: entryName};

				//push the new entry into the corresponding array
				if (tabBodyName == "quick-reports-body")
				{
					reports.push(entry);
				}
				else
				{
					folders.push(entry);
				}

				numOfEntries++;				
			}
		}

		//save data to local storage
		writeToLocalSt();

		var combo = UTILS.qs("#" + tabBodyName + " .saved-links");

		//remove all current options from combobox
		while (combo.firstChild)
		{
		    combo.removeChild(combo.firstChild);
		}

		//fill the corresponding combobox
		if (tabBodyName == "quick-reports-body")
		{
			fillSavedLinksCombo(combo, reports);
		}
		else
		{
			fillSavedLinksCombo(combo, folders);
		}

		if (numOfEntries)
		{
			//select the last option in the combobox
			combo.selectedIndex = (numOfEntries - 1); 
			combo.onchange();
			combo.classList.remove("hidden");
			UTILS.qs("#" + tabBodyName + " iframe").classList.remove("hidden");
		}
		else
		{
			//if there are no saved links - hide the combo and the iframe
			combo.classList.add("hidden");
			UTILS.qs("#" + tabBodyName + " iframe").classList.add("hidden");
		}

		return false;
	}
}


//read the notification from the json file
function readNotificationFromFile()
{
	var doneFunction =  function(res)
	{
		if (res.notification)
		{
			//display notification
			var notif = UTILS.qs(".notifications");
			notif.innerHTML = res.notification;
			notif.classList.remove("hidden");
		}
	};

	//make an ajax request to the file
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


//fill a combobox with link names
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


//fill a settings panel with links names and urls
function fillSettingsPanel(panelName, values)
{
	//define current tab input names
	var inputPrefix = (panelName == "quickReports") ? "rep_0" : "fol_0";

	for (var i = 0; i < values.length; i++)
	{
		//get inputs
		var nameField = UTILS.qs("#" + inputPrefix + (i+1) + "_name");
		var urlField = UTILS.qs("#" + inputPrefix + (i+1) + "_URL");

		//grab content
		nameField.value = values[i].text;
		urlField.value = values[i].value;

		//make the inputs required
		if (!nameField.hasAttribute("required"))
		{
			nameField.setAttribute("required", "true");
		}

		if (!urlField.hasAttribute("required"))
		{
			urlField.setAttribute("required", "true");
		}
	}
}


//write data to the local storage
function writeToLocalSt()
{
	var reportsStr = JSON.stringify(reports);
	var foldersStr = JSON.stringify(folders);
	var lastTab = document.location.hash;

	//concat all links and last tab into one string of data
	var savedData = reportsStr + "^" + foldersStr + "^" + lastTab;
	localStorage.setItem("savedData", savedData);
}


//load saved links and last tab from the local storage
function readLocalSt()
{
	//load saved data
	var savedData = localStorage.getItem("savedData");
	if (!savedData)
	{
		return;
	}
	var savedDataSplit = savedData.split("^");

	//make sure all data exists before loading it
	if (savedDataSplit[0] != "")
	{
		reports = JSON.parse(savedDataSplit[0]);
	}
	if (savedDataSplit[1] != "")
	{
		folders = JSON.parse(savedDataSplit[1]);
	}
	if (savedDataSplit[2] != "")
	{
		var lastTab = savedDataSplit[2];
	
		//if there was a previous tab - switch to it
		document.location.hash = lastTab;
	}

	//check whether there are saved links in the quick reports tab
	if ((reports) && (reports.length))
	{		
		//fill quick reports saved links combo
		var quickReportsCombo = UTILS.qs("#quick-reports-body .saved-links");
		fillSavedLinksCombo(quickReportsCombo, reports);

		//fill quick reports settings panel form
		fillSettingsPanel("quickReports", reports);

		//select the last option in the combobox and display site
		quickReportsCombo.selectedIndex = (reports.length - 1);
		displaySavedSite("quick-reports-body", quickReportsCombo.value);

		//hide settings panel
		UTILS.qs("#quick-reports-body .settings-panel").classList.add("hidden");

		//show combo and iframe
		quickReportsCombo.classList.remove("hidden");
		UTILS.qs("#quick-reports-body iframe").classList.remove("hidden");

	}

	//check whether there are saved links in the team folders tab
	if ((folders) && (folders.length))
	{		
		//fill team folders saved links combo
		var teamFoldersCombo = UTILS.qs("#my-team-folders-body .saved-links");
		fillSavedLinksCombo(teamFoldersCombo, folders);

		//fill team folders settings panel form
		fillSettingsPanel("myTeamFolders", folders);

		//select the last option in the combobox and display site
		teamFoldersCombo.selectedIndex = (folders.length - 1);
		displaySavedSite("my-team-folders-body", teamFoldersCombo.value);

		//hide settings panel
		UTILS.qs("#my-team-folders-body .settings-panel").classList.add("hidden");

		//show combo and iframe
		teamFoldersCombo.classList.remove("hidden");
		UTILS.qs("#my-team-folders-body iframe").classList.remove("hidden");
	}
}


//validate a url using RegEx
function isUrlValid(url) 
{
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}


//look for a string or a part of it among site link names
function search()
{
	var found = false;
	var searchStr = UTILS.qs("#searchField").value.toLowerCase();

	//look for the string in all quick reports entries
	for(var i = 0; (!found) && (i < reports.length); i++)
	{
		//check substring
		var findInd = reports[i].text.toLowerCase().indexOf(searchStr);
		if (findInd != -1)
		{
			//found - go to the correct tab and display site
			found = true;
			document.location.hash = "#quick-reports";

			var combo = UTILS.qs("#quick-reports-body .saved-links");
			combo.selectedIndex = i; 
			combo.onchange();
		}
	}

	//look for the string in all team folders entries
	for(var i = 0; (!found) && (i < folders.length); i++)
	{
		//check substring
		var findInd = folders[i].text.toLowerCase().indexOf(searchStr);
		if (findInd != -1)
		{
			//found - go to the correct tab and display site
			found = true;
			document.location.hash = "#my-team-folders";

			var combo = UTILS.qs("#my-team-folders-body .saved-links");
			combo.selectedIndex = i; 
			combo.onchange();
		}
	}

	//display a notification if the string wasn't found at all
	if (!found)
	{
		var notif = UTILS.qs(".notifications");

		notif.innerHTML = "The searched report '" + searchStr + "' was not found.";
		notif.classList.remove("hidden");
	}
}