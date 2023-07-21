var URL = "http://localhost:6300/";
Vue.createApp({
    data() {
        return {
            page: '',
            getStartedForm: {
                open: false
            },
            user: {
                name: "",
                email: "",
                password: "",
            },
            loggedInStatus: false,
            previousPage: 'index',
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
            formattedStartDate: "",
            formattedEndDate: "",
            // TRIAL STUFF
            trialOrganizations: [],
            filteredTrialOrganizations: [],
            volunteerorgsearch: "",
            volunteerformbutton: true,
            volunteersearch: "",
            watchedValue: "",
            toggleVolunteerSearchModal: true,
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
            this.organizationsPage.spinner = true;
            let codes = [];
            fetch(URL + `organizations?${newQuery}`)
                .then(response => response.json())
                .then(data => {
                    this.organizationsPage.results = data.total_results;
                    this.organizationsPage.current = data.cur_page;
                    this.organizationsPage.total = data.num_pages;
                    if (data.organizations.length != 0) {
                        data.organizations.forEach(org => {
                            this.organizations.push(
                                {
                                    orgname: org.name,
                                    city: org.city,
                                    state: org.state,
                                    ein: org.ein,
                                    ntee: org.ntee_code ? org.ntee_code : "None",
                                    category: "",
                                    description: ""
                                }
                            )
                            codes.push(org.ntee_code ? org.ntee_code : "None");
                        })
                    } else {
                        this.organizationsPage.spinner = false;
                    }
                    if (codes.length > 0) {
                        fetch(URL + `ntee?code=${codes.join("&code=")}`).then(response => response.json()).then(data => {
                            for (let i = 0; i < this.organizations.length; i++) {
                                this.organizations[i]["category"] = data[this.organizations[i].ntee].category;
                                this.organizations[i]["description"] = data[this.organizations[i].ntee].description;
                            }
                            this.organizationsPage.spinner = false;
                        })
                    }
                })
        },
        getOrganizationStates: function () {
            fetch(URL + `states`).then(response => response.json()).then(data => {
                this.organizationsStates = data;
                this.organizationsFilteredStates = data;
            })
        },
        getOrganizationCategories: function () {
            fetch(URL + `categories`).then(response => response.json()).then(data => {
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
                    data.forEach((post) => {
                        var formattedDates = this.formatDate(post.dateStart, post.dateEnd);
                        post.formattedStartDate = formattedDates.formattedStartDate;
                        post.formattedEndDate = formattedDates.formattedEndDate;
                        this.volunteerOpportunities.push(post);
                    })
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
                            this.getVolunteerOpportunities();
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
                        alert("Unable to delete volunteer post");
                    }
                });
        },
        formatDate: function (dateStart, dateEnd) {
            // Convert the date strings into Date objects
            var startDate = new Date(dateStart);
            var endDate = new Date(dateEnd);

            // Get the year, month, and day from the Date objects
            var startYear = startDate.getFullYear();
            var startMonth = startDate.getMonth() + 1;
            var startDay = startDate.getDate();
            
            var endYear = endDate.getFullYear();
            var endMonth = endDate.getMonth() + 1;
            var endDay = endDate.getDate();

            // Create formatted date strings
            var formattedStartDate = `${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}-${startYear}`;
            var formattedEndDate = `${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}-${endYear}`;

            return {
                formattedStartDate: formattedStartDate,
                formattedEndDate: formattedEndDate
            }

        },
        getTrialOrganizations: function () {
            fetch(`http://localhost:6300/localOrganizations`)
                .then(response => response.json())
                .then(data => {
                    data.forEach((organization) => {
                        this.trialOrganizations.push(organization.name);
                        // console.log(this.trialOrganizations);
                    })
                })
        },
        /* user stuff */
        loggedIn: function () {
            let options = {
                credentials: "include"
            }
            fetch(URL + "session", options)
                .then(response => response.json())
                .then(data => {
                    if (data && data.cookie && data.userId) {
                        this.loggedInStatus = true;
                        /* do something if logged in */
                    } else {
                        this.loggedInStatus = false;
                        /* do something if not logged in*/
                    }
                })
        },
        signUp: function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            let options = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(this.user)
            }
            fetch(URL + "users", options).then(response => {
                if (response.status == 201) {
                    this.createSession();
                } else {
                    response.text().then(text => alert(text));
                }
            });
        },
        createSession: function () {
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            let options = {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(this.user),
                credentials: "include"
            }
            fetch(URL + "session", options).then(response => {
                if (response.status == 201) {
                    response.text().then(data => {
                        if (data) {
                            data = JSON.parse(data);
                            this.loggedInStatus = true;
                            // this.page = "" go to volunteer page with access to form
                            this.getPreviousPage();
                            this.user.name = data.name;
                            window.location.href = this.previousPage + ".html";
                        } else {
                            alert("No session created");
                        }
                    })
                } else {
                    response.text().then(text => alert(text));
                }
            });
        },
        logout: function () {
            let options = {
                method: "DELETE",
                credentials: "include"
            }
            fetch(URL + "session", options).then(response => {
                if (response.status == 204) {
                    this.loggedInStatus = false;
                } else {
                    console.log("Couldn't log out", response.status);
                }
                this.page = "auth";
                this.user.name = "";
                this.user.email = "";
                this.user.password = "";
            });
        },
        setPage: function (page) {
            localStorage.setItem("page", page);
        },
        getPreviousPage: function () {
            let page = localStorage.getItem("page");
            if (page) {
                this.previousPage = page;
            }
        },
        goBackToPreviousPage: function () {
            window.location.href = this.previousPage + ".html";
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
            /*
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
            fetch(URL + 'location?ip=' + data.ip).then((response) => {
                    */
            fetch(URL + 'location?ip=' + "144.38.184.33").then((response) => {
                if (response.status === 200) {
                    this.indexLocation.spinner = false;
                    return response.json();
                } else {
                    console.log("Couldn't get location", response.status);
                }
            }).then((data) => {
                console.log(data);
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
                    fetch(URL + `localOrganizations`)
                        .then(response => response.json())
                        .then(data => {
                            data.forEach((organization) => {
                                let marker = L.marker([organization.location.latitude, organization.location.longitude]).addTo(map);
                                marker.bindPopup(`<b>${organization.name}</b><br/><a href=${organization.link} target="_blank">${organization.link}</a>`);
                            })
                        })
                } else {
                    console.log("No Map for you");
                }
            })
            /*
            })
            .catch(error => {
                console.log('Error:', error);
            }
            );
            */
        },
        volunteerorgsearch(newsearch, oldsearch) {
            this.filteredTrialOrganizations = this.trialOrganizations.filter(organization => {return organization.toLowerCase().includes(newsearch.toLowerCase())});
            // console.log(this.trialOrganizations.filter(organization => organization.toLowerCase().includes(newsearch.toLowerCase())));
            if (this.filteredTrialOrganizations.length == 1 && this.filteredTrialOrganizations[0] == newsearch) {
                this.filteredTrialOrganizations = [];
            }
        }
    },
    created: function () {
        this.loggedIn();
    },
    mounted: function () {
        this.loggedIn();
        if (this.page == 'index') {
            this.setPage('index');
        } else if (this.page == 'organizations') {
            this.setPage('organizations');
            this.getOrganizations();
            this.getOrganizationStates();
            this.getOrganizationCategories();
        } else if (this.page == 'volunteer') {
            this.setPage('volunteer');
            this.loggedIn();
            this.getTrialOrganizations();
            this.getVolunteerOpportunities();
        } else if (this.page == 'volunteerForm') {
            this.getTrialOrganizations();
        }
    },
}).mount("#app");