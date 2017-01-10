var map;

// Create a new blank array for all the listing markers.
var markers = [];

// Create a styles array to use with the map.
var styles = [{
    featureType: 'water',
    stylers: [{
        color: '#19a0d8'
    }]
}, {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [{
            color: '#ffffff'
        },
        {
            weight: 7
        }
    ]
}, {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{
        color: '#e85113'
    }]
}, {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{
            color: '#efe9e4'
        },
        {
            lightness: -40
        }
    ]
}, {
    featureType: 'transit.station',
    stylers: [{
            weight: 9
        },
        {
            hue: '#e85113'
        }
    ]
}, {
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [{
        visibility: 'off'
    }]
}, {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{
        lightness: 100
    }]
}, {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{
        lightness: -100
    }]
}, {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{
            visibility: 'on'
        },
        {
            color: '#f0e4d3'
        }
    ]
}, {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{
            color: '#efe9e4'
        },
        {
            lightness: -25
        }
    ]
}];

// These are the listings that will be shown to the user.
var locations = [


    {
        title: 'Keens Steakhouse',
        location: {
            lat: 40.7484301,
            lng: -73.9937836
        }
    },
        {
            title: 'Veselka ',
            location: {
                lat: 40.7290258,
                lng: -73.9893147
            }
        },

    {
        title: 'Grand Hyatt New York',
        location: {
            lat: 40.7525591,
            lng: -73.9858106
        }
    },
    {
        title: 'Plaza Hotel',
        location: {
            lat: 40.758423,
            lng: -73.9827865
        }
    },
    {
        title: 'Hotel Pennsylvania',
        location: {
            lat: 40.7713024,
            lng: -73.9632393
        }
    },
];


function initMap() {


    // Constructor creates a new map - only center and zoom are required.

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413547,
            lng: -73.9980

        },
        zoom: 12, // setting zoom, max-value 23
        styles: styles, // changing default styles to predefined style
        mapTypeControl: false // enabling changes over the map
    });



    //Instantiate ViewModel

    ko.applyBindings(new Viewmodel());

}


// Viewmodel
var Viewmodel = function() {
    var self = this;
    self.locationList = ko.observableArray(locations);
    self.query = ko.observable('');
    self.display = ko.observable(true);


    var largeInfowindow = new google.maps.InfoWindow();

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.

    var highlightedIcon = "image/food.png";
    // setting default marker color
    var defaultIcon = makeMarkerIcon('C119FF');

    self.locationList().forEach(function(item) {
           console.log(item.title);
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: item.location,
            map: map,
            title: item.title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon
        });


        item.marker = marker;
        // Push the marker to our array of markers.
         markers.push(marker);
        //enabling info window on clicking
        marker.addListener('click', function() {
           map.panTo(marker.getPosition());
           map.setZoom(13);
          map.setCenter(marker.getPosition());
          item.marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function() {
                item.marker.setAnimation(null);
          }, 1400);
            populateInfoWindow(item.marker, largeInfowindow);

        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.

       marker.addListener('mouseover', function() {
          this.setIcon(highlightedIcon);
      });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });

    });

    //displaying information when clicked on a marker on map
    // seting Animation to that particular clicked marker

    self.clickEvent = function(currentItem) {
        //  setting infowindow to particular clicked marker
        populateInfoWindow(currentItem.marker, largeInfowindow);
        // setting Animation to clicked marker
        currentItem.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            currentItem.marker.setAnimation(null);
        }, 1400);
    };

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.

    function populateInfoWindow(marker, infowindow) {

        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;
            // In case the status is OK, which means the pano was found, compute the
            // position of the streetview image, then calculate the heading, then get a
            // panorama from that and set the options
            function getStreetView(data, status){
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                    //  infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 30
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
                }
            }
            // Use streetview service to get the closest streetview image within

            // wikipedia
            var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
            //ajax request

            $.ajax({
                url: wikiURL,
                dataType: "jsonp",
                //jsonp: "callback",
              }).done(function(response) {
                    // getting back the firt response
                    var articleStr = response[0];
                    console.log(articleStr);
                    var URL = 'https://en.wikipedia.org/wiki/' + articleStr;
                    // Use streetview service to get the closest streetview image within
                    // 50 meters of the markers position
                    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                    infowindow.setContent('<div>' + marker.title + '</div><br><a href="' + URL + '">' + URL + ' </a><br><hr><div id="pano"></div>');
                    // Open the infowindow on the correct marker.
                    infowindow.open(map, marker);
                    //error handling
                }).fail(function (jqXHR, textStatus) {
                    alert("failed to load wikipedia resources");
                    });

        }
    }


    //filtering the location list
    self.filteredItems = ko.computed(function() {
       largeInfowindow.close();//closing all the previously opened infowindows
        var query = self.query().toLowerCase(); // to convert to lowercase
        // if search item not equal to any location in list
        if (!query) {
            // display all markers
            for(var i=0;i<markers.length;i++){
             markers[i].setVisible();
            }
            //display all list
            return self.locationList();
        } else {

            return ko.utils.arrayFilter(self.locationList(), function(item) {

                var match = item.title.toLowerCase().indexOf(query) !== -1;
                //setting matched location marker visible
                item.marker.setVisible(match); //display the filtered markers
                //displaying the matched location
                return match;

            });
        }
    });

    // value of visible-binding toggled on clicking displayIcon function
    self.displayIcon = function() {
        if (!self.display()) {
            self.display(true);
            console.log(self.display());
        } else {
            self.display(false);
            console.log(self.display());
        }
    };

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

};
