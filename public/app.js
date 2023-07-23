var URL = "http://localhost:6300/";
// var URL = "https://aidhub-production.up.railway.app/";
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
            gettingStatus: true,

            state: "",
            states: [],
            showStateDropdown: false,
            filteredStates: [],

            showOrganizationDropdown: false,
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
            organizationsCategories: [],

            organizationsSearchFilterState: {
                name: "",
                abbreviation: ""
            },

            organizationsShowCategoryDropdown: false,
            organizationsSearchFilterCategory: {
                category: "",
                ntee_num: ""
            },
            organizationsFilteredCategories: [],
            /* organizations.html end */

            volunteerOpportunities: [],
            allVolunteerOpportunities: [], // Keeps a copy of volunteerOpportunities
            filteredVolunteerOpportunities: [], // Store the filtered and sorted volunteer opportunities
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
                website: "",
                numLikes: 0,
            },
            toggleModal: false,
            formattedStartDate: "",
            formattedEndDate: "",

            // TRIAL STUFF
            organizations: [],
            filteredOrganizations: [],
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
        getStates: function () {
            fetch(URL + `states`).then(response => response.json()).then(data => {
                this.states = data;
                this.filteredStates = data;
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
        selectState: function (state) {
            if (this.page == 'organizations') {
                this.organizationsSearchFilterState = Object.assign({}, state);
            }
            this.state = state.name;
            this.filteredStates = [];
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
        // VOLUNTEER OPPORTUNITIES STUFF
        getVolunteerOpportunities: function () {
            fetch(URL + 'volunteerOpportunities')
                .then(response => response.json()).then((data) => {
                    data.forEach((post) => {
                        var formattedDates = this.formatDate(post.dateStart, post.dateEnd);
                        post.formattedStartDate = formattedDates.formattedStartDate;
                        post.formattedEndDate = formattedDates.formattedEndDate;
                        // Initialize numLikes to 0 if it doesn't exist in the data
                        post.numLikes = post.numLikes || 0;
                        this.volunteerOpportunities.push(post);
                    })

                    this.allVolunteerOpportunities = [...this.volunteerOpportunities];
                });
        },
        addVolunteerOpportunities: function () {
            myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            var encodedData = {
                user: this.user.name,
                title: this.newVolunteerPost.title,
                orgname: this.newVolunteerPost.orgname,
                city: this.newVolunteerPost.city,
                state: this.state,
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
                },
                credentials: "include"
            };

            fetch(URL + "volunteerOpportunities", requestOptions)
                .then((response) => {
                    if (response.status === 201) {
                        response.json().then((data) => {
                            this.volunteerOpportunities.push(data);
                            this.getVolunteerOpportunities();
                            this.newVolunteerPost = {
                                title: "",
                                description: "",
                                orgname: "",
                                city: "",
                                state: "",
                                dateStart: "",
                                dateEnd: "",
                                num_people: 0,
                                website: ""
                            };
                            window.location.href = "volunteer.html";
                        });
                    } else {
                        alert("Not able to post volunteer opportunity");
                    }
                });
        },
        updateVolunteerOpportunities: function(index) {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var encodedData = {
                user: this.user.name,
                title: this.newVolunteerPost.title,
                orgname: this.newVolunteerPost.orgname,
                city: this.newVolunteerPost.city,
                state: this.state,
                dateStart: this.newVolunteerPost.dateStart,
                dateEnd: this.newVolunteerPost.dateEnd,
                description: this.newVolunteerPost.description,
                num_people: this.newVolunteerPost.num_people,
                website: this.newVolunteerPost.website
            }

            var requestOptions = {
                method: "PUT",
                body: JSON.stringify(encodedData),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            };
            var volpostId = this.volunteerOpportunities[index]._id;
            console.log(volpostId);
            fetch(URL + `volunteerOpportunities/${volpostId}`, requestOptions)
            .then((response) => {
                if (response.status === 204) {
                    this.volunteerOpportunities[this.newVolunteerPost.index].user = this.user.name;
                    this.volunteerOpportunities[this.newVolunteerPost.index].title = this.newVolunteerPost.title;
                    this.volunteerOpportunities[this.newVolunteerPost.index].orgname = this.newVolunteerPost.orgname;
                    this.volunteerOpportunities[this.newVolunteerPost.index].city = this.newVolunteerPost.city;
                    this.volunteerOpportunities[this.newVolunteerPost.index].state = this.newVolunteerPost.state;
                    this.volunteerOpportunities[this.newVolunteerPost.index].dateStart = this.newVolunteerPost.dateStart;
                    this.volunteerOpportunities[this.newVolunteerPost.index].dateEnd = this.newVolunteerPost.dateEnd;
                    this.volunteerOpportunities[this.newVolunteerPost.index].description = this.newVolunteerPost.type;
                }
            })
        },
        deleteVolunteerOpportunities: function (index) {
            var volpostId = this.volunteerOpportunities[index]._id;
            var requestOptions = {
                method: "DELETE",
                credentials: "include"
            };
            fetch(URL + `volunteerOpportunities/${volpostId}`, requestOptions)
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
        likePost: function(index) {
            console.log("likePost called with index:", index);
            if (index >= 0 && index < this.volunteerOpportunities.length) {
                this.volunteerOpportunities[index].numLikes++;
            }
            console.log("post.numLikes:", this.volunteerOpportunities[index].numLikes);
        },
        filterBy: function(filterType) {
            // Show all volunteer opportunities
            if (filterType === 'all') {
                this.allVolunteerOpportunities = [...this.volunteerOpportunities];
            // Show volunteer opportunities ending soon
            } else if (filterType === 'oldest') {
                let currentDate = new Date();
                // Filter the opportunities that have a valid end date and the end date 
                // is greater than or equal to the current date
                let endingSoonOpportunities = this.volunteerOpportunities.filter((post) => {
                    return (
                        post.formattedEndDate && new Date(post.formattedEndDate) >= currentDate
                    );
                });
                // Sort the filtered opportunities by their end dates in ascending order
                endingSoonOpportunities.sort((a,b) => new Date(a.dateEnd) - new Date(b.dateEnd));

                // Update the displayed opportunities with the sorted and filtered list
                this.volunteerOpportunities = endingSoonOpportunities;
            }
        },
        getOrganizationsDropdown: function () {
            fetch(URL + `localOrganizations`)
                .then(response => response.json())
                .then(data => {
                    data.forEach((organization) => {
                        this.organizations.push(organization.name);
                        this.filteredOrganizations.push(organization.name);
                        // console.log(this.trialOrganizations);
                    })
                })
        },
        selectOrganization: function (organization) {
            this.newVolunteerPost.orgname = organization;
            this.filteredOrganizations = [];
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
                        this.user = data;
                        /* do something if logged in */
                    } else {
                        this.loggedInStatus = false;
                        if (this.page == 'volunteerForm') {
                            window.location.href = "login.html";
                        }
                    }
                    this.gettingStatus = false;
                }).catch(error => {
                    this.loggedInStatus = false;
                    console.log(error);
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
                this.page = "";
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
            this.getPreviousPage();
            if (this.previousPage == 'volunteerForm') {
                this.previousPage = 'volunteer';
            }
            window.location.href = this.previousPage + ".html";
        },
        goToVolunteerForm: function () {
            this.setPage('volunteerForm');
            if (this.loggedInStatus) {
                window.location.href = "volunteerForm.html";
            } else {
                window.location.href = "login.html";
            }
        },
    },
    watch: {
        state(newState, oldState) {
            this.organizationsSearchFilterState.name = newState;
            if (!this.states.find(state => {
                return newState
                    .toLowerCase() == state.name.toLowerCase();
            })) {
                this.organizationsSearchFilterState.abbreviation = '';
            };
            this.filteredStates = this.states.filter((state) => {
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
                this.indexLocation.spinner = false;
                if (response.status === 200) {
                    return response.json();
                } else {
                    console.log("Couldn't get location", response.status);
                    return {
                        city: "St. George",
                        region: "UT",
                        country: "US",
                        loc: "37.1041,-113.5841"
                    }
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
        'newVolunteerPost.orgname'(newsearch, oldsearch) {
            this.filteredOrganizations = this.organizations.filter(organization => { return organization.toLowerCase().includes(newsearch.toLowerCase()) });
        },
        loggedInStatus(newStatus, oldStatus) {
            // needed to redirect to volunteer page after logging out
            this.getPreviousPage();
            if (newStatus === false && this.previousPage == 'volunteerForm') {
                window.location.href = "volunteer.html";
            }
        },
    },
    created: function () {
        this.loggedIn();
        // Set allVolunteerOpportunities initially when the component is created
        this.allVolunteerOpportunities = [...this.volunteerOpportunities];
        // Set filteredVolunteerOpportunities to allVolunteerOpportunities to display all posts initially
        this.filteredVolunteerOpportunities = [...this.volunteerOpportunities];
    },
    mounted: function () {
        if (this.page == 'index') {
            this.setPage('index');
        } else if (this.page == 'organizations') {
            this.setPage('organizations');
            this.getOrganizations();
            this.getStates();
            this.getOrganizationCategories();
        } else if (this.page == 'volunteer') {
            this.setPage('volunteer');
            this.getVolunteerOpportunities();
        } else if (this.page == 'volunteerForm') {
            this.setPage('volunteerForm');
            this.getStates();
            this.getOrganizationsDropdown();
        }
    },
}).mount("#app");