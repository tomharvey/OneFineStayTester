var journey_log;

function addEvent(elm, evType, fn, useCapture){
	if (elm.addEventListener) { //W3C
		elm.addEventListener(evType, fn, useCapture);
		return true;
	}
	else if (elm.attachEvent) { //IE
		var r = elm.attachEvent('on'+evType, function() {fn.call(elm);});
		return r;
	}
	else { // <IE
		elm['on' + evType] = fn;
	}
}

function evalJourneyLog(){
	if (xmlhttp.readyState == 4){
		journey_log = eval('(' + xmlhttp.responseText + ')');
		}
	}

function loadJSON(){
	if (window.XMLHttpRequest){// code for IE7+
	  xmlhttp=new XMLHttpRequest();
	  }
	else{// code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.open("GET","TFL_data.json",true);
	xmlhttp.onreadystatechange = evalJourneyLog;
	xmlhttp.send();
}

function coordsToLatLng(easting, northing)
	{
		//Converts the TFL supplier easting and northing coords system to LatLng
		var os1 = new OSRef(easting, northing);
		return os1.toLatLng();
	}

function getGetOrdinal(n) {
	var s=["th","st","nd","rd"],
	v=n%100;
	return n+(s[(v-20)%10]||s[v]||s[0]);
}

function getHumanDuration(sec) {
	var minutes = Math.floor(sec / 60);
	var seconds = sec - minutes * 60;
	if(seconds < 10){
		seconds = "0"+seconds;
	}
	return minutes +":"+seconds;
}

function pluralize(string, count) {
	if (count > 1)
		return string + "s";
	else
		return string;
}

function Bike(){
	this.id;
	this.journeys = new Array; //journey objects
	this.journey_duration = 0; //seconds
	this.stop_ids = new Array; //unique stop ids
	this.stops = new Array; //[easting,northing,name,visits]
	this.addStop = function addStopIfUnique(point){
							if (this.stop_ids.indexOf(point[0]) == -1){
								this.stop_ids.push(point[0]);
								this.stops[point[0]] = [point[1],point[2], point[3],1];
							}
							else
								this.stops[point[0]][3] ++;
						};
}

function Journey(){
	this.startPoint = new Array; // [id,easting,northing,name]
	this.endPoint = new Array;
	this.duration = 0; //seconds
}

function searchBikes() {
	journey_info = document.getElementById('journey_info');
	journey_info.innerHTML = "<p>Searching...</p>";
	
	if (!journey_log){
		setTimeout("searchBikes()",500);
		return false;
	}

	var bike = new Bike;
	bike.id = document.getElementById('bikeId').value;
	for (i=0;i<journey_log.length;i++){
		if (journey_log[i].bike_id == bike.id){
			var journey = new Journey;
			journey.startPoint = [journey_log[i].start_station_id,journey_log[i].start_station.x,journey_log[i].start_station.y,journey_log[i].start_station.name];
			journey.endPoint = [journey_log[i].end_station_id,journey_log[i].end_station.x,journey_log[i].end_station.y,journey_log[i].end_station.name];
			journey.duration = journey_log[i].duration;
			bike.journeys.push(journey);
			bike.journey_duration += parseInt(journey_log[i].duration);
			
			bike.addStop(journey.startPoint);
			bike.addStop(journey.endPoint);
		}
	}
	displayBike(bike);
}

function WinLoad(){
	//Hijack form submit event and set focus on the form search
		bikeSearchForm = document.getElementById('bike_searcher');
		addEvent(bikeSearchForm, 'submit', searchBikes, false);
		document.getElementById('bikeId').focus();
	//Load the json file
		loadJSON();
	//Load the Maps API and display the Map
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=showGMap";
		document.body.appendChild(script);
}

addEvent(window, 'load', WinLoad, false);