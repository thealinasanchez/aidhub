Vue.createApp({
    data() {
        return {
        }
    },
    methods : {
        // LONGITUDE AND LATITUDE FUNCTIONS
        getLocation: function() {
            var x = document.getElementById("user-location");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }
        },
        showPosition: function(position) {
            var x = document.getElementById("user-location");
            x.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
        },
        showError: function(error) {
            var x = document.getElementById("user-location");
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    x.innerHTML = "User denied the request for Geolocation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    x.innerHTML = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    x.innerHTML = "The request to get user location timed out.";
                    break;
                case error.UNKOWN_ERROR:
                    x.innerHTML = "An unknown error occured.";
                    break;
            }
        },
        // REVERSE GEOCODING FUNCTIONS
        
    },
    created : function() {
    }
}).mount("#app");