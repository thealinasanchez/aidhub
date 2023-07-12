Vue.createApp({
    data() {
        return {
            organizations: [],
            search: "",
            filteredOrganizations: [],
            sortNames: "",
            newOrganization: {
                orgname: "",
                location: {
                    city: "",
                    state: ""
                },
                missionStatement: ""
            }
        }
    },
    methods : {
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
            if (this.sortNames == 'asc') {
                function compare(a,b) {
                    if (a.amount > b.amount) return -1;
                    if (a.amount < b.amount) return 1;
                    return 0;
                }
                this.sortNames = 'desc';
            } else {
                function compare(a,b) {
                    if (a.amount < b.amount) return -1;
                    if (a.amount > b.amount) return 1;
                    return 0;
                }
                this.sortNames = 'asc';
            }
            this.organizations.sort(compare);
        },
        updateOrganization: function() {
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            
            var encodedData = "orgname=" + encodeURIComponent(this.newOrganization.orgname) +
                                "&location=" + encodeURIComponent(this.newOrganization.location) +
                                "&missionStatement" + encodeURIComponent(this.newOrganization.missionStatement);
            var requestOptions = {
                method: 'PUT',
                body: encodedData,
                headers: myHeaders
            };
            var orgId = this.expenses[this.modal.index]._id;
            console.log(orgId);
            fetch(`http://localhost:8080/organizations/${orgId}`, requestOptions)
            .then((response) => {
                if (response.status == 204) {
                    this.organizations[this.modal.index].orgname = this.newOrganization.orgname;
                    this.organizations[this.modal.index].location = this.newOrganization.location;
                    this.organizations[this.modal.index].missionStatement = this.newOrganization.missionStatement;
                }
            })
        },
        addOrganization: function() {
            myHeaders = new Headers();
            // first param is the header, second param is content of header
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            var encodedData = "orgname=" + encodeURIComponent(this.modal.orgname) +
                                "&location=" + encodeURIComponent(this.modal.location) +
                                "&missionStatement" + encodeURIComponent(this.modal.missionStatement);
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
    created : function() {
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
    }
}).mount("#app");