const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));


// ==========================================
// DATA FILE
// ==========================================

const DATA_FILE = path.join(
    __dirname,
    "data",
    "policies.json"
);


// ==========================================
// READ POLICIES
// ==========================================

function readPolicies() {

    try {

        return JSON.parse(
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            )
        );

    }

    catch (error) {

        return [];

    }

}


// ==========================================
// SAVE POLICIES
// ==========================================

function savePolicies(policies) {

    fs.writeFileSync(

        DATA_FILE,

        JSON.stringify(
            policies,
            null,
            2
        )

    );

}


// ==========================================
// DASHBOARD
// ==========================================

app.get(
    "/api/dashboard",
    (req, res) => {

        const policies =
            readPolicies();


        res.json({

            total:
                policies.length,


            reportOnly:
                policies.filter(
                    p =>
                        p.status ===
                        "Report-only"
                ).length,


            enabled:
                policies.filter(
                    p =>
                        p.status ===
                        "Enabled"
                ).length,


            testing:
                policies.filter(
                    p =>
                        p.status ===
                        "Testing"
                ).length

        });

    }
);


// ==========================================
// GET POLICIES
// ==========================================

app.get(
    "/api/policies",
    (req, res) => {

        const policies =
            readPolicies();


        res.json(
            policies
        );

    }
);


// ==========================================
// CREATE POLICY
// ==========================================

app.post(
    "/api/policies",
    (req, res) => {

        const policies =
            readPolicies();


        const newPolicy = {

            id:
                Date.now(),


            name:
                req.body.name,


            description:
                req.body.description,


            condition:
                req.body.condition,


            action:
                req.body.action,


            status:
                "Draft",


            createdAt:
                new Date().toISOString()

        };


        policies.push(
            newPolicy
        );


        savePolicies(
            policies
        );


        res.json({

            message:
                "Policy created successfully",


            policy:
                newPolicy

        });

    }
);


// ==========================================
// UPDATE POLICY STATUS
// ==========================================

app.put(
    "/api/policies/:id/status",
    (req, res) => {

        const policies =
            readPolicies();


        const id =
            Number(
                req.params.id
            );


        const policy =
            policies.find(
                p =>
                    p.id === id
            );


        if (!policy) {

            return res
                .status(404)
                .json({

                    message:
                        "Policy not found"

                });

        }


        policy.status =
            req.body.status;


        savePolicies(
            policies
        );


        res.json({

            message:
                "Policy status updated",


            policy:
                policy

        });

    }
);


// ==========================================
// SIGN-IN SIMULATOR
// ==========================================

app.post(
    "/api/simulate",
    (req, res) => {


        const {

            user,

            role,

            device,

            location,

            risk,

            mfa,

            clientApp,

            breakGlass

        } = req.body;


        let result =
            "ACCESS GRANTED";


        let reason =
            "No policy blocked this sign-in.";


        let severity =
            "success";


        // ==================================
        // 1. BREAK-GLASS ACCOUNT
        // ==================================

        if (
            breakGlass === "Yes"
        ) {

            result =
                "ACCESS GRANTED";


            reason =
                "Break-glass account is excluded from Conditional Access policies.";


            severity =
                "success";

        }


        // ==================================
        // 2. LEGACY AUTHENTICATION
        // ==================================

        else if (
            clientApp ===
            "Legacy Authentication"
        ) {

            result =
                "ACCESS BLOCKED";


            reason =
                "Legacy authentication protocols are blocked.";


            severity =
                "danger";

        }


        // ==================================
        // 3. HIGH RISK
        // ==================================

        else if (
            risk === "High"
        ) {

            result =
                "ACCESS BLOCKED";


            reason =
                "High-risk sign-in detected.";


            severity =
                "danger";

        }


        // ==================================
        // 4. ADMIN MFA
        // ==================================

        else if (

            role === "Admin" &&

            mfa === "No"

        ) {

            result =
                "MFA REQUIRED";


            reason =
                "MFA is required for administrator roles from any location.";


            severity =
                "warning";

        }


        // ==================================
        // 5. UNKNOWN DEVICE
        // ==================================

        else if (
            device === "Unknown"
        ) {

            result =
                "MFA REQUIRED";


            reason =
                "Unknown device requires additional authentication.";


            severity =
                "warning";

        }


        // ==================================
        // FINAL RESPONSE
        // ==================================

        res.json({

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
                breakGlass,


            result:
                result,


            reason:
                reason,


            severity:
                severity,


            timestamp:
                new Date().toISOString()

        });

    }
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            status:
                "Online",


            service:
                "Entra CA Rollout Simulator"

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    3000,
    () => {

        console.log(
            "======================================"
        );


        console.log(
            "Entra CA Rollout Server Started"
        );


        console.log(
            "Server running on http://localhost:3000"
        );


        console.log(
            "======================================"
        );

    }
);