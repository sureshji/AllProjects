sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox",
    "sap/m/Input",
    'sap/ui/core/Fragment',
    "sap/m/PDFViewer",
    "sap/base/security/URLWhitelist",
    "sap/m/Select",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    // "sap.ui.model.FilterOperator"
], function (Filter, SmartFilterBar, ComboBox, Input, Fragment, PDFViewer, URLWhitelist, Select, MessageToast, MessageBox) {
    "use strict";
    return {
        onInit: function () {
            this.uiModel = this.getOwnerComponent().getModel("ui");
            this.uiModel.setData({
                listReportActionBtnEditMode: false,
                displayPreview: false,
                displayPrint: false,
                search: {
                    Process_flag: "PartsRequest12",
                    issue_flag: "Y1",
                    Kanban_type: "1",
                    material: "",
                    kanbanid: "",
                    plt_issfrm: "",
                    sloc_issfrm: "",
                    printdt: "",
                    printtm: "",
                    plant_issto: "",
                    sloc_issto: "",
                    language: "",
                    supp_areaissto: ""
                }
            });
            // this.byId("listReportFilter").attachFilterChange(this.onChangePlant.bind(this));
            this.firstTime = true;
            this.firstBindTableTime = true;
            // this.getPrintQueues();
            // this.byId("trafficColumn").getParent().attachRowsUpdated(this.onTableRowsUpdated.bind(this));
            // this.byId("trafficColumn").getParent().setAlternateRowColors(true)

            // if(this.byId("GridTable").getColumns()[0].getLabel().getText() === 'Traffic Light'){
            //     var template = new sap.ui.core.Icon({
            //         src:"sap-icon://circle-task-2",
            //         color:"{= ${color} === '' ? '#1d2d3e' : '#bb0000'}"
            //     });
            //     this.byId("GridTable").getColumns()[0].setTemplate(template)
            // }
            this.getOwnerComponent().getModel("ZSRVBHCM0001").setSizeLimit(2000);

            this.byId("listReportFilter").attachFilterChange(this.onChangePlant.bind(this));
        },
        onChangePlant: function (oEvent) {
            var parameters = oEvent.getParameters();

            // check auth for plant issue from
            if (parameters && parameters.getParameter("id").includes("plt_issfrm")) {
                var id = parameters.getParameter("id");
                var oFilters = [];
                var tokens = this.byId(id).getProperty("value").match(/\(([^)]+)\)/)[1];
                if (tokens.length > 0) {
                    oFilters.push(new Filter("Plant", "EQ", tokens));
                    var that = this;
                    this.getOwnerComponent().getModel("ZSRVBHCM0001").read("/plant", {
                        filters: oFilters,
                        success: function (res) {
                            var message = "";
                            var found = res.results.filter(function (object) {
                                return object.Plant === tokens;
                            });
                            if (!found || found.length === 0) {
                                message += "You are not authorized to plant " + tokens + "\n";
                                that.byId(id).setValue();
                            }
                            if (message !== "") {
                                MessageBox.error(message);
                            }
                        }
                    });
                }
            }
            // check auth for plant issue to
            if (parameters && parameters.getParameter("id").includes("plant_issto")) {
                var id = parameters.getParameter("id");
                var oFilters = [];
                var tokens = this.byId(id).getProperty("value").match(/\(([^)]+)\)/)[1];
                if (tokens.length > 0) {
                    oFilters.push(new Filter("Plant", "EQ", tokens));
                    var that = this;
                    this.getOwnerComponent().getModel("ZSRVBHCM0001").read("/plant", {
                        filters: oFilters,
                        success: function (res) {
                            var message = "";
                            var found = res.results.filter(function (object) {
                                return object.Plant === tokens;
                            });
                            if (!found || found.length === 0) {
                                message += "You are not authorized to plant " + tokens + "\n";
                                that.byId(id).setValue();
                            }
                            if (message !== "") {
                                MessageBox.error(message);
                            }
                        }
                    });
                }
            }
        },
        plantIsTo: function (flg) {
            if (flg === 'FirstIssue') {
                // this.getView().byId('plant_issto').setMandatory('mandatory')
                return 'mandatory'
            } else {
                // this.getView().byId('plant_issto').setMandatory('notMandatory')
                return 'notMandatory'
            }
        },

        getPrintQueues: function () {
            var that = this;
            var sValue = this.getOwnerComponent().getModel("ui").getProperty("/search/Kanban_type")
            this.getOwnerComponent().getModel().read("/ZCDSEBPPB0058", {
                filters: [
                    new Filter({
                        filters: [
                            new Filter("REPORTID", FilterOperator.EQ, sValue)
                        ],
                        and: false
                    })
                ],
                success: function (response) {
                    that.getView().getModel("ui").setProperty("/aQueues", response.results);
                },
                error: function (oError) {
                    console.log("Error while calling Printer list from ZCDSEBPPB0058 from main service ", oError)
                }
            });
        },
        getCustomAppStateDataExtension: function (oCustomData) {
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            if (oCustomData) {
                var oCustomField1 = this.oView.byId("Process_flag");
                // if (oCustomField1) {
                //     oCustomData.Process_flag = oCustomField1.getSelectedKey();
                // }
            }
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                // if (oCustomData.Process_flag) {
                //     var oComboBox = this.oView.byId("Process_flag");
                //     oComboBox.setSelectedKey(
                //         oCustomData.Process_flag
                //     );
                // }
            }
        },
        // onTableRowsUpdated: function (oEvent) {
        //     if (oEvent) {
        //         oEvent.getSource().getPlugins()[0].selectAll();
        //     }

        // },
        onBeforeRebindTableExtension: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            oBindingParams.parameters = oBindingParams.parameters || {};
            if (oBindingParams.parameters && oBindingParams.parameters.select) {
                oBindingParams.parameters.select += ",Process_flag";
            }
            var sProcess_flag = this.uiModel.getProperty("/search/Process_flag");
            this.byId("btnPrint").setVisible(sProcess_flag !== "Display");
            var sissue_flag = this.uiModel.getProperty("/search/issue_flag");
            var sKanban_type = this.uiModel.getProperty("/search/Kanban_type");
            var aPlt_issfrm = oSmartFilterBar.getControlByKey("plt_issfrm").getValue();
            var aSloc_issfrm = oSmartFilterBar.getControlByKey("sloc_issfrm").getTokens();
            var aPlant_issto = oSmartFilterBar.getControlByKey("plant_issto").getValue();
            var aSloc_issto = oSmartFilterBar.getControlByKey("sloc_issto").getTokens();
            if (sProcess_flag === "PartsRequest12" && aPlt_issfrm.length === 0) {
                MessageBox.error("Enter the 'Plant Issued From' (Mandatory field)");
                oBindingParams.preventTableBind = true
                return
            }
            // if (sProcess_flag === "PartsRequest12" && aSloc_issfrm.length === 0) {
            //     MessageBox.error("Enter the 'Storage Location From' (Mandatory field)");
            //     oBindingParams.preventTableBind = true
            //     return
            // }

            if (sProcess_flag === "FirstIssue" && aPlant_issto.length === 0) {
                MessageBox.error("Enter the 'Plant Issued To' (Mandatory field)");
                oBindingParams.preventTableBind = true
                return
            }
            if (sProcess_flag === "FirstIssue" && aSloc_issto.length === 0) {
                MessageBox.error("Enter the 'Storage Location To' (Mandatory field)");
                oBindingParams.preventTableBind = true
                return
            }
            // if (sProcess_flag === "Display" && ((aPlt_issfrm.length === 0 && aSloc_issfrm.length === 0 && aPlant_issto.length === 0 && aSloc_issto.length === 0) ||
            //         (aPlt_issfrm.length > 0 && aSloc_issfrm.length === 0) || (aPlant_issto.length > 0 && aPlant_issto.length === 0) || (aPlt_issfrm.length > 0 && aPlant_issto.length === 0))) {
            //     MessageBox.error("Enter the 'Either Plant Issued From or Plant Issue To' (Mandatory field)");
            //     oBindingParams.preventTableBind = true
            //     return
            // }
            if (sProcess_flag === "Display") {
                if ((aPlt_issfrm.length === 0 && aSloc_issfrm.length === 0 && aPlant_issto.length === 0 && aSloc_issto.length === 0)) {
                    MessageBox.error("Enter the 'Either Plant Issued From or Plant Issue To' (Mandatory field)");
                    oBindingParams.preventTableBind = true
                    return
                }
            }
            if (sProcess_flag === "PartsRequest12") {
                oBindingParams.filters.push(new Filter("selectflag", "EQ", sissue_flag));
            } else if (sProcess_flag === "FirstIssue") {
                oBindingParams.filters.push(new Filter("selectflag", "EQ", "X" + sKanban_type));
            } else if (sProcess_flag === "Display") {
                oBindingParams.filters.push(new Filter("selectflag", "EQ", "X" + sKanban_type));
            }

        },
        onValueHelpSpecifyPrinter: function () {
            var that = this;
            var oView = this.getView();
            if (!this._oDialogPrintQueue) {
                this._oDialogPrintQueue = Fragment.load({
                    id: "OutputSelection",
                    name: "com.yokogawa.zhpp0003.ext.fragments.Select",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._oDialogPrintQueue.then(function (oDialog) {
                oDialog.getAggregation('_dialog').getContent()[1].setBusy(true);

                var Kanban_type = that.uiModel.getProperty("/search/Kanban_type");
                var proces_flag = that.uiModel.getProperty("/search/Process_flag");

                if (proces_flag === "PartsRequest12") {
                    var sValue = 11
                } else {
                    if (Kanban_type === "5" || Kanban_type === "6") {
                        var sValue = 9
                    } else if (Kanban_type === "7" || Kanban_type === "8") {
                        var sValue = 10
                    } else if (Kanban_type === "1" || Kanban_type === "2") {
                        var sValue = 11
                    } else if (Kanban_type === "3" || Kanban_type === "4") {
                        var sValue = 12
                    }
                }
                that.getOwnerComponent().getModel().read("/ZCDSEBPPB0058", {
                    filters: [
                        new Filter({
                            filters: [
                                new Filter("REPORTID", sap.ui.model.FilterOperator.EQ, sValue)
                            ],
                            and: false
                        })
                    ],
                    success: function (response) {
                        that.getView().getModel("ui").setProperty("/aQueues", response.results);
                        oDialog.getAggregation('_dialog').getContent()[1].setBusy(false);
                    },
                    error: function (oError) {
                        oDialog.getAggregation('_dialog').getContent()[1].setBusy(false);
                        MessageBox.error(oError);
                        console.log("Error while calling Printer list from ZCDSEBPPB0058 from main service ", oError)
                    }
                });

                oDialog.open();
                oDialog.clearSelection(false);
            });
        },
        onQDialogClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                this.getView().getModel("ui").setProperty("/SpecifiedPrinter", oSelectedItem.getTitle());
                var inputField = Fragment.byId("OutputSelection", "7v");
                var printBtn = Fragment.byId("OutputSelection", "btnPrint");
                inputField.setValue(oSelectedItem.getTitle())
                inputField.setProperty('valueState', 'Success');
                inputField.setProperty('valueStateText', '');
                printBtn.setEnabled(true);
            }
        },

        onQueueSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oBinding = oEvent.getParameter("itemsBinding");
            if (sValue) {
                oBinding.filter([new Filter({
                    filters:
                        [
                            new Filter("PRINTERID", sap.ui.model.FilterOperator.Contains, sValue),
                            new Filter("KEY1", sap.ui.model.FilterOperator.Contains, sValue),
                            new Filter("KEY2", sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                    and: false
                })
                ]);
            } else {
                oBinding.filter([]);
            }

        },
        onClear: function () {
            this.getView().byId("listReportFilter").fireClear();
            this.onInitSmartFilterBarExtension();
        },
        onOutputSelect: function () {
            var that = this;

            var oView = this.getView();
            this.getView().getModel("ui").setProperty("/SendTOQueue", false);
            this.getView().getModel("ui").setProperty("/PDFDownload", false);
            this.getView().getModel("ui").setProperty("/TextDownload", false);
            // create popover
            if (!this._oDialogOutputSelection) {
                this._oDialogOutputSelection = Fragment.load({
                    id: "OutputSelection",
                    name: "com.yokogawa.zhpp0003.ext.fragments.OutputSelection",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            that._oDialogOutputSelection.then(function (oDialog) {
                oDialog.open();
                Fragment.byId("OutputSelection", "defaultPrinter").setSelected(true);
                Fragment.byId("OutputSelection", "specifyPrinter").setSelected(false);
                Fragment.byId("OutputSelection", "7v").setEnabled(false);
                Fragment.byId("OutputSelection", "7v").setValueState("None");
                that.getView().getModel("ui").setProperty("/SpecifiedPrinter", "");
            });


        },
        onSpecificPrinterSelect: function (oEvent) {
            oEvent.getSource().getParent().getAggregation('items')[1].setEnabled(true);
            Fragment.byId("OutputSelection", "btnPrint").setEnabled(false);
        },
        onSelectDefaultPrinter: function (oEvent) {
            oEvent.getSource().getParent().getAggregation('items')[1].getItems()[1].setEnabled(false);
            Fragment.byId("OutputSelection", "btnPrint").setEnabled(true);
        },
        onPrinterValEntered: function (oEvent) {

            var enteredVal = oEvent.getParameter("value");
            var inputField = Fragment.byId("OutputSelection", "7v")
            var printList = this.uiModel.getProperty('/aQueues')
            var printBtn = Fragment.byId("OutputSelection", "btnPrint");
            var specificPrinterRadioSelected = Fragment.byId("OutputSelection", "specifyPrinter").getSelected()
            if (specificPrinterRadioSelected) {
                if (printList && printList.length) {
                    let isInprintList = printList.some(obj => {
                        return obj.qname === enteredVal
                    })
                    if (!isInprintList) {
                        inputField.setProperty('valueState', 'Error');
                        inputField.setProperty('valueStateText', 'Invalid Entry');
                        printBtn.setEnabled(false);
                    } else {
                        inputField.setProperty('valueState', 'Success');
                        inputField.setProperty('valueStateText', '');
                        printBtn.setEnabled(true);
                    }
                } else {
                    inputField.setProperty('valueState', 'Error');
                    inputField.setProperty('valueStateText', 'Wrong Printer ID');
                    printBtn.setEnabled(false);
                }
            } else {
                printBtn.setEnabled(true);
            }

        },
        onPrint: function () {
            this.getView().getModel("ui").setProperty("/TextDownload", false);
            this.getView().getModel("ui").setProperty("/PDFDownload", false);
            this.getView().getModel("ui").setProperty("/SendTOQueue", true);
            // var data = this.extensionAPI.getSelectedContexts()[0].getObject();

            this.getPickingData();
        },
        onPDFDownload: function () {
            this.getView().getModel("ui").setProperty("/SendTOQueue", false);
            this.getView().getModel("ui").setProperty("/TextDownload", false);
            this.getView().getModel("ui").setProperty("/PDFDownload", true);
            this.getPickingData();

        },
        onTextDownload: function () {
            this.getView().getModel("ui").setProperty("/TextDownload", true);
            this.getView().getModel("ui").setProperty("/PDFDownload", false);
            this.getView().getModel("ui").setProperty("/SendTOQueue", false);
            this.getPickingData();

        },
        onClose: function () {
            var that = this;
            this._oDialogOutputSelection.then(function (oDialog) {
                Fragment.byId("OutputSelection", "defaultPrinter").setSelected(true);
                Fragment.byId("OutputSelection", "specifyPrinter").setSelected(false);
                Fragment.byId("OutputSelection", "btnPrint").setEnabled(true);
                that.getView().getModel("ui").setProperty("/SpecifiedPrinter", "");
                oDialog.close();
            });
        },

        getTheFormBtoA: function () {
            var aBtoa = "";
            var key = ""
            return aBtoa;
        },

        readErrorMessages: function () {
            sap.ui.core.BusyIndicator.hide();
            var aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
            var message = "";
            aMessages.forEach(function (oMessage) {
                if (message.indexOf(oMessage.getMessage()) === -1) {
                    message += oMessage.getMessage();
                }
            });
            if (message) {
                MessageBox.error(message);
            }
        },

        getLanguage: function () {
            var aLanguage = this.byId("listReportFilter").getControlByKey("language");
            if (aLanguage && aLanguage.getTokens().length > 0) {
                return aLanguage.getTokens()[0].getCustomData()[0].getValue().value1;
            }
            return "";
        },

        getPickingData: function (oEvent) {
            var that = this;
            var oContexts = this.extensionAPI.getSelectedContexts();
            //var xdpTempalge = 'PickingListReportsSetForm/SetForm'
            var data = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>`;
            sap.ui.core.BusyIndicator.show(0);
            var totalCount = oContexts.length - 1;
            var allDocuments = [];
            var sProcess_flag = this.uiModel.getProperty("/search/Process_flag");
            var sIssue_flag = this.uiModel.getProperty("/search/issue_flag");
            var sKanban_type = this.uiModel.getProperty("/search/Kanban_type");
            sap.ui.getCore().getMessageManager().removeAllMessages();
            let diffedGroups = [];
            oContexts.forEach(function (object, index) {
                diffedGroups.push("ZCDSEHPPB0085C" + index);
            });
            that.getOwnerComponent().getModel().setDeferredGroups(diffedGroups);
            oContexts.forEach(function (object, index) {
                // decide if to update ZTHBT0030 or Insert
                that.bUpdateZTHBT0030 = false;
                that.getOwnerComponent().getModel().create("/ZCDSEHPPB0085C", object.getObject(),
                    {
                        groupId: "ZCDSEHPPB0085C" + index,
                        success: (resPost) => {
                            let infoPath = object.getPath();
                            if (resPost.message) {
                                that.getOwnerComponent().getModel().setProperty(object.getPath() + "/message", resPost.message);
                                sap.ui.core.BusyIndicator.hide(0);
                                // MessageBox.error(resPost.message); 
                            } else if (sKanban_type === "5" || sKanban_type === "6" || sKanban_type === "7" || sKanban_type === "8") {//Form 3                      

                                that.getOwnerComponent().getModel().read("/ZCDSEHPPB0068", {
                                    filters: [new Filter("kanbanid", "EQ", object.getObject().kanbanid), new Filter("materialnumber", "EQ", object.getObject().material), new Filter("language", "EQ", that.getLanguage())],
                                    success: function (res) {
                                        var aZCDSEHPPB0068 = res.results[0];
                                        that.getOwnerComponent().getModel().read("/ZTHBT0030", {
                                            filters: [new Filter("PKNUM", "EQ", object.getObject().kanbannum), new Filter("PKKEY", "EQ", object.getObject().kanbanid)],
                                            success: function (res30) {
                                                var revnum = 1;
                                                res30 = res30.results;
                                                if (res30.length > 0) {
                                                    res30.sort(function (a, b) { return Number(b.REVNR) - Number(a.REVNR) })
                                                    revnum = Number(res30[0].REVNR);
                                                    revnum = ("0000000" + revnum).slice(-2);
                                                    that.bUpdateZTHBT0030 = true;
                                                }
                                                // if (sProcess_flag === "FirstIssue") {
                                                let Process_flag = object.getObject().Process_flag ? object.getObject().Process_flag : "00";
                                                var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrdering003(aZCDSEHPPB0068, Process_flag))));//(xmlData);(that.getProductionOrdering003(aZCDSEHPPB0068));
                                                // }
                                                var jsondata1 = {
                                                    "xdpTemplate": "ProductionOrdering/ZHPPF0003",
                                                    "xmlData": encdata,
                                                };
                                                allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068 });
                                                // if (totalCount === index) {
                                                that.printAllDocuments(allDocuments, index);
                                                // }
                                            },
                                            error: that.readErrorMessages.bind(that)
                                        });
                                    },
                                    error: that.readErrorMessages.bind(that)
                                });
                            } else {
                                that.getOwnerComponent().getModel().read("/ZCDSEHPPB0069", {
                                    filters: [new Filter("kanbanid", "EQ", object.getObject().kanbanid), new Filter("Material", "EQ", object.getObject().material), new Filter("language", "EQ", that.getLanguage())],
                                    success: function (res) {
                                        var aZCDSEHPPB0069 = res.results[0];
                                        that.getOwnerComponent().getModel().read("/ZTHBT0030", {
                                            filters: [new Filter("PKNUM", "EQ", object.getObject().kanbannum), new Filter("PKKEY", "EQ", object.getObject().kanbanid)],
                                            success: function (res30) {
                                                var xdpTemplate = "";
                                                var encdata = "";
                                                res30 = res30.results;
                                                var revnum = "";
                                                if (res30.length > 0) {
                                                    res30.sort(function (a, b) { return Number(b.REVNR) - Number(a.REVNR) })
                                                    // aZCDSEHPPB0069.QRkanbannum = object.getObject().kanbanid + "2" + res30[0].REVNR;
                                                    // revnum = Number(res30[0].REVNR) + 1 ;
                                                    revnum = Number(res30[0].REVNR);
                                                    revnum = ("000" + revnum.toString()).slice(-2);
                                                    that.bUpdateZTHBT0030 = true
                                                }
                                                if (sKanban_type === "3") {
                                                    xdpTemplate = "PartsOrderKanban/ZHPPF0001";
                                                    let kanbanId = "0000000000" + object.getObject().kanbanid;
                                                    kanbanId = kanbanId.slice(-10);
                                                    let Process_flag = object.getObject().Process_flag ? object.getObject().Process_flag : "00";
                                                    aZCDSEHPPB0069.QRkanbannum = kanbanId + "2" + Process_flag;
                                                    encdata = btoa(unescape(encodeURIComponent((that.getPartsOrderKanban001(aZCDSEHPPB0069, revnum, true)))));
                                                } else if (sKanban_type === "4") {
                                                    let kanbanId = "0000000000" + object.getObject().kanbanid;
                                                    kanbanId = kanbanId.slice(-10);
                                                    let Process_flag = object.getObject().Process_flag ? object.getObject().Process_flag : "00";

                                                    aZCDSEHPPB0069.QRkanbannum = kanbanId + "2" + Process_flag;
                                                    aZCDSEHPPB0069.qrcodesecond = kanbanId + "1" + Process_flag;
                                                    xdpTemplate = "PartsOrderKanban2Scan/ZHPPF0016";
                                                    encdata = btoa(unescape(encodeURIComponent((that.getPartsOrderKanban001(aZCDSEHPPB0069, revnum)))));
                                                } else {
                                                    let kanbanId = "0000000000" + object.getObject().kanbanid;
                                                    kanbanId = kanbanId.slice(-10);
                                                    let Process_flag = object.getObject().Process_flag ? object.getObject().Process_flag : "00";

                                                    if (sProcess_flag === "FirstIssue") {
                                                        aZCDSEHPPB0069.QRkanbannum = kanbanId + "3" + Process_flag;
                                                    } else if (sProcess_flag === "PartsRequest12" && sIssue_flag == "Y1") {
                                                        aZCDSEHPPB0069.QRkanbannum = kanbanId + "3" + Process_flag;
                                                    } else if (sProcess_flag === "PartsRequest12" && sIssue_flag == "Y2") {
                                                        aZCDSEHPPB0069.QRkanbannum = kanbanId + "3" + revnum;
                                                    }
                                                    xdpTemplate = "PartsOrderStepOneTwo/ZHPPF0002";
                                                    encdata = btoa(unescape(encodeURIComponent((that.getPartsOrderStepOneTwo002(aZCDSEHPPB0069, revnum)))));
                                                }
                                                var jsondata1 = {
                                                    "xdpTemplate": xdpTemplate,
                                                    "xmlData": encdata,
                                                };
                                                allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0069 });
                                                //  if (totalCount === index) {
                                                that.printAllDocuments(allDocuments, index);
                                                // }
                                            },
                                            error: that.readErrorMessages.bind(that)
                                        });
                                    },
                                    error: that.readErrorMessages.bind(that)
                                });
                            }
                        },
                        error: that.readErrorMessages.bind(that)
                    }
                );

                that.getOwnerComponent().getModel().submitChanges({
                    groupId: "ZCDSEHPPB0085C" + index,
                    success: function (res) {
                    },
                    error: function () { }
                })
                // SRVBHPP0008/ZCDSEHPPB0069?$filter=kanbanid%20eq%20%27351%27%20and%20language%20eq%20%27EN%27

            });

        },

        exportToCSV: function (res) {

            var csvFile = res;
            sap.ui.core.BusyIndicator.hide();
            var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, "download.csv");
            } else {
                var link = document.createElement("a");
                if (link.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "download.csv");
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        },

        printAllDocuments: function (documents, selIndex) {
            var that = this;
            var csvData = "";
            sap.ui.core.BusyIndicator.show(0)
            if (this.getView().getModel("ui").getProperty("/TextDownload")) {
                var sKanban_type = that.getOwnerComponent().getModel("ui").getProperty("/search/Kanban_type");
                var sIssueType = that.getOwnerComponent().getModel("ui").getProperty("/search/IssueType");
                if (sKanban_type === "5" || sKanban_type === "6" || sKanban_type === "7" || sKanban_type === "8") {//Form 3
                    csvData = that.getForm3Key() + '\n';
                    documents.forEach(function (resObject) {
                        csvData += that.getForm3Data(resObject.res) + '\n';
                    });
                } else if (["1", "2"].indexOf(sKanban_type) !== -1) { //Form 2
                    csvData = that.getForm2Key() + '\n';
                    documents.forEach(function (resObject) {
                        csvData += that.getForm2Data(resObject.res) + '\n';
                    });
                } else {
                    csvData = that.getForm1Key() + '\n';
                    documents.forEach(function (resObject) {//Form 1
                        csvData += that.getForm1Data(resObject.res) + '\n';
                    });
                }
                debugger;
                var oContexts = that.extensionAPI.getSelectedContexts();
                var info = oContexts[selIndex];
                var object = info.getPath();
                that.getView().getModel().setProperty(object + "/message", "X");
                // that.getView().getModel().setProperty(object + "/Printhist", info.getObject().Process_flag);
                that.updateMedia(object);
                that.exportToCSV(csvData);
                sap.ui.core.BusyIndicator.hide();
            } else {
                documents.forEach(function (res) {
                    that.openPDF(res.jsondata1, res.res, selIndex);
                });
            }
        },

        getPartsOrderKanban001: function (object, revner, hideQRsecond) {
            if (!object) {
                object = {};
            }
            var today = new Date();

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd", UTC: false
            });
            var date = oDateFormat.format(today);
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "hh:mm:ss", UTC: false
            });
            var time = oDateFormat.format(new Date());
            // time=new Date().toTimeString().split(' ')[0];

            var reportid = "";
            if (object.Reportid) {
                reportid = ('0000' + object.Reportid.toString()).slice(-3);
            }
            // var pkkey = object.buildingcode.split("  ");
            // if (pkkey && pkkey.length > 0) {
            //     pkkey = pkkey[0].trim();
            // }

            var data = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>`;

            data += `<data>`;
            data += `<OUTPUT>`;
            data += `<KANBANID>` + object.kanbanid + `</KANBANID>`;
            data += `<LANGUAGE>` + object.language + `</LANGUAGE>`;
            data += `<REVNR>` + object.revnr + `</REVNR>`;
            data += `<STORAGE_LOCTO>` + object.storage_locto + `</STORAGE_LOCTO>`;
            data += `<STORAGE_LOCFROM>` + object.storage_locfrom + `</STORAGE_LOCFROM>`;
            data += `<SUPP_AREA_ISS>` + object.Supp_Area_iss + `</SUPP_AREA_ISS>`;
            data += `<QUANTITYUNIT>` + object.Quantityunit + `</QUANTITYUNIT>`;
            data += `<KANBANQUN>` + object.Kanbanqun + `</KANBANQUN>`;
            data += `<MATERIAL>` + object.Material + `</MATERIAL>`;
            data += `<BOXTYPE>` + object.Boxtype + `</BOXTYPE>`;
            data += `<MATERIALDESCRIPTION>` + object.Materialdesc + `</MATERIALDESCRIPTION>`;
            data += `<QRKANBANNUM>` + object.QRkanbannum + `</QRKANBANNUM>`;
            if (!hideQRsecond) {
                data += `<QRCODESECOND>` + object.qrcodesecond + `</QRCODESECOND>`;
            }

            data += `<STORAGEBINISS>` + object.Storagebiniss + `</STORAGEBINISS>`;
            data += `<BULKINFO>` + object.Bulkinfo + `</BULKINFO>`;
            data += `<DESCRIPTION>` + object.description + `</DESCRIPTION>`;
            data += `<PREPROCESS10>` + object.preprocess10 + `</PREPROCESS10>`;
            data += `<PREPROCESS20>` + object.preprocess20 + `</PREPROCESS20>`;
            data += `<NOTE>` + object.Note + `</NOTE>`;
            data += `<N_X>` + object.n_x + `</N_X>`;
            data += `<ADDRESS>` + object.address + `</ADDRESS>`;
            data += `<S_DATE>` + date + `</S_DATE>`;
            data += `<S_TIME>` + time + `</S_TIME>`;
            data += `<COMPANYCODE>` + object.Companycode + `</COMPANYCODE>`;
            data += `<SCAN1_2>` + object.scan1_2 + `</SCAN1_2>`;
            data += `<BATCHFLAG>` + object.batchflag + `</BATCHFLAG>`;
            data += `<MATERIALQR>` + object.MaterialQR + `</MATERIALQR>`;
            data += `<REPORTID>` + reportid + `</REPORTID>`;
            data += `<STORAGE_LOC_STEP12>` + object.storage_loc_step12 + `</STORAGE_LOC_STEP12>`;
            data += `<SUPP_AREA_ISS_STEP12>` + object.Supp_Area_iss_step12 + `</SUPP_AREA_ISS_STEP12>`;
            data += `<BUILDINGCODE>` + object.buildingcode + `</BUILDINGCODE>`;
            data += `<TOTALNO>` + object.TotalNo + `</TOTALNO>`;
            data += `<DATANO>` + object.DataNo + `</DATANO>`;
            data += `<BULKINFO>` + object.Bulkinfo + `</BULKINFO>`;
            data += `<PLANTABB>` + object.Plantabb + `</PLANTABB>`;
            data += `<STORAGETEXT>` + object.Storetext + `</STORAGETEXT>`;
            data += `<ADRNUM>` + object.adrnum + `</ADRNUM>`;
            data += `<MEINS>` + object.meins + `</MEINS>`;
            data += `</OUTPUT>`;
            data += `</data>`;
            return data;
        },
        getProductionOrdering003: function (object, revner) {
            var today = new Date();
            if (!object) {
                object = {};
            }

            var today = new Date();
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd", UTC: false
            });
            object.printdate = oDateFormat.format(today);

            object.kanbanid = "0000000000" + object.kanbanid;
            object.kanbanid = object.kanbanid.slice(-10);

            var reportid = "";
            if (object.reportid) {
                reportid = ('0000' + object.reportid.toString()).slice(-3);
            }
            var data = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>`;
            data += `<data>`;
            data += `<OUTPUT>`;
            data += `<MATERIALNUMBER>` + object.materialnumber + `</MATERIALNUMBER>`;
            data += `<PKSTU>` + object.pkstu + `</PKSTU>`;
            data += `<MATERIALDESCRIPTION>` + object.materialdescription + `</MATERIALDESCRIPTION>`;
            data += `<KANBANID>` + object.kanbanid + `</KANBANID>`;
            data += `<RAWMATERIAL>` + object.rawmaterial + `</RAWMATERIAL>`;
            data += `<CYCLESTORINGPOSITION>` + object.cyclestoringposition + `</CYCLESTORINGPOSITION>`;
            data += `<MATERIALSTORAGEBIN>` + object.materialstoragebin + `</MATERIALSTORAGEBIN>`;
            if (object.pkstu === "Y201" || object.pkstu === "Y203") {
                data += `<QRCODEFIRST>` + "X" + `</QRCODEFIRST>`;
            } else {
                data += `<QRCODEFIRST>` + object.kanbanid + "1" + revner + object.pkstu + object.materialnumber + object.behmg + object.elpro + object.areastoragelocation + object.materialstoragebin + `</QRCODEFIRST>`;
            }
            data += `<QRCODESECOND>` + object.kanbanid + "2" + revner + object.pkstu + object.materialnumber + object.behmg + object.elpro + object.areastoragelocation + object.materialstoragebin + `</QRCODESECOND>`;
            // data += `<QRCODESECOND>` + object.qrcodesecond + `</QRCODESECOND>`;
            data += `<SUMOFLT>` + object.sumoflt + `</SUMOFLT>`;
            data += `<QUANTITY>` + object.quantity + `</QUANTITY>`;
            data += `<BOXTYPE>` + object.boxtype + `</BOXTYPE>`;
            data += `<NUMBEROFKANBAN>` + object.numberofkanban + `</NUMBEROFKANBAN>`;
            data += `<AREASTORAGELOCATION>` + object.areastoragelocation + `</AREASTORAGELOCATION>`;
            data += `<AREASTORINGPOSITION>` + object.areastoringposition + `</AREASTORINGPOSITION>`;
            data += `<AREASTORAGEBIN>` + object.areastoragebin + `</AREASTORAGEBIN>`;
            data += `<PROCESS>` + object.process + `</PROCESS>`;
            data += `<PRINTDATE>` + object.printdate + `</PRINTDATE>`;
            data += `<UNIT>` + object.unit + `</UNIT>`;
            data += `<NOTES>` + object.notes + `</NOTES>`;
            data += `<REPORTID>` + reportid + `</REPORTID>`;
            data += `<SCAN1_2>` + object.scan1_2 + `</SCAN1_2>`;
            data += `</OUTPUT>`;
            data += `</data>`;
            return data;
        },

        getPartsOrderStepOneTwo002: function (object, revner) {

            if (!object) {
                object = {};
            }

            var today = new Date();
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd", UTC: false
            });
            var date = oDateFormat.format(today);

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "hh:mm:ss", UTC: false
            });
            var time = oDateFormat.format(new Date());

            // time=new Date().toTimeString().split(' ')[0];

            var reportid = "";
            if (object.Reportid) {
                reportid = ('0000' + object.Reportid.toString()).slice(-3);
            }
            // make length of QR code value 13 by adding extra zeros before kanban id
            // object.kanbanid = "0000000000" + object.kanbanid;
            // object.kanbanid = object.kanbanid.substr(object.kanbanid.length - 10);
            var data = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>`;
            data += `<data>`;
            data += `<OUTPUT>`;
            data += `<KANBANID>` + object.kanbanid + `</KANBANID>`;
            data += `<LANGUAGE>` + object.language + `</LANGUAGE>`;
            data += `<REVNR>` + object.revnr + `</REVNR>`;
            data += `<STORAGE_LOCTO>` + object.storage_locto + `</STORAGE_LOCTO>`;
            data += `<STORAGE_LOCFROM>` + object.storage_locfrom + `</STORAGE_LOCFROM>`;
            data += `<SUPP_AREA_ISS>` + object.Supp_Area_iss + `</SUPP_AREA_ISS>`;
            data += `<QUANTITYUNIT>` + object.Quantityunit + `</QUANTITYUNIT>`;
            data += `<KANBANQUN>` + object.Kanbanqun + `</KANBANQUN>`;
            data += `<MATERIAL>` + object.Material + `</MATERIAL>`;
            data += `<BOXTYPE>` + object.Boxtype + `</BOXTYPE>`;
            data += `<MATERIALDESCRIPTION>` + object.Materialdesc + `</MATERIALDESCRIPTION>`;
            data += `<QRKANBANNUM>` + object.QRkanbannum + `</QRKANBANNUM>`;
            data += `<STORAGEBINISS>` + object.Storagebiniss + `</STORAGEBINISS>`;
            data += `<BULKINFO>` + object.Bulkinfo + `</BULKINFO>`;
            data += `<DESCRIPTION>` + object.description + `</DESCRIPTION>`;
            data += `<PREPROCESS10>` + object.preprocess10 + `</PREPROCESS10>`;
            data += `<PREPROCESS20>` + object.preprocess20 + `</PREPROCESS20>`;
            data += `<NOTE>` + object.Note + `</NOTE>`;
            data += `<N_X>` + object.n_x + `</N_X>`;
            data += `<ADDRESS>` + object.address + `</ADDRESS>`;
            data += `<S_DATE>` + date + `</S_DATE>`;
            data += `<S_TIME>` + time + `</S_TIME>`;
            data += `<COMPANYCODE>` + object.Companycode + `</COMPANYCODE>`;
            data += `<SCAN1_2>` + object.scan1_2 + `</SCAN1_2>`;
            data += `<BATCHFLAG>` + object.batchflag + `</BATCHFLAG>`;
            data += `<MATERIALQR>` + object.MaterialQR + `</MATERIALQR>`;
            data += `<REPORTID>` + reportid + `</REPORTID>`;
            data += `<STORAGE_LOC_STEP12>` + object.storage_loc_step12 + `</STORAGE_LOC_STEP12>`;
            data += `<SUPP_AREA_ISS_STEP12>` + object.Supp_Area_iss_step12 + `</SUPP_AREA_ISS_STEP12>`;
            data += `<BUILDINGCODE>` + object.buildingcode + `</BUILDINGCODE>`;
            data += `<TOTALNO>` + object.TotalNo + `</TOTALNO>`;
            data += `<DATANO>` + object.DataNo + `</DATANO>`;
            data += `<BULKINFO>` + object.Bulkinfo + `</BULKINFO>`;
            data += `<PLANTABB>` + object.Plantabb + `</PLANTABB>`;
            data += `<STORAGETEXT>` + object.Storetext + `</STORAGETEXT>`;
            data += `<ADRNUM>` + object.adrnum + `</ADRNUM>`;
            data += `<MEINS>` + object.meins + `</MEINS>`;
            data += `</OUTPUT>`;
            data += `</data>`;
            return data;
        },

        ataURIToBlob: function (dataURI) {
            const splitDataURI = dataURI.split(',')
            const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
            const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

            const ia = new Uint8Array(byteString.length)
            for (let i = 0; i < byteString.length; i++)
                ia[i] = byteString.charCodeAt(i)

            return new Blob([ia], { type: mimeString })
        },

        openPDF: function (jsondata1, res, selIndex) {
            var that = this;
            jsondata1.formType = "print";
            jsondata1.formLocale = "";
            jsondata1.taggedPdf = 1;
            jsondata1.embedFont = 0;
            var that = this;
            var jsondata = JSON.stringify(jsondata1);
            // var jsondata = jsondata1;
            var dest = $.sap.getModulePath("com.yokogawa.zhpp0003") + '/dest-adsrestapi';
            var url_render = dest + "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=2";
            sap.ui.core.BusyIndicator.show(0)
            $.ajax({
                url: url_render,
                type: "post",
                contentType: "application/json",
                data: jsondata,
                success: function (a, textStatus, jqXHR) {
                    if (that.getView().getModel("ui").getProperty("/SendTOQueue")) {
                        var oContexts = that.extensionAPI.getSelectedContexts();
                        var info = oContexts[selIndex]
                        var object = info.getPath();
                        that.getView().getModel().setProperty(object + "/Printmed", "Paper");
                        that.sendToPrintQueue(a, res, selIndex);
                    } else {
                        that.showPDF(a, selIndex);
                    }
                },
                error: function (data) {
                    console.log(data);
                    sap.ui.core.BusyIndicator.hide()
                    console.log("error while getting pdf content");
                }
            });
        },

        updateZTHBT0030Entry: function (selIndex) {
            var that = this;
            var oContexts = this.extensionAPI.getSelectedContexts();
            var uiModelData = this.uiModel.getProperty("/search");
            var proccessFlag = uiModelData.Process_flag;
            var issueType = uiModelData.issue_flag;
            //var xdpTempalge = 'PickingListReportsSetForm/SetForm'
            sap.ui.core.BusyIndicator.show(0);
            sap.ui.getCore().getMessageManager().removeAllMessages();
            that.getOwnerComponent().getModel().resetChanges(null, true);
            that.getOwnerComponent().getModel().setDeferredGroups(["ZTHBT0030"]);
            var format1 = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "PThh'H'mm'M'ss'S'" });
            var info = oContexts[selIndex];
            var object = info.getObject();
            var action = "create";
            var path = "/ZTHBT0030";
            var Process_flag = 0;

            var today = new Date();
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd", UTC: false
            });
            var date = oDateFormat.format(today);

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "hh:mm:ss", UTC: false
            });
            var time = oDateFormat.format(new Date());

            if (proccessFlag == "FirstIssue") {
                if (that.bUpdateZTHBT0030) {
                    Process_flag = object.Process_flag;
                    action = "update";
                    path = "/ZTHBT0030(PKNUM='" + object.kanbannum.toString() + "',PKKEY=" + Number(object.kanbanid) + ")";
                }
                that.getOwnerComponent().getModel()[action](path, {
                    PKNUM: object.kanbannum.toString(),
                    PKKEY: Number(object.kanbanid),
                    REVNR: Number(Process_flag),
                    PDATS: new Date(),
                    PZEIT: time
                    // PZEIT: new Date().toTimeString().split(' ')[0],
                    // PZEIT: new Date().toUTCString().split(' ')[4]

                }, {
                    groupId: "ZTHBT0030",
                    success: function () {
                        console.log("ZTHBT30 updated success")
                    },
                    error: that.readErrorMessages.bind(that)
                });
            }
            else if (proccessFlag == "PartsRequest12" && issueType == "Y1") {
                if (that.bUpdateZTHBT0030) {
                    Process_flag = object.Process_flag;
                    action = "update";
                    path = "/ZTHBT0030(PKNUM='" + object.kanbannum.toString() + "',PKKEY=" + Number(object.kanbanid) + ")";
                }
                that.getOwnerComponent().getModel()[action](path, {
                    PKNUM: object.kanbannum.toString(),
                    PKKEY: Number(object.kanbanid),
                    REVNR: Number(Process_flag),
                    PRVNR: Number(Process_flag),
                    PDATS: new Date(),
                    PZEIT: time
                    // PZEIT: new Date().toTimeString().split(' ')[0],
                    // PZEIT: new Date().toUTCString().split(' ')[4]

                }, {
                    groupId: "ZTHBT0030",
                    success: function () {
                        console.log("ZTHBT30 updated success")
                    },
                    error: that.readErrorMessages.bind(that)
                });
            }
            else if (proccessFlag == "PartsRequest12" && issueType == "Y2") {
                // if (that.bUpdateZTHBT0030) {
                Process_flag = object.Process_flag;
                action = "update";
                path = "/ZTHBT0030(PKNUM='" + object.kanbannum.toString() + "',PKKEY=" + Number(object.kanbanid) + ")";
                // }
                that.getOwnerComponent().getModel()[action](path, {
                    PKNUM: object.kanbannum.toString(),
                    PKKEY: Number(object.kanbanid),
                    PDATS: new Date(),
                    PZEIT: time
                    // PZEIT: new Date().toTimeString().split(' ')[0],
                    // PZEIT: new Date().toUTCString().split(' ')[4]
                }, {
                    groupId: "ZTHBT0030",
                    success: function () {
                        console.log("ZTHBT30 updated success")
                    },
                    error: that.readErrorMessages.bind(that)
                });
            }

            that.getOwnerComponent().getModel().submitChanges({
                groupId: "ZTHBT0030",
                success: function (res) {
                    sap.ui.core.BusyIndicator.hide(0);
                },
                error: that.readErrorMessages.bind(that)
            })
        },

        sendToPrintQueue: function (a, res, selIndex) {
            var that = this;
            const fd = new FormData();
            var blob = that.ataURIToBlob("data:application/pdf;base64," + a.fileContent);
            fd.append('file', blob, res.PickingNumber + "-" + res.PickingItemNumber + ".pdf");
            var settings = {
                "url": $.sap.getModulePath("com.yokogawa.zhpp0003") + "/dm/api/v1/rest/print-documents",

                "method": "POST",
                "timeout": 0,
                "headers": {
                    "scan": "true",
                    "If-None-Match": "*",
                },
                "processData": false,
                "mimeType": "multipart/form-data",
                "contentType": false,
                "data": fd
            };

            $.ajax(settings).done(function (response) {
                var settings = {
                    "url": $.sap.getModulePath("com.yokogawa.zhpp0003") + "/qm/api/v1/rest/print-tasks/" + response,
                    "method": "PUT",
                    "timeout": 0,
                    "headers": {
                        "Content-Type": "application/json",
                        "If-None-Match": "*",
                    },
                    "data": JSON.stringify({
                        "numberOfCopies": 1,
                        "username": sap.ushell.Container.getService("UserInfo").getEmail(),
                        "qname": that.getView().getModel("ui").getProperty("/SpecifiedPrinter") ? that.getView().getModel("ui").getProperty("/SpecifiedPrinter") : "T001",
                        "printContents": [
                            {
                                "objectKey": response,
                                "documentName": res.PickingNumber + "-" + res.PickingItemNumber + ".pdf"
                            }
                        ]
                    }),
                };

                $.ajax(settings).done(function (response) {
                    sap.ui.core.BusyIndicator.hide();
                    var sissue_flag = that.uiModel.getProperty("/search/issue_flag");
                    if (sissue_flag === "Y1") {
                        // that.changeStatus();
                    }
                    that.updateZTHBT0030Entry(selIndex);
                    var oContexts = that.extensionAPI.getSelectedContexts();
                    var info = oContexts[selIndex]
                    var object = info.getPath();
                    that.getView().getModel().setProperty(object + "/message", "X");
                    // that.getView().getModel().setProperty(object + "/Printhist", info.getObject().Process_flag);
                    that.updateMedia(object);
                    MessageBox.success("Document sent to print queue successfully");
                    // that.extensionAPI.rebindTable(true);
                });
            });
        },

        updateMedia: function (infoPath) {
            var that = this;
            if (that.getView().getModel("ui").getProperty("/PDFDownload")) {
                that.getView().getModel().setProperty(infoPath + "/Printmed", "PDF");
            }
            if (that.getView().getModel("ui").getProperty("/TextDownload")) {
                that.getView().getModel().setProperty(infoPath + "/Printmed", "Text");
            }
            if (that.getView().getModel("ui").getProperty("/SendTOQueue")) {
                that.getView().getModel().setProperty(infoPath + "/Printmed", "Paper");
            }
        },

        changeStatus: function () {
            var data = this.extensionAPI.getSelectedContexts()[0].getObject();
            this.getOwnerComponent().getModel().callFunction("/ZCDSEHPPB0085",
                {
                    urlParameters: {
                        material: data.material, kanbanid: data.kanbanid,
                        kanbannum: data.kanbannum, selectflag: "Y1"
                    },
                    method: "POST",
                    success: (res) => {

                    },
                    error: (error) => {
                        // this.showMessages("error");
                    }
                }
            );
        },

        showPDF: function (a, selIndex) {
            var that = this;
            var decodedPdfContent = atob(a.fileContent);
            var byteArray = new Uint8Array(decodedPdfContent.length);
            for (var i = 0; i < decodedPdfContent.length; i++) {
                byteArray[i] = decodedPdfContent.charCodeAt(i);
            }
            var blob = new Blob([byteArray.buffer], {
                type: 'application/pdf'
            });
            var _pdfurl = URL.createObjectURL(blob);

            if (!this._PDFViewer) {
                this._PDFViewer = new sap.m.PDFViewer({
                    width: "auto",
                    source: _pdfurl
                });
                jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
            }
            this._PDFViewer.setSource(_pdfurl);
            // this.getView().getModel().setProperty(this.extensionAPI.getSelectedContexts()[0].getPath() + "/message" , "X");
            var sissue_flag = this.uiModel.getProperty("/search/issue_flag");
            if (sissue_flag === "Y1") {
                this.changeStatus();
            }
            this.updateZTHBT0030Entry(selIndex);
            var oContexts = this.extensionAPI.getSelectedContexts();
            var info = oContexts[selIndex];
            var object = info.getPath();
            that.getView().getModel().setProperty(object + "/message", "X");
            // that.getView().getModel().setProperty(object + "/Printhist", info.getObject().Process_flag);
            that.updateMedia(object);
            this._PDFViewer.open();
            // that.extensionAPI.rebindTable(true);

            sap.ui.core.BusyIndicator.hide();
        },

        updatePrintStatus: function (res) {
            var that = this;
            var postData = $.extend(true, {}, res.to_PickingListUpdate);
            delete postData.__metadata;
            var format = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "'PT'HH'H'mm'M'ss'S'"
            });
            postData.prntdate = new Date();
            postData.prnttime = format.format(new Date());
            that.getOwnerComponent().getModel().update("/ZCDSEHPPB0011(pkngnubr='" + res.PickingNumber + "',pkngitnr='" + res.PickingItemNumber + "')",
                postData, {
                success: function () { }
            });
        },

        onCancel: function () {
            var that = this;
            var oContexts = this.extensionAPI.getSelectedContexts();
            // var sPickingItemNumber = object.getObject().PickingItemNumber;
            sap.ui.getCore().getMessageManager().removeAllMessages();
            oContexts.forEach(function (object) {
                that.getOwnerComponent().getModel().read("/ZCDSEHPPC0001", {
                    filters: [new Filter("PickingNumber", "EQ", object.getObject().PickingNumber), new Filter("PickingItemNumber", "EQ", sPickingNumber)],
                    urlParameters: { "$expand": "to_PickingListUpdate" },
                    success: function (res) {
                        var postData = $.extend(true, {}, res.results[0].to_PickingListUpdate);
                        delete postData.__metadata;
                        postData.zzh_d_flg = true;
                        that.getOwnerComponent().getModel().update("/ZCDSEHPPB0011(pkngnubr='" + res.results[0].PickingNumber + "',pkngitnr='" + res.results[0].PickingItemNumber + "')",
                            postData, {
                            success: function () {
                                MessageToast.show("Cancelled Successfully");
                                that.extensionAPI.rebindTable(true);
                            },
                            error: function () {
                                sap.ui.core.BusyIndicator.hide();
                                var aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                                var message = "";
                                aMessages.forEach(function (oMessage) {
                                    if (message.indexOf(oMessage.getMessage()) === -1) {
                                        message += oMessage.getMessage();
                                    }
                                });
                                if (message) {
                                    MessageBox.error(message);
                                }
                            }
                        });
                    }
                });

            });


        },


        getForm1Data: function (object) {
            var data = object.kanbanid + "," + object.language + "," + object.revnr + "," + object.storage_locto + "," + object.storage_locfrom + "," +
                object.Supp_Area_iss + "," + object.Quantityunit + "," + object.Kanbanqun + "," + object.Material + "," + object.Boxtype + "," +
                object.Materialdesc + "," + object.QRkanbannum + "," + object.Storagebiniss + "," + object.Bulkinfo + "," + object.description + "," + object.preprocess10 + "," +
                object.preprocess20 + "," + object.Note + "," + object.n_x + "," + object.address + "," + object.s_date + "," + object.s_time + "," +
                object.Companycode + "," + object.scan1_2 + "," + object.batchflag + "," + object.MaterialQR + "," + object.Reportid + "," + object.storage_loc_step12 + "," +
                object.Supp_Area_iss_step12 + "," + object.buildingcode + "," + object.TotalNo + "," + object.DataNo +
                object.Bulkinfo + "," + object.Plantabb + "," + object.Storetext + "," + object.adrnum + "," + object.meins;

            return data;
        },

        getForm1Key: function () {
            var data = "Kanban ID" + "," + "Language" + "," + "Revision number" + "," + "Storage location" + "," + "Receiving stor. loc." + "," +
                "Storage Bin" + "," + "Unit of issue" + "," + "Container Quantity" + "," + "Material" + "," + "Boxtype" + "," +
                "Materialdesc" + "," + "QRkanbannum" + "," + "Storage bin iss" + "," + "Bulk info" + "," + "description" + "," + "preprocess10" + "," +
                "preprocess20" + "," + "Note" + "," + "R/2 table" + "," + "address" + "," + "Local Date" + "," + "Local Time" + "," +
                "Company code" + "," + "scan1_2" + "," + "batch flag" + "," + "MaterialQR" + "," + "Reportid" + "," + "storage_loc_step12" + "," +
                "Supp_Area_iss_step12" + "," + "building code" + "," + "TotalNo" + "," + "DataNo" +
                "Bulkinfo" + "," + "Plantabb" + "," + "Storetext" + "," + "adrnum" + "," + "Base Unit of Measure";

            return data;
        },


        getForm2Data: function (object) {
            var data = object.kanbanid + "," + object.language + "," + object.revnr + "," + object.storage_locto + "," + object.storage_locfrom + "," +
                object.Supp_Area_iss + "," + object.Quantityunit + "," + object.Kanbanqun + "," + object.Material + "," + object.Boxtype + "," +
                object.Materialdesc + "," + object.QRkanbannum + "," + object.Storagebiniss + "," + object.Bulkinfo + "," + object.description + "," + object.preprocess10 + "," +
                object.preprocess20 + "," + object.Note + "," + object.n_x + "," + object.address + "," + object.s_date + "," + object.s_time + "," +
                object.Companycode + "," + object.scan1_2 + "," + object.batchflag + "," + object.MaterialQR + "," + object.Reportid + "," + object.storage_loc_step12 + "," +
                object.Supp_Area_iss_step12 + "," + object.buildingcode + "," + object.TotalNo + "," + object.DataNo +
                object.Bulkinfo + "," + object.Plantabb + "," + object.Storetext + "," + object.adrnum + "," + object.meins;
            return data;
        },

        getForm2Key: function () {
            var data = "Kanban ID" + "," + "Language" + "," + "Revision number" + "," + "Storage location" + "," + "Receiving stor. loc." + "," +
                "Storage Bin" + "," + "Unit of issue" + "," + "Container Quantity" + "," + "Material" + "," + "Boxtype" + "," +
                "Materialdesc" + "," + "QRkanbannum" + "," + "Storage bin iss" + "," + "Bulk info" + "," + "description" + "," + "preprocess10" + "," +
                "preprocess20" + "," + "Note" + "," + "R/2 table" + "," + "address" + "," + "Local Date" + "," + "Local Time" + "," +
                "Company code" + "," + "scan1_2" + "," + "batch flag" + "," + "MaterialQR" + "," + "Reportid" + "," + "storage_loc_step12" + "," +
                "Supp_Area_iss_step12" + "," + "building code" + "," + "TotalNo" + "," + "DataNo" +
                "Bulkinfo" + "," + "Plantabb" + "," + "Storetext" + "," + "adrnum" + "," + "Base Unit of Measure";

            return data;
        },


        getForm3Data: function (object) {
            var data = object.materialnumber + "," + object.materialdescription + "," + object.kanbanid + "," + object.rawmaterial + "," +
                object.cyclestoringposition + "," + object.materialstoragebin + "," + object.qrcodefirst + "," + object.qrcodesecond + "," +
                object.sumoflt + "," + object.quantity + "," + object.boxtype + "," + object.numberofkanban + "," +
                object.areastoragelocation + "," + object.areastoringposition + "," + object.areastoragebin + "," + object.process + "," +
                object.printdate + "," + object.notes + "," + object.reportid + "," +
                object.scannumber;
            return data;
        },

        getForm3Key: function () {
            var data = "materialnumber" + "," + "materialdescription" + "," + "kanbanid" + "," + "rawmaterial" + "," +
                "cyclestoringposition" + "," + "materialstoragebin" + "," + "qrcodefirst" + "," + "qrcodesecond" + "," +
                "sumoflt" + "," + "quantity" + "," + "boxtype" + "," + "numberofkanban" + "," +
                "areastoragelocation" + "," + "areastoringposition" + "," + "areastoragebin" + "," + "process" + "," +
                "printdate" + "," + "notes" + "," + "reportid" + "," +
                "scannumber";
            return data;
        }
    };
});