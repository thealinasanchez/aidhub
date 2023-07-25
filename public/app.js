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
                about: "I have a passion for helping others and I want to make a difference in my community.",
                email: "",
                password: "",
            },
            userProfileImage: "",
            userProfileImageURL: "",
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
                type: "",
                orgname: "",
                city: "",
                state: "",
                dateStart: "",
                dateEnd: "",
                description: "",
                num_people: 0,
                website: "",
                numLikes: 0,
                liked: false
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


            editProfile: {
                userId: "",
                profileImage: null,
                profileImageUrl: "",
                profileImageError: false,
                nameEditToggle: false,
                nameError: false,
                name: "",
                aboutEditToggle: false,
                aboutError: false,
                about: "",
                emailEditToggle: false,
                emailError: false,
                email: "",
                // currentPassword: "",
                password: "",
                passwordEditToggle: false,
                confirmPassword: "",
                passwordMessage: "",
                deleteAccountToggle: false
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
                        post.user = post.postedBy.name ? post.postedBy.name : "Anonymous";
                        // Initialize numLikes to 0 if it doesn't exist in the data
                        post.numLikes = post.numLikes || 0;
                        this.volunteerOpportunities.push(post);
                    })

                    this.allVolunteerOpportunities = [...this.volunteerOpportunities];
                }).catch((error) => {
                    console.error("Error fetching volunteer opportunities:", error);
                })
        },
        getVolunteerOpportunitiesByUser: function (userId) {
            this.volunteerOpportunities = [];
            fetch(URL + `volunteerOpportunities/user/${userId}`)
                .then(response => response.json()).then((data) => {
                    data.forEach((post) => {
                        var formattedDates = this.formatDate(post.dateStart, post.dateEnd);
                        post.formattedStartDate = formattedDates.formattedStartDate;
                        post.formattedEndDate = formattedDates.formattedEndDate;
                        post.user = post.postedBy.name ? post.postedBy.name : "Anonymous";
                        this.volunteerOpportunities.push(post);
                    })
                });
        },
        addVolunteerOpportunities: function () {
            if (!localStorage.getItem('userId')) {
                console.log("couldn't Post Volunteer opportunities because local storage wasn't used")
                return
            }
            myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            var encodedData = {
                title: this.newVolunteerPost.title,
                orgname: this.newVolunteerPost.orgname == "" ? "personal" : this.newVolunteerPost.orgname,
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
                            console.log(data);
                            this.newVolunteerPost = {
                                title: "",
                                type: "",
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
        updateVolunteerOpportunities: function (index) {
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

            // Get the year, month, and day from the Date objects
            var startYear = startDate.getFullYear();
            var startMonth = startDate.getMonth() + 1;
            var startDay = startDate.getDate();

            // Create formatted date strings
            var formattedStartDate = `${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}-${startYear}`;
            if (dateEnd) {
                var endDate = new Date(dateEnd);
                var endYear = endDate.getFullYear();
                var endMonth = endDate.getMonth() + 1;
                var endDay = endDate.getDate();
                var formattedEndDate = `${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}-${endYear}`;
                return {
                    formattedStartDate: formattedStartDate,
                    formattedEndDate: formattedEndDate
                }
            } else {
                return {
                    formattedStartDate: formattedStartDate
                }
            }
        },
        likePost: function(postId) {
            
        },
        filterBy: function (filterType) {
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
                endingSoonOpportunities.sort((a, b) => new Date(a.dateEnd) - new Date(b.dateEnd));

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
                        this.userProfileImage = `https://my-profile-photos-bucket.s3.us-west-1.amazonaws.com/${data.userId}-profile-picture.jpg?v=${Date.now()}`;
                        this.user = data;
                        this.loggedInStatus = true;
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
                            console.log(data);
                            this.loggedInStatus = true;
                            this.getPreviousPage();
                            this.user.name = data.name;
                            localStorage.setItem("userId", data.userId);
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
                    if (localStorage.getItem("userId")) {
                        localStorage.removeItem("userId");
                    }
                } else {
                    console.log("Couldn't log out", response.status);
                }
                this.page = "";
                this.user.name = "";
                this.user.email = "";
                this.user.password = "";
            });
        },
        deleteAccount: function () {
            let options = {
                method: "DELETE",
                credentials: "include"
            }
            fetch(URL + `users/${localStorage.getItem("userId")}`, options).then(response => {
                this.logout();
                this.loggedInStatus = false;
                if (response.status == 204) {
                } else {
                    alert("Couldn't delete account", response.status);
                }
                this.user.name = "";
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
        checkLoginAndGoToEditProfile: function () {
            if (this.loggedInStatus) {
                window.location.href = "privateProfile.html";
            } else {
                window.location.href = "login.html";
            }
        },
        getUserInformation: function () {
            let options = {
                credentials: "include"
            }
            if (!localStorage.getItem("userId")) {
                window.location.href = "login.html";
            }
            fetch(URL + `users/${localStorage.getItem("userId")}`, options)
                .then((response) => {
                    if (response.status == 401) {
                        window.location.href = "login.html";
                    } else {
                        return response.json()
                    }
                })
                .then(data => {
                    this.user = data;
                    this.editProfile.userId = data._id;
                    this.getUserProfileImage(data._id);
                }).catch(
                    (error) => {
                        console.log("Failed to fetch user information", error);
                    }
                )
        },
        editProfileSubmit: function (input) {
            if (!localStorage.getItem('userId')) {
                console.log("User data Not saved on local storage")
                return
            }
            let myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            let options = {
                method: "PUT",
                credentials: "include",
                headers: myHeaders,
                body: JSON.stringify(input)
            }
            fetch(URL + `users/${localStorage.getItem('userId')}`, options)
                .then((response) => {
                    if (response.status == 200) {
                        this.getVolunteerOpportunitiesByUser();
                        this.editProfile.nameEditToggle = false;
                        this.editProfile.aboutEditToggle = false;
                        this.editProfile.emailEditToggle = false;
                        this.editProfile.passwordEditToggle = false;
                        response.json().then(data => {
                            this.user.name = data.name;
                            this.user.about = data.about;
                            this.user.email = data.email;
                            this.editProfile.name = data.name;
                            this.editProfile.about = data.about;
                            this.editProfile.email = data.email;
                        });
                        this.user.password = "";
                    } else if (response.status == 401) {
                        window.location.href = "login.html";
                    } else if (response.status == 422) {
                        if (input.hasOwnProperty("name")) {
                            this.editProfile.nameError = true;
                        } else if (input.hasOwnProperty("email")) {
                            this.editProfile.emailError = true;
                        }
                    }
                })
        },
        editProfileNameToggle: function () {
            this.editProfile.nameError = false;
            this.editProfile.nameEditToggle = !this.editProfile.nameEditToggle;
            this.editProfile.name = this.user.name;
        },
        editProfileNameSubmit: function () {
            this.editProfile.nameError = false;
            this.editProfileSubmit({ name: this.editProfile.name });
        },
        editProfileAboutToggle: function () {
            this.editProfile.aboutEditToggle = !this.editProfile.aboutEditToggle;
            this.editProfile.about = this.user.about;
        },
        editProfileAboutSubmit: function () {
            this.editProfileSubmit({ about: this.editProfile.about });
        },
        editProfileEmailToggle: function () {
            this.editProfile.emailError = false;
            this.editProfile.emailEditToggle = !this.editProfile.emailEditToggle;
            this.editProfile.email = this.user.email;
        },
        editProfileEmailSubmit: function () {
            this.editProfile.emailError = false;
            this.editProfileSubmit({ email: this.editProfile.email });
        },
        editProfilePasswordToggle: function () {
            this.editProfile.passwordEditToggle = !this.editProfile.passwordEditToggle;
            this.editProfile.password = "";
            this.editProfile.confirmPassword = "";
            this.editProfile.passwordMessage = "";
        },
        editProfilePasswordSubmit: function () {
            if (this.editProfile.password != this.editProfile.confirmPassword) {
                this.editProfile.passwordMessage = "Passwords do not match";
                return;
            }
            this.editProfileSubmit({ password: this.editProfile.password });
        },
        editProfileDeleteAccountToggle: function () {
            this.editProfile.deleteAccountToggle = !this.editProfile.deleteAccountToggle;
        },
        editProfileDeleteAccount: function () {
            this.deleteAccount();
            window.location.href = "index.html";
            this.loggedInStatus = false;
        },
        uploadUserProfileImage: function (event) {
            this.editProfile.profileImage = event.target.files[0];
            this.postUserProfileImage();
        },
        postUserProfileImage: function () {
            this.editProfile.profileImageError = false;
            if (this.editProfile.profileImage == null) {
                console.log("No file selected");
                return;
            } else if (!localStorage.getItem('userId')) {
                console.log("User data Not saved on local storage")
                return;
            } else if (!/^[^.]+\.(jpg|jpeg)$/ig.test(this.editProfile.profileImage.name)) {
                this.editProfile.profileImageError = true;
                console.log("Invalid file type");
                return;
            }
            const formData = new FormData();
            formData.append("file", this.editProfile.profileImage);

            let myHeaders = new Headers();
            let options = {
                method: "POST",
                credentials: "include",
                headers: myHeaders,
                body: formData
            }
            fetch(URL + `userProfile/${localStorage.getItem("userId")}`, options)
                .then((response) => {
                    console.log(response)
                    if (response.status == 201) {
                        this.editProfile.profileImageUrl = '';
                        this.getUserProfileImage(localStorage.getItem("userId"));
                    } else if (response.status == 401) {
                        window.location.href = "login.html";
                    }
                })
        },
        getUserProfileImage: function (userId) {
            this.editProfile.profileImageUrl = `https://my-profile-photos-bucket.s3.us-west-1.amazonaws.com/${userId}-profile-picture.jpg?v=${Math.random()}`;
        },
        goToPublicProfile: function (userId) {
            localStorage.setItem("publicProfileId", userId);
            window.location.href = `publicProfile.html`;
        },
        getPublicProfile: function () {
            let userId = localStorage.getItem("publicProfileId");
            if (!userId) {
                window.location.href = "index.html";
            }
            fetch(URL + `users/profile/${userId}`)
                .then(response => response.json())
                .then(data => {
                    this.user = data;
                    this.userProfileImageURL = `https://my-profile-photos-bucket.s3.us-west-1.amazonaws.com/${userId}-profile-picture.jpg?v=${Math.random()}`;
                    this.getVolunteerOpportunitiesByUser(data._id);
                }).catch(error => {
                    console.log(error);
                    window.location.href = "index.html";
                })
        }
    },
    /*                                                     WATCHERS                                                     */
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
            } else if (newStatus === false && this.page == 'privateProfile') {
                window.location.href = "index.html";
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
        } else if (this.page == 'privateProfile') {
            this.getUserInformation();
            this.getVolunteerOpportunitiesByUser(localStorage.getItem("userId") ? localStorage.getItem("userId") : "");
        } else if (this.page == 'publicProfile') {
            this.getPublicProfile();
        }
    },
}).mount("#app");