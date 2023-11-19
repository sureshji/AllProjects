/*----------------------------------------------------------------------*
* Program Name    : ZAPIBPS0012_Interface
* Title           : Billing Invoice Information from Field Glass to S4 and BTP Interface
* Create Date     : 6-April-2023
* Function Number : 25_0783
* Release         : HOPES 02
* Author          : 30054521 (Divye)
*----------------------------------------------------------------------*
* Description     : Billing Invoice Information from Field Glass to S4 and BTP Interface
*----------------------------------------------------------------------*
* CHANGE HISTORY
*----------------------------------------------------------------------*
* Date        | User ID  | Fuction    | Description
*----------------------------------------------------------------------*
*
*----------------------------------------------------------------------*/
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const express = require("express");
const core = require('@sap-cloud-sdk/core');
const xsenv = require('@sap/xsenv');
const axios = require("axios");
const SapCfAxios = require("sap-cf-axios").default;
const axios1 = SapCfAxios("fetch-destination-api");

xsenv.loadEnv();
const app = express();
const PORT = process.env.PORT || 5000;
var cap0074Response = [];

const sDestinationName = 'sap-btp-sapui5-destination-service';

const getCAPAccessToken = async () => {
  console.error('There was an error!', "test");
    const responseCAPDestination = await axios({
        method: "GET",
        url: "https://global-dev-001-space-001-fetch-destination-service-nodejs.cfapps.jp20.hana.ondemand.com/readDestinationDetails?destination=cap-zhs402-api",
        params: {
          $format: "json"
        },
        headers: {
          accept: "application/json"
        }
    }) .catch(error => {
      // element.parentElement.innerHTML = `Error: ${error.message}`;
      console.error('readDestinationDetails', error);
  });;
    console.log(responseCAPDestination);
    var capURL = responseCAPDestination.data.URL;
    var capTokenURL = responseCAPDestination.data.tokenServiceURL;
    const capAuth = Buffer.from(`${responseCAPDestination.data.clientId}:${responseCAPDestination.data.clientSecret}`).toString("base64");
    

    ///Code to get access token from CAP Service
    const responseCodeCAP = await axios({
    method: "POST",
    url: capTokenURL,
    headers: {
        'Authorization': "Basic " + capAuth,//'Basic c2ItemhzNDAyIXQzNDU6NUoweEJYVElBL1B4cVNZVHJ2Mm5nRkpoR1RnPQ==',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
        grant_type: "client_credentials"
    }
    }) .catch(error => {
      // element.parentElement.innerHTML = `Error: ${error.message}`;
      console.error('There was an error!', capTokenURL);
  });;
    const tokenCAP = "Bearer " + responseCodeCAP.data.access_token;
    return {tokenCAP:tokenCAP, capURL:capURL};
};

