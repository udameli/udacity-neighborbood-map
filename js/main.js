let map;
const default_icon = './static/images/default_marker_icon.png';
const selected_icon = './static/images/selected_marker_icon.png';

let activePin;

$(document).ready(function() {
  	$('#simple-menu').sidr();
});

function loadMapError() {
	$(document).ready(function() {
  		$('#map').append('<div class="row text-uppercase text-center error-message">' +
  			'<h2>Oops! Request to Google Maps failed.</h2></div>');
	});
}

function loadMap() {
	const styles = [
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
}

// pre-selected locations
let locations = [
	{title: 'Fontana Di Trevi', location: {lat: 41.900935, lng: 12.483301}},
	{title: 'Trattoria Galleria Sciarra', location: {lat: 41.8995, lng: 12.4823}},
	{title: 'Venchi Gelato Cafe', location: {lat: 41.900112, lng: 12.480693}},
	{title: 'Galleria Alberto Sordi', location: {lat: 41.901343, lng: 12.481122}},
	{title: 'Piazza Venezia', location: {lat: 41.895666, lng: 12.482625}}
];

let Pin = function(data) {
	this.title = ko.observable(data.title);
	this.location = data.location;
	this.marker = {};
	this.wikiUrl = ko.observable('');
	this.matchedSearch = ko.observable(true);
};

let ViewModel = function() {
	let self = this;

	self.errorMessage = ko.observable();

	self.pins = ko.observableArray([]);

	// user input typed into a search bar
	self.searchedTitle = ko.observable('');
	locations.forEach(function(location) {
		self.pins().push(new Pin(location));
	});

	// infowindow that appears when marker is clicked
	let largeInfoWindow = new google.maps.InfoWindow();

	// assigning markers to each pin
	self.pins().forEach(function(pin) {
		let marker = new google.maps.Marker({
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

	/* executes when <li> with title is clicked;
	displays pin info in the infoWindow,
	fires up animation and changes default icon to selected one */
	self.selectPin = function(pin) {
		activePin && activePin.setIcon(default_icon);
		activePin && activePin.setAnimation(null);
		activePin = pin.marker;
		activePin.setIcon(selected_icon);
		activePin.setAnimation(google.maps.Animation.BOUNCE);
		populateInfoWindow(pin.marker, largeInfoWindow);
	};

	/* compares user input to existing titles and displays
	selected pins */
	self.searchPin = function(viewModel) {
		activePin && activePin.setIcon(default_icon);
		activePin && activePin.setAnimation(null);
		largeInfoWindow.close();
		let searchedTitle = viewModel.searchedTitle;
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
	};
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
			let wikiUrlBase = 'https://en.wikipedia.org/w/api.php?' +
			'format=json&action=query&list=geosearch&gsradius=100&gscoord=';
			let lat = marker.position.lat();
			let lng = marker.position.lng();
			let wikiUrl = wikiUrlBase + lat + '|' + lng;
			let wikiRequestTimeout = setTimeout(function(){
				infoWindow.setContent('<div id="wikiLinkWindow">Failed to' +
					'Get Wikipedia Resources</div>');
				}, 8000);
			infoWindow.setContent('<div>Loading...</div>');
			$.ajax({
				url: wikiUrl,
				dataType: 'jsonp',
				success: function(response) {
					try {
						let pageID = response.query.geosearch[0].pageid;
						let title = response.query.geosearch[0].title;
						let url = 'https://en.wikipedia.org/wiki?curid=' + pageID;
						infoWindow.setContent('<div class="text-center">' +
							marker.title + '</div><hr><div id="wikiLinkWindow' +
							'">Wikipedia Article: <a href="'+ url + '">' +
							title + '</a></div>');
						clearTimeout(wikiRequestTimeout);
					} catch(error){
						//if no geocode
						infoWindow.setContent('<div class="text-center">' +
							marker.title + '</div><hr><div>Wikipedia Article: ' +
							'Could not retrieve Wikipedia resources for ' +
							'this location</div>');
					};
				},
				error: function() {
					infoWindow.setContent('<div class="text-center">' +
						marker.title + '</div><hr><div>Oops...something went ' +
						'wrong :( Check your network connection');
				}
			})
		};

		getWikiLink();
		infoWindow.open(map, marker)
	} else {
		infoWindow.open(map, marker)
	}
};

function gm_authFailure() {
	$('#map div:first-child').css('display','none');
	$(document).ready(function() {
  		$('#map').append('<div class="row text-uppercase text-center error-message">' +
  			'<h2>Oops! Request to Google Maps failed.</h2></div>');
	});
}

