sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/m/MessageBox",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, MessageBox) {
        "use strict";

        return Controller.extend("com.yokogawa.zhmm0024.com.yokogawa.zhmm0024.controller.main", {
            onInit: function () {
                var viewModel = new JSONModel();
                this.getView().setModel(viewModel, "viewModel");
                this.getView().getModel("viewModel").setProperty("/material", false);
                this.getView().getModel("viewModel").setProperty("/BUPFPGPL", false);
                var dialogModel = new JSONModel();
                this.getView().setModel(dialogModel, "dialogModel");
            },
            onSelect: function (oEvt) {

                var selectedKeys = oEvt.getSource().getProperty("selectedKeys");
                this.getView().getModel("viewModel").setProperty("/material", false);
                this.getView().getModel("viewModel").setProperty("/BUPFPGPL", false);
                this.getView().byId("_IDGenComboBox2").setValueState("None");
                //var material = [{select:"",tName:"A820",pmkCode:"100",pmkDesc:"Sales",matCode:"EJA110",matDesc:"Material",msgType:"S",result:"Conditon record created"},{select:"",tName:"A525",pmkCode:"10",pmkDesc:"Eng",matCode:"EJA110A",matDesc:"Abc",msgType:"E",result:"PMK code not match with material"}]
                for (var i = 0; i < selectedKeys.length; i++) {
                    var selectedKey = selectedKeys[i];
                    switch (selectedKey) {
                        case "R": this.getView().getModel("viewModel").setProperty("/material", true);
                            break;
                        case "S": this.getView().getModel("viewModel").setProperty("/material", true);
                            break;
                        case "T": this.getView().getModel("viewModel").setProperty("/material", true);
                            break;
                        case "M": this.getView().getModel("viewModel").setProperty("/material", true);
                            break;
                        case "B": this.getView().getModel("viewModel").setProperty("/BUPFPGPL", true);
                            break;
                    }
                }
                //this.getView().byId("_IDGenTable1").setVisibleRowCount(this.getView().getModel("viewModel").getData().outputTable.length);
                this.getView().getModel("viewModel").refresh(true);
                // if(selectedKey === "04") {
                //     this.getView().byId("_IDGenInput1").setEnabled(false);
                // }
                // else if(selectedKey === "05") {
                //     this.getView().byId("_IDGenInput2").setEnabled(false);
                // }

            },
            onModeChange: function (oEvt) {
                var selectedKey = oEvt.getParameter("selectedItem").getProperty("key");
                this.getView().byId("_IDGenComboBox1").setValueState("None");
                if (selectedKey === "01") {
                    this.getView().getModel("viewModel").setProperty("/normal", true);
                    this.getView().getModel("viewModel").setProperty("/recoveryMode", false);
                }
                else if (selectedKey === "02") {
                    this.getView().getModel("viewModel").setProperty("/recoveryMode", true);
                    this.getView().getModel("viewModel").setProperty("/normal", false);
                    this.getView().byId("TP1").setValue("12:35:32 AM");
                    this.getView().byId("TP2").setValue("12:35:32 PM");
                    this.getView().byId("DP1").setValue("4/1/23");
                    this.getView().byId("DP2").setValue("12/31/23");

                }
            },
            onRunBackGrndJOB: function (oEvt) {

                var that = this;
                var dialogModel = that.getView().getModel("dialogModel").getData();
                var fromDateTime = dialogModel.datefrom + " " + dialogModel.timefrom;
                fromDateTime = new Date(fromDateTime);
                fromDateTime = this.dateConvert(fromDateTime);
                var toDateTime = dialogModel.dateto + " " + dialogModel.timeto;
                toDateTime = new Date(toDateTime);
                toDateTime = this.dateConvert(toDateTime);
                var data = [];
                data.push({
                    start_date: fromDateTime,
                    end_date: toDateTime
                })
                var userInfo = sap.ushell.Container.getService("UserInfo"),
                    today = new Date(),
                    dd = that.addZero(today.getDate()),
                    MM = that.addZero(today.getMonth() + 1),
                    yyyy = today.getFullYear(),
                    url_render = $.sap.getModulePath("com.yokogawa.zhmm0024.com.yokogawa.zhmm0024") + "/scheduler/jobs/372559/schedules",
                    newData = {
                        data: data,
                        description: "Job scheduled by " + userInfo.getFullName() + " on " + MM + '/' + dd + '/' + yyyy,
                        active: true,
                        type: "one-time",
                        time: "now"
                    }
                $.ajax({
                    url: url_render,
                    type: 'POST',
                    data: JSON.stringify(newData),
                    contentType: "application/json",
                    success: function (data) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Job Schedule id: " + data.scheduleId + " was created successfully");
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(e.responseText);
                    }
                });
            },
            onPressExecute: function (oEvt) {
                var selectedMode = this.getView().byId("_IDGenComboBox1").getSelectedKey();
                var list = this.getView().byId("_IDGenComboBox2").getSelectedKeys();
                var selectedList = list.join("");

                if (selectedMode === "01") {

                    var msg = "Please confirm Change Master history table update";
                    var that = this;
                    sap.m.MessageBox.confirm(
                        msg, {
                        title: "Confirmation",
                        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                        onClose: function (oAction) {
                            if (oAction === "YES") {
                                var oModel = that.getOwnerComponent().getModel();
                                that.getView().setBusy(true);
                                oModel.read("/BTP111", {
                                    success: function (oData, oResponse) {
                                        debugger;
                                        that.getView().setBusy(false);
                                        var data = JSON.parse(oResponse.headers["sap-message"]).message[0];
                                        var dialogModel = that.getView().getModel("dialogModel");
                                        dialogModel.setProperty("/datefrom", data.START_DATE);
                                        dialogModel.setProperty("/timefrom", data.START_TIME);
                                        dialogModel.setProperty("/dateto", data.END_DATE);
                                        dialogModel.setProperty("/timeto", data.END_TIME);
                                        MessageToast.show("Last Scheduled data fetched successfully");
                                        that.onRunBackGrndJOB();
                                    },
                                    error: function (mResponse) {
                                        that.getView().setBusy(false);
                                        MessageBox.error("Couldn't fetch Job Scheduler Data");
                                    }
                                });
                            }
                        }
                    });
                }
                else if (selectedMode === "02") {
                    var timefrom = this.getView().byId("TP1").getValue();
                    var datefrom = this.getView().byId("DP1").getDateValue();
                    datefrom = (datefrom.getMonth() + 1).toString() + "/" + (datefrom.getDate()) + "/" + (datefrom.getFullYear()).toString();
                    var timeto = this.getView().byId("TP2").getValue();
                    var dateto = this.getView().byId("DP2").getDateValue();
                    dateto = (dateto.getMonth() + 1).toString() + "/" + (dateto.getDate()) + "/" + (dateto.getFullYear()).toString();
                    var materialValue = this.getView().byId("_IDGenInput1").getValue();
                    var BUPFPGPL = this.getView().byId("_IDGenInput2").getValue();
                    this.getView().byId("TP1").setValueStateText("Time is mandatory");
                    this.getView().byId("TP2").setValueStateText("Time is mandatory");
                    this.getView().byId("DP1").setValueStateText("Date is mandatory");
                    this.getView().byId("DP2").setValueStateText("Date is mandatory");
                    var mandatoryFilled = true;
                    this.getView().byId("_IDGenInput1").setValueStateText("Material is mandatory");
                    if (list.length === 0 || timefrom === "" || datefrom === "" || timeto === "" || dateto === "") {
                        mandatoryFilled = false;
                        if (list.length === 0) {
                            this.getView().byId("_IDGenComboBox2").setValueState("Error");
                            this.getView().byId("_IDGenComboBox2").setValueStateText("Select atleast one entry");
                        }
                        if (timefrom === "") this.getView().byId("TP1").setValueState("Error");
                        if (timeto === "") this.getView().byId("TP2").setValueState("Error");
                        if (datefrom === "") this.getView().byId("DP1").setValueState("Error");
                        if (dateto === "") this.getView().byId("DP2").setValueState("Error");
                        MessageToast.show("Fill all required fields");
                    }
                    if (this.getView().getModel("viewModel").getData().material === true && this.getView().byId("_IDGenInput1").getValue() === "") {
                        mandatoryFilled = false;
                        this.getView().byId("_IDGenInput1").setValueState("Error");
                        MessageToast.show("Fill all required fields");
                    }
                    if (this.getView().getModel("viewModel").getData().BUPFPGPL === true && this.getView().byId("_IDGenInput2").getValue() === "") {
                        mandatoryFilled = false;
                        this.getView().byId("_IDGenInput2").setValueState("Error");
                        MessageToast.show("Fill all required fields");
                    }
                    if (mandatoryFilled === true) {
                        var fromDateTime = datefrom + " " + timefrom;
                        fromDateTime = new Date(fromDateTime);
                        fromDateTime = this.dateConvert(fromDateTime);
                        var toDateTime = dateto + " " + timeto;
                        toDateTime = new Date(toDateTime);
                        toDateTime = this.dateConvert(toDateTime);
                        var that = this;
                        //that.getView().setBusy(true);
                        var url = "/salePurchaseAPIcall?$filter=A4ZCPIF0080RENEWAL_DATE ge '" + fromDateTime + "' and A4ZCPIF0080RENEWAL_DATE le '" + toDateTime + "' and ZIOCH3139 eq '" + selectedList + "' and A4ZCPIF0080SUPERVISE_MO eq '" + materialValue + "' and PRICE_F eq '" + BUPFPGPL + "'";
                        // if(materialValue !== "") url = url + " and A4ZCPIF0080SUPERVISE_MO eq '" + material + "'";
                        // if(BUPFPGPL !== "") url = url + " and PRICE_F eq '" + BUPFPGPL + "'";
                        var oModel = that.getOwnerComponent().getModel();
                        var aFilterIds = ["A4ZCPIF0080DATE_FROM", "A4ZCPIF0080DATE_TO", "ZIOCH3139", "A4ZCPIF0080SUPERVISE_MO", "PRICE_F"];
                        var aFilterOpr = ["EQ", "EQ", "EQ", "EQ", "EQ"]
                        var aFilterValues = [fromDateTime, toDateTime, selectedList, materialValue, BUPFPGPL];
                        var aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues, aFilterOpr);

                        that.getView().setBusy(true);
                        oModel.read("/salePurchaseAPIcall", {
                            filters: aFilters,
                            success: function (oData, oResponse) {

                                that.getView().byId("_IDGenTable1").setVisible(true);
                                that.getView().setBusy(false);
                                var tableData = oData.results;
                                for (var i = 0; i < tableData.length; i++) {
                                    tableData[i].pmkCode = "";
                                    tableData[i].pmkDesc = "";
                                    tableData[i].matDesc = "";
                                    if (tableData[i].success === "S") tableData[i].message = "Condition Record:" + tableData[i].message.match(/\d+\.\d+|\d+/g)[0];
                                    tableData[i].message = that.nextLine(tableData[i].message);
                                }
                                that.getView().getModel("viewModel").setProperty("/outputTable", tableData);
                            },
                            error: function (mResponse) {
                                that.getView().setBusy(false);
                                MessageBox.error(mResponse.message);
                            }
                        });
                    }
                }
                else {
                    this.getView().byId("_IDGenComboBox1").setValueState("Error");
                    this.getView().byId("_IDGenComboBox1").setValueStateText("Mode is mandatory");
                    MessageToast.show("Fill all required fields");
                }
            },
            nextLine: function (inputString) {
                var words = inputString.split(' ');
                var result = '';
                var currentLineLength = 0;
                words.forEach(function (word) {
                    if ((currentLineLength + word.length) <= 55) {
                        result += word + ' ';
                        currentLineLength += word.length + 1; 
                    } else {
                        result += '\n' + word + ' ';
                        currentLineLength = word.length + 1;
                    }
                });
                return result.trim();
            },
            _createSearchFilterObject: function (aFilterIds, aFilterValues, aFilterOpr) {
                var aFilters = [], iCount;
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], aFilterOpr[iCount], aFilterValues[iCount]));
                }
                return aFilters;
            },
            dateConvert: function (dateTimeString) {
                const date = new Date(dateTimeString);
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                // const hours = "00";
                // const minutes = "00";
                // const seconds = "00";
                const formattedDateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
                return formattedDateTime;
            },
            onChangeSDate: function () {
                this.getView().byId("DP1").setValueState("None");
            },
            handleChangeTP2: function () {
                this.getView().byId("TP2").setValueState("None");
            },
            handleChangeTP1: function () {
                this.getView().byId("TP1").setValueState("None");
            },
            onChangeDate2: function () {
                this.getView().byId("DP2").setValueState("None");
            },
            onChangeMat: function () {
                this.getView().byId("_IDGenInput1").setValueState("None");
            },
            onChangeBUPF: function () {
                this.getView().byId("_IDGenInput2").setValueState("None");
            },
            addZero: function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
        });
    });
