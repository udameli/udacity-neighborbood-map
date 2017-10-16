var map;
var default_icon = './static/images/default_marker_icon.png';
var selected_icon = './static/images/selected_marker_icon.png';

var activePin;

$(document).ready(function() {
  	$('#simple-menu').sidr();
});

function loadMap() {
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
		mapTypeControl: false,
		});

	ko.applyBindings(new ViewModel());
};

var locations = [
	{title: 'Fontana Di Trevi', location: {lat: 41.900935, lng: 12.483301}},
	{title: 'Trattoria Galleria Sciarra', location: {lat: 41.8995, lng: 12.4823}},
	{title: 'Venchi Gelato Cafe', location: {lat: 41.900112, lng: 12.480693}},
	{title: 'Galleria Alberto Sordi', location: {lat: 41.901343, lng: 12.481122}},
	{title: 'Piazza Venezia', location: {lat: 41.895666, lng: 12.482625}}
];

var Pin = function(data) {
	this.title = ko.observable(data.title);
	this.location = data.location;
	this.marker = {};
	this.wikiUrl = ko.observable('');
	this.matchedSearch = ko.observable(true);
};

var ViewModel = function() {
	var self = this;

	self.pins = ko.observableArray([]);

	self.searchedTitle = ko.observable('');

	locations.forEach(function(location) {
		self.pins().push(new Pin(location));
	});

	var largeInfoWindow = new google.maps.InfoWindow();

	self.pins().forEach(function(pin) {
		var marker = new google.maps.Marker({
			map: map,
			position: pin.location,
			title: pin.title(),
			animation: google.maps.Animation.DROP,
			icon: default_icon
		});
		pin.marker = marker;
		pin.marker.addListener('click', function() {
			activePin && activePin.setIcon(default_icon); 
			activePin && activePin.setAnimation(null);
			activePin = pin.marker;
			activePin.setIcon(selected_icon);
			activePin.setAnimation(google.maps.Animation.BOUNCE);
			populateInfoWindow(this, largeInfoWindow);
		});
	});

	self.selectPin = function(pin) {
		console.log(pin);
		/* Display pin with clicked title */
		activePin && activePin.setIcon(default_icon);
		activePin && activePin.setAnimation(null);
		activePin = pin.marker;
		activePin.setIcon(selected_icon);
		activePin.setAnimation(google.maps.Animation.BOUNCE);
		populateInfoWindow(pin.marker, largeInfoWindow);
	};

	self.searchPin = function(viewModel) {
		console.log(viewModel);
		activePin && activePin.setIcon(default_icon);
		activePin && activePin.setAnimation(null);
		largeInfoWindow.close();
		var searchedTitle = viewModel.searchedTitle;
		if (searchedTitle() != '') {
			self.pins().forEach(function(pin) {
				pin.marker.setMap(null);
				pin.matchedSearch(false);
				if (pin.title().indexOf(searchedTitle()) >= 0) {
					pin.matchedSearch(true);
					pin.marker.setMap(map);
				};
			});
		} else {
			self.pins().forEach(function(pin) {
				pin.matchedSearch(true);
				pin.marker.setMap(map);
			});
		}
	}

};

function populateInfoWindow(marker, infoWindow) {
	// Check to make sure the infoWindow is not already opened on this marker.
	if (infoWindow.marker != marker) {
		infoWindow.setContent('Loading...');
		infoWindow.marker = marker;
		// Make sure the marker is properly cleared if the window is closed.
		infoWindow.addListener('closeclick', function(){
			activePin.setIcon(default_icon);
			activePin.setAnimation(null);
			infoWindow.marker = null;
		});

		function getWikiLink() {
			// Make AJAX call to Wikipedia API
			var wikiUrlBase = 'https://en.wikipedia.org/w/api.php?format=json&action=query&list=geosearch&gsradius=100&gscoord=';
			var lat = marker.position.lat();
			var lng = marker.position.lng();
			var wikiUrl = wikiUrlBase + lat + '|' + lng;
			var wikiRequestTimeout = setTimeout(function(){
				infoWindow.setContent('<div id="wikiLinkWindow">Failed to Get Wikipedia Resources</div>');
				}, 8000);
			infoWindow.setContent('<div>Loading...</div>');
			$.ajax({
				url: wikiUrl,
				dataType: 'jsonp',
				success: function(response) {
					try {
						var pageID = response.query.geosearch[0].pageid;
						var title = response.query.geosearch[0].title;
						var url = 'https://en.wikipedia.org/wiki?curid=' + pageID;
						infoWindow.setContent('<div class="text-center">' + marker.title + '</div><hr><div id="wikiLinkWindow">Wikipedia Article: <a href="'+ url + '">' + title + '</a></div>');
						clearTimeout(wikiRequestTimeout);
					} catch(error){
						//if no geocode
						infoWindow.setContent('<div class="text-center">' + marker.title + '</div><hr><div>Wikipedia Article: Could not retrieve Wikipedia resources for this location</div>');
					};	
				}, 
				error: function() {
					infoWindow.setContent('<div class="text-center">' + marker.title + '</div><hr><div>Oops...something went wrong :( Check your network connection');
				}
			})
		};
		
		getWikiLink();
		infoWindow.open(map, marker)
	} else {
		infoWindow.open(map, marker)
	}
};



