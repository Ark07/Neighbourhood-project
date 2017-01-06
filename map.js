



var map;
function initMap(){
  map = new google.maps.Map(document.getElementById('map'),{
    center: { lat:40.7413547,lng:-73.9980},
    zoom: 13
  });


  // This autocomplete is for use in the search within time entry box.
  var placeAutocomplete = new google.maps.places.Autocomplete(
      document.getElementById('places-search-text'));
      placeAutocomplete.bindTo('bounds',map);
  var markers = []
  var largeInfowindow = new google.maps.InfoWindow();



  var locations = [

    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
  ]


  var viewmodel = function(){
    var self = this;
    self.location = ko.observableArray();
    locations.forEach(function(locat){
      self.location.push(locat)
    })

    self.search = ko.observable();
    self.clickEvent= function(currentItem){
        console.log(currentItem.title)
        console.log(currentItem.location)
    }
  }

  ko.applyBindings(new viewmodel());















    for(var i=0; i<locations.length; i++){
        var position = locations[i].location;
        var title = locations[i].title;


        $('#places').append('<tr><'+title+'</tr>')

        var marker = new google.maps.Marker({
          position: position,
          map: map,
          title: title
        })
        markers.push(marker);
        marker.addListener('click',function(){
          populateInfoWindow(this, largeInfowindow);
       })

      }

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
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
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
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }







}
