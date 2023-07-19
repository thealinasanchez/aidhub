
Vue.createApp({
    data() {
        return {
            page: '',
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
                    },
                ],
            },
            indexLocation: {
                askForLocation: true,
                state: "",
                city: "",
                spinner: false,
                mapMarkers: []
            },

            /* organizations.html start */
            search: "",
            organizations: [],
            filteredOrganizations: [],
            organizationsPage: {
                results: 0,
                current: -1,
                total: 0,
                spinner: true
            },
            sortOrder: "asc",
            sortOrderCities: "",

            /* organizations.html search variables */
            organizationsSearchFilterShow: false,
            organizationsStates: [],
            organizationsCategories: [],

            organizationsShowStateDropdown: false,
            organizationsSearchFilterState: {
                name: "",
                abbreviation: ""
            },
            organizationsFilteredStates: [],

            organizationsShowCategoryDropdown: false,
            organizationsSearchFilterCategory: {
                category: "",
                ntee_num: ""
            },
            organizationsFilteredCategories: [],
            /* organizations.html end */

            /* Volunteer New Post Toggle Modal Form */
            volunteerPostModal: {
                index: -1,
                user: "",
                title: "",
                orgname: "",
                city: "",
                state: "",
                dateStart: "",
                dateEnd: "",
                description: "",
                num_people: 0,
                website: ""
            },
            toggleModal: false,
            volunteerOpportunities: [],
            newVolunteerPost: {
                user: "",
                title: "",
                orgname: "personal",
                city: "",
                state: "",
                dateStart: "",
                dateEnd: "",
                description: "",
                num_people: 0,
                website: ""
            },

            // TRIAL STUFF
            trialOrganizations: [],
            filteredTrialOrganizations: [],
            volunteerorgsearch: ""
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
        getOrganizations: function (query = "") {
            // get organizations from API
            let previous = false;
            var newQuery = "";
            if (query != "") {
                previous = true;
                newQuery += "q=" + query.replace(" ", "+");
            }
            if (this.organizationsSearchFilterState.abbreviation != "") {
                newQuery += previous ? "&" : "";
                previous = true;
                newQuery += "state%5Bid%5D=" + this.organizationsSearchFilterState.abbreviation;
            }
            if (this.organizationsSearchFilterCategory.ntee_num != "") {
                newQuery += previous ? "&" : "";
                newQuery += "ntee%5Bid%5D=" + this.organizationsSearchFilterCategory.ntee_num;
            }
            if (this.organizationsPage.current != -1) {
                newQuery += previous ? "&" : "";
                newQuery += "page=" + this.organizationsPage.current;
            }
            if (data.organizations.length !== 0) {
                data.organizations.forEach((org) => {
                    this.organizations.push(org);
                })
            }
            this.organizationsPage.spinner = true;
            let codes = [];
            // fetch(`http://localhost:6300/organizations?${newQuery}`)
            //     .then(response => response.json())
            //     .then(data => {
            //         this.organizationsPage.results = data.total_results;
            //         this.organizationsPage.current = data.cur_page;
            //         this.organizationsPage.total = data.num_pages;
            //         if (data.organizations.length != 0) {
            //             data.organizations.forEach(org => {
            //                 this.organizations.push(
            //                     {
            //                         orgname: org.name,
            //                         city: org.city,
            //                         state: org.state,
            //                         ein: org.ein,
            //                         ntee: org.ntee_code ? org.ntee_code : "None",
            //                         category: "",
            //                         description: ""
            //                     }
            //                 )
            //                 codes.push(org.ntee_code ? org.ntee_code : "None");
            //             })
            //         } else {
            //             this.organizationsPage.spinner = false;
            //         }
            //         if (codes.length > 0) {
            //             fetch(`http://localhost:6300/ntee?code=${codes.join("&code=")}`).then(response => response.json()).then(data => {
            //                 for (let i = 0; i < this.organizations.length; i++) {
            //                     this.organizations[i]["category"] = data[this.organizations[i].ntee].category;
            //                     this.organizations[i]["description"] = data[this.organizations[i].ntee].description;
            //                 }
            //                 this.organizationsPage.spinner = false;
            //             })
            //         }
            //     })
        },
        getOrganizationStates: function () {
            fetch(`http://localhost:6300/states`).then(response => response.json()).then(data => {
                this.organizationsStates = data;
                this.organizationsFilteredStates = data;
            })
        },
        getOrganizationCategories: function () {
            fetch(`http://localhost:6300/categories`).then(response => response.json()).then(data => {
                this.organizationsCategories = data;
                this.organizationsFilteredCategories = data
            });
        },
        submitSearchForOrganizations: function () {
            this.organizationsPage.current = 0;
            this.organizations = [];
            this.getOrganizations(this.search);
        },
        toggleOrganizationsSearchFilter: function () {
            this.organizationsSearchFilterShow = !this.organizationsSearchFilterShow;
        },
        organizationsFilterSelectState: function (state) {
            this.organizationsSearchFilterState = Object.assign({}, state);
            this.organizationsFilteredStates = [];
        },
        organizationsFilterSelectCategory: function (category) {
            this.organizationsSearchFilterCategory = Object.assign({}, category);
            this.organizationsFilteredCategories = [];
        },
        orgPageNavigationNext: function () {
            if (this.organizationsPage.current >= this.organizationsPage.total) return;
            this.organizationsPage.current++;
            this.organizations = [];
            this.getOrganizations(this.search);
        },
        orgPageNavigationPrevious: function () {
            if (this.organizationsPage.current <= 0) return;
            this.organizationsPage.current--;
            this.organizations = [];
            this.getOrganizations(this.search);
        },
        sortNames: function () {
            if (this.sortOrder == 'asc') {
                function compare(a, b) {
                    if (a.orgname > b.orgname) return -1;
                    if (a.orgname < b.orgname) return 1;
                    return 0;
                }
                this.sortOrder = 'desc';
            } else {
                function compare(a, b) {
                    if (a.orgname < b.orgname) return -1;
                    if (a.orgname > b.orgname) return 1;
                    return 0;
                }
                this.sortOrder = 'asc';
            }
            this.organizations.sort(compare);
        },
        sortCities: function () {
            if (this.sortOrderCities == 'asc') {
                function compare(a, b) {
                    if (a.city < b.city) return -1;
                    if (a.city > b.city) return 1;
                    return 0;
                }
                this.sortOrderCities = 'desc';
            } else {
                function compare(a, b) {
                    if (a.city > b.city) return -1;
                    if (a.city < b.city) return 1;
                    return 0;
                }
                this.sortOrderCities = 'asc';
            }
            this.organizations.sort(compare);
        },
        indexAskLocationAccept: function () {
            this.indexLocation.askForLocation = false;
        },
        dropdownOrgSelection: function (name) {
            this.volunteerorgsearch = name;
        },
        // VOLUNTEERFORM.HTML STUFF
        toggleVolunteerPostModal: function (index = null) {
            this.toggleModal = !this.toggleModal;
            if (index !== null) {
                let modal = this.volunteerOpportunities[index];
                this.volunteerPostModal.index = index;
                this.volunteerPostModal.user = modal.user;
                this.volunteerPostModal.title = modal.title;
                this.volunteerPostModal.orgname = modal.orgname;
                this.volunteerPostModal.city = modal.city;
                this.volunteerPostModal.state = modal.state;
                this.volunteerPostModal.dateStart = modal.dateStart;
                this.volunteerPostModal.dateEnd = modal.dateEnd;
                this.volunteerPostModal.description = modal.description;
                this.volunteerPostModal.num_people = modal.num_people;
                this.volunteerPostModal.website = modal.website;
            }
        },
        // GET, POST, DELETE VOLUNTEER OPPORTUNITIES STUFF
        getVolunteerOpportunities: function () {
            fetch('http://localhost:6300/volunteerOpportunities')
                .then(response => response.json()).then((data) => {
                    this.volunteerOpportunities = data;
                });
        },
        addVolunteerOpportunities: function () {
            myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            var encodedData = {
                user: this.newVolunteerPost.user,
                title: this.newVolunteerPost.title,
                orgname: this.newVolunteerPost.orgname,
                city: this.newVolunteerPost.city,
                state: this.newVolunteerPost.state,
                dateStart: this.newVolunteerPost.dateStart,
                dateEnd: this.newVolunteerPost.dateEnd,
                description: this.newVolunteerPost.description,
                num_people: this.newVolunteerPost.num_people,
                website: this.newVolunteerPost.website
            }
            console.log(encodedData);
            var requestOptions = {
                method: "POST",
                body: JSON.stringify(encodedData),
                headers: {
                    "Content-Type": "application/json"
                }
            };

            fetch("http://localhost:6300/volunteerOpportunities", requestOptions)
                .then((response) => {
                    if (response.status === 201) {
                        response.json().then((data) => {
                            this.volunteerOpportunities.push(data);
                            this.newVolunteerPost = {};
                        });
                    } else {
                        alert("Not able to post volunteer opportunity");
                    }
                });
        },
        deleteVolunteerOpportunities: function (index) {
            var volpostId = this.expenses[index]._id;
            var requestOptions = {
                method: "DELETE"
            };
            fetch(`http://localhost:6300/volunteerOpportunities/${volpostId}`, requestOptions)
                .then((response) => {
                    if (response.status === 204) {
                        console.log("success");
                        this.volunteerOpportunities.splice(index, 1);
                    } else {
                        alert("Unable to delete expense");
                    }
                });
        },
        getTrialOrganizations: function () {
            fetch(`http://localhost:6300/localOrganizations`)
                .then(response => response.json())
                .then(data => {
                    data.forEach((organization) => {
                        this.trialOrganizations.push(organization.name);
                        console.log(this.trialOrganizations);
                    })
                })
        }
    },
    watch: {
        'organizationsSearchFilterState.name'(newState, oldState) {
            if (!this.organizationsStates.find(state => {
                return newState
                    .toLowerCase() == state.name.toLowerCase();
            })) {
                this.organizationsSearchFilterState.abbreviation = '';
            };
            this.organizationsFilteredStates = this.organizationsStates.filter((state) => {
                return state.abbreviation
                    .toLowerCase()
                    .startsWith(newState.toLowerCase()) ||
                    state.name
                        .toLowerCase()
                        .startsWith(newState.toLowerCase());
            });
        },
        'organizationsSearchFilterCategory.category'(newCategory, oldCategory) {
            if (!this.organizationsCategories.find(category => {
                return newCategory
                    .toLowerCase() == category.category.toLowerCase();
            })) {
                this.organizationsSearchFilterCategory.ntee_num = '';
            };
            this.organizationsFilteredCategories = this.organizationsCategories.filter((category) => {
                return category.category
                    .toLowerCase()
                    .includes(newCategory.toLowerCase());
            })
        },
        'indexLocation.askForLocation'(newAskForLocation, oldAskForLocation) {
            this.indexLocation.spinner = true;
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    fetch('http://localhost:6300/location?ip=' + data.ip).then((response) => {
                        if (response.status === 200) {
                            this.indexLocation.spinner = false;
                            return response.json();
                        } else {
                            console.log("Couldn't get location", response.status);
                        }
                    }).then((data) => {
                        let loc = data.loc.split(",");
                        let ipLocation = {
                            city: data.city ? data.city : "",
                            state: data.region ? data.region : "",
                            country: data.country ? data.country : "",
                            latitude: -91,
                            longitude: -181,
                        }
                        ipLocation.latitude = Number(loc[0]);
                        ipLocation.longitude = Number(loc[1]);
                        if (ipLocation.latitude != -91 && ipLocation.longitude != -181) {
                            var Stadia_AlidadeSmoothDark = new L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                                maxZoom: 20,
                                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OSM</a>'
                            });
                            let location = [ipLocation.latitude, ipLocation.longitude];
                            var map = new L.Map("map", {
                                center: location,
                                zoom: 12,
                                minZoom: 12,
                                maxZoom: 15,
                                // zoomControl: false
                            })
                                .addLayer(Stadia_AlidadeSmoothDark);
                            // map.touchZoom.disable();
                            // map.doubleClickZoom.disable();
                            map.scrollWheelZoom.disable();
                            // map.boxZoom.disable();
                            // map.keyboard.disable();
                            fetch(`http://localhost:6300/localOrganizations`)
                                .then(response => response.json())
                                .then(data => {
                                    data.forEach((organization) => {
                                        let marker = L.marker([organization.location.latitude, organization.location.longitude]).addTo(map);
                                        marker.bindPopup(`<b>${organization.name}</b><br/><a href=${organization.link}>${organization.link}</a>`);
                                    })
                                })
                        } else {
                            console.log("No Map for you");
                        }
                    })
                })
                .catch(error => {
                    console.log('Error:', error);
                }
                );
        },
        volunteerorgsearch(newsearch, oldsearch) {
            this.filteredTrialOrganizations = this.trialOrganizations.filter((name) => {
                return name.toLowerCase().includes(newsearch.toLowerCase());
            })
            console.log(this.filteredOrganizations);
        }
    },
    created: function () {
    },
    mounted: function () {
        if (this.page == 'index') {
            console.log("index");
        } else if (this.page == 'organizations') {
            this.getOrganizations();
            this.getOrganizationStates();
            this.getOrganizationCategories();
        } else if (this.page == 'volunteerForm') {
            this.getTrialOrganizations();
        }
    },
}).mount("#app");