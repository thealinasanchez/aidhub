Vue.createApp({
    data() {
        return {
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
            // organizations.html database variables
            organizations: [],
            search: "",
            filteredOrganizations: [],
            sortNames: "",
            newOrganization: {
                orgname: "",
                categories: [],
                city: "",
                state: "",
                missionStatement: ""
            }
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
        getOrganizations: async function () {



            //   proxyUrl: 'http://localhost:8080/api', // URL of your proxy server
            //   apiUrl: 'http://api.example.com', // URL of the target API
            //   responseData: null // Placeholder for the response data

            try {
                const response = await fetch(`http://localhost:8080/api?url=https://projects.propublica.org/nonprofits/api/v2/search.json?q=`);
                const data = await response.json();
                console.log(data);
                // this.responseData = data;
            } catch (error) {
                console.error(error);
            }


        },
        resetSearch: function () {
            this.search = "";
        },
        sortNames: function () {
            if (this.sortNames == 'asc') {
                function compare(a, b) {
                    if (a.amount > b.amount) return -1;
                    if (a.amount < b.amount) return 1;
                    return 0;
                }
                this.sortNames = 'desc';
            } else {
                function compare(a, b) {
                    if (a.amount < b.amount) return -1;
                    if (a.amount > b.amount) return 1;
                    return 0;
                }
                this.sortNames = 'asc';
            }
            this.organizations.sort(compare);
        },
        updateOrganization: function () {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            var encodedData = "orgname=" + encodeURIComponent(this.newOrganization.orgname) +
                "&categories=" + encodeURIComponent(this.newOrganization.categories) +
                "&city=" + encodeURIComponent(this.newOrganization.city) +
                "&state=" + encodeURIComponent(this.newOrganization.state) +
                "&missionStatement" + encodeURIComponent(this.newOrganization.missionStatement);
            var requestOptions = {
                method: 'PUT',
                body: encodedData,
                headers: myHeaders
            };
            var orgId = this.expenses[this.newOrganization.index]._id;
            console.log(orgId);
            fetch(`http://localhost:8080/organizations/${orgId}`, requestOptions)
                .then((response) => {
                    if (response.status == 204) {
                        this.organizations[this.newOrganization.index].orgname = this.newOrganization.orgname;
                        this.organizations[this.newOrganization.index].categories = this.newOrganization.categories;
                        this.organizations[this.newOrganization.index].city = this.newOrganization.city;
                        this.organizations[this.newOrganization.index].state = this.newOrganization.state;
                        this.organizations[this.newOrganization.index].missionStatement = this.newOrganization.missionStatement;
                    }
                })
        },
        addOrganization: function () {
            myHeaders = new Headers();
            // first param is the header, second param is content of header
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            var encodedData = "orgname=" + encodeURIComponent(this.newOrganization.orgname) +
                "&categories=" + encodeURIComponent(this.newOrganization.categories) +
                "&city=" + encodeURIComponent(this.newOrganization.city) +
                "&state=" + encodeURIComponent(this.newOrganization.state) +
                "&missionStatement" + encodeURIComponent(this.newOrganization.missionStatement);
            var requestOptions = {
                method: 'POST',
                body: encodedData,
                headers: myHeaders
            };
            fetch("http://localhost:8080/organizations", requestOptions)
                .then((response) => {
                    if (response.status === 201) {
                        response.json().then(data => {
                            this.organizations.push(data);
                            this.newOrganization = {};
                        })
                        console.log("Success");
                        this.newOrganization = {};
                    } else {
                        alert("Not able to add organization");
                    }
                })
        }
    },
    created: function () {
        this.getOrganizations();
    },
    watch: {
        search(newSearch, oldSearch) {
            this.filteredOrganizations = this.organizations.filter((org) => {
                return org.description
                    .toLowerCase()
                    .includes(newSearch.toLowerCase());
            });
        }
    },
    mounted: function () {
        // var Stadia_AlidadeSmoothDark = new L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
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