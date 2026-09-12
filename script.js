// ======================================================
// SUPABASE CONNECTION
// ======================================================

const SUPABASE_URL =
    "https://fovbdldyynuygmuvcqea.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_c2c2cwBQyn3Qd-DV_60w_w_mf5iPCjG";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================================
// SUBJECTS
// ======================================================

const subjects = {

    1: [
        "Engineering Mathematics",
        "Engineering Physics",
        "Programing Data Structures",
        "Basic Electrical Engineering"
    ],

    2: [
        "Engineering Mathematics-II",
        "Network Theory",
        "Digita Logic and Design",
        "Electronic Devices"
    ],

    3: [
        "Probability and random Variables",
        "Electrical Machines-I",
        "Analog Electronics",
        "Object Oriented Language",
        "Signals and Systems"
    ],

    4: [
        "Electrical Machines-II",
        "Power Systems-I",
        "Digital Electronics",
        "Control Systems"
    ],

    5: [
        "Power Systems-II",
        "Power Electronics",
        "Microprocessors and Microcontrollers",
        "Electrical Measurements"
    ],

    6: [
        "Switchgear and Protection",
        "Power System Analysis",
        "Electrical Drives",
        "Renewable Energy Systems"
    ],

    7: [
        "High Voltage Engineering",
        "Power System Operation and Control",
        "Special Electrical Machines",
        "Elective-I"
    ],

    8: [
        "Power Quality",
        "Smart Grid",
        "Elective-II",
        "Project Work"
    ]

};


// ======================================================
// OPEN SEMESTER
// ======================================================

function openSemester(semester) {

    const subjectList = subjects[semester];

    let output = "";

    for (let i = 0; i < subjectList.length; i++) {

        output += `
            <div class="subject-card">

                <h3>${subjectList[i]}</h3>

                <button onclick="openNotes('${subjectList[i]}')">
                    View Notes
                </button>

            </div>
        `;
    }

    document.getElementById("subject-section").innerHTML = `

        <h2>Semester ${semester}</h2>

        <div class="subject-container">
            ${output}
        </div>

    `;

    document.getElementById("subject-section")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ======================================================
// OPEN NOTES PAGE
// ======================================================

function openNotes(subject) {

    document.getElementById("subject-section").innerHTML = `

        <div class="notes-page">

            <h2>${subject}</h2>

            <p class="notes-subtitle">
                Notes and study materials
            </p>

            <div class="notes-grid">

                <div class="notes-card">
                    <h3>Unit 1</h3>

                    <button onclick="openPDF('${subject}', 'Unit 1')">
                        View Notes
                    </button>
                </div>


                <div class="notes-card">
                    <h3>Unit 2</h3>

                    <button onclick="openPDF('${subject}', 'Unit 2')">
                        View Notes
                    </button>
                </div>


                <div class="notes-card">
                    <h3>Unit 3</h3>

                    <button onclick="openPDF('${subject}', 'Unit 3')">
                        View Notes
                    </button>
                </div>


                <div class="notes-card">
                    <h3>Unit 4</h3>

                    <button onclick="openPDF('${subject}', 'Unit 4')">
                        View Notes
                    </button>
                </div>


                <div class="notes-card">
                    <h3>Unit 5</h3>

                    <button onclick="openPDF('${subject}', 'Unit 5')">
                        View Notes
                    </button>
                </div>


                <div class="notes-card">
                    <h3>Unit 6</h3>

                    <button onclick="openPDF('${subject}', 'Unit 6')">
                        View Notes
                    </button>
                </div>


                <div class="notes-card previous-paper">

                    <h3>Previous Papers</h3>

                    <button onclick="openPDF('${subject}', 'Previous Papers')">
                        View Papers
                    </button>

                </div>

            </div>

        </div>

    `;

    document.getElementById("subject-section")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ======================================================
// OPEN APPROVED PDF
// ======================================================

async function openPDF(subject, section) {

    const { data, error } =
        await supabaseClient
            .from("notes")
            .select("title, file_url")
            .ilike("subject", subject)
            .eq("section", section)
            .eq("status", "approved");

    if (error) {

        alert(
            "Error loading notes: " +
            error.message
        );

        return;
    }


    if (!data || data.length === 0) {

        alert(
            "No approved notes available for this section yet."
        );

        return;
    }


    // Only one PDF
    if (data.length === 1) {

        window.open(
            data[0].file_url,
            "_blank"
        );

        return;
    }


    // Multiple PDFs
    let message =
        "Available Notes:\n\n";

    for (let i = 0; i < data.length; i++) {

        message +=
            (i + 1) +
            ". " +
            data[i].title +
            "\n";
    }


    const choice = prompt(
        message +
        "\nEnter the number to open:"
    );


    const number =
        parseInt(choice);


    if (
        number >= 1 &&
        number <= data.length
    ) {

        window.open(
            data[number - 1].file_url,
            "_blank"
        );
    }
}


// ======================================================
// ADMIN LOGIN
// ======================================================

async function loginAdmin() {

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    const message =
        document
            .getElementById("login-message");


    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        return;
    }


    message.innerText =
        "Logging in...";


    const { data, error } =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        message.innerText =
            "Login failed: " +
            error.message;

        return;
    }


    message.innerText =
        "Login successful!";


    window.location.href =
        "admin-dashboard.html";
}


// ======================================================
// UPLOAD NOTE
// Works for both admin and anonymous users
// ======================================================

async function uploadNote() {

    const semester =
        document
            .getElementById("semester")
            .value;


    const subject =
        document
            .getElementById("subject")
            .value;


    const section =
        document
            .getElementById("section")
            .value;


    const title =
        document
            .getElementById("title")
            .value
            .trim();


    const file =
        document
            .getElementById("pdf")
            .files[0];


    const message =
        document
            .getElementById("upload-message");


    // Check fields
    if (!subject || !title || !file) {

        message.innerText =
            "Please fill all fields.";

        return;
    }


    // Check PDF
    if (file.type !== "application/pdf") {

        message.innerText =
            "Only PDF files are allowed.";

        return;
    }


    // Maximum file size: 10 MB
    if (file.size > 50 * 1024 * 1024) {

        message.innerText =
            "PDF must be smaller than 50 MB.";

        return;
    }


    message.innerText =
        "Uploading PDF...";


    // Create unique filename
    const fileName =
        Date.now() +
        "-" +
        file.name
            .replace(/[^a-zA-Z0-9._-]/g, "_");


    const filePath =
        "notes/" +
        fileName;


    // Upload PDF to Storage
    const { error: uploadError } =
        await supabaseClient.storage
            .from("notes")
            .upload(
                filePath,
                file
            );


    if (uploadError) {

        message.innerText =
            "Upload failed: " +
            uploadError.message;

        return;
    }


    // Get public URL
    const { data } =
        supabaseClient.storage
            .from("notes")
            .getPublicUrl(
                filePath
            );


    const fileUrl =
        data.publicUrl;


    // Insert database record
    const { error: databaseError } =
        await supabaseClient
            .from("notes")
            .insert({

                semester:
                    Number(semester),

                subject:
                    subject,

                section:
                    section,

                title:
                    title,

                file_url:
                    fileUrl,

                status:
                    "pending"

            });


    if (databaseError) {

        message.innerText =
            "Database error: " +
            databaseError.message;

        return;
    }


    // Success
    message.innerText =
        "PDF uploaded successfully! Waiting for approval.";


    // Clear form
    document.getElementById("title").value = "";

    document.getElementById("pdf").value = "";


    // Reload pending notes if on admin dashboard
    loadPendingNotes();
}


// ======================================================
// LOAD PENDING NOTES
// ======================================================

async function loadPendingNotes() {

    const container =
        document.getElementById(
            "pending-notes"
        );


    // Not on admin dashboard
    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading pending notes...</p>";


    const { data, error } =
        await supabaseClient
            .from("notes")
            .select("*")
            .eq("status", "pending")
            .order(
                "uploaded_at",
                {
                    ascending: false
                }
            );


    if (error) {

        container.innerHTML =
            "<p>Error loading notes: " +
            error.message +
            "</p>";

        return;
    }


    if (!data || data.length === 0) {

        container.innerHTML =
            "<p>No pending notes.</p>";

        return;
    }


    let output = "";


    for (let i = 0; i < data.length; i++) {

        const note =
            data[i];


        output += `

            <div class="pending-note">

                <h3>
                    ${note.title}
                </h3>

                <p>
                    <b>Semester:</b>
                    ${note.semester}
                </p>

                <p>
                    <b>Subject:</b>
                    ${note.subject}
                </p>

                <p>
                    <b>Section:</b>
                    ${note.section}
                </p>


                <button
                    class="approve-button"
                    onclick="approveNote(${note.id})">

                    Approve

                </button>


                <button
                    class="delete-button"
                    onclick="deleteNote(${note.id})">

                    Delete

                </button>


                <button
                    onclick="window.open('${note.file_url}', '_blank')">

                    View PDF

                </button>

            </div>

        `;
    }


    container.innerHTML =
        output;
}


// ======================================================
// APPROVE NOTE
// ======================================================

async function approveNote(id) {

    const { error } =
        await supabaseClient
            .from("notes")
            .update({

                status:
                    "approved"

            })
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Approval failed: " +
            error.message
        );

        return;
    }


    alert(
        "Note approved successfully!"
    );


    loadPendingNotes();
}


// ======================================================
// DELETE NOTE
// ======================================================

async function deleteNote(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) {
        return;
    }

    // Get the note first so we know the PDF path
    const { data: note, error: fetchError } =
        await supabaseClient
            .from("notes")
            .select("file_url")
            .eq("id", id)
            .single();

    if (fetchError) {
        alert(
            "Could not find note: " +
            fetchError.message
        );
        return;
    }

    // Extract the file path from the public URL
    const marker = "/storage/v1/object/public/notes/";

    const position =
        note.file_url.indexOf(marker);

    if (position === -1) {
        alert("Could not determine PDF path.");
        return;
    }

    const filePath =
        decodeURIComponent(
            note.file_url.substring(
                position + marker.length
            )
        );

    // Delete PDF from Storage
    const { error: storageError } =
        await supabaseClient.storage
            .from("notes")
            .remove([filePath]);

    if (storageError) {
        alert(
            "PDF deletion failed: " +
            storageError.message
        );
        return;
    }

    // Delete database record
    const { error: databaseError } =
        await supabaseClient
            .from("notes")
            .delete()
            .eq("id", id);

    if (databaseError) {
        alert(
            "Database deletion failed: " +
            databaseError.message
        );
        return;
    }

    alert(
        "Note and PDF deleted successfully!"
    );

    loadPendingNotes();
}

// ======================================================
// LOAD ADMIN SUBJECTS
// ======================================================

function loadAdminSubjects() {

    const semester =
        document.getElementById(
            "semester"
        );


    const subject =
        document.getElementById(
            "subject"
        );


    if (!semester || !subject) {
        return;
    }


    const selectedSemester =
        semester.value;


    const subjectList =
        subjects[selectedSemester];


    subject.innerHTML =
        '<option value="">Select Subject</option>';


    for (
        let i = 0;
        i < subjectList.length;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            subjectList[i];


        option.textContent =
            subjectList[i];


        subject.appendChild(
            option
        );
    }
}


// ======================================================
// ADMIN SECURITY CHECK
// ======================================================

async function checkAdminAccess() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient
            .auth
            .getUser();


    // No login
    if (!user) {

        window.location.href =
            "admin.html";

        return;
    }


    // Check admin_users table
    const { data, error } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    // Not an admin
    if (error || !data) {

        await supabaseClient
            .auth
            .signOut();


        alert(
            "Access denied. Admin only."
        );


        window.location.href =
            "admin.html";

        return;
    }
}


// ======================================================
// ADMIN LOGOUT
// ======================================================

async function logoutAdmin() {

    const { error } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        alert(
            "Logout failed: " +
            error.message
        );

        return;
    }


    window.location.href =
        "admin.html";
}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

// Semester dropdown on admin dashboard
const semesterDropdown =
    document.getElementById(
        "semester"
    );


if (semesterDropdown) {

    semesterDropdown.addEventListener(
        "change",
        loadAdminSubjects
    );


    loadAdminSubjects();
}


// Load pending notes on admin dashboard
if (
    document.getElementById(
        "pending-notes"
    )
) {

    loadPendingNotes();
}


// Protect admin dashboard
if (
    window.location.pathname.includes(
        "admin-dashboard.html"
    )
) {

    checkAdminAccess();
}