const getS4Data = async (capURL, tokenCAP, filters, REQ_BY) => {
    var sFiltes = filters.split(" and ");
    var aFiler = [];
    sFiltes.forEach(function(info){
      // if(info.indexOf("PlannedCountDate") !== -1){
      //   var dates = info.replace("datetime'","");
      //   var ss = dates.split("T")[0];
      //   aFiler.push(ss);
      // } else 
        // if(info.indexOf("PostingDate") === -1){
        //   aFiler.push(info);
        // }
        // if(info.indexOf("PostingDate") === -1){
        //   aFiler.push(info);
        // }
    });
    var finalFilters = aFiler.join(" and ");
    console.log(capURL + "/v2/ZAPIBPS0012/ZAPIBPS0012Report?$expand=to_item&" + filters);
    let responseS4 = await axios({
      method: 'GET',
      url: capURL + "/v2/ZAPIBPS0012/ZAPIBPS0012Report?$expand=to_item&" + filters,//"/sap/opu/odata/sap/ZSRVBHPS0010/ZCDSEHPSC0011",
      headers: {
        'Accept': 'application/json',
        Authorization: tokenCAP
      }
    });
    // console.log(JSON.stringify(responseS4.data.d.results));
    var s4Data = responseS4.data.d.results;
    for (let response of s4Data) { 
      var capPostData = {
        PhysInvDoc:response.PhysInvDoc,
        PLANT:response.Plant,
        STORLOC:response.StorageLocation,
        STATUS:"In-Progress",
        REQ_BY:REQ_BY
      }; 
      console.log(JSON.stringify(capPostData));
      const responseCAP = await axios({
        method: "POST",
        url: capURL + "/v2/ZAPIBPS0012/ZTHBT0074",
        data: capPostData,
        headers: {
          Authorization: tokenCAP,//"Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vZ2xvYmFsLWRldi0wMDEuYXV0aGVudGljYXRpb24uanAyMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xNDA1NDAyNjk5IiwidHlwIjoiSldUIn0.eyJqdGkiOiIzNGIyMzI3MGMwNWY0NmFlYTMyODg3Y2JiYzVkMDJjZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiIwMDc1ZTAzMy1hMTFiLTQwZGUtOWVmZi02OGQ0NGI0NmNlOTIiLCJ6ZG4iOiJnbG9iYWwtZGV2LTAwMSJ9LCJzdWIiOiJzYi16aHM0MDIhdDM0NSIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItemhzNDAyIXQzNDUiLCJjaWQiOiJzYi16aHM0MDIhdDM0NSIsImF6cCI6InNiLXpoczQwMiF0MzQ1IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiI1Y2NjNTUxYyIsImlhdCI6MTY3NDE1NTEwNywiZXhwIjoxNjc0MTk4MzA3LCJpc3MiOiJodHRwczovL2dsb2JhbC1kZXYtMDAxLmF1dGhlbnRpY2F0aW9uLmpwMjAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiIwMDc1ZTAzMy1hMTFiLTQwZGUtOWVmZi02OGQ0NGI0NmNlOTIiLCJhdWQiOlsic2ItemhzNDAyIXQzNDUiLCJ1YWEiXX0.h0xTUlNcqebsLuw26hlOoXK0UGeWEnvFGPrWN4sdp25CJHVA7VaB_VbnUYAintjOOLUULBKb-9Y4VKQTWC8W-4onW0nnofmQFPu_SUmbYODTuUbk_REaOSY050FHJD3wbMA2JKXY1ucR6FjAOevkH4U4-lon07xTdCwNRrUZKFtHDTpdES9TaiPmAroxMs1Op-oFd4Lal5rKGSjRJ5TPI_T1CybLYf_3UR66n_nfst0cQJIoRrRTed253Wmd793aDNlcam9VoGqIYuLBVvxn227IQwVVAy3sSbqUdkSvccLV0OV-QWpshbWW7u-frDV3kg4EPF9uajdYoETkNXXOtA",
          accept: "application/json"
        }
      });
      // console.log(JSON.stringify(responseCAP) + " Test");
      cap0074Response.push(responseCAP.data.d);
      // console.log(JSON.stringify(responseCAP.data));
      // console.log(JSON.stringify(cap0074Response));
    }
    return responseS4.data.d.results;
};

const buildS4ReqBody = async (data, postingDate, countingDate) => {
  var object = {
    Iblnr:data.PhysInvDoc,
    Werks:data.Plant,
    Lgort:data.StorageLocation,
    Gidat:countingDate,
    Budat:postingDate,
    HeaderToItemNav:[]
  };
  // console.log(object);
  data.to_item.results.forEach(element => {
    object.HeaderToItemNav.push({
      Gjahr:element.FiscalYear,
      Iblnr:element.PhysInvDoc,
      Zeili:element.Item,
      Matnr:element.Material,
      Werks:element.Plant,
      Lgort:element.StorageLocation,
      Menge:element.Quantity,
      Meins:element.Unit,
      Xzael:element.CountInd,
      // Gidat:countingDate,
      // Budat:postingDate
    })
  });
  // object.HeaderToItemNav = JSON.stringify(object.HeaderToItemNav);
  // console.log(object);
  return object;
}

const handlePostInvDiff = async (req, res) => {
  try {
    
  
  console.log("Test 1212");
  console.log(req.body);
  const accessToken = await getCAPAccessToken();
  const tokenCAP = accessToken.tokenCAP;
  const capURL = accessToken.capURL;
  console.log("Test 111");
  const s4Data = await getS4Data(capURL,tokenCAP, req.body.Filters, req.body.REQ_BY);
  const postingDate = req.body.postingDate;
  const countingDate = req.body.countDate;
  ///////////////////////end

  // res.send(responseInvoice.data.data); 
  if (s4Data.length !== 0) {
    var responseArray = [];
    for (let response of s4Data) { 
      let s4PostingData = await buildS4ReqBody(response, postingDate, countingDate);
      console.log(JSON.stringify(s4PostingData));
      let responseS4 = await axios({
        method: 'POST',
        url: capURL + "/v2/ZAPIBPS0012/ZAPIBPS0012POST",//"/sap/opu/odata/sap/ZSRVBHPS0010/ZCDSEHPSC0011",
        data: s4PostingData,
        headers: {
          'Accept': 'application/json',
          Authorization: tokenCAP
        }
      });
 
     
      // console.log(s4PostingData); 
      
    // Werks:data.Plant,
    // Lgort:data.StorageLocation,
        var capPostData = {
          PhysInvDoc:responseS4.data.d.Iblnr,
          PLANT:responseS4.data.d.Werks,
          STORLOC:responseS4.data.d.Lgort,
          HEADER:JSON.stringify(s4PostingData),
          ITEM:JSON.stringify(s4PostingData.HeaderToItemNav),
          STATUS:"Completed",
          MTYPE:responseS4.data.d.Type,
          CLASS:responseS4.data.d.Number,
          MESSAGE:responseS4.data.d.Message
        }; 
        console.log(capPostData);
        let updateId ;
        updateId = cap0074Response.find(element => {
            return element.PhysInvDoc === capPostData.PhysInvDoc;
             
        });
        capPostData.ID =  updateId.ID ;
        // console.log(updateId);
        console.log(capURL + "/v2/ZAPIBPS0012/ZTHBT0074(ID=" + updateId.ID + ")");
        const responseCAP = await axios({
          method: "PUT",
          url: capURL + "/v2/ZAPIBPS0012/ZTHBT0074/" + updateId.ID,
          data: capPostData,
          headers: {
            Authorization: tokenCAP,//"Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vZ2xvYmFsLWRldi0wMDEuYXV0aGVudGljYXRpb24uanAyMC5oYW5hLm9uZGVtYW5kLmNvbS90b2tlbl9rZXlzIiwia2lkIjoiZGVmYXVsdC1qd3Qta2V5LS0xNDA1NDAyNjk5IiwidHlwIjoiSldUIn0.eyJqdGkiOiIzNGIyMzI3MGMwNWY0NmFlYTMyODg3Y2JiYzVkMDJjZSIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiIwMDc1ZTAzMy1hMTFiLTQwZGUtOWVmZi02OGQ0NGI0NmNlOTIiLCJ6ZG4iOiJnbG9iYWwtZGV2LTAwMSJ9LCJzdWIiOiJzYi16aHM0MDIhdDM0NSIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItemhzNDAyIXQzNDUiLCJjaWQiOiJzYi16aHM0MDIhdDM0NSIsImF6cCI6InNiLXpoczQwMiF0MzQ1IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiI1Y2NjNTUxYyIsImlhdCI6MTY3NDE1NTEwNywiZXhwIjoxNjc0MTk4MzA3LCJpc3MiOiJodHRwczovL2dsb2JhbC1kZXYtMDAxLmF1dGhlbnRpY2F0aW9uLmpwMjAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiIwMDc1ZTAzMy1hMTFiLTQwZGUtOWVmZi02OGQ0NGI0NmNlOTIiLCJhdWQiOlsic2ItemhzNDAyIXQzNDUiLCJ1YWEiXX0.h0xTUlNcqebsLuw26hlOoXK0UGeWEnvFGPrWN4sdp25CJHVA7VaB_VbnUYAintjOOLUULBKb-9Y4VKQTWC8W-4onW0nnofmQFPu_SUmbYODTuUbk_REaOSY050FHJD3wbMA2JKXY1ucR6FjAOevkH4U4-lon07xTdCwNRrUZKFtHDTpdES9TaiPmAroxMs1Op-oFd4Lal5rKGSjRJ5TPI_T1CybLYf_3UR66n_nfst0cQJIoRrRTed253Wmd793aDNlcam9VoGqIYuLBVvxn227IQwVVAy3sSbqUdkSvccLV0OV-QWpshbWW7u-frDV3kg4EPF9uajdYoETkNXXOtA",
            accept: "application/json"
          }
        }) .catch(error => {
          // element.parentElement.innerHTML = `Error: ${error.message}`;
          console.error('There was an error!', error);
      });;
        // console.log("test");
        responseArray.push(responseCAP.data);
    
    }
    res.send(responseArray);
  } else {
    res.send("No New Data found in Field Glass System for Invoice");
  }
  } catch (error) {
    console.log(error);
  }
}

app.post("/ZAPIBPS0012PostInvDiff", jsonParser, handlePostInvDiff);//to be schedule for background JOB

app.listen(PORT, () => {
  console.log("port listining");
})