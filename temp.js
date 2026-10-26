const form=document.getElementById("application-form");
console.log(form);

const recentApplications=document.getElementById("recent-applications");
const totalCount = document.getElementById("total-count");
const appliedCount = document.getElementById("applied-count");
const interviewCount = document.getElementById("interview-count");
const selectedCount = document.getElementById("selected-count");
const upcomingInterviews = document.getElementById("upcoming-interviews");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const sortOrder = document.getElementById("sort-order");
const interviewRate = document.getElementById("interview-rate");
const selectionRate = document.getElementById("selection-rate");
const resultsCount = document.getElementById("results-count");

let applications = JSON.parse(localStorage.getItem("applications")) || [];


function updateStats() {
    let applied = 0;
    let interview = 0;
    let selected = 0;

    applications.forEach(function(application) {
        if (application.status === "Applied") {
            applied++;
        } else if (application.status === "Interview") {
            interview++;
        } else if (application.status === "Selected") {
            selected++;
        }
    });

    totalCount.textContent = applications.length;
    appliedCount.textContent = applied;
    interviewCount.textContent = interview;
    selectedCount.textContent = selected;
}

function updateConversionRates() {
    const total = applications.length;

    const interview = applications.filter(function(application) {
        return application.status === "Interview";
    }).length;

    const selected = applications.filter(function(application) {
        return application.status === "Selected";
    }).length;

    const interviewPercentage = total === 0
        ? 0
        : (interview / total) * 100;

    const selectionPercentage = total === 0
        ? 0
        : (selected / total) * 100;

    interviewRate.textContent = interviewPercentage.toFixed(1) + "%";
    selectionRate.textContent = selectionPercentage.toFixed(1) + "%";
}


function renderApplications() {
    recentApplications.querySelectorAll(
    ".application-card, .empty-message"
    ).forEach(function(element) {
    element.remove();
});

    const searchText = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedSort = sortOrder.value;
    let filteredApplications = applications.filter(function(application) {
        const matchesSearch =
        application.company.toLowerCase().includes(searchText) ||
        application.job.toLowerCase().includes(searchText);

    const matchesStatus =
        selectedStatus === "All" ||
        application.status === selectedStatus;

    return matchesSearch && matchesStatus;
});
filteredApplications.sort(function(a, b) {
    if (selectedSort === "newest") {
        return new Date(b.date) - new Date(a.date);
    }

    return new Date(a.date) - new Date(b.date);
});
resultsCount.textContent =
    "Showing " + filteredApplications.length +
    " of " + applications.length + " applications";
if (filteredApplications.length === 0) {
    const message = document.createElement("p");
    message.classList.add("empty-message");
    message.textContent = applications.length === 0
        ? "No applications added yet."
        : "No applications match your search or filter.";

    recentApplications.appendChild(message);
}

    filteredApplications.forEach(function(application) {
        const card = document.createElement("div");
        card.classList.add("application-card");

        const companyName = document.createElement("h3");
        companyName.textContent = application.company;

        const jobRole = document.createElement("p");
        jobRole.textContent = application.job;

        const applicationStatus = document.createElement("p");
        applicationStatus.textContent = "Status: " + application.status;
        applicationStatus.classList.add("status", application.status.toLowerCase());

        const applicationDate = document.createElement("p");
        const formattedDate = new Date(
            application.date + "T00:00:00"
        );
        applicationDate.textContent =
        "Application Date: " +
        formattedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const interviewDateText = document.createElement("p");
        if (application.interviewDate) {
            const formattedInterviewDate = new Date(
                application.interviewDate + "T00:00:00"
            );
            interviewDateText.textContent =
            "Interview Date: " +
            formattedInterviewDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            });
        } else {
            interviewDateText.textContent = "Interview not scheduled";
        }

        const interviewNotesText = document.createElement("p");
        interviewNotesText.textContent = application.interviewNotes
            ? "Preparation Notes: " + application.interviewNotes
            : "No preparation notes added";

        
const editButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.classList.add("edit-btn");

const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete";
deleteButton.classList.add("delete-btn");

card.append(
    companyName,
    jobRole,
    applicationStatus,
    applicationDate,
    interviewDateText,
    interviewNotesText,
    editButton,
    deleteButton
);

deleteButton.addEventListener("click", function() {
    const confirmDelete = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) {
        return;
    }

    applications = applications.filter(function(item) {
        return item !== application;
    });

    localStorage.setItem("applications", JSON.stringify(applications));
    renderApplications();
});


editButton.addEventListener("click", function() {
    if (card.querySelector(".edit-form")) {
        return;
    }
    const editForm = document.createElement("form");
    editForm.classList.add("edit-form");

    editForm.innerHTML = `
        <label>Company Name</label>
        <input type="text" name="company" minlength="2" required>

        <label>Job Role</label>
        <input type="text" name="job" minlength="2" required>

        <label>Status</label>
        <select name="status">
            <option ${application.status === "Applied" ? "selected" : ""}>Applied</option>
            <option ${application.status === "Interview" ? "selected" : ""}>Interview</option>
            <option ${application.status === "Selected" ? "selected" : ""}>Selected</option>
            <option ${application.status === "Rejected" ? "selected" : ""}>Rejected</option>
        </select>

        <label>Application Date</label>
        <input type="date" name="date" value="${application.date}" required>

        <label>Interview Date</label>
        <input type="date" name="interviewDate" value="${application.interviewDate || ""}">

        <label>Interview Preparation Notes</label>
        <textarea name="interviewNotes" rows="3">${application.interviewNotes || ""}</textarea>

        <button type="submit">Save Changes</button>
        <button type="button" class="cancel-edit">Cancel</button>
    `;
    editForm.elements["company"].value = application.company;
    editForm.elements["job"].value = application.job;

    card.appendChild(editForm);
    
editForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newCompany = editForm.elements["company"].value.trim();
    const newJob = editForm.elements["job"].value.trim();
    const newStatus = editForm.elements["status"].value;
    const newDate = editForm.elements["date"].value;
    const newInterviewDate = editForm.elements["interviewDate"].value;
    const newNotes = editForm.elements["interviewNotes"].value.trim();

    if (newStatus !== "Interview" && newInterviewDate !== "") {
    alert("Please set the status to Interview before adding an interview date.");
    return;
    }

    if (newStatus === "Interview" && newInterviewDate === "") {
        alert("Please enter an interview date.");
        return;
    }

    if (newInterviewDate !== "" && newInterviewDate < newDate) {
    alert("Interview date cannot be earlier than the application date.");
    return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
        newStatus === "Interview" &&
        newInterviewDate !== "" &&
        new Date(newInterviewDate + "T00:00:00") < today
    ) {
        alert("Interview date cannot be in the past.");
        return;
    }

    if (newCompany === "" || newJob === "" || newDate === "") {
        alert("Please fill in all required fields.");
        return;
    }

    const selectedDate = new Date(newDate + "T00:00:00");

    if (selectedDate > today) {
        alert("Application date cannot be in the future.");
        return;
    }

    const duplicate = applications.some(function(item) {
    return item !== application &&
        item.company.toLowerCase() === newCompany.toLowerCase() &&
        item.job.toLowerCase() === newJob.toLowerCase();
    });

    if (duplicate) {
        alert("Another application with this company and job role already exists!");
        return;
    }

    application.company = newCompany;
    application.job = newJob;
    application.status = newStatus;
    application.date = newDate;
    application.interviewDate = newInterviewDate;
    application.interviewNotes = newNotes;

    localStorage.setItem("applications", JSON.stringify(applications));

    renderApplications();

    alert("Application updated successfully!");

});

    const cancelButton = editForm.querySelector(".cancel-edit");
    cancelButton.addEventListener("click", function() {
        editForm.remove();
    });
});

recentApplications.appendChild(card);
});

    updateStats();
    updateConversionRates();
    renderUpcomingInterviews();
    renderStatusChart();
}

const clearButton = document.getElementById("clear-applications");

clearButton.addEventListener("click", function() {
    const confirmDelete = confirm(
        "Are you sure you want to delete all " +
        applications.length +
        " applications? This action cannot be undone."
    );
    if (confirmDelete) {
        applications = [];

        localStorage.setItem(
            "applications",
            JSON.stringify(applications)
        );

        renderApplications();
    }
});

function renderUpcomingInterviews() {
    upcomingInterviews.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = applications
        .filter(function(application) {
            if (!application.interviewDate) {
                return false;
            }

            const interviewDate = new Date(
                application.interviewDate + "T00:00:00"
            );

            return interviewDate >= today &&
                   application.status === "Interview";
        })
        .sort(function(a, b) {
            return new Date(a.interviewDate) -
                   new Date(b.interviewDate);
        });

    if (upcoming.length === 0) {
        const message = document.createElement("p");
        message.classList.add("empty-message");
        message.textContent = "No upcoming interviews scheduled.";
        upcomingInterviews.appendChild(message);
        return;
    }

    upcoming.forEach(function(application) {
        const card = document.createElement("div");
        card.classList.add("interview-card");

        const company = document.createElement("h3");
        company.textContent = application.company;

        const role = document.createElement("p");
        role.textContent = "Role: " + application.job;

        const date = document.createElement("p");
        
        const formattedInterviewDate = new Date(
        application.interviewDate + "T00:00:00"
        );

        date.textContent = "Interview Date: " +
        formattedInterviewDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });


        const notes = document.createElement("p");
        notes.textContent = application.interviewNotes
            ? "Preparation: " + application.interviewNotes
            : "No preparation notes added";

        card.append(company, role, date, notes);
        upcomingInterviews.appendChild(card);
    });
}


form.addEventListener("submit", function(event) {
    event.preventDefault();

    const company = document.getElementById("company").value.trim();
    const job = document.getElementById("job").value.trim();
    const status = document.getElementById("st").value;
    const date = document.getElementById("dt").value;
    const interviewDate = document.getElementById("interview-date").value;
    const interviewNotes = document.getElementById("interview-notes").value.trim();

     if (status !== "Interview" && interviewDate !== "") {
        alert("Please set the status to Interview before adding an interview date.");
        return;
    }

    if (interviewDate !== "" && interviewDate < date) {
        alert("Interview date cannot be earlier than the application date.");
        return;
    }

    const selectedInterviewDate = interviewDate
    ? new Date(interviewDate + "T00:00:00")
    : null;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (
        status === "Interview" &&
        selectedInterviewDate &&
        selectedInterviewDate < todayDate
    ) {
        alert("Interview date cannot be in the past.");
        return;
    }
    // Validate required fields
    if (company === "" || job === "" || status === "" || date === "") {
        alert("Please fill in all the required fields.");
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (date > today) {
        alert("Application date cannot be in the future.");
        return;
    }

    const duplicate = applications.some(function(application) {
    return application.company.toLowerCase() === company.toLowerCase() &&
           application.job.toLowerCase() === job.toLowerCase();
        });

    if (duplicate) {
        alert("This company and job role already exist!");
        return;
    }

    // Create an application object
    const application = {
        company: company,
        job: job,
        status: status,
        date: date,
        interviewDate: interviewDate,
        interviewNotes: interviewNotes
    };

    // Save the application
    applications.push(application);
    localStorage.setItem("applications", JSON.stringify(applications));

    // Refresh the application cards and dashboard
    renderApplications();

    // Clear the form
    form.reset();

    alert("Application added successfully!");
});
searchInput.addEventListener("input", renderApplications);
statusFilter.addEventListener("change", renderApplications);
sortOrder.addEventListener("change", renderApplications);

const statusInput = document.getElementById("st");
const interviewDateInput = document.getElementById("interview-date");

function updateInterviewDateRequirement() {
    if (statusInput.value === "Interview") {
        interviewDateInput.required = true;
        interviewDateInput.previousElementSibling.textContent =
            "Interview Date *";
    } else {
        interviewDateInput.required = false;
        interviewDateInput.previousElementSibling.textContent =
            "Interview Date (optional)";
    }
}

statusInput.addEventListener("change", updateInterviewDateRequirement);

updateInterviewDateRequirement();


let statusChart;

function renderStatusChart() {
    const chartCanvas = document.getElementById("status-chart");
    if (!chartCanvas || typeof Chart === "undefined") {
        return;
    }

    const statuses = ["Applied", "Interview", "Selected", "Rejected"];

    const counts = statuses.map(function(status) {
        return applications.filter(function(application) {
            return application.status === status;
        }).length;
    });

    if (statusChart) {
        statusChart.destroy();
    }

    statusChart = new Chart(chartCanvas, {
        type: "doughnut",
        data: {
            labels: statuses,
            datasets: [{
                label: "Applications",
                data: counts
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

const exportButton = document.getElementById("export-applications");

exportButton.addEventListener("click", function () {
    if (applications.length === 0) {
        alert("No applications available to export!");
        return;
    }

    const headers = [
        "Company",
        "Job Role",
        "Status",
        "Application Date",
        "Interview Date",
        "Interview Notes"
    ];

    const rows = applications.map(app => [
    app.company,
    app.job,
    app.status,
    app.date,
    app.interviewDate || "",
    app.interviewNotes || ""
]);

    const csvContent = [headers, ...rows]
        .map(row =>
            row.map(value =>
                `"${String(value ?? "").replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "job-applications.csv";
    link.click();

    URL.revokeObjectURL(url);
});


renderStatusChart();

// Display saved applications when the page loads
renderApplications();
