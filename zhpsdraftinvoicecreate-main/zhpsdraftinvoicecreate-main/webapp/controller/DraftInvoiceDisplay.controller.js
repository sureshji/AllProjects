sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("com.yokogawa.zhpsdraftinvoicecreate.controller.DraftInvoiceDisplay", {
            onInit: function () {

                // var aitemInvoice = [];
                // var oDraftInvoiceData = new JSONModel();
                // oDraftInvoiceData.setData(aitemInvoice);
                // this.getView().setModel(oDraftInvoiceData, "oDraftInvoiceData");
                var oViewModel = new JSONModel({
                    hasRequired: true,
                    hasInputVisible: true,
                    hasTextVisible: false,
                    totalValue: "",
                    taxAmount: null,
                    status: "Success",
                    hasHarmonyVisible: true,
                    invoiceID: "",
                    invoiceDate: null,
                    material: {
                        MATERIALDESC: "",
                        UNITPRICE: "",
                        QUAN: "",
                        BILLINGAMOUNT: ""
                    }
                });
                this.getView().setModel(oViewModel, "appView");

                this.getOwnerComponent().getRouter().getRoute("RouteDraftInvoiceDisplay").attachMatched(this._onObjectMatched, this);

            },
            _onObjectMatched: function (oEvent) {

                this.busyDialog = new sap.m.BusyDialog({
                    title: "Loading Data",
                    text: "Retreiving Invoice"
                });
                this.busyDialog.open();
                var sPath = oEvent.getParameter("arguments").sPath;
                this.sPath = sPath;
                var strSPath = sPath.split("('");
                this.INVOICEID = strSPath[1].replace("')", "");
                this.companyCode = oEvent.getParameter("arguments").companyCode;
                this.projectID = oEvent.getParameter("arguments").projectID;
                this.dateFrom = oEvent.getParameter("arguments").dateFrom;
                this.dateTo = oEvent.getParameter("arguments").dateTo;
                this.getInvoiceData();
                // this.getSalesRateTableData();


                //    this._bindView("/"+sPath);

            },
            getSalesRateTableData: function () {
                var urlToRead = "/ZTHBT0021";
                var filter = new sap.ui.model.Filter("PROJECTID", "EQ", this.ProjectID);
                this.getOwnerComponent().getModel().read(urlToRead, {
                    filters: [filter],
                    method: "GET",
                    success: function (data) {
                        var SalesModel = new sap.ui.model.json.JSONModel();
                        SalesModel.setData(data.results[0]);
                        this.getView().setModel(SalesModel, "SalesModel");
                    }.bind(this),
                    error: function (oError) {
                        reject(oError);
                    }.bind(this)
                });

            },
            onCreate: function () {
                if (!this._oInvoiceHistoryDailogFragment) {
                    // load asynchronous XML fragment
                    this._oInvoiceHistoryDailogFragment = sap.ui.xmlfragment("InvoiceHistorySelectionDialog",
                        "com.yokogawa.zhpsdraftinvoice.view.fragments.InvoiceCreateDialog", this);
                    this.getView().addDependent(this._oInvoiceHistoryDailogFragment);
                }
                // this._onInitializeSalesRateEditDialog(oModelData);
                this._oInvoiceHistoryDailogFragment.open();
                // this.getOwnerComponent().getRouter().navTo("RouteSalesRateRegistration");
            },
            onCreateInvoice: function () {
                this.getOwnerComponent().getRouter().navTo("RouteDraftInvoiceCreate");
            },
            getInvoiceData: function () {
                // this.busyDialog = new sap.m.BusyDialog({
                //     title: "Loading Data",
                //     text: "Retreiving Invoice"
                // });
                // this.busyDialog.open();
                var urlToRead = "/" + this.sPath;//'/ZTHBT0022';
                var filter = new sap.ui.model.Filter("INVOICEID", "EQ", this.InvoiceID);
                var data1;
                this.getOwnerComponent().getModel().read(urlToRead, {
                    urlParameters: {
                        "$expand": "RESOURCES,EXPENSE,MATERIAL"
                    },
                    // filters: [filter],
                    method: "GET",
                    success: function (oData, response) {
                        console.log(oData);
                        this.busyDialog.close();
                        var oDraftInvoiceData = new JSONModel([]);
                        oDraftInvoiceData.setData(oData);
                        this.getView().setModel(oDraftInvoiceData, "oDraftInvoiceData");
                        this.ProjectID = oData.PROJECTID;
                        this.getSalesRateTableData();
                        // this.getView().getModel("oDraftInvoiceData").setProperty('/', oData.results);
                        //this.byId('idSolTeamTable').setModel(this.getView().getModel("oDraftInvoiceData"));
                    }.bind(this),
                    error: function (error) {
                        this.busyDialog.close();
                    }.bind(this)


                });

            },
            onEditInvoice: function () {
                // this.getView().byId("idHoursText").setVisible(false);
                // this.getView().byId("idHoursInput").setVisible(true);
                this.getView().getModel("appView").setProperty("/hasInputVisible", false);
                this.getView().getModel("appView").setProperty("/hasTextVisible", true);
            },
            onSaveChanges: function () {
                var that = this;
                var oInvoiceData = this.getView().getModel("oDraftInvoiceData").getData();
                var oDataModel = this.getView().getModel();

                if (oInvoiceData) {

                    var sPath;
                    sPath = "/" + this.sPath;

                    this.getView().getModel().setProperty(sPath + "/TOTALAMOUNT", String(oInvoiceData.TOTALAMOUNT));
                    this.getView().getModel().setProperty(sPath + "/TAXAMOUNT", oInvoiceData.TAXAMOUNT);

                }

                if (oInvoiceData.RESOURCES.results.length > 0) {
                    oInvoiceData.RESOURCES.results.forEach(function (oResources) {

                        if (oResources.ID) {
                            var sPath;
                            sPath = "/ZTHBT0023(guid'" + oResources.ID + "')";

                            that.getView().getModel().setProperty(sPath + "/HOURS", oResources.HOURS);
                            that.getView().getModel().setProperty(sPath + "/BILLINGAMOUNT", oResources.BILLINGAMOUNT);
                        } else {
                            oDataModel.createEntry("/ZTHBT0023", {
                                properties: {
                                    INVOICEID_INVOICEID: that.INVOICEID,
                                    YEARMONTH: oResources.YEARMONTH,
                                    EMPID: oResources.EMPID,
                                    EMPNAME: oResources.EMPNAME,
                                    GRADE: oResources.GRADE,
                                    BELONGS: oResources.BELONGS,
                                    //                            CURR: oResources.CURR,
                                    UNITPRICE: oResources.UNITPRICE,
                                    HOURS: oResources.HOURS,
                                    BILLINGAMOUNT: oResources.BILLINGAMOUNT
                                }
                            });
                        }

                    });
                }

                if (oInvoiceData.EXPENSE.results.length > 0) {
                    oInvoiceData.EXPENSE.results.forEach(function (oExpense) {

                        if (oExpense.ID) {
                            var sPath;
                            sPath = "/ZTHBT0024(guid'" + oExpense.ID + "')";
                            that.getView().getModel().setProperty(sPath + "/NOTE", oExpense.NOTE);
                            that.getView().getModel().setProperty(sPath + "/CALCTYPE", oExpense.CALCTYPE);
                            that.getView().getModel().setProperty(sPath + "/BILLINGAMOUNT", oExpense.BILLINGAMOUNT);
                        } else {
                            oDataModel.createEntry("/ZTHBT0024", {
                                properties: {
                                    INVOICEID_INVOICEID: that.INVOICEID,
                                    COSTELEMENT: oExpense.COSTELEMENT,
                                    NOTE: oExpense.NOTE,
                                    CURRENCY: oExpense.CURRENCY,
                                    ITEMTEXT: oExpense.ITEMTEXT,
                                    AMOUNT: oExpense.AMOUNT,
                                    CALCTYPE: oExpense.CALCTYPE,
                                    MARKUP: oExpense.MARKUP,
                                    BILLINGAMOUNT: oExpense.BILLINGAMOUNT
                                }
                            });
                        }


                    });
                }
                if (oInvoiceData.MATERIAL.results.length > 0) {
                    oInvoiceData.MATERIAL.results.forEach(function (oMaterial) {

                        if (oMaterial.ID) {
                            var sPath;
                            sPath = "/ZTHBT0025(guid'" + oMaterial.ID + "')";
                            that.getView().getModel().setProperty(sPath + "/MATERIALDESC", oMaterial.MATERIALDESC);
                            that.getView().getModel().setProperty(sPath + "/UNITPRICE", oMaterial.UNITPRICE);
                            that.getView().getModel().setProperty(sPath + "/QUAN", oMaterial.QUAN);
                            that.getView().getModel().setProperty(sPath + "/CURRENCY", oMaterial.CURRENCY);
                            that.getView().getModel().setProperty(sPath + "/UOM", oMaterial.UOM);
                        } else {
                            oDataModel.createEntry("/ZTHBT0025", {
                                properties: {
                                    INVOICEID_INVOICEID: that.INVOICEID,
                                    MATERIALDESC: oMaterial.MATERIALDESC,
                                    UNITPRICE: oMaterial.UNITPRICE,
                                    QUAN: oMaterial.QUAN,
                                    CURRENCY: oMaterial.CURRENCY,
                                    UOM: oMaterial.UOM,
                                    BILLINGAMOUNT: oMaterial.BILLINGAMOUNT
                                }
                            });
                        }



                    });
                }

                // var sPath = "/ZTHBT0024('345345')";
                // }
                // var oDataModel = this.getView().getModel();
                // oDataModel.setProperty(sPath + "/CalcType", "-");
                // var oDataModel = this.getView().getModel();
                if (oDataModel.hasPendingChanges()) {
                    oDataModel.submitChanges({
                        success: function (data) {
                            MessageBox.success("Invoice Saved Successfully");
                            this.getView().getModel("appView").setProperty("/hasInputVisible", true);
                            this.getView().getModel("appView").setProperty("/hasTextVisible", false);

                        }.bind(this),
                        error: function () {
                            this.busyDialog.close();
                            MessageBox.show("Error while updating!");
                        }.bind(this),
                    });
                }
            },
            onChangeCalcType: function (oEvent) {
                var oContext = oEvent.getSource().mBindingInfos.selectedKey.binding.oContext.sPath;
                var aSelectedCalcType = oEvent.getParameters().selectedItem.mProperties.key;
                var oDraftInvoiceData = this.getView().getModel("oDraftInvoiceData").getProperty(oContext);
                if (aSelectedCalcType === "1") {
                    oDraftInvoiceData.BILLINGAMOUNT = oDraftInvoiceData.AMOUNT;
                } else if (aSelectedCalcType === "2") {

                } else if (aSelectedCalcType === "3") {

                } else if (aSelectedCalcType === "4") {

                }
                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                var oData = this.getView().getModel("oDraftInvoiceData").getData();
                for (var i = 0; i < oData.RESOURCES.results.length; i++) {
                    totalResourceBiling = totalResourceBiling + parseFloat(oData.RESOURCES.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.EXPENSE.results.length; i++) {
                    totalExpenseBiling = totalExpenseBiling + parseFloat(oData.EXPENSE.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.MATERIAL.results.length; i++) {
                    totalMaterialBiling = totalMaterialBiling + parseFloat(oData.MATERIAL.results[i].BILLINGAMOUNT);
                }
                var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                oData.TOTALAMOUNT = totalValue;

                this.getView().getModel("oDraftInvoiceData").refresh();
            },
            _onInitializeResourceDialog: function () {
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idyearMonth").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idEmpID").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idName").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idHours").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idBillingAmount").setValue("");
                //   sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idCurrency").setValue("");
            },
            _onInitializeExpenseDialog: function () {
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCostElement").setValue("");
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idNote").setValue("");
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idItemText").setValue("");
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idAmount").setValue("");
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCalcType").setSelectedKey("");
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idExtended").setValue("");
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").setValue("");
            },
            _onInitializeMaterialDialog: function () {
                sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idMaterialDescription").setValue("");
                sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idUnitPrice").setValue("");
                sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idQuantity").setValue("");
                sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idBillingAmount").setValue("");
            },
            calculateTotalBillingAmount: function () {
                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;

                // this.getView().getModel().setProperty(sPath + "/Hours", oResources.Hours);
                var oData = this.getView().getModel("oDraftInvoiceData").getData();
                for (var i = 0; i < oData.RESOURCES.results.length; i++) {
                    totalResourceBiling = totalResourceBiling + parseFloat(oData.RESOURCES.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.EXPENSE.results.length; i++) {
                    totalExpenseBiling = totalExpenseBiling + parseFloat(oData.EXPENSE.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.MATERIAL.results.length; i++) {
                    totalMaterialBiling = totalMaterialBiling + parseFloat(oData.MATERIAL.results[i].BILLINGAMOUNT);
                }
                var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                oData.TOTALAMOUNT = totalValue;

                this.getView().getModel("oDraftInvoiceData").refresh();
            },
            onChangeHours: function (oEvent) {
                var oContext = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var oDraftInvoiceData = this.getView().getModel("oDraftInvoiceData").getProperty(oContext);
                var hours = oEvent.getSource().getValue();
                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                var oNewValue = oDraftInvoiceData.UNITPRICE * hours;
                oDraftInvoiceData.BILLINGAMOUNT = oNewValue;
                // this.getView().getModel().setProperty(sPath + "/Hours", oResources.Hours);
                var oData = this.getView().getModel("oDraftInvoiceData").getData();
                for (var i = 0; i < oData.RESOURCES.results.length; i++) {
                    totalResourceBiling = totalResourceBiling + parseFloat(oData.RESOURCES.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.EXPENSE.results.length; i++) {
                    totalExpenseBiling = totalExpenseBiling + parseFloat(oData.EXPENSE.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.MATERIAL.results.length; i++) {
                    totalMaterialBiling = totalMaterialBiling + parseFloat(oData.MATERIAL.results[i].BILLINGAMOUNT);
                }
                var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                oData.TOTALAMOUNT = totalValue;

                this.getView().getModel("oDraftInvoiceData").refresh();
            },
            onChangeExtendValueHelp: function () {
                var CalcType = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCalcType").getSelectedKey();
                var oAmount = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idAmount").getValue();
                var value = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idExtended").getValue();
                var amt;

                oAmount = parseInt(oAmount);
                value = parseInt(value);
                if (CalcType === "1") {
                    // oDraftInvoiceData.BillingAmount = oDraftInvoiceData.Amount;
                } else if (CalcType === "2") {

                    var oPercentValue = ((oAmount * value) / 100).toFixed(2);
                    amt = oAmount + parseInt(oPercentValue);
                } else if (CalcType === "3") {

                    amt = oAmount + parseInt(value);
                } else if (CalcType === "4") {
                    amt = parseInt(value);
                }

                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").setValue(amt);

            },
            onChangeAmount: function (oEvent) {
                var oContext = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var oDraftInvoiceData = this.getView().getModel("oDraftInvoiceData").getProperty(oContext);
                var value = oEvent.getSource().getValue();
                var CalcType = oDraftInvoiceData.CALCTYPE;
                var oAmount = oDraftInvoiceData.AMOUNT;
                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                if (CalcType === "1") {
                    // oDraftInvoiceData.BillingAmount = oDraftInvoiceData.Amount;
                } else if (CalcType === "2") {

                    var oPercentValue = ((oAmount * value) / 100).toFixed(2);
                    oDraftInvoiceData.BILLINGAMOUNT = oAmount + parseFloat(oPercentValue);
                } else if (CalcType === "3") {

                    oDraftInvoiceData.BILLINGAMOUNT = oAmount + parseFloat(value);
                } else if (CalcType === "4") {
                    oDraftInvoiceData.BILLINGAMOUNT = parseFloat(value);
                }

                var oData = this.getView().getModel("oDraftInvoiceData").getData();
                for (var i = 0; i < oData.RESOURCES.results.length; i++) {
                    totalResourceBiling = totalResourceBiling + parseFloat(oData.RESOURCES.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.EXPENSE.results.length; i++) {
                    totalExpenseBiling = totalExpenseBiling + parseFloat(oData.EXPENSE.results[i].BILLINGAMOUNT);
                }
                for (var i = 0; i < oData.MATERIAL.results.length; i++) {
                    totalMaterialBiling = totalMaterialBiling + parseFloat(oData.MATERIAL.results[i].BILLINGAMOUNT);
                }
                var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                oData.TOTALAMOUNT = totalValue;
                this.getView().getModel("oDraftInvoiceData").refresh();
            },
            totalFormatter: function (results) {
                return results.length;
            },
            onPrintInvoice: function () {
                this.busyDialog = new sap.m.BusyDialog({
                    title: "Loading Data",
                    text: "Retreiving PDF"
                });
                this.busyDialog.open();
                var urlToRead = '/ZTHBT0022';
                var filter = new sap.ui.model.Filter("INVOICEID", "EQ", this.INVOICEID);
                var that1 = this;
                //?$expand=to_Components
                var data1;
                this.getOwnerComponent()
                    .getModel()
                    .read(urlToRead, {
                        urlParameters: {
                            "$expand": "RESOURCES,EXPENSE,MATERIAL"
                        },
                        filters: [filter],
                        method: "GET",
                        success: function (oData, response) {
                            console.log(oData);
                            data1 = '<?xml version="1.0" encoding="utf-8"?>' +
                                '<data>' +
                                '<INVOICENO>' + oData.results[0].INVOICEID + '</INVOICENO>' +
                                '<INVOICEDATE>' + oData.results[0].INVDATE + '</INVOICEDATE>' +
                                '<RESOURCE>';

                            for (let index in oData.results[0].RESOURCES.results) {
                                let oResources = oData.results[0].RESOURCES.results[index];
                                data1 = data1 + '<DATA>' +
                                    '<D_INVOICE>' + oResources.INVOICEID + '</D_INVOICE>' +
                                    '<YEARMONTH>' + oResources.YEARMONTH + '</YEARMONTH>' +
                                    '<EMPID>' + oResources.EMPID + '</EMPID>' +
                                    '<EMPNAME>' + oResources.EMPNAME + '</EMPNAME>' +
                                    '<GRADE>' + oResources.GRADE + '</GRADE>' +
                                    '<BELONGS>' + oResources.BELONGS + '</BELONGS>' +
                                    '<CURR>' + oResources.CURR + '</CURR>' +
                                    '<UNITPRICE>' + oResources.UNITPRICE + '</UNITPRICE>' +
                                    '<HOURS>' + oResources.HOURS + '</HOURS>' +
                                    '<BILLINGAMOUNT>' + oResources.BILLINGAMOUNT + '</BILLINGAMOUNT>' +
                                    `</DATA>`;
                            }
                            data1 = data1 + '</RESOURCE>' + '<EXPENSE>';
                            for (let index in oData.results[0].EXPENSE.results) {
                                let oExpense = oData.results[0].EXPENSE.results[index];
                                data1 = data1 + '<DATA>' +
                                    '<NOTE>' + oExpense.NOTE + '</NOTE>' +
                                    '<BILLINGAMOUNT>' + oExpense.BILLINGAMOUNT + '</BILLINGAMOUNT>' +
                                    `</DATA>`;
                            }
                            data1 = data1 + '</EXPENSE>' + '<MATERIAL>';
                            for (let index in oData.results[0].MATERIAL.results) {
                                let oExpense = oData.results[0].MATERIAL.results[index];
                                data1 = data1 + '<DATA>' +
                                    '<DESCRIPTION>' + oExpense.MATERIALDESC + '</DESCRIPTION>' +
                                    '<UNITPRICE>' + oExpense.UNITPRICE + '</UNITPRICE>' +
                                    '<QUANTITY>' + oExpense.QUAN + '</QUANTITY>' +
                                    '<BILLINGAMOUNT>' + oExpense.BILLINGAMOUNT + '</BILLINGAMOUNT>' +
                                    `</DATA>`;
                            }
                            data1 = data1 + '</MATERIAL>' + '</data>';
                            var encdata1 = btoa(data1);
                            var jsondata2 = {
                                "xdpTemplate": "HODraftDocumentForm/HODraft",
                                "xmlData": encdata1,
                                "formType": "print",
                                "formLocale": "",
                                "taggedPdf": 1,
                                "embedFont": 0
                            };
                            var jsondata3 = JSON.stringify(jsondata2);
                            var dest = '/dest-adsrestapi';
                            var url_render = $.sap.getModulePath("com.yokogawa.zhpsdraftinvoicecreate") + "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=2";
                            $.ajax({
                                url: url_render,
                                type: "post",
                                contentType: "application/json",
                                data: jsondata3,
                                success: function (data, textStatus, jqXHR) {
                                    console.log(data);
                                    var decodedPdfContent = atob(data.fileContent);
                                    var byteArray = new Uint8Array(decodedPdfContent.length);
                                    for (var i = 0; i < decodedPdfContent.length; i++) {
                                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                                    }
                                    var blob = new Blob([byteArray.buffer], {
                                        type: 'application/pdf'
                                    });
                                    var _pdfurl = URL.createObjectURL(blob);
                                    if (!that1._PDFViewer) {
                                        that1._PDFViewer = new sap.m.PDFViewer({
                                            width: "auto",
                                            source: _pdfurl
                                        });
                                        jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                                    }
                                    that1._PDFViewer.open();
                                    that1.busyDialog.close();
                                    // BusyIndicator.hide();

                                },
                                error: function (data) {
                                    MessageBox.show("Error while printing pdf");
                                    that1.busyDialog.close();
                                }
                            });

                            // var urlToRead = '/ZAdobeService' + '?xmlData=' + encdata1;
                            // that1.getOwnerComponent().getModel("zcdsehbtc0001").read(urlToRead, {
                            //     urlParameters: {
                            //         "xmlData": encdata1,
                            //         "xdpTemplate": "HODraftDocumentForm/HODraft"
                            //     },
                            //     method: "GET",
                            //     success: function (data, response) {
                            //         console.log(data);
                            //         var decodedPdfContent = atob(data.results[0].pdfFile);
                            //         var byteArray = new Uint8Array(decodedPdfContent.length);
                            //         for (var i = 0; i < decodedPdfContent.length; i++) {
                            //             byteArray[i] = decodedPdfContent.charCodeAt(i);
                            //         }
                            //         var blob = new Blob([byteArray.buffer], {
                            //             type: 'application/pdf'
                            //         });
                            //         var _pdfurl = URL.createObjectURL(blob);
                            //         if (!that1._PDFViewer) {
                            //             that1._PDFViewer = new sap.m.PDFViewer({
                            //                 width: "auto",
                            //                 source: _pdfurl
                            //             });
                            //             jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
                            //         }
                            //         that1.busyDialog.close();
                            //         that1._PDFViewer.open();
                            //     }
                            // });
                        }
                    });

            },
            onAddResourceDialog: function () {
                var itemSolTeam = {
                    "YEARMONTH": "",
                    "EMPLOYEEID": "",
                    "NAME": "",
                    "GRADE": "",
                    "BELONGS": "",
                    "UNITPRICE": "111",
                    "HOURS": "",
                    "BILLINGAMOUNT": ""
                };

                this._oResourceModel = this.getView().getModel("oDraftInvoiceData").getData();
                this._oResourceModel.RESOURCES.results.push(itemSolTeam);
                this.getView().getModel("oDraftInvoiceData").refresh(true);
            },
            onAddResource: function () {
                if (!this._oResourceCreateDialogFragment) {
                    // load asynchronous XML fragment
                    this._oResourceCreateDialogFragment = sap.ui.xmlfragment("InvoiceResourceDialog",
                        "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.ResourceCreateDialog", this);
                    this.getView().addDependent(this._oResourceCreateDialogFragment);
                }
                // this._onInitializeSalesRateEditDialog(oModelData);
                this._onInitializeResourceDialog();
                this._oResourceCreateDialogFragment.open();
                // this.getOwnerComponent().getRouter().navTo("RouteSalesRateRegistration");
            },
            onAddExpense: function () {
                if (!this._oExpenseCreateDialogFragment) {
                    // load asynchronous XML fragment
                    this._oExpenseCreateDialogFragment = sap.ui.xmlfragment("InvoiceExpenseDialog",
                        "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.ExpenseCreateDialog", this);
                    this.getView().addDependent(this._oExpenseCreateDialogFragment);
                }
                this._onInitializeExpenseDialog();
                this._oExpenseCreateDialogFragment.open();
                // this.getOwnerComponent().getRouter().navTo("RouteSalesRateRegistration");
            },
            onAddMaterial: function () {
                if (!this._oMaterialCreateDialogFragment) {
                    // load asynchronous XML fragment
                    this._oMaterialCreateDialogFragment = sap.ui.xmlfragment("InvoiceMaterialDialog",
                        "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.MaterialCreateDialog", this);
                    this.getView().addDependent(this._oMaterialCreateDialogFragment);
                }
                this._onInitializeMaterialDialog;
                // this.getView().getModel("appView").setData("");
                this._oMaterialCreateDialogFragment.open();
                w
            },
            onChangeCalcTypeValueHelp: function () {
                var calcType = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCalcType").getSelectedKey();
                var Amount = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idAmount").getValue();

                if (calcType === "1") {
                    sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").setValue(Amount);
                } else if (calcType === "2") {
                    this.onChangeExtendValueHelp();
                } else if (calcType === "3") {
                    this.onChangeExtendValueHelp();
                } else if (calcType === "4") {
                    this.onChangeExtendValueHelp();
                }

            },
            onChangeHoursValueHelp: function () {
                var UnitPrice = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idUnitPrice").getValue();
                var Hours = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idHours").getValue();

                var amt = UnitPrice * Hours;
                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").setValue(amt);
            },
            onChangeQuantityDialog: function () {
                var UnitPrice = sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idUnitPrice").getValue();
                var Quantity = sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idQuantity").getValue();
                var amt = UnitPrice * Quantity;
                sap.ui.core.Fragment.byId("InvoiceMaterialDialog", "idBillingAmount").setValue(amt);
            },
            onChangeHoursValueHelp: function () {
                var UnitPrice = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idUnitPrice").getValue();
                var Hours = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idHours").getValue();

                var amt = UnitPrice * Hours;
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idBillingAmount").setValue(amt);
            },
            onAddResourceDialog: function () {
                if (sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idyearMonth").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idyearMonth").setValueState("Error");
                    return;
                }
                if (sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idEmpID").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idEmpID").setValueState("Error");
                    return;
                }
                if (sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idName").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idName").setValueState("Error");
                    return;
                }
                var yearMonth = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idyearMonth").getValue();
                var EmpID = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idEmpID").getValue();
                var Name = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idName").getValue();
                var Grade = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idGrade").getValue();
                var Belongs = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idBelongs").getValue();
                var UnitPrice = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idUnitPrice").getValue();
                var Hours = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idHours").getValue();
                var BillingAmount = sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idBillingAmount").getValue();
                if (BillingAmount) {
                    BillingAmount = parseInt(BillingAmount);
                }
                var itemResource = {
                    "YEARMONTH": yearMonth,
                    "EMPID": EmpID,
                    "EMPNAME": Name,
                    "GRADE": Grade,
                    "BELONGS": Belongs,
                    "UNITPRICE": UnitPrice,
                    "HOURS": Hours,
                    "BILLINGAMOUNT": BillingAmount
                };

                this._oResourceModel = this.getView().getModel("oDraftInvoiceData").getData();
                this._oResourceModel.RESOURCES.results.push(itemResource);
                this._oResourceCreateDialogFragment.close();
                this.calculateTotalBillingAmount();
                this.getView().getModel("oDraftInvoiceData").refresh(true);
            },
            onAddExpenseDialog: function () {
                if (sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCostElement").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCostElement").setValueState("Error");
                    return;
                }
                if (sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idNote").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idNote").setValueState("Error");
                    return;
                }
                if (sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idItemText").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idItemText").setValueState("Error");
                    return;
                }
                if (sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idAmount").getValue() === "") {
                    sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idAmount").setValueState("Error");
                    return;
                }
                var CostElement = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCostElement").getValue();
                var Note = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idNote").getValue();
                var ItemText = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idItemText").getValue();
                var Amount = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idAmount").getValue();
                var CalcType = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idCalcType").getSelectedKey();
                var Extended = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idExtended").getValue();
                var BillingAmount = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").getValue();
                if (BillingAmount) {
                    BillingAmount = parseInt(BillingAmount);
                }
                var itemExpense = {
                    "COSTELEMENT": CostElement,
                    "NOTE": Note,
                    "ITEMTEXT": ItemText,
                    "AMOUNT": Amount,
                    "CALCTYPE": CalcType,
                    "BILLINGAMOUNT": BillingAmount
                };

                this._oExpenseModel = this.getView().getModel("oDraftInvoiceData").getData();
                this._oExpenseModel.EXPENSE.results.push(itemExpense);
                this._oExpenseCreateDialogFragment.close();
                this.calculateTotalBillingAmount();
                this.getView().getModel("oDraftInvoiceData").refresh(true);
            },
            onAddMaterialDialog: function () {
                var oMaterialData = this.getView().getModel("appView").getData();
                var BillingAmount = oMaterialData.material.BILLINGAMOUNT;
                if (BillingAmount) {
                    BillingAmount = parseInt(BillingAmount);
                }
                var itemMaterial = {
                    "MATERIALDESC": oMaterialData.material.MATERIALDESC,
                    "UNITPRICE": oMaterialData.material.UNITPRICE,
                    "QUAN": oMaterialData.material.QUAN,
                    "BILLINGAMOUNT": BillingAmount
                };

                this._oMaterialModel = this.getView().getModel("oDraftInvoiceData").getData();
                this._oMaterialModel.MATERIAL.results.push(itemMaterial);
                this._oMaterialCreateDialogFragment.close();
                this.calculateTotalBillingAmount();
                this.getView().getModel("oDraftInvoiceData").refresh(true);
            },
            onCloseResourceDialog: function () {
                this._oResourceCreateDialogFragment.close();
            },
            onCloseExpenseDialog: function () {
                this._oExpenseCreateDialogFragment.close();
            },
            onCloseMaterialDialog: function () {
                this._oMaterialCreateDialogFragment.close();
            },
            onPrintSRVPDF: function () {
                wbsData = this.getView().getModel("oDraftInvoiceData").getData().EXPENSE.results[0];
                if (wbsData) {
                    wbsData = wbsData.ITEMTEXT;
                }
                else wbsData = "";
                var urlToRead = "/PDFdownload";
                var oFilter = [];
                var that = this;
                var aFilterIds = ["Pernr", "WBSElement", "Year_numc", "month_numc", "Cathours", "UNIT", "CatsAmount", "Currency", "Grade", "Belongs", "FirstName", "LastName"];
                var aFilterValues = ["", wbsData, "", "", 0, "", 0, "", "", "", "", "",];
                var aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                const [day, month, year] = this.dateFrom.split('-');
                const dateFrom = [year, month, day].join('-') + "T00:00:00";
                const [day1, month1, year1] = this.dateTo.split('-');
                const dateTo = [year1, month1, day1].join('-') + "T00:00:00";
                oFilter.push(new Filter({
                    filters: [
                        new Filter({
                            path: "projectId",
                            operator: FilterOperator.EQ,
                            value1: this.projectID
                        }),
                        new Filter({
                            path: "CompanyCode",
                            operator: FilterOperator.EQ,
                            value1: this.companyCode
                        }),
                        new Filter({
                            path: "WorkDate",
                            operator: FilterOperator.BT,
                            value1: dateFrom,
                            value2: dateTo
                        })
                    ],
                    and: true
                }));
                oFilter[0].aFilters = oFilter[0].aFilters.concat(aFilters);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel("ZSRVBHHR0001").read(urlToRead, {
                    filters: oFilter,
                    method: "GET",
                    success: function (oData, response) {
                        sap.ui.core.BusyIndicator.hide(0);
                        var decodedPdfContent = atob(oData.results[0].PDF);
                        var byteArray = new Uint8Array(decodedPdfContent.length);
                        for (var i = 0; i < decodedPdfContent.length; i++) {
                            byteArray[i] = decodedPdfContent.charCodeAt(i);
                        }
                        var blob = new Blob([byteArray.buffer], {
                            type: 'application/pdf'
                        });
                        var _pdfurl = URL.createObjectURL(blob);
                        var link = document.createElement('a');
                        link.href = _pdfurl;
                        link.download = data.DocNo + "_" + data.FisYear + "_" + data.CompanyCode + '.pdf';
                        link.dispatchEvent(new MouseEvent('click'));
                        text = res.results[0].MSGTX;
                        sap.m.MessageBox.show(text, {
                            icon: sap.m.MessageBox.Icon.SUCCESS,
                            title: "Success",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                    }.bind(this),
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide(0);
                        var msg = JSON.parse(error.responseText).error.message.value;
                        sap.m.MessageBox.show(msg,
                            sap.m.MessageBox.Icon.ERROR,
                            "ERROR"
                        );
                    }.bind(this)


                });
                // this.getOwnerComponent().getModel("ZSRVBHHR0001").read(urlToRead, {
                //     urlParameters: {
                //         "projectID": this.projectID,
                //         "CompanyCode": this.companyCode
                //     },
                //     method: "GET",
                //     success: function (data, response) {

                //     },
                //     error: function (error) {

                //         that.busyDialog.close();
                //         var msg = JSON.parse(error.responseText).error.message.value;
                //         sap.m.MessageBox.show(msg,
                //             sap.m.MessageBox.Icon.ERROR,
                //             "ERROR"
                //         );
                //     }
                // });
            },
            _createSearchFilterObject: function (aFilterIds, aFilterValues) {
                var aFilters = [], iCount;
                for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                    aFilters.push(new Filter(aFilterIds[iCount], sap.ui.model.FilterOperator.EQ, aFilterValues[iCount]));
                }
                return aFilters;
            },
        });
    });
