var overlays = new Array;
var info = "";

function clearOverlays(){
	for (i=0;i<overlays.length;i++){
		overlays[i].setMap(null);
		delete overlays[i];
	}
	overlays.length = 0;
	info = "";
}

function placeMarkers(stops){
	var bounds = new google.maps.LatLngBounds;
	for (s=0;s<stops.length;s++){
		if (stops[s] != undefined){
			var stop = stops[s];

			//I've only made the first 4 images, in reality numbered icons would be auto-generated/cached by a backend task
			if (stop[3] < 5 && stop[3] > 0) var countedImgURL = 'markers/'+stop[3]+'_visits.png';
			else var countedImgURL = 'markers/blank.png';
			var image = new google.maps.MarkerImage(countedImgURL,
				new google.maps.Size(40, 34), //Size
				new google.maps.Point(0,0),
				new google.maps.Point(20, 17) //Center point
			);

			var stopCoords = coordsToLatLng(stop[0],stop[1]);

			var stopLatLng = new google.maps.LatLng(stopCoords.lat, stopCoords.lng);
			var marker = new google.maps.Marker({
				position: stopLatLng,
				map: map,
				icon: image,
				title: stop[2],
				zIndex: s
				});
			bounds.extend(stopLatLng);
			overlays.push(marker);
		}
	}
	map.fitBounds(bounds);
}

function drawJourneys(journeys){
	for(i=0;i<journeys.length;i++){
		var journey = journeys[i];
		
		info += "<dl>"
		info += "<dt>Start</dt><dd>"+journey.startPoint[3]+"</dd>";
		info += "<dt>Finish</dt><dd>"+journey.endPoint[3]+"</dd>";
		info += "<dt>Duration</dt><dd>"+getHumanDuration(journey.duration)+"</dd>";
		info += "<span class='clear'></span>"
		info += "</dl>";
		
		var startCoords = coordsToLatLng(journey.startPoint[1],journey.startPoint[2]);
		var endCoords = coordsToLatLng(journey.endPoint[1],journey.endPoint[2]);
		var journeyCoords = [
			new google.maps.LatLng(startCoords.lat,startCoords.lng),
			new google.maps.LatLng(endCoords.lat,endCoords.lng)
		];
		var journeyLine = new google.maps.Polyline({
			path: journeyCoords,
			strokeColor: "#06318C",
		    strokeOpacity: 1.0,
		    strokeWeight: 5
		})
		journeyLine.setMap(map);
		overlays.push(journeyLine);
	}
	journey_info.innerHTML += info;
	if (undefined != document.getElementById('extendInfo')){
		addEvent(document.getElementById('extendInfo'), 'click', expandInfo, false);
	}
}

function displayBike(bike){
	if (bike.stops.length > 0){
		clearOverlays();
		journey_info.innerHTML = "<a href='#' id='extendInfo'>"+bike.journeys.length+" "+ pluralize("trip",bike.journeys.length)+" ("+getHumanDuration(bike.journey_duration)+") through "+bike.stop_ids.length+" "+ pluralize("stop",bike.stop_ids.length)+"<span id='extra'> - view info -</span></a>";
		placeMarkers(bike.stops);
		drawJourneys(bike.journeys);
	}
	else{
		clearOverlays();
		journey_info.innerHTML = "<p>Error - No journeys found for this bike</p>";
	}
}

function showGMap()
	{
	var coords = coordsToLatLng(529377.55,177853.07);
	
	var latlng = new google.maps.LatLng(coords.lat, coords.lng);
	var mapOptions = 
		{
		zoom: 13,
		maxZoom: 17,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
		};
	map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
	}

function expandInfo(){
	document.getElementById('extra').style.display = "none";
	all_info = document.getElementsByTagName('dl');
	for (i=0;i<all_info.length;i++){
		this_info = all_info[i];
		this_info.style.display = "block";
	}
}