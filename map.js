


var map;

function initMap() {


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
                weight: 6
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

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413547,
            lng: -73.9980
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });



    var markers = []


    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = "image/food.png";


    var locations = [

        {
            title: 'Park Ave Penthouse',
            location: {
                lat: 40.7713024,
                lng: -73.9632393
            }
        },
        {
            title: 'Chelsea Loft',
            location: {
                lat: 40.7444883,
                lng: -73.9949465
            }
        },
        {
            title: 'Union Square Open Floor Plan',
            location: {
                lat: 40.7347062,
                lng: -73.9895759
            }
        },
        {
            title: 'East Village Hip Studio',
            location: {
                lat: 40.7281777,
                lng: -73.984377
            }
        },
        {
            title: 'TriBeCa Artsy Bachelor Pad',
            location: {
                lat: 40.7195264,
                lng: -74.0089934
            }
        },
        {
            title: 'Chinatown Homey Space',
            location: {
                lat: 40.7180628,
                lng: -73.9961237
            }
        }
    ]



    var largeInfowindow = new google.maps.InfoWindow();




    document.getElementById('show-listings').addEventListener('click', showListings);

    document.getElementById('hide-listings').addEventListener('click', function() {
        hideMarkers(markers);
    });

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
            function getStreetView(data, status) {
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

            var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
            console.log(wikiURL)


            $.ajax({
                    url: wikiURL,
                    dataType: "jsonp",
                    //jsonp: "callback",
                    success: function(response) {
                        var articleStr = response[0];
                        console.log(articleStr)
                        var URL = 'https://en.wikipedia.org/wiki/' + articleStr;


                           // Use streetview service to get the closest streetview image within
                        // 50 meters of the markers position
                        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                        infowindow.setContent('<div>' + marker.title + '</div><br><a href="' +URL + '">'  + URL + ' </a><br><hr><div id="pano"></div>');
                        // Open the infowindow on the correct marker.
                        infowindow.open(map, marker);

                      }

                })






        }
    }


    // This function will loop through the markers array and display them all.
    function showListings() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    // This function will loop through the listings and hide them all.
    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }


    // wikipedia




    var viewmodel = function() {
        var self = this;
        self.locationList = ko.observableArray(locations);
        self.query = ko.observable('');

        /**  for(var i=0; i<locations.length; i++){
        var position = locations[i].location;
        var title = locations[i].title;
**/

        var defaultIcon = makeMarkerIcon('0091ff');

        self.locationList().forEach(function(item) {
            //$('#places').append('<tr><'+item.title+'</tr>')
            console.log(item.title)
            var marker = new google.maps.Marker({
                position: item.location,
                map: map,
                title: item.title,
                icon: defaultIcon
            })
            item.marker = marker;
            markers.push(marker);
            marker.addListener('click', function() {
                populateInfoWindow(item.marker, largeInfowindow);
            })

            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });

        })

        self.clickEvent = function(currentItem) {
            populateInfoWindow(currentItem.marker, largeInfowindow);
            currentItem.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                currentItem.marker.setAnimation(null);
            }, 1000);

        }

        //filtering
        self.filteredItems = ko.computed(function() {
            var query = self.query().toLowerCase(); // to convert to lowercase

            if (!query) {

                return self.locationList();
            } else {
                return ko.utils.arrayFilter(self.locationList(), function(item) {

                    var match = item.title.toLowerCase().indexOf(query) !== -1;

                    item.marker.setVisible(match); //display the filtered markers
                    return match;

                })
            }
        });

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


    }

        ko.applyBindings(new viewmodel());



    }
