/*----------------------------------------------------------------------*
* Program Name    : ZHPS0020_INTERFACE
* Title           : Change History Search
* Create Date     : 24-August-2023
* Function Number : 
* Release         : HOPES 02
* Author          : 30059868 (Miten Patel)
*----------------------------------------------------------------------*
* Description     : Material Characteristics
*----------------------------------------------------------------------*
* CHANGE HISTORY
*----------------------------------------------------------------------*
* Date        | User ID  | Fuction    | Description
*----------------------------------------------------------------------*
*
*----------------------------------------------------------------------*/

var express = require("express");
var core = require('@sap-cloud-sdk/core');
var xsenv = require('@sap/xsenv');
var axios = require("axios");
var SapCfAxios = require("sap-cf-axios").default;
var axios1 = SapCfAxios("fetch-destination-api");
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()

xsenv.loadEnv();
var app = express();
var PORT = process.env.PORT || 5000;
// var sDestinationName = 'sap-btp-sapui5-destination-service';


var handleTrigger = async (req, res) => {
    var sap_job_id = req.headers['x-sap-job-id'];
    var sap_job_schedule_id = req.headers['x-sap-job-schedule-id'];
    var sap_job_run_id = req.headers['x-sap-job-run-id'];
    var sap_scheduler_host = req.headers['x-sap-scheduler-host'];

    console.log('Incoming Job schedule trigger details', { sap_job_id: sap_job_id, sap_job_schedule_id, sap_job_run_id: sap_job_run_id, sap_scheduler_host: sap_scheduler_host })

    // return status 202 to Jobscheduler
    res.status(202).send()

    // Get destination details for cap service
    var responseCAPDestination = await axios1({
        method: "GET",
        url: "/readDestinationDetails?destination=cap-zhs402-api",
        params: {
            $format: "json"
        },
        headers: {
            accept: "application/json"
        }
    });

    // CAP token URL and Service URL and Auth
    var capURL = responseCAPDestination.data.URL;
    var capTokenURL = responseCAPDestination.data.tokenServiceURL;
    var capAuth = Buffer.from(`${responseCAPDestination.data.clientId}:${responseCAPDestination.data.clientSecret}`).toString("base64");

    /// Get access token from CAP Service
    var responseCodeCAP = await axios({
        method: "POST",
        url: capTokenURL,
        headers: {
            'Authorization': "Basic " + capAuth,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            grant_type: "client_credentials"
        }
    });
    var tokenCAP = "Bearer " + responseCodeCAP.data.access_token;


    // Get destination details for Job scheduler service
    var responseJOBSchedulerDesti = await axios1({
        method: "GET",
        url: "/readDestinationDetails?destination=dest-bgjob-api",
        params: {
            $format: "json"
        },
        headers: {
            accept: "application/json"
        }
    });
    // jobScheduler token URL and Service URL and Auth
    var jobSchedulerTokenURL = responseJOBSchedulerDesti.data.tokenServiceURL;
    var jobSchedulerAuth = Buffer.from(`${responseJOBSchedulerDesti.data.clientId}:${responseJOBSchedulerDesti.data.clientSecret}`).toString("base64");

    /// Get access token from jobScheduler Service
    var jobSchedulerCodeCAP = await axios({
        method: "POST",
        url: jobSchedulerTokenURL,
        headers: {
            'Authorization': "Basic " + jobSchedulerAuth,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            grant_type: "client_credentials"
        }
    });
    var tokenjobScheduler = "Bearer " + jobSchedulerCodeCAP.data.access_token;
    var jobSchedulerURL = responseJOBSchedulerDesti.data.URL;

    var aError = []

    try {
        // Call the CAP Service to trigger the process
        var materialCharecteristicsDataResponse = await axios({
            method: "POST",
            url: capURL + "/v2/zapibps0032/MaterialCharacteristics",
            headers: {
                'Accept': 'application/json',
                'Authorization': tokenCAP
            },
            data: { "fromjobScheduler": true }
        });

    } catch (error) {
        aError.push(error)
    }
    // if no error in 'materialCharecteristicsDataResponse' then procceed below
    if (aError.length === 0) {

        // if CAP service returns data then call SAP jobscheduler API and update it
        if (materialCharecteristicsDataResponse.data) {

            var isSuccess = false;
            if (materialCharecteristicsDataResponse.data.d.Message === "Success") {
                isSuccess = true
            } else {
                isSuccess = false
            }


            // update ZTHBT0111 Table with run log when 'isSuccess = true'
            if (aError.length === 0 && isSuccess === true) {
                try {
                    await axios({
                        method: "POST",
                        url: capURL + "/v2/zapibps0032/logJobRun367754",
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': tokenCAP
                        },
                        data: {
                            "fromJobScheduler": true,
                            "startOrEnd": true
                        }
                    });
                } catch (error) {
                    aError.push(error)
                }
            }

            // update SAP jobscheduler API run log based on 'isSuccess'
            try {
                await axios({
                    method: "PUT",
                    url: jobSchedulerURL + `/scheduler/jobs/${sap_job_id}/schedules/${sap_job_schedule_id}/runs/${sap_job_run_id}`,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': tokenjobScheduler
                    },
                    data: {
                        "success": isSuccess,
                        "message": JSON.stringify(materialCharecteristicsDataResponse.data.d)
                    }
                });
            } catch (error) {
                aError.push(error)
            }

            if (aError.length > 0) {
                console.log('Errors', aError)
            }

        } else {
            // if CAP service returns no data then call SAP jobscheduler API and update it with error
            try {
                await axios({
                    method: "PUT",
                    url: jobSchedulerURL + `/scheduler/jobs/${sap_job_id}/schedules/${sap_job_schedule_id}/runs/${sap_job_run_id}`,
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': tokenjobScheduler
                    },
                    data: {
                        "success": false,
                        "message": "No data recieved from CAP service"
                    }
                });
            } catch (error) {
                aError.push(error)
            }

            if (aError.length > 0) {
                console.log('Errors', aError)
            }

        }
    } else {
        // update SAP jobschduler API with error status
        try {
            await axios({
                method: "PUT",
                url: jobSchedulerURL + `/scheduler/jobs/${sap_job_id}/schedules/${sap_job_schedule_id}/runs/${sap_job_run_id}`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': tokenjobScheduler
                },
                data: {
                    "success": false,
                    "message": JSON.stringify(aError)
                }
            });
        } catch (error) {
            aError.push(error)
        }
        console.log('Errors', aError)
    }
}

app.post("/MaterialCharacteristics", jsonParser, handleTrigger); //to be schedule for background JOB

app.listen(PORT, () => {
    console.log("port listining");
})