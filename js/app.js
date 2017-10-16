var map;

var markers = [];

function initMap(){
	var styles = [
	    {
	        featureType: "administrative",
	        elementType: "labels.text.fill",
	        stylers: [
	            { color: "#444444" },
	            { visibility: "off" }
	        ]
	    }, {
	        featureType: "landscape",
	        elementType: "all",
	        stylers: [
	            { color: "#f2f2f2" }
	        ]
	    }, {
	        featureType: "poi",
	        elementType: "all",
	        stylers: [
	            { visibility: "off" }
	        ]
	    }, {
	        featureType: "poi.attraction",
	        elementType: "geometry",
	        stylers: [
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "poi.attraction",
	        elementType: "labels.text",
	        stylers: [
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "poi.attraction",
	        elementType: "labels.text.fill",
	        stylers: [
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "poi.attraction",
	        elementType: "labels.icon",
	        stylers: [
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "poi.park",
	        elementType: "labels.text.fill",
	        stylers: [
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "poi.park",
	        elementType: "labels.icon",
	        stylers: [
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "road",
	        elementType: "all",
	        stylers: [
	            { saturation: -100 },
	            { lightness: 45 }
	        ]
	    }, {
	        featureType: "road.highway",
	        elementType: "all",
	        stylers: [
	            { visibility: "simplified" }
	        ]
	    }, {
	       	featureType: "road.highway",
	        elementType: "geometry.fill",
	        stylers: [
	            { visibility: "on" },
	            { color: "#b5a265" }
	        ]
	    }, {
	        featureType: "road.arterial",
	        elementType: "labels.icon",
	        stylers: [
	            { visibility: "off" }
	        ]
	    }, {
	        featureType: "transit",
	        elementType: "all",
	        stylers: [
	            { visibility: "off" }
	        ]
	    }, {
	        featureType: "water",
	        elementType: "all",
	        stylers: [
	            { color: "#0f4d67" },
	            { visibility: "on" }
	        ]
	    }, {
	        featureType: "water",
	        elementType: "geometry.fill",
	        stylers: [
	            { lightness: "59" },
	            { saturation: "-59" },
	            { gamma: "1.90" }
	        ]
	    }, {
	        featureType: "water",
	        elementType: "labels.text",
	        stylers: [
	            { color: "#ffffff" }
	        ]
	    }, {
	        featureType: "water",
	        elementType: "labels.text.stroke",
	        stylers: [
	            { color: "#256461" }
	        ]
	    }
	];

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 41.898821, lng: 12.488101},
		zoom: 15,
		styles: styles,
		mapTypeControl: false
		});

	var largeInfoWindow = new google.maps.InfoWindow();
	
	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per locaion, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position, 
			title: title,
			animation: google.maps.Animation.DROP,
			id: i,
			icon: default_icon
		});
		// Push the marker to the array of markers.
		markers.push(marker);
		// Create an onclick event to open an infoWindow at each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfoWindow);
		});
		// Two event listeners to change the marker color
		/* to be edited and tied to what is showed in the sidebar*/
		/*marker.addListener('click', function() {
			if (this.icon == default_icon) {
				this.setIcon(selected_icon)
			}else {
				this.setIcon(default_icon)
			}
		});*/
	};

};

var locations = [
	{title: 'Fontana Di Trevi', location: {lat: 41.900935, lng: 12.483301}},
	{title: 'Trattoria Galleria Sciarra', location: {lat: 41.899506, lng: 12.482339}},
	{title: 'Venchi Gelato Cafe', location: {lat: 41.900112, lng: 12.480693}},
	{title: 'Galleria Alberto Sordi', location: {lat: 41.901343, lng: 12.481122}},
	{title: 'Piazza Venezia', location: {lat: 41.895666, lng: 12.482625}}
];

var default_icon = './static/images/default_marker_icon.png';
var selected_icon = './static/images/selected_marker_icon.png';

// This function populates the infoWindow when the marker is clicked. 
function populateInfoWindow(marker, infoWindow) {
	// Check to make sure the infoWindow is not already opened on this marker.
	if (infoWindow.marker != marker) {
		infoWindow.setContent('');
		infoWindow.marker = marker;
		// Make sure the marker is properly cleared if the window is closed.
		infoWindow.addListener('closeclick', function(){
			infoWindow.marker = null;
		});
		
		function getWikiLink() {
			// Make AJAX call to Wikipedia API
			var wikiUrlBase = 'https://en.wikipedia.org/w/api.php?format=json&action=query&list=geosearch&gsradius=100&gscoord=';
			var lat = marker.position.lat();
			console.log(lat);
			var lng = marker.position.lng();
			console.log(lng);
			var wikiUrl = wikiUrlBase + lat + '|' + lng;
			console.log(wikiUrl);
			var wikiRequestTimeout = setTimeout(function(){
				infoWindow.setContent('<div id="wikiLinkWindow">Failed to Get Wikipedia Resources</div>');
			}, 8000);
			$.ajax({
				url: wikiUrl,
				dataType: 'jsonp',
				success: function(response) {
					var pageID = response.query.geosearch[0].pageid;
					var title = response.query.geosearch[0].title;
					var url = 'https://en.wikipedia.org/wiki?curid=' + pageID;
					infoWindow.setContent('<div id="wikiLinkWindow"><a href="'+ url + '">' + title + '</a></div>');
					clearTimeout(wikiRequestTimeout);
				}
			});
		};

		var streetViewService = new google.maps.StreetViewService();
		var radius = 50;
		function getStreetView(data, status) {
			if (status == google.maps.StreetViewStatus.OK) {
				var nearStreetViewLocation = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(
					nearStreetViewLocation, marker.position);
					infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
					var panoramaOptions = {
						position: nearStreetViewLocation,
						pov: {
							heading: heading,
							pitch: 30
						}
					};
				var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
			} else {
				infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
				infoWindow.setContent('<div>Hello</div>');
			};
		};
		// Use streetview service to get the closest streetview image within 50 meters of the markers position
		streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
		

		// Open the infowindow on the correct marker.
		infoWindow.open(map, marker);

	};
};
