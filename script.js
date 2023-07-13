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
            sortOrder: "",
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
        getOrganizations: function() {
            fetch("http://localhost:8080/organizations")
            .then((response) => response.json())
            .then((data) => {
                this.organizations = data;
            });
        },
        resetSearch: function() {
            this.search = "";
        },
        sortNames: function() {
            if (this.sortOrder == 'asc') {
                function compare(a,b) {
                    if (a.orgname > b.orgname) return -1;
                    if (a.orgname < b.orgname) return 1;
                    return 0;
                }
                this.sortOrder = 'desc';
            } else {
                function compare(a,b) {
                    if (a.orgname < b.orgname) return -1;
                    if (a.orgname > b.orgname) return 1;
                    return 0;
                }
                this.sortOrder = 'asc';
            }
            this.organizations = this.organizations.sort(compare);
        },
        updateOrganization: function() {
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
        addOrganization: function() {
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
                if(response.status === 201) {
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
                return org.city
                    .toLowerCase()
                    .includes(newSearch.toLowerCase());
            });
        }
    }
}).mount("#app");