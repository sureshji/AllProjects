sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    'sap/ui/core/BusyIndicator',
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"],
    function (JSONModel, MessageToast, BusyIndicator, Fragment, Filter, FilterOperator, MessageBox) {
        "use strict";
        return {
            onInit: function () {
                let oUIVisible = {
                    master: true,
                    text: false,
                    formEditable: true,
                    processRecordSheetEditable: true
                };
                var oModelUIVisible = new JSONModel(oUIVisible);
                this.getView().setModel(oModelUIVisible, 'oModelUI');
                let oTOVisible = {
                    none: true,
                    ot: false,
                    cct: false,
                    st: false,
                    tORBG: false,
                    tOSelected: 5,
                    po: false,
                    linkage: false,
                    cc: false,
                    gl: false,
                    store: false
                };
                var oModelUIVisible = new JSONModel(oTOVisible);
                this.getView().setModel(oModelUIVisible, 'oModelTO');
                let oPartOrderData = {
                    Plant: '',
                    ProdOrderMode: 0,
                    ToSelected: 0,
                    Material: '',
                    MaterialDescription: '',
                    Version: '',
                    Quantity: '',
                    Language: '',
                    OrderFinishDate: '',
                    StorageLocation: '',
                    Workcenter: "",
                    Note: '',
                    Prodorder: '',
                    Linknumber: '',
                    Costcenter: '',
                    Glaccnt: '',
                    Store: ''
                }
                var oModelPartOrd = new JSONModel(oPartOrderData);
                this.getView().setModel(oModelPartOrd, 'oModelPartOrd');
                let oIssueOption = {
                    childPart: false,
                    oOSelected: 0,
                    iOSelected: 0,
                    pOSelected: 0,
                    processRecordSheet: false,
                    productionOrderSheet: false,
                    printer: ''
                };
                var oModelIO = new JSONModel(oIssueOption);
                this.getView().setModel(oModelIO, 'oModelIO');
                this.languageMapping = {
                    'E': 'en',
                    '1': 'en',/*only english is enabled in BTP*/
                    '3': 'en',
                    'J': 'en',
                    'P': 'en',
                    'R': 'en'
                }
            },
            oMassUpload: function (oEvent) {
                if (!this.oMassUploadDialog) {
                    this.oMassUploadDialog = sap.ui.xmlfragment(
                        "zz.zppproductionorder.fragments.MassUpload",
                        this.getView().getController()
                    );
                    this.getView().addDependent(this.oMassUploadDialog);
                    this.oMassUploadDialog.open();
                } else {
                    this.oMassUploadDialog.open();
                }
            },
            oCreateOrder: function (oEvent) {
                if (!this.oTransferDialog) {
                    this.oTransferDialog = sap.ui.xmlfragment(
                        "idFragmentorder",
                        "zz.zppproductionorder.fragments.CreateOrder",
                        this
                    );
                    this.getView().addDependent(this.oTransferDialog);
                    this.oTransferDialog.open();
                } else {
                    this.oTransferDialog.open();
                }
            },
            onOrderSave: async function (oEvent) {
                BusyIndicator.show();
                // var OrderFinishDate = this.getView().getModel('oModelPartOrd').oData.OrderFinishDate;
                // if(OrderFinishDate == "") {
                //     MessageBox.error("Fill required parameter Schedule Finished Date");
                //     BusyIndicator.hide();
                //     return;
                // }
                let resVal = this.validate();
                if (resVal === true) {

                    var oModelUIData = this.getView().getModel('oModelPartOrd');
                    if(oModelUIData.oData.Quantity == "") {
                        oModelUIData.oData.Quantity = "0"; 
                    }
                    if(oModelUIData.oData.OrderFinishDate == "") {
                        oModelUIData.oData.OrderFinishDate = null; 
                    }
                    var that = this;
                    var sUrl = '/sap/opu/odata/sap/ZAPIHPP0003_SRV';
                    var oModelCreatePartOrder = new sap.ui.model.odata.ODataModel(sUrl, true);
                    this.getView().setModel(oModelCreatePartOrder);
                    sap.ui.getCore().setModel(oModelCreatePartOrder);
                    await this.getOwnerComponent()
                        .getModel()
                        .create("/PROD_ORDERSet", oModelUIData.oData, {
                            success: async function (oData, response) {
                                let oSapMessage = {};
                                if (response.headers["sap-message"]) {
                                    oSapMessage = JSON.parse(response.headers["sap-message"]);
                                }
                                if (oSapMessage.severity === "error") {

                                    BusyIndicator.hide();
                                    MessageBox.error(oSapMessage.message);
                                }
                                else {
                                    BusyIndicator.hide();
                                    await that.onSuccessPOCreate(oData.ProdOrderCreated);
                                }

                            },
                            error: function (oError) {
                                BusyIndicator.hide();
                                MessageBox.error("Error occurred while saving Create Part Order due to" + oError.responseText);
                            }
                        })

                }
            },
            onSuccessPOCreate: async function (ProdOrder) {
                MessageToast.show(`Production Order ${ProdOrder} is created successfully`);
                this.oTransferDialog.close();
                await this.createAddStatus(ProdOrder);
            },
            createAddStatus: async function (ProdOrder) {
                BusyIndicator.show();
                var that = this;
                var oModelUIData = this.getView().getModel('oModelPartOrd');
                let addStatus = {
                    PRODUCTIONORDER: ProdOrder,
                    ZZPLANT: oModelUIData.oData.Plant,
                    MAT_TEXT: oModelUIData.oData.MaterialDescription,
                    ZZG_PRINTED_REV: "00"
                }
                await this.getOwnerComponent()
                    .getModel("capService").create("/AdditionalStatus", addStatus, {
                        success: async function (Odata) {
                            BusyIndicator.hide();
                            await that.onPrint(ProdOrder, oModelUIData.Plant, oModelUIData.Workcenter);
                        },
                        error: function (oError) {
                            BusyIndicator.hide();
                            MessageBox.error("Error occurred while Inserting Additioanl Status in Cloud");
                        }
                    })
            },
            onMassUploadSave: function (oEvent) {
                var fU = sap.ui.getCore().byId('FileUploaderId');
                var sFile = fU.getValue();
                if (!sFile) {
                    sMsg = "Please select a file first";
                    sap.m.MessageToast.show(sMsg);
                    return;
                }
                else {
                    var that = this;
                    if (!this.getView().getModel()) {
                        var sUrl = '/sap/opu/odata/sap/ZAPIHPP0003_SRV';
                        var oModelCreatePartOrder = new sap.ui.model.odata.ODataModel(sUrl, true);
                        this.getView().setModel(oModelCreatePartOrder);
                        sap.ui.getCore().setModel(oModelCreatePartOrder);
                    }

                    that._addTokenToUploader();
                    fU.upload();
                    that.oMassUploadDialog.close();

                }
            },

            _addTokenToUploader: function () {
                //Add header parameters to file uploader.
                var oDataModel = this.getView().getModel();
                var sTokenForUpload = oDataModel.getSecurityToken();
                var oFileUploader = sap.ui.getCore().byId("FileUploaderId");
                var oHeaderParameter = new sap.ui.unified.FileUploaderParameter({
                    name: "X-CSRF-Token",
                    value: sTokenForUpload
                });

                var sFile = oFileUploader.getValue();
                var oHeaderSlug = new sap.ui.unified.FileUploaderParameter({
                    name: "SLUG",
                    value: sFile
                });

                //Header parameter need to be removed then added.
                oFileUploader.removeAllHeaderParameters();
                oFileUploader.addHeaderParameter(oHeaderParameter);

                oFileUploader.addHeaderParameter(oHeaderSlug);
                //set upload url
                var sUrl = oDataModel.sServiceUrl + "/PROD_ORDER_FILESet";
                oFileUploader.setUploadUrl(sUrl);
            },
            onPrint: async function (ProdOrder, Plant, Workcenter) {
                let oData = this.getView().getModel('oModelIO').oData;
                if (oData.childPart) {
                    await this.printChildPartList(ProdOrder, Plant, Workcenter);
                };
                if (oData.processRecordSheet) {
                    await this.printProcessRecordSheet(ProdOrder, Plant, Workcenter);
                }
                if (oData.productionOrderSheet) {
                    await this.printProductionOrderSheet(ProdOrder, Plant, Workcenter);
                }
                // if(!oData.childPart && !oData.processRecordSheet && !oData.productionOrderSheet) {
                //     BusyIndicator.hide();
                // }   

            },
            printProcessRecordSheet: async function (ProdOrder, Plant, Workcenter) {
                BusyIndicator.show();
                MessageToast.show("Process Record Sheet Printing is started");
                var urlToRead = `/ProcessRecordSheetCombined('${ProdOrder}')`;
                var that = this;
                var data1;
                // let oModel = this.getOwnerComponent()
                // .getModel("ZAPIHPP0003_SRV");

                await this.getOwnerComponent()
                    .getModel("capService")
                    .read(urlToRead, {
                        urlParameters: {
                            "$expand": "to_OpertaionsList"
                        },
                        method: "GET",
                        success: async function (oDataArray, response) {
                            BusyIndicator.hide();
                            let oData = oDataArray;
                            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                                `<HEADER><ORDERNUMBER>` + oData.OrderNumber + `</ORDERNUMBER>` +
                                `<TITLE>` + oData.title + `</TITLE>` +
                                `<PRODUCTIONVERSION>` + oData.ProductionVersion + `</PRODUCTIONVERSION>` +
                                `<WORKCENTER>` + oData.WorkCenter + `</WORKCENTER>` +
                                `<MATERIALDESCRIPTION>` + oData.MaterialDescription + `</MATERIALDESCRIPTION>` +
                                `<TRANSPROD>` + oData.TransProd + `</TRANSPROD>` +
                                `<MODEL>` + oData.Model + `</MODEL >` +
                                `<IVTRYPROD>` + oData.Ivtryprod + `</IVTRYPROD>` +
                                `<TRWORKCENTER>` + oData.TRWorkCenter + `</TRWORKCENTER>` +
                                `<STORAGELOCATION>` + oData.StorageLocation + `</STORAGELOCATION>` +
                                `<STORAGEBIN>` + oData.StorageBin + `</STORAGEBIN>` +
                                `<PARTSNO>` + oData.PartsNo + `</PARTSNO>` +
                                `<STORE>` + oData.Store + `</STORE>` +
                                `<MFGORDERPLANNEDTOTALQTY>` + oData.MfgOrderPlannedTotalQty + `</MFGORDERPLANNEDTOTALQTY>` +
                                `<PRODUCTIONUNIT>` + oData.ProductionUnit + `</PRODUCTIONUNIT>` +
                                `<MFGORDERSCHEDULEDSTARTDATE>` + oData.MfgOrderScheduledStartDate + `</MFGORDERSCHEDULEDSTARTDATE>` +
                                `<MFGORDERSCHEDULEDENDDATE>` + oData.MfgOrderScheduledEndDate + `</MFGORDERSCHEDULEDENDDATE>` +
                                `<PRINTD>` + oData.PrintD + `</PRINTD>` +
                                `<SCANNER>` + oData.Scanner + `</SCANNER>` +
                                `<NOTE>` + oData.Note + `</NOTE>` +
                                `<MEMO1>` + oData.memo1 + `</MEMO1>` +
                                `<MEMO2>` + oData.memo2 + `</MEMO2>` +
                                `<MEMO3>` + oData.memo3 + `</MEMO3>` +
                                `<MEMO4>` + oData.memo4 + `</MEMO4>` +
                                `<REPORTID>` + oData.ReportId + `</REPORTID>` +
                                `<REPRINT>` + oData.RePrint + `</REPRINT>` +
                                `</HEADER>` + `<ITEM>`;

                            for (let index in oData.to_OpertaionsList.results) {
                                let oOperationData = oData.to_OpertaionsList.results[index];
                                data1 = data1 + `<DATA>` +
                                    `<ORDERNUMBER>` + oOperationData.OrderNumber + `</ORDERNUMBER>` +
                                    `<OPERATIONNUMBER>` + oOperationData.OperationNumber + `</OPERATIONNUMBER>` +
                                    `<CODE>` + oOperationData.Code + `</CODE>` +
                                    `<WORKCENTER>` + oOperationData.WorkCenter + `</WORKCENTER>` +
                                    `<COSTCENTER>` + oOperationData.CostCenter + `</COSTCENTER>` +
                                    `<STANDARDVALUE5>` + oOperationData.StandardValue5 + `</STANDARDVALUE5>` +
                                    `<UNIT5>` + oOperationData.Unit5 + `</UNIT5>` +
                                    `<STANDARDVALUE3>` + oOperationData.StandardValue3 + `</STANDARDVALUE3>` +
                                    `<UNIT3>` + oOperationData.Unit3 + `</UNIT3>` +
                                    `<SUPPLIER>` + oOperationData.Supplier + `</SUPPLIER>` +
                                    `</DATA>`;
                            }

                            data1 = data1 + `</ITEM>` + `</data>`;
                            await that.renderPdf(data1, "ProcessRecordSheet", ProdOrder, Plant, Workcenter);
                        },
                        error: function (oError) {
                            MessageBox.error("Error occurred while saving Create Part Order");
                            BusyIndicator.hide();

                        }
                    })
            },
            printProductionOrderSheet: async function (ProdOrder, Plant, Workcenter) {
                BusyIndicator.show();
                MessageToast.show("Production Order Sheet Printing is started");
                var urlToRead = `/ProductionOrderSheetCombined('${ProdOrder}')`;
                var that = this;
                var data1;
                // let oModel = this.getOwnerComponent()
                // .getModel("ZAPIHPP0003_SRV");

                await this.getOwnerComponent()
                    .getModel("capService")
                    .read(urlToRead, {
                        urlParameters: {
                            "$expand": "to_OpertaionsListColumn1,to_OpertaionsListColumn2,to_OpertaionsListColumn3"
                        },
                        method: "GET",
                        success: async function (oDataArray, response) {
                            BusyIndicator.hide();
                            let oData = oDataArray;

                            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                                `<HEADER>` +
                                `<BUILDINGLOCATION>` + oData.BuildingLocation + `</BUILDINGLOCATION>` +
                                `<ENTRYQTY>` + oData.EntryQty + `</ENTRYQTY>` +
                                `<ENTRYUNIT>` + oData.EntryUnit + `</ENTRYUNIT>` +
                                `<ENTRYUNIT2>` + oData.EntryUnit2 + `</ENTRYUNIT2>` +
                                `<FINISH>` + oData.Finish + `</FINISH>` +
                                `<INVRECADDRESS>` + oData.InvRecAddress + `</INVRECADDRESS>` +
                                `<IVTRYPROD>` + oData.Ivtryprod + `</IVTRYPROD>` +
                                `<LABOUR>` + oData.Labour + `</LABOUR>` +
                                `<MACHINE>` + oData.Machine + `</MACHINE>` +
                                `<MATERIAL>` + oData.Material + `</MATERIAL>` +
                                `<MATERIALDESCRIPTION>` + oData.MaterialDescription + `</MATERIALDESCRIPTION>` +
                                `<MATEXPLANATION>` + oData.MatExplanation + `</MATEXPLANATION>` +
                                `<MEMO1>` + oData.memo1 + `</MEMO1>` +
                                `<MEMO2>` + oData.memo2 + `</MEMO2>` +
                                `<MEMO3>` + oData.memo3 + `</MEMO3>` +
                                `<MFGORDERPLANNEDTOTALQTY>` + oData.MfgOrderPlannedTotalQty + `</MFGORDERPLANNEDTOTALQTY>` +
                                `<MFGORDERSCHEDULEDENDDATE>` + oData.MfgOrderScheduledEndDate + `</MFGORDERSCHEDULEDENDDATE>` +
                                `<MFGORDERSCHEDULEDSTARTDATE>` + oData.MfgOrderScheduledStartDate + `</MFGORDERSCHEDULEDSTARTDATE>` +
                                `<MFGORDERSCHEDULEDSTARTDATEUF>` + oData.MfgOrderScheduledStartDateUF + `</MFGORDERSCHEDULEDSTARTDATEUF>` +
                                `<MFGORDERSCHEDULEDENDDATEUF>` + oData.MfgOrderScheduledEndDateUF + `</MFGORDERSCHEDULEDENDDATEUF>` +
                                `<MTLLOCATION>` + oData.MtlLocation + `</MTLLOCATION>` +
                                `<MTLPARTSSHELFNO>` + oData.MtlPartsShelfNo + `</MTLPARTSSHELFNO>` +
                                `<NOTE>` + oData.Note + `</NOTE>` +
                                `<ORDERNUMBER>` + oData.OrderNumber + `</ORDERNUMBER>` +
                                `<PARTSNO>` + oData.PartsNo + `</PARTSNO>` +
                                `<PRINTDATE>` + oData.PrintDate + `</PRINTDATE>` +
                                `<PRODUCTIONUNIT>` + oData.ProductionUnit + `</PRODUCTIONUNIT>` +
                                `<PRSSTYPE>` + oData.PrssType + `</PRSSTYPE>` +
                                `<REPORTID>` + oData.ReportId + `</REPORTID>` +
                                `<REPRINT>` + oData.RePrint + `</REPRINT>` +
                                `<RWCD>` + oData.rwcd + `</RWCD>` +
                                `<SCANNER>` + oData.Scanner + `</SCANNER>` +
                                `<SETUP>` + oData.SetUp + `</SETUP>` +
                                `<STORAGEBIN>` + oData.StorageBin + `</STORAGEBIN>` +
                                `<STORAGELOCATION>` + oData.StorageLocation + `</STORAGELOCATION>` +
                                `<TITLE>` + oData.title + `</TITLE>` +
                                `<TITLE2>` + oData.title2 + `</TITLE2>` +
                                `<TOTALREQQTY>` + oData.TotalReqQty + `</TOTALREQQTY>` +
                                `<TRANSPROD>` + oData.TransProd + `</TRANSPROD>` +
                                `<TRWORKCENTER>` + oData.TRWorkCenter + `</TRWORKCENTER>` +
                                `<UNIT3>` + oData.Unit3 + `</UNIT3>` +
                                `<UNIT4>` + oData.Unit4 + `</UNIT4>` +
                                `<UNIT5>` + oData.Unit5 + `</UNIT5>` +
                                `<WORKCENTER>` + oData.WorkCenter + `</WORKCENTER>` +
                                `</HEADER>` + `<ITEM>`;

                            for (let index in oData.to_OpertaionsListColumn1.results) {

                                let oDataC1 = oData.to_OpertaionsListColumn1.results[index];
                                let oDataC2 = oData.to_OpertaionsListColumn2.results[index];
                                let oDataC3 = oData.to_OpertaionsListColumn3.results[index];
                                data1 = data1 + `<DATA>` +
                                    `<CODE>` + oDataC1.Code + `</CODE>` +
                                    `<CONF_NUMBER>` + oDataC1.Conf_Number + `</CONF_NUMBER>` +
                                    `<CONTROLKEY>` + oDataC1.ControlKey + `</CONTROLKEY>` +
                                    `<COSTCENTER>` + oDataC1.CostCenter + `</COSTCENTER>` +
                                    `<DESCRIPTION>` + oDataC1.Description + `</DESCRIPTION>` +
                                    `<LATESTSCHEDULEFINISHDATE>` + oDataC1.LatestScheduleFinishDate + `</LATESTSCHEDULEFINISHDATE>` +
                                    `<OPERATIONNUMBER>` + oDataC1.OperationNumber + `</OPERATIONNUMBER>` +
                                    `<ORDERNUMBER>` + oDataC1.OrderNumber + `</ORDERNUMBER>` +
                                    `<STANDARDVALUE3>` + oDataC1.StandardValue3 + `</STANDARDVALUE3>` +
                                    `<STANDARDVALUE4>` + oDataC1.StandardValue4 + `</STANDARDVALUE4>` +
                                    `<STANDARDVALUE5>` + oDataC1.StandardValue5 + `</STANDARDVALUE5>` +
                                    `<SUPPLIER>` + oDataC1.Supplier + `</SUPPLIER>` +
                                    `<UNIT3>` + oDataC1.Unit3 + `</UNIT3>` +
                                    `<UNIT4>` + oDataC1.Unit4 + `</UNIT4>` +
                                    `<UNIT5>` + oDataC1.Unit5 + `</UNIT5>` +
                                    `<WORKCENTER>` + oDataC1.WorkCenter + `</WORKCENTER>`;
                                if (oDataC2) {
                                    data1 = data1 + `<CODESG>` + oDataC2.Code + `</CODESG>` +
                                        `<CONF_NUMBERSG>` + oDataC2.Conf_Number + `</CONF_NUMBERSG>` +
                                        `<CONTROLKEYSG>` + oDataC2.ControlKey + `</CONTROLKEYSG>` +
                                        `<COSTCENTERSG>` + oDataC2.CostCenter + `</COSTCENTERSG>` +
                                        `<DESCRIPTIONSG>` + oDataC2.Description + `</DESCRIPTIONSG>` +
                                        `<LATESTSCHEDULEFINISHDATESG>` + oDataC2.LatestScheduleFinishDate + `</LATESTSCHEDULEFINISHDATESG>` +
                                        `<OPERATIONNUMBERSG>` + oDataC2.OperationNumber + `</OPERATIONNUMBERSG>` +
                                        `<ORDERNUMBERSG>` + oDataC2.OrderNumber + `</ORDERNUMBERSG>` +
                                        `<STANDARDVALUE3SG>` + oDataC2.StandardValue3 + `</STANDARDVALUE3SG>` +
                                        `<STANDARDVALUE4SG>` + oDataC2.StandardValue4 + `</STANDARDVALUE4SG>` +
                                        `<STANDARDVALUE5SG>` + oDataC2.StandardValue5 + `</STANDARDVALUE5SG>` +
                                        `<SUPPLIERSG>` + oDataC2.Supplier + `</SUPPLIERSG>` +
                                        `<UNIT3SG>` + oDataC2.Unit3 + `</UNIT3SG>` +
                                        `<UNIT4SG>` + oDataC2.Unit4 + `</UNIT4SG>` +
                                        `<UNIT5SG>` + oDataC2.Unit5 + `</UNIT5SG>` +
                                        `<WORKCENTERSG>` + oDataC2.WorkCenter + `</WORKCENTERSG>`;
                                }
                                if (oDataC3) {
                                    data1 = data1 + `<CODETG>` + oDataC3.Code + `</CODETG>` +
                                        `<CONF_NUMBERTG>` + oDataC3.Conf_Number + `</CONF_NUMBERTG>` +
                                        `<CONTROLKEYTG>` + oDataC3.ControlKey + `</CONTROLKEYTG>` +
                                        `<COSTCENTERTG>` + oDataC3.CostCenter + `</COSTCENTERTG>` +
                                        `<DESCRIPTIONTG>` + oDataC3.Description + `</DESCRIPTIONTG>` +
                                        `<LATESTSCHEDULEFINISHDATETG>` + oDataC3.LatestScheduleFinishDate + `</LATESTSCHEDULEFINISHDATETG>` +
                                        `<OPERATIONNUMBERTG>` + oDataC3.OperationNumber + `</OPERATIONNUMBERTG>` +
                                        `<ORDERNUMBERTG>` + oDataC3.OrderNumber + `</ORDERNUMBERTG>` +
                                        `<STANDARDVALUE3TG>` + oDataC3.StandardValue3 + `</STANDARDVALUE3TG>` +
                                        `<STANDARDVALUE4TG>` + oDataC3.StandardValue4 + `</STANDARDVALUE4TG>` +
                                        `<STANDARDVALUE5TG>` + oDataC3.StandardValue5 + `</STANDARDVALUE5TG>` +
                                        `<SUPPLIERTG>` + oDataC3.Supplier + `</SUPPLIERTG>` +
                                        `<UNIT3TG>` + oDataC3.Unit3 + `</UNIT3TG>` +
                                        `<UNIT4TG>` + oDataC3.Unit4 + `</UNIT4TG>` +
                                        `<UNIT5TG>` + oDataC3.Unit5 + `</UNIT5TG>` +
                                        `<WORKCENTERTG>` + oDataC3.WorkCenter + `</WORKCENTERTG>`;
                                }
                                data1 = data1 + `</DATA>`;
                            }
                            data1 = data1 + `</ITEM>` ;

                            // for (let index in oData.to_OpertaionsListColumn2.results) {
                            //     let oDataC2 = oData.to_OpertaionsListColumn2.results[index];
                            //     data1 = data1 + `<DATA>` +
                            //         `<CODE>` + oDataC2.Code + `</CODE>` +
                            //         `<CONF_NUMBER>` + oDataC2.Conf_Number + `</CONF_NUMBER>` +
                            //         `<CONTROLKEY>` + oDataC2.ControlKey + `</CONTROLKEY>` +
                            //         `<COSTCENTER>` + oDataC2.CostCenter + `</COSTCENTER>` +
                            //         `<DESCRIPTION>` + oDataC2.Description + `</DESCRIPTION>` +
                            //         `<LATESTSCHEDULEFINISHDATE>` + oDataC2.LatestScheduleFinishDate + `</LATESTSCHEDULEFINISHDATE>` +
                            //         `<OPERATIONNUMBER>` + oDataC2.OperationNumber + `</OPERATIONNUMBER>` +
                            //         `<ORDERNUMBER>` + oDataC2.OrderNumber + `</ORDERNUMBER>` +
                            //         `<STANDARDVALUE3>` + oDataC2.StandardValue3 + `</STANDARDVALUE3>` +
                            //         `<STANDARDVALUE4>` + oDataC2.StandardValue4 + `</STANDARDVALUE4>` +
                            //         `<STANDARDVALUE5>` + oDataC2.StandardValue5 + `</STANDARDVALUE5>` +
                            //         `<SUPPLIER>` + oDataC2.Supplier + `</SUPPLIER>` +
                            //         `<UNIT3>` + oDataC2.Unit3 + `</UNIT3>` +
                            //         `<UNIT4>` + oDataC2.Unit4 + `</UNIT4>` +
                            //         `<UNIT5>` + oDataC2.Unit5 + `</UNIT5>` +
                            //         `<WORKCENTER>` + oDataC2.WorkCenter + `</WORKCENTER>` +
                            //         `</DATA>`;
                            // }
                            // data1 = data1 + `</ITEM2>` + `<ITEM3>`;
                            // for (let index in oData.to_OpertaionsListColumn3.results) {
                            //     let oDataC3 = oData.to_OpertaionsListColumn3.results[index];
                            //     data1 = data1 + `<DATA>` +
                            //         `<CODE>` + oDataC3.Code + `</CODE>` +
                            //         `<CONF_NUMBER>` + oDataC3.Conf_Number + `</CONF_NUMBER>` +
                            //         `<CONTROLKEY>` + oDataC3.ControlKey + `</CONTROLKEY>` +
                            //         `<COSTCENTER>` + oDataC3.CostCenter + `</COSTCENTER>` +
                            //         `<DESCRIPTION>` + oDataC3.Description + `</DESCRIPTION>` +
                            //         `<LATESTSCHEDULEFINISHDATE>` + oDataC3.LatestScheduleFinishDate + `</LATESTSCHEDULEFINISHDATE>` +
                            //         `<OPERATIONNUMBER>` + oDataC3.OperationNumber + `</OPERATIONNUMBER>` +
                            //         `<ORDERNUMBER>` + oDataC3.OrderNumber + `</ORDERNUMBER>` +
                            //         `<STANDARDVALUE3>` + oDataC3.StandardValue3 + `</STANDARDVALUE3>` +
                            //         `<STANDARDVALUE4>` + oDataC3.StandardValue4 + `</STANDARDVALUE4>` +
                            //         `<STANDARDVALUE5>` + oDataC3.StandardValue5 + `</STANDARDVALUE5>` +
                            //         `<SUPPLIER>` + oDataC3.Supplier + `</SUPPLIER>` +
                            //         `<UNIT3>` + oDataC3.Unit3 + `</UNIT3>` +
                            //         `<UNIT4>` + oDataC3.Unit4 + `</UNIT4>` +
                            //         `<UNIT5>` + oDataC3.Unit5 + `</UNIT5>` +
                            //         `<WORKCENTER>` + oDataC3.WorkCenter + `</WORKCENTER>` +
                            //         `</DATA>`;
                            // }

                            data1 = data1  + `</data>`;
                            await that.renderPdf(data1, "ProductionOrderSheet", ProdOrder, Plant, Workcenter);
                        },
                        error: function (oError) {
                            MessageBox.error("Error occurred while printing Production Order Sheet");
                            BusyIndicator.hide();

                        }
                    })
            },
            renderPdf: async function (xmlData, formName, ProdOrder, Plant, Workcenter) {
                console.log(xmlData);
                BusyIndicator.show();
                console.log('render pdf is called');
                var that = this;
                var RenderPDFFunc = async function (xmlData, templateNameDerived, ProdOrder, templateName) {
                    console.log('RenderPDFFunc is called');

                    var encdata1 = btoa(xmlData);
                    var jsondata2 = {
                        "xdpTemplate": templateNameDerived,
                        "xmlData": encdata1,
                        "formType": "print",
                        "formLocale": "",
                        "taggedPdf": 1,
                        "embedFont": 0
                    };
                    var jsondata3 = JSON.stringify(jsondata2);
                    var dest = '/dest-adsrestapi';
                    var url_render = $.sap.getModulePath("zz.zppproductionorder") + dest + "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=2";
                    await $.ajax({
                        url: url_render,
                        type: "post",
                        contentType: "application/json",
                        data: jsondata3,
                        success: async function (data, textStatus, jqXHR) {
                            console.log('ADS render is successfull with', data);
                            var oModelIO = that.getView().getModel('oModelIO').oData;
                            console.log(oModelIO);
                            BusyIndicator.hide();
                            switch (oModelIO.oOSelected) {
                                case 2:
                                    await that.showPdfDocument(data, ProdOrder);

                                    break;
                                case 1:
                                    await that.printPdfDocument(data, ProdOrder, templateName, oModelIO.printer, Plant, Workcenter);
                                    break;
                                default:
                                    break;
                            }
                        },
                        error: function (data) {
                            BusyIndicator.hide();
                            MessageBox.error("Error while printing pdf");

                        }
                    });
                };
                BusyIndicator.show();
                let oModelUIData = this.getView().getModel('oModelPartOrd').oData;
                let isoLanguage = this.languageMapping[oModelUIData.Language]
                let dest = '/dest-adsrestapi';
                let url_render = $.sap.getModulePath("zz.zppproductionorder") + dest + `/v1/forms/${formName}/templates?language=${isoLanguage}`;
                await $.ajax({
                    url: url_render,
                    type: "get",
                    contentType: "application/json",
                    success: async function (data, textStatus, jqXHR) {
                        BusyIndicator.hide();
                        console.log("form is retrieved with " + data);
                        console.log(data);
                        if (data && data.length > 0) {
                            var templateNameDerived = `${formName}/${data[0].templateName}`;
                            await RenderPDFFunc(xmlData, templateNameDerived, ProdOrder, data[0].templateName);
                        }
                        else {
                            MessageBox.error("Error while receiving the Form Template");
                        }
                    },
                    error: function (data) {
                        BusyIndicator.hide();
                        MessageBox.error("Error while receiving the Form Template");
                    }
                });

            },
            showPdfDocument: async function (data, ProdOrder) {
                console.log('showPdfDocument');
                var decodedPdfContent = atob(data.fileContent);
                var byteArray = new Uint8Array(decodedPdfContent.length);
                for (var i = 0; i < decodedPdfContent.length; i++) {
                    byteArray[i] = decodedPdfContent.charCodeAt(i);
                }
                var blob = new Blob([byteArray.buffer], {
                    type: 'application/pdf'
                });
                var _pdfurl = URL.createObjectURL(blob);
                await this.updateAdditionalStatus(ProdOrder);
                // if (!this._PDFViewer) {
                this._PDFViewer = new sap.m.PDFViewer({
                    width: "auto",
                    source: _pdfurl
                });
                jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                // }

                this._PDFViewer.open();
            },
            updateAdditionalStatus: async function (ProdOrder) {
                let that = this;
                BusyIndicator.show();
                const callBackFunc = async function (userId) {
                    var oModelUIData = that.getView().getModel('oModelPartOrd');
                    const d = new Date();
                    let text = d.toJSON();
                    let addStatus = {
                        PRODUCTIONORDER: ProdOrder,
                        ZZPLANT: oModelUIData.oData.Plant,
                        MAT_TEXT: oModelUIData.oData.MaterialDescription,
                        ZZG_PRINTED_REV: "00",
                        ZPRINT: 'X',
                        ZZG_PRNTDATE: text.substring(0, 10),
                        ZZG_PRNTTIME: text.substring(11, 19),
                        ZZG_PRNTPRID: userId

                    };
                    await that.getOwnerComponent()
                        .getModel("capService").update(`/AdditionalStatus('${ProdOrder}')`, addStatus, {
                            success: async function (Odata) {
                                BusyIndicator.hide();

                            },
                            error: function (oError) {
                                BusyIndicator.hide();
                                MessageBox.error("Error occurred while Updating Additioanl Status in Cloud");
                            }
                        })
                };

                sap.ushell.Container.getServiceAsync("UserInfo").then(function (UserInfo) {
                    var userId = UserInfo.getId();
                    var url_render = $.sap.getModulePath("zz.zppproductionorder") + '/Users/' + userId;
                    $.ajax({
                        url: url_render,
                        type: "get",
                        success: function (data, textStatus, jqXHR) {
                            that.globalId = data.externalId;
                            callBackFunc(that.globalId);
                        },
                        error: function (data) {
                            BusyIndicator.hide();
                            MessageBox.error("Error While Reading User Info");

                        }
                    });
                });



            },
            printPdfDocument: async function (data, ProdOrder, templateName, printer, Plant, Workcenter) {
                console.log('printPdfDocument is called');
                var that = this;
                var callBackFunc = async function (printerRetrieved) {
                    BusyIndicator.show();
                    const fd = new FormData();
                    var blob = that.ataURIToBlob("data:application/pdf;base64," + data.fileContent);
                    fd.append('file', blob, `${ProdOrder}_${templateName}.pdf`);
                    var settings = {
                        "url": $.sap.getModulePath("zz.zppproductionorder") + "/dm/api/v1/rest/print-documents",

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

                    await $.ajax(settings).done(async function (response) {
                        BusyIndicator.hide();
                        var settings = {
                            "url": $.sap.getModulePath("zz.zppproductionorder") + "/qm/api/v1/rest/print-tasks/" + response,
                            "method": "PUT",
                            "timeout": 0,
                            "headers": {
                                "Content-Type": "application/json",
                                "If-None-Match": "*",
                            },
                            "data": JSON.stringify({
                                "numberOfCopies": 1,
                                "username": sap.ushell.Container.getService("UserInfo").getEmail(),
                                "qname": printerRetrieved,
                                "printContents": [
                                    {
                                        "objectKey": response,
                                        "documentName": `${ProdOrder}_${templateName}.pdf`
                                    }
                                ]
                            }),
                        };
                        BusyIndicator.show();

                        await $.ajax(settings).done(async function (response) {
                            BusyIndicator.hide();
                            await that.updateAdditionalStatus(ProdOrder);
                            MessageBox.success("Document sent to print queue successfully");
                            sap.ui.core.BusyIndicator.hide();
                        }).fail(function (jqXhr, textStatus) {
                            BusyIndicator.hide();
                            console.log(jqXhr);
                            console.log(textStatus);
                        });;
                    }).fail(function (jqXhr, textStatus) {
                        BusyIndicator.hide();
                        console.log(jqXhr);
                        console.log(textStatus);
                    });
                }
                var oFilter;
                BusyIndicator.show();
                if (printer === '') {
                    oFilter = new Filter({
                        filters: [
                            new Filter({
                                path: 'KEY1',
                                operator: FilterOperator.EQ,
                                value1: Plant
                            }),
                            new Filter({
                                path: 'KEY2',
                                operator: FilterOperator.EQ,
                                value1: Workcenter
                            })
                        ],
                        and: true
                    });
                }
                else {
                    oFilter = new Filter({
                        path: 'PRINTERID',
                        operator: FilterOperator.EQ,
                        value1: printer
                    })
                }


                await that.getOwnerComponent()
                    .getModel("capService").read(`/PrinterConfiguration`, {
                        filter: [oFilter],
                        success: async function (oData) {
                            BusyIndicator.hide();
                            let PrinterRetrieved = oData.results[0].PRINTERID;
                            await callBackFunc(PrinterRetrieved);
                        },
                        error: function (oError) {
                            BusyIndicator.hide();
                            if (printer) {
                                MessageBox.error("Provided Printer is not configured");
                            }
                            else {
                                MessageBox.error("Please select printer ID from F4 search help");
                            }

                        }
                    });
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
            printChildPartList: async function (ProdOrder, Plant, Workcenter) {
                MessageToast.show("Child Part List Printing is started");
                BusyIndicator.show();
                var urlToRead = `/ChildPartListCombined('${ProdOrder}')`;
                var that = this;
                //?$expand=to_Components
                var data1;
                await this.getOwnerComponent()
                    .getModel("capService")
                    .read(urlToRead, {
                        urlParameters: {
                            "$expand": "to_Components"
                        },
                        method: "GET",
                        success: async function (oDataArray, response) {
                            let oData = oDataArray;
                            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                                `<HEADER><PRODUCTIONORDERNO>` + oData.ProductionOrderNo + `</PRODUCTIONORDERNO>` +
                                `<RESERVATION>` + oData.Reservation + `</RESERVATION>` +
                                `<MATERIALNUMBER>` + oData.MaterialNumber + `</MATERIALNUMBER>` +
                                `<MATERIALDESCRIPTIONH>` + oData.MaterialDescriptionH + `</MATERIALDESCRIPTIONH>` +
                                `<ORDERQTY>` + oData.OrderQty + `</ORDERQTY>` +
                                `<BASEUNITMEASURE>` + oData.BaseUnitMeasure + `</BASEUNITMEASURE>` +
                                `<STARTDATE>` + oData.StartDate + `</STARTDATE>` +
                                `<ENDDATE>` + oData.EndDate + `</ENDDATE>` +
                                `<STORAGELOCATION>` + oData.StorageLocation + `</STORAGELOCATION>` +
                                `<REPRINT>` + '' + `</REPRINT>` +
                                `<ISSUEDATE>` + oData.IssueDate + `</ISSUEDATE>` +
                                `</HEADER>` + `<ITEMS>`;

                            for (let index in oData.to_Components.results) {
                                let oComponent = oData.to_Components.results[index];
                                data1 = data1 + `<DATA>` +
                                    '<PT>' + oComponent.PT + '</PT>' +
                                    '<SPT>' + oComponent.SPT + '</SPT>' +
                                    '<RESERVATION>' + oComponent.rsnum + '</RESERVATION>' +
                                    '<PARTNUMBER>' + oComponent.PartNumber + '</PARTNUMBER>' +
                                    '<PARTDESCRIPTION>' + oComponent.PartDescription + '</PARTDESCRIPTION>' +
                                    '<REQQTY>' + oComponent.ReqQty + '</REQQTY>' +
                                    '<BASEUNIT>' + oComponent.BaseUnit + '</BASEUNIT>' +
                                    '<STORAGEDATALOCATION>' + oComponent.StorageLocation + '</STORAGEDATALOCATION>' +
                                    '<DIMENSION>' + oComponent.Dimension + '</DIMENSION>' +
                                    '<MATERIALQTY>' + oComponent.MaterialQty + '</MATERIALQTY>' +
                                    '<PLANT>' + oComponent.Plant + '</PLANT>' +
                                    '<STORAGEDATABIN>' + oComponent.StorageDataBin + '</STORAGEDATABIN>' +
                                    '<LOCATION>' + oComponent.Location + '</LOCATION>' +
                                    '<BACKFLUSH>' + oComponent.BackFlush + '</BACKFLUSH>' +
                                    '<SUPPLYAREA>' + oComponent.SupplyArea + '</SUPPLYAREA>' +
                                    `</DATA>`;
                            }

                            data1 = data1 + `</ITEMS>` + `</data>`;
                            BusyIndicator.hide();
                            await that.renderPdf(data1, "ChildPartList", ProdOrder, Plant, Workcenter);
                        },
                        error: function (oError) {
                            BusyIndicator.hide();
                            MessageBox.error("Error occurred while saving Create Part Order");

                        }
                    })
            },
            onUpload: function (oEvent) {

                var viewId = this.getView().getId();
                var idforFU = oEvent.getParameter("id");
                var fU = sap.ui.getCore().byId('FileUploaderId');
                var domRef = fU.getFocusDomRef();
                var file = domRef.files[0];
                var sUrl = '/sap/opu/odata/sap/ZAPIHPP0003_SRV';
                if (!this.getOwnerComponent().getModel()) {
                    var oModelCreatePartOrder = new sap.ui.model.odata.ODataModel(sUrl, true);
                    this.getView().setModel(oModelCreatePartOrder);
                    sap.ui.getCore().setModel(oModelCreatePartOrder);
                }

                var oHeaders = {
                    'slug': 'QF',
                    'X-CSRF-Token': this.getView().getModel().getSecurityToken()
                };
                jQuery.ajax({
                    type: 'POST',
                    url: sUrl,
                    headers: oHeaders,
                    cache: false,
                    contentType: 'csv',
                    processData: false,
                    data: file,
                    success: function (data) {

                        sap.m.MessageToast.show('File Uploaded Successfully');
                    },
                    error: function (data) {
                        sap.m.MessageToast.show('Error while uploading the excel file');
                    }

                });

                // this._import(oEvent.getParameter("files") && oEvent.getParameter("files")[0]);

            },
            handleUploadComplete: function (oEvent) {
                this.oMassUploadDialog.close();
                sap.m.MessageToast.show("File Uploaded");

            },
            _import: function (file) {
                var that = this;
                var excelData = {};
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        });

                    };
                    reader.onerror = function (ex) {
                        MessageBox.error("Error While reading Excel " + ex.getText());
                    };
                    reader.readAsBinaryString(file);

                }
            },
            onOrderCancel: function (oEvent) {
                this.oTransferDialog.close();

            },
            onMassUploadCancel: function (oEvent) {
                this.oMassUploadDialog.close();
            },

            onSelect: function (oEvent) {
                var oModelUI = this.getView().getModel('oModelUI');
                var oModelPartOrd = this.getView().getModel('oModelPartOrd');
                oModelPartOrd.setProperty("/Plant", "");
                oModelPartOrd.setProperty("/Material", "");
                oModelPartOrd.setProperty('/MaterialDescription', "");
                oModelPartOrd.setProperty('/Version', "");
                oModelPartOrd.setProperty('/Quantity', "");
                oModelPartOrd.setProperty("/Language", "");
                oModelPartOrd.setProperty("/OrderFinishDate", "");
                oModelPartOrd.setProperty('/StorageLocation', "");
                oModelPartOrd.setProperty('/Note', "");
                oModelPartOrd.setProperty('/Workcenter', "");
                oModelPartOrd.setProperty('/Costcenter', '');

                var selectedIndex = oEvent.getParameters('selectedIndex');
                if (selectedIndex.selectedIndex === 0) {
                    oModelUI.setProperty("/master", true);
                    oModelUI.setProperty("/text", false);
                    oModelUI.setProperty('/formEditable', true);
                    oModelUI.setProperty('/processRecordSheetEditable', true);


                }
                else if (selectedIndex.selectedIndex === 1) {
                    oModelUI.setProperty("/text", true);
                    oModelUI.setProperty("/master", false);
                    oModelUI.setProperty('/formEditable', true);
                    oModelUI.setProperty('/processRecordSheetEditable', true);
                }
            },
            onSelectTO: function (oEvent) {
                var oModelTO = this.getView().getModel('oModelTO');
                var oModelPartOrd = this.getView().getModel('oModelPartOrd');
                var selectedIndex = oEvent.getParameters('selectedIndex');
                oModelTO.setProperty("/none", false);
                oModelTO.setProperty("/ot", false);
                oModelTO.setProperty('/cct', false);
                oModelTO.setProperty('/st', false);
                oModelTO.setProperty('/tORBG', false);
                oModelTO.setProperty("/po", false);
                oModelTO.setProperty("/linkage", false);
                oModelTO.setProperty('/cc', false);
                oModelTO.setProperty('/gl', false);
                oModelTO.setProperty('/store', false);
                oModelPartOrd.setProperty('/Prodorder', '');
                oModelPartOrd.setProperty('/Linknumber', '');
                oModelPartOrd.setProperty('/Costcenter', '');
                oModelPartOrd.setProperty('/Glaccnt', '');
                oModelPartOrd.setProperty('/Store', '');

                switch (selectedIndex.selectedIndex) {
                    case 0:
                        oModelTO.setProperty("/none", true);
                        break;
                    case 1:
                        oModelTO.setProperty("/ot", true);
                        oModelTO.setProperty('/tORBG', true);
                        break;
                    case 2:
                        oModelTO.setProperty("/cct", true);
                        oModelTO.setProperty('/tORBG', true);
                        break;
                    case 3:
                        oModelTO.setProperty("/ot", true);
                        //oModelTO.setProperty("/cct", true);
                        oModelTO.setProperty("/st", true);
                        oModelTO.setProperty('/tORBG', true);
                        break;
                    default:
                }
            },
            onSelectTOField: function (oEvent) {
                var oModelTO = this.getView().getModel('oModelTO');
                var oModelPartOrd = this.getView().getModel('oModelPartOrd');
                var selectedIndex = oEvent.getParameters('selectedIndex');
                oModelTO.setProperty("/po", false);
                oModelTO.setProperty("/linkage", false);
                oModelTO.setProperty('/cc', false);
                oModelTO.setProperty('/gl', false);
                oModelTO.setProperty('/store', false);
                oModelPartOrd.setProperty('/Prodorder', '');
                oModelPartOrd.setProperty('/Linknumber', '');
                oModelPartOrd.setProperty('/Costcenter', '');
                oModelPartOrd.setProperty('/Glaccnt', '');
                oModelPartOrd.setProperty('/Store', '');
                switch (selectedIndex.selectedIndex) {
                    case 0:
                        oModelTO.setProperty("/po", true);
                        break;
                    case 1:
                        oModelTO.setProperty("/linkage", true);

                        break;
                    // case 2:
                    //     oModelTO.setProperty("/cc", true);
                    //     break;
                    // case 3:
                    //     oModelTO.setProperty("/gl", true);
                    //     break;
                    case 2:
                        oModelTO.setProperty("/store", true);
                        break;
                    case 3:
                        oModelTO.setProperty("/cct", true);
                        break;
                    default:
                }
            },
            onValueHelp: function (oEvent) {
                this.elementId = oEvent.getSource().getId();
                this.sourceId;
                this.titleId;
                var oModelUIData = this.getView().getModel('oModelPartOrd');
                switch (true) {
                    case this.elementId.includes("idPlant"):
                        this.sourceId = "zz.zppproductionorder.fragments.PlantHelp";
                        this.titleId = 'Werks';
                        break;
                    case this.elementId.includes("idMat1"):
                        this.sourceId = "zz.zppproductionorder.fragments.MaterialHelp";
                        this.titleId = 'Matnr';
                        break;
                    case this.elementId.includes("idSloc"):
                        this.sourceId = "zz.zppproductionorder.fragments.StorageHelp";
                        this.titleId = 'Lgort';
                        break;
                    case this.elementId.includes("idPV"):
                        this.sourceId = "zz.zppproductionorder.fragments.VersionHelp";
                        this.titleId = 'Verid';
                        break;
                    default:
                        break;
                };

                var oView = this.getView();
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: this.sourceId,
                    controller: this
                }).then(function (oValueHelpDialog) {
                    oView.addDependent(oValueHelpDialog);
                    return oValueHelpDialog;
                });
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    // var oFilterArray = [];
                    // oFilterArray.push(new Filter('Werks', FilterOperator.Contains, oModelUIData.oData.Plant));
                    // oFilterArray.push(new Filter('Matnr', FilterOperator.Contains, oModelUIData.oData.Matnr));
                    // var oFilter = new Filter('Werks', FilterOperator.Contains, oModelUIData.oData.Plant)
                    // var oBinding = oEvent.getParameter("itemsBinding");
                    // oBinding.filter([oFilter]);
                    oValueHelpDialog.open();
                }.bind(this));
            },
            onValueHelpDialogClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    sap.ui.getCore().byId(this.elementId).setValue(oSelectedItem.getTitle());
                    var oBinding = oEvent.getParameter("itemsBinding");
                    oBinding.filter([]);
                }
            },
            onSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter(this.titleId, FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },
            validate: function () {
                var oModelIO = this.getView().getModel('oModelIO').oData;
                if (oModelIO && (oModelIO.childPart || oModelIO.processRecordSheet || oModelIO.productionOrderSheet)) {
                    if (oModelIO.oOSelected > 3 || oModelIO.oOSelected < 0) {
                        MessageBox.error(`Select an output option`);
                        return false;
                    }
                    if (oModelIO.oOSelected === 1 && oModelIO.pOSelected === 1 && oModelIO.printer === '') {
                        MessageBox.error(`Please select printer ID from F4 search help`);
                        return false;
                    }
                }
                return true;
            },
            handlePrinterSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("PRINTERID", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },
            handlePrinterClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (!oSelectedItem) {
                    return;
                }
                var oModelIO = this.getView().getModel('oModelIO');
                oModelIO.setProperty("/printer", oSelectedItem.getCells()[0].getTitle());
            },
            onValueHelpPrinter: function (oEvent) {
                var oView = this.getView();

                if (!this._printerValueHelpDialog) {
                    this._printerValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "zz.zppproductionorder.fragments.Printer",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._printerValueHelpDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                }.bind(this));
            },
            onValueHelp1: async function (oEvent) {
                var oView = this.getView();
                this.ValueHelpInvokedOn = oEvent.getSource().mBindingInfos.value.parts[0].path;
                var fragmentObj = {
                    "Costcenter": "CostCenter",
                    "Glaccnt": "GLAccount",
                    "Store": "StorageLocation",
                    "Prodorder": "ProductionOrder",
                    "Plant": "PlantHelp",
                    "Material": "MaterialHelp",
                    "StorageLocation": "StorageHelp",
                    "Workcenter": "WorkCenter"
                };
                var idProperty = this.ValueHelpInvokedOn.substring(1);
                const fragmentId = `zz.zppproductionorder.fragments.${fragmentObj[idProperty]}`;
                if (!this.FragemntLoaded) {
                    this.FragemntLoaded = {}
                }
                if (!this.FragemntLoaded[idProperty]) {
                    this.FragemntLoaded[idProperty] = await Fragment.load({
                        id: oView.getId() + idProperty,
                        name: fragmentId,
                        controller: this
                    });
                    oView.addDependent(this.FragemntLoaded[idProperty]);
                }
                this.FragemntLoaded[idProperty].open();
            },
            handleClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (!oSelectedItem) {
                    return;
                }
                var oModelIO = this.getView().getModel('oModelPartOrd');
                oModelIO.setProperty(this.ValueHelpInvokedOn, oSelectedItem.getCells()[0].getTitle());
                var idProperty = this.ValueHelpInvokedOn.substring(1);
            },
            handleSearch: function (oEvent) {
                var idProperty = this.ValueHelpInvokedOn.substring(1);
                var searchField = {
                    "Costcenter": ["Kostl", "Kokrs", "Ktext"],
                    "Glaccnt": ["Saknr", "Txt50", "GlaccountType", "Ktopl"],
                    "Store": ["Lgort", "Werks", "Lgobe"],
                    "Prodorder": ["prod_order_created", "plant", "material", "order_type"],
                    "Plant": ["Werks"],
                    "Material": ["Matnr"],
                    "StorageLocation": ["Lgort"],
                    "Workcenter": ["Arbpl"]

                };
                var sValue = oEvent.getParameter("value");
                const arrayFields = searchField[idProperty];
                var oFilters = [];
                arrayFields.forEach(function (oItem) {
                    oFilters.push(new Filter({
                        path: oItem,
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: sValue
                    }));
                });

                var oFilter = new Filter({ filters: oFilters, and: false });
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },
            onProductVersionChange: function (oEvent) {
                let oParameters = oEvent.getParameters();
                var oModelUI = this.getView().getModel('oModelUI');
                if (oParameters.value.substring(2, 1) === '2') {
                    this.getView().getModel('oModelIO').setProperty("/processRecordSheet", true);
                    oModelUI.setProperty('/processRecordSheetEditable', false);
                }
                else {
                    this.getView().getModel('oModelIO').setProperty("/processRecordSheet", false);
                    oModelUI.setProperty('/processRecordSheetEditable', true);
                }
            }
        };
    });
