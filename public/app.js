Vue.createApp({
    data() {
        return {
            currentClientInformation: {
                location: {
                    city: "",
                    state: "",
                    lat: "",
                    long: ""
                }
            },
            getStartedForm: {
                open: false
            },
            //index.html slideshow stuff
            slideShow: {
                currentIndex: 0,
                slides: [
                    {
                        src: "./volunteering1.jpg",
                        alt: "People volunteering",
                        caption: "",
                    },
                    {
                        src: "./volunteering2.jpg",
                        alt: "People volunteering",
                        caption: "",
                    },
                    {
                        src: "./volunteering3.jpg",
                        alt: "People volunteering",
                        caption: "",
                    }
                ],
            },
            organizations: [],
            search: "",
        }
    },
    methods: {
        volunteerOpenForm: function () {
            this.getStartedForm.open = true;
        },
        donateOpenForm: function () {
            this.getStartedForm.open = true;
        },
        moveSlideShow: function () {
            let slideShow = document.querySelector(".slideshow-container");
            slideShow.style.transform = `translateX(-${100 * this.slideShow.currentIndex}%)`;
        },
        moveToSlide: function (index) {
            if (this.slideShow.currentIndex > this.slideShow.slides.length - 1) { this.slideShow.currentIndex = 0 }
            else if (this.slideShow.currentIndex < 0) { this.slideShow.currentIndex = this.slideShow.slides.length - 1 }
            else { this.slideShow.currentIndex = index }
            this.moveSlideShow();
        },
        moveToNextSlide: function () {
            if (this.slideShow.currentIndex >= this.slideShow.slides.length - 1) { this.slideShow.currentIndex = 0; }
            else { this.slideShow.currentIndex++ }
            this.moveSlideShow();
        },
        moveToPreviousSlide: function () {
            if (this.slideShow.currentIndex <= 0) { this.slideShow.currentIndex = this.slideShow.slides.length - 1 }
            else { this.slideShow.currentIndex-- };
            this.moveSlideShow();
        },
        // organizations.html database functions
        getOrganizations: function () {
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Basic dGhlYWxpbmFzYW5jaGV6QGdtYWlsLmNvbTphbGluYXNhbmNoZXo4MDE=");
            myHeaders.append("Content-Type", "application/json");

            fetch("http://projects.propublica.org/nonprofits/api/v2/search.json?q=propublica", {
                method: "GET",
                headers: myHeaders,
                cors: "cors"
            })
                .then((response) => {
                    console.log(response);
                    return response.json()
                })
                .then((data) => {
                    console.log(data);
                    this.organizations = data;
                });
            console.log(this.organizations);
        },
        resetSearch: function () {
            this.search = "";
        },
        submitSearch: function () {
            fetch(`https://projects.propublica.org/nonprofits/api/v2/search.json?q=${this.search.replace(" ", "+")}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    this.organizations = data;
                });
        },
    },
    created: function () {
        this.getOrganizations();
    },
    watch: {

    },
    mounted: function () {
        // var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        //     maxZoom: 20,
        //     attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OSM</a>'
        // });
        // let location = [37.108280, -113.583282];
        // var map = new L.Map("map", {
        //     center: location,
        //     zoom: 9,
        //     minZoom: 9,
        //     maxZoom: 9,
        //     zoomControl: false
        // })
        //     .addLayer(Stadia_AlidadeSmoothDark);
        // map.touchZoom.disable();
        // map.doubleClickZoom.disable();
        // map.scrollWheelZoom.disable();
        // map.boxZoom.disable();
        // map.keyboard.disable();
        /*
        var polygon = L.polygon([
            [51.509, -0.08],
            [51.503, -0.06],
            [51.51, -0.047]
        ]).addTo(map);
        */
    }
}).mount("#app");