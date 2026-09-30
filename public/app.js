// ==========================================
// ENTRAGUARD - FRONTEND JAVASCRIPT
// ==========================================


// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(pageName) {

    // Hide all pages
    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {

        page.classList.remove("active");

    });


    // Show selected page
    const selectedPage =
        document.getElementById(pageName);

    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    // ======================================
    // MOVE BLUE ACTIVE BUTTON
    // ======================================

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        item.classList.remove("active");

    });


    // Add active class to clicked button
    navItems.forEach(function (item) {

        const clickCode =
            item.getAttribute("onclick");

        if (
            clickCode &&
            clickCode.includes(
                "showPage('" + pageName + "')"
            )
        ) {

            item.classList.add("active");

        }

    });


    // ======================================
    // LOAD PAGE DATA
    // ======================================

    if (pageName === "dashboard") {

        loadDashboard();

    }


    if (pageName === "policies") {

        loadPolicies();

    }


    if (pageName === "monitoring") {

        loadMonitoring();

    }

}

// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/dashboard");


        const data =
            await response.json();


        console.log(
            "Dashboard:",
            data
        );


        setText(
            "totalPolicies",
            data.total
        );


        setText(
            "reportPolicies",
            data.reportOnly
        );


        setText(
            "enabledPolicies",
            data.enabled
        );


        setText(
            "testingPolicies",
            data.testing
        );


    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ==========================================
// LOAD POLICIES
// ==========================================

async function loadPolicies() {

    try {

        const response =
            await fetch("/api/policies");


        const policies =
            await response.json();


        console.log(
            "Policies:",
            policies
        );


        renderPolicies(
            policies
        );


    }

    catch (error) {

        console.error(
            "Policy loading error:",
            error
        );

    }

}


// ==========================================
// DISPLAY POLICIES
// ==========================================

function renderPolicies(policies) {


    const container =
        document.getElementById(
            "policyList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (policies.length === 0) {

        container.innerHTML = `

            <div class="panel">

                <h3>
                    No Policies Found
                </h3>

                <p>
                    Create your first Conditional Access policy.
                </p>

            </div>

        `;

        return;

    }


    policies.forEach(function (policy) {


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "policy-card";


        card.style.background =
            "white";


        card.style.padding =
            "22px";


        card.style.marginBottom =
            "15px";


        card.style.borderRadius =
            "12px";


        card.style.border =
            "1px solid #e2e8f0";


        card.innerHTML = `

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:20px;
            ">

                <div>

                    <h3>
                        ${escapeHtml(policy.name)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            policy.description || ""
                        )}
                    </p>

                    <p>
                        <strong>Condition:</strong>
                        ${escapeHtml(
                            policy.condition || ""
                        )}
                    </p>

                    <p>
                        <strong>Action:</strong>
                        ${escapeHtml(
                            policy.action || ""
                        )}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHtml(
                            policy.status || ""
                        )}
                    </p>

                </div>


                <div>

                    <select
                        onchange="
                            updatePolicyStatus(
                                ${policy.id},
                                this.value
                            )
                        "
                    >

                        <option
                            value="Draft"
                            ${
                                policy.status === "Draft"
                                ? "selected"
                                : ""
                            }
                        >
                            Draft
                        </option>


                        <option
                            value="Report-only"
                            ${
                                policy.status === "Report-only"
                                ? "selected"
                                : ""
                            }
                        >
                            Report-only
                        </option>


                        <option
                            value="Testing"
                            ${
                                policy.status === "Testing"
                                ? "selected"
                                : ""
                            }
                        >
                            Testing
                        </option>


                        <option
                            value="Enabled"
                            ${
                                policy.status === "Enabled"
                                ? "selected"
                                : ""
                            }
                        >
                            Enabled
                        </option>

                    </select>

                </div>

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


// ==========================================
// CREATE POLICY
// ==========================================

async function createPolicy() {


    const nameElement =
        document.getElementById(
            "policyName"
        );


    const descriptionElement =
        document.getElementById(
            "policyDescription"
        );


    const conditionElement =
        document.getElementById(
            "policyCondition"
        );


    const actionElement =
        document.getElementById(
            "policyAction"
        );


    if (!nameElement) {

        alert(
            "Policy name field not found."
        );

        return;

    }


    const name =
        nameElement.value.trim();


    const description =
        descriptionElement
            ? descriptionElement.value.trim()
            : "";


    const condition =
        conditionElement
            ? conditionElement.value
            : "All users";


    const action =
        actionElement
            ? actionElement.value
            : "Require MFA";


    if (!name) {

        alert(
            "Please enter a policy name."
        );

        return;

    }


    try {


        const response =
            await fetch(
                "/api/policies",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            name:
                                name,

                            description:
                                description,

                            condition:
                                condition,

                            action:
                                action

                        })

                }
            );


        const result =
            await response.json();


        console.log(
            "Created:",
            result
        );


        if (!response.ok) {

            alert(
                result.message ||
                "Failed to create policy."
            );

            return;

        }


        alert(
            "Policy created successfully!"
        );


        nameElement.value =
            "";


        if (descriptionElement) {

            descriptionElement.value =
                "";

        }


        loadPolicies();

        loadDashboard();


    }

    catch (error) {

        console.error(
            "Create policy error:",
            error
        );


        alert(
            "Server error while creating policy."
        );

    }

}


// ==========================================
// UPDATE POLICY STATUS
// ==========================================

async function updatePolicyStatus(
    policyId,
    status
) {


    try {


        const response =
            await fetch(
                `/api/policies/${policyId}/status`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            status:
                                status

                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to update policy."
            );

            return;

        }


        console.log(
            "Policy updated:",
            result
        );


        loadPolicies();

        loadDashboard();


    }

    catch (error) {

        console.error(
            "Status update error:",
            error
        );

    }

}


// ==========================================
// SIGN-IN SIMULATOR
// ==========================================

async function simulateSignIn() {


    // USER

    const user =
        document.getElementById(
            "simUser"
        ).value;


    // ROLE

    const role =
        document.getElementById(
            "simRole"
        ).value;


    // DEVICE

    const device =
        document.getElementById(
            "simDevice"
        ).value;


    // LOCATION

    const location =
        document.getElementById(
            "simLocation"
        ).value;


    // RISK

    const risk =
        document.getElementById(
            "simRisk"
        ).value;


    // MFA

    const mfa =
        document.getElementById(
            "simMfa"
        ).value;


    // CLIENT APPLICATION

    const clientApp =
        document.getElementById(
            "simClientApp"
        ).value;


    // BREAK GLASS

    const breakGlass =
        document.getElementById(
            "simBreakGlass"
        ).value;


    try {


        const response =
            await fetch(
                "/api/simulate",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify({

                            user:
                                user,

                            role:
                                role,

                            device:
                                device,

                            location:
                                location,

                            risk:
                                risk,

                            mfa:
                                mfa,

                            clientApp:
                                clientApp,

                            breakGlass:
                                breakGlass

                        })

                }
            );


        const result =
            await response.json();


        console.log(
            "Simulation Result:",
            result
        );


        displaySimulationResult(
            result
        );


    }

    catch (error) {

        console.error(
            "Simulation error:",
            error
        );


        alert(
            "Simulation failed. Check server."
        );

    }

}


// ==========================================
// DISPLAY SIMULATION RESULT
// ==========================================

function displaySimulationResult(
    result
) {


    const container =
        document.getElementById(
            "simulationResult"
        );


    if (!container) {

        return;

    }


    container.classList.remove(
        "hidden"
    );


    let background =
        "#dcfce7";


    let textColor =
        "#166534";


    if (
        result.severity ===
        "danger"
    ) {

        background =
            "#fee2e2";


        textColor =
            "#991b1b";

    }


    else if (
        result.severity ===
        "warning"
    ) {

        background =
            "#fef3c7";


        textColor =
            "#92400e";

    }


    container.innerHTML = `

        <div style="
            margin-top:25px;
            padding:25px;
            border-radius:14px;
            background:${background};
            color:${textColor};
            border:1px solid rgba(0,0,0,0.08);
        ">


            <h2 style="
                margin-top:0;
            ">

                ${escapeHtml(
                    result.result
                )}

            </h2>


            <p style="
                font-size:16px;
                font-weight:500;
            ">

                ${escapeHtml(
                    result.reason
                )}

            </p>


            <hr style="
                border:none;
                border-top:
                    1px solid
                    rgba(0,0,0,0.12);
                margin:18px 0;
            ">


            <p>

                <strong>
                    User:
                </strong>

                ${escapeHtml(
                    result.user
                )}

            </p>


            <p>

                <strong>
                    Role:
                </strong>

                ${escapeHtml(
                    result.role
                )}

            </p>


            <p>

                <strong>
                    Device:
                </strong>

                ${escapeHtml(
                    result.device
                )}

            </p>


            <p>

                <strong>
                    Location:
                </strong>

                ${escapeHtml(
                    result.location
                )}

            </p>


            <p>

                <strong>
                    Risk Level:
                </strong>

                ${escapeHtml(
                    result.risk
                )}

            </p>


            <p>

                <strong>
                    MFA:
                </strong>

                ${escapeHtml(
                    result.mfa
                )}

            </p>


            <p>

                <strong>
                    Client Application:
                </strong>

                ${escapeHtml(
                    result.clientApp
                )}

            </p>


            <p>

                <strong>
                    Break-glass:
                </strong>

                ${escapeHtml(
                    result.breakGlass
                )}

            </p>


        </div>

    `;

}


// ==========================================
// MONITORING
// ==========================================

async function loadMonitoring() {

    console.log(
        "Monitoring page loaded"
    );

}


// ==========================================
// HELPER
// ==========================================

function setText(
    id,
    value
) {


    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(
    value
) {


    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "EntraGuard frontend loaded"
        );


        loadDashboard();

        loadPolicies();


    }
);