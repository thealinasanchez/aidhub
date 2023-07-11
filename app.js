Vue.createApp({
    data() {
        return {
        }
    },
    methods : {
        getLocation: function() {
            var x = document.getElementById("user-location");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }
        },
        showPosition: function(position) {
            
        }
    },
    created : function() {
    }
}).mount("#app");