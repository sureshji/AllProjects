sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/m/MessageToast',
    "sap/m/Dialog",
    'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,MessageBox,MessageToast,Dialog,Filter,FilterOperator) {
        "use strict";

        return Controller.extend("com.yokogawa.zhpsdraftinvoicecreate.controller.DraftInvoiceCreate", {
            onInit: function () {

                var oInvoiceResourceData = new JSONModel();
			    var itemResource = [];
			    oInvoiceResourceData.setData(itemResource);
			    this.getView().setModel(oInvoiceResourceData, "oInvoiceResourceData");

                var oExpenseData = new JSONModel();
			    var itemExpense = [];
			    oExpenseData.setData(itemExpense);
			    this.getView().setModel(oExpenseData, "oExpenseData");

                var oMaterialData = new JSONModel();
			    var itemMaterial = [];
			    oMaterialData.setData(itemMaterial);
			    this.getView().setModel(oMaterialData, "oMaterialData");

                var oViewModel = new JSONModel({
                    hasRequired: true,
                    hasInputVisible: false,
                    hasTextVisible: true,
                    status: "Success",
                    totalValue:0.00,
                   
                    taxAmount:0,
                    hasHarmonyVisible: true,
                    invoiceID: "",
                    invoiceDate: null,
                    material: {
                        MATERIALDESC: null,
                        CURRENCY:"",
                        UNITPRICE: "",
                        QUAN: "",
                        UOM: "",
                        BILLINGAMOUNT: ""
                      }
                });
               
                this.getView().setModel(oViewModel, "appView");
    
                this.getOwnerComponent().getRouter().getRoute("RouteDraftInvoiceCreate").attachMatched(this._onObjectMatched, this);
                
                },
                _onObjectMatched: function (oEvent) {
                    this.busyDialog = new sap.m.BusyDialog({
                        title: "Loading Data",
                        text: "Retreiving Resource and Expense Data"
                    });
                    this.busyDialog.open();
                    this.companyCode = oEvent.getParameter("arguments").companyCode;
                    this.projectID = oEvent.getParameter("arguments").projectID;
                    this.dateFrom = oEvent.getParameter("arguments").dateFrom;
                    this.dateTo = oEvent.getParameter("arguments").dateTo;
                    
                    this.ProjectID = "E000026N00";
                    // this.getInvoiceData();
                    this.getResourceData();
                    this.getExpenseData();
                    this.getSalesRateTableData();
                 
                },
                // getInvoiceID: function () {
                //     var CurrentYear = new Date().getFullYear();
                //     var random = Math.floor(Math.random() * 90000) + 10000;
                //     this.InvoiceID = CurrentYear + "-" + random;
                //     this.getView().getModel("appView").setProperty("/invoiceID", this.InvoiceID);

                // },
                getSalesRateTableData: function () {
                    var urlToRead = "/ZTHBT0021";
                    var filter = new sap.ui.model.Filter("PROJECTID", "EQ", this.projectID);
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
                getResourceData: function () {
                    var urlToRead = "/CustTimesheets";
                    var projectID = "E000026N00";
                    var oFilter = [];
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
                    // var filter = new sap.ui.model.Filter("projectId", "EQ", "E000026N00");
                    // var that1 = this;
            
                    this.getOwnerComponent().getModel("ZSRVBHHR0001").read(urlToRead, {
                        filters: oFilter,
                        method: "GET",
                        success: function (oData, response) {
                            console.log(oData);
                            var oResourcesData = [];
                            var salesRatePromises = [];
                            for(var i=0; i<oData.results.length; i++) {
                                var oResourceData = {};
                                oResourceData.YEARMONTH = oData.results[i].Year_numc + "/" + oData.results[i].month_numc;
                                oResourceData.EMPID = oData.results[i].Pernr;
                                oResourceData.EMPNAME = oData.results[i].FirstName + oData.results[i].LastName;
                                oResourceData.GRADE = oData.results[i].Grade;
                                oResourceData.BELONGS = oData.results[i].Belongs;
                                oResourceData.CURR = oData.results[i].Curr;
                                oResourceData.UNITPRICE = oData.results[i].CatsAmount;
                                oResourceData.HOURS = oData.results[i].Cathours;

                                // var amt = parseInt(oData.results[i].CatsAmount) * parseInt(oData.results[i].Cathours); 
                                // oResourceData.BillingAmount = amt;

                                oResourcesData.push(oResourceData);
                                // salesRatePromises.push(this.getSalesRateData(oData.results[i].projectId,this));
                            }
                            salesRatePromises.push(this.getSalesRateData(projectID,this));
                            
                            Promise.all(salesRatePromises).then(function (values) {
                                
                                    for (var j = 0; j < oResourcesData.length; j++) {
                                        oResourcesData[j].UNITPRICE = values[0].results[0].UNITPRICE;
                                        oResourcesData[j].CURR = values[0].results[0].CURRENCY;
                                        var amt = parseInt(values[0].results[0].UNITPRICE) * parseInt(oResourcesData[j].HOURS); 
                                        oResourcesData[j].BILLINGAMOUNT = amt;
                                    }
                                
                                this.getView().getModel("oInvoiceResourceData").setProperty('/', oResourcesData);
						        this.getView().byId("idInvoiceResourceTable").selectAll();
                                this.onSelectionChange();
                                // new busy
                            }.bind(this));
                            // this.getView().getModel("oInvoiceResourceData").setProperty('/', oResourcesData);
						    // this.getView().byId("idInvoiceResourceTable").selectAll();
                        }.bind(this),
                        error: function (error) {
                            this.busyDialog.close();
                        }.bind(this)
    
    
                    });
    
                },
                getExpenseData: function () {
                    // this.busyDialog = new sap.m.BusyDialog({
                    //     title: "Loading Data",
                    //     text: "Retreiving Invoice"
                    // });
                    // this.busyDialog.open();
                    var urlToRead = "/AccountingDoc";
                    // var filter = new sap.ui.model.Filter("AccDocNo", "EQ", "100000051");
                    var oFilter = [];
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
                            })
                        ],
                        and: true
                    }));
                    this.getOwnerComponent().getModel("ZSRVBHHR0001").read(urlToRead, {
                        filters: oFilter,
                        method: "GET",
                        success: function (oData, response) {
                            console.log(oData);
                            var oExpensesData = [];
                            for(var i=0; i<oData.results.length; i++) {
                                var oExpenseData = {};
                                oExpenseData.COSTELEMENT = oData.results[i].AccDocNo;
                                oExpenseData.ITEMTEXT = oData.results[i].ItemTxt;
                                oExpenseData.AMOUNT = oData.results[i].Amount;
                                oExpenseData.BILLINGAMOUNT = 0;
                                oExpenseData.MARKUP = 0;
                                oExpenseData.CURRENCY= oData.results[i].Currency;
                                
                                oExpensesData.push(oExpenseData);
                            }
                            
                            this.getView().getModel("oExpenseData").setProperty('/', oExpensesData);
                            this.getView().byId("idExpense").selectAll();
                            this.onSelectionChange();
                            this.busyDialog.close();
                           
                        }.bind(this),
                        error: function (error) {
                            this.busyDialog.close();
                        }.bind(this)
    
    
                    });
    
                },
            getSalesRateData: function (ProjectID,that1) {

                return new Promise(function (resolve, reject) {
                    var urlToRead = "/ZTHBT0021";
                    var filter = new sap.ui.model.Filter("PROJECTID", "EQ", ProjectID);
                    that1.getOwnerComponent().getModel().read(urlToRead, {
                        filters: [filter],
                        method: "GET",
                        success: function (data, textStatus, jqXHR) {
                            resolve(data);
                        },
                        error: function (oError) {
                            reject(oError);
                        }
                    });

                });
            },
                getInvoiceData: function () {
                    // this.busyDialog = new sap.m.BusyDialog({
                    //     title: "Loading Data",
                    //     text: "Retreiving Invoice"
                    // });
                    // this.busyDialog.open();
                    var urlToRead = "/ZTHBT0022('12345')";
                    var filter = new sap.ui.model.Filter("InvoiceID", "EQ", "12345");
                    var data1;
                    this.getOwnerComponent().getModel().read(urlToRead, {
                        urlParameters: {
                            "$expand": "Resources,Expense,Material"
                        },
                        // filters: [filter],
                        method: "GET",
                        success: function (oData, response) {
                            console.log(oData);
                            var oDraftInvoiceData = new JSONModel([]);
                            oDraftInvoiceData.setData(oData);
                            this.getView().setModel(oDraftInvoiceData, "oDraftInvoiceData");
                            // this.getView().getModel("oDraftInvoiceData").setProperty('/', oData.results);
                            //this.byId('idSolTeamTable').setModel(this.getView().getModel("oDraftInvoiceData"));
                        }.bind(this),
                        error: function (error) {
    
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
            onChangeCalcType: function (oEvent) {
                
                var oContext = oEvent.getSource().mBindingInfos.selectedKey.binding.oContext.sPath;
                var aSelectedCalcType = oEvent.getParameters().selectedItem.mProperties.key;
                var oExpenseData = this.getView().getModel("oExpenseData").getProperty(oContext);
                if (aSelectedCalcType === "0") {
                    oExpenseData.BILLINGAMOUNT = parseFloat(oExpenseData.AMOUNT);
                    oExpenseData.MARKUP ="";
                }
                else if (aSelectedCalcType === "1") {
                    oExpenseData.BILLINGAMOUNT = parseFloat(oExpenseData.AMOUNT);
                    oExpenseData.MARKUP ="";

                } else if (aSelectedCalcType === "2") {

                } else if (aSelectedCalcType === "3") {
                    
                } else if (aSelectedCalcType === "4") {
                    
                }

                // this.calculateTotalAmount();
                this.onSelectionChange();
                // var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                // var oResourceData = this.getView().getModel("oInvoiceResourceData").getData();
                // for(var i=0; i < oResourceData.length; i++) {
                //     totalResourceBiling = totalResourceBiling + oResourceData[i].BillingAmount;
                // }
                // var oExpenseData = this.getView().getModel("oExpenseData").getData();
                // for(var i=0; i < oExpenseData.length; i++) {
                //     totalExpenseBiling = totalExpenseBiling + oExpenseData[i].BillingAmount;
                // }
                // var oMaterialData = this.getView().getModel("oMaterialData").getData();
                // for(var i=0; i < oMaterialData.length; i++) {
                //     totalMaterialBiling = totalMaterialBiling + oMaterialData[i].BillingAmount;
                // }
                // var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                // this.getView().getModel("appView").setProperty("/totalValue", totalValue);

                this.getView().getModel("oExpenseData").refresh();
            },
            calculateTotalAmount: function () {
                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                var oResourceData = this.getView().getModel("oInvoiceResourceData").getData();
                for(var i=0; i < oResourceData.length; i++) {
                    totalResourceBiling = totalResourceBiling + oResourceData[i].BILLINGAMOUNT;
                }
                var oExpenseData = this.getView().getModel("oExpenseData").getData();
                for(var i=0; i < oExpenseData.length; i++) {
                    totalExpenseBiling = totalExpenseBiling + oExpenseData[i].BILLINGAMOUNT;
                }
                var oMaterialData = this.getView().getModel("oMaterialData").getData();
                for(var i=0; i < oMaterialData.length; i++) {
                    totalMaterialBiling = totalMaterialBiling + oMaterialData[i].BILLINGAMOUNT;
                }
                var totalValue = totalResourceBiling + parseInt(totalExpenseBiling) + totalMaterialBiling;
                this.getView().getModel("appView").setProperty("/totalValue", totalValue);
                //this.getView().getModel("appView").setProperty("/totalValueReference",totalValue)
            },
            onChangeHours: function(oEvent) {
                var oContext = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var oDraftInvoiceData = this.getView().getModel("oInvoiceResourceData").getProperty(oContext);
                var hours = oEvent.getSource().getValue();
                // var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                var oNewValue = oDraftInvoiceData.UNITPRICE*hours;
                    oDraftInvoiceData.BILLINGAMOUNT = oNewValue;

                    // this.calculateTotalAmount();
                    this.onSelectionChange();
                // this.getView().getModel().setProperty(sPath + "/Hours", oResources.Hours);
                // var oResourceData = this.getView().getModel("oInvoiceResourceData").getData();
                // for(var i=0; i < oResourceData.results.length; i++) {
                //     totalResourceBiling = totalResourceBiling + oData.results[i].BillingAmount;
                // }
                // var oExpenseData = this.getView().getModel("oExpenseData").getData();
                // for(var i=0; i < oExpenseData.results.length; i++) {
                //     totalExpenseBiling = totalExpenseBiling + oData.results[i].BillingAmount;
                // }
                // var oMaterialData = this.getView().getModel("oMaterialData").getData();
                // for(var i=0; i < oMaterialData.results.length; i++) {
                //     totalMaterialBiling = totalMaterialBiling + oData.results[i].BillingAmount;
                // }
                // var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                // this.getView().getModel("appView").setProperty("/totalValue", totalValue);
            
                this.getView().getModel("oDraftInvoiceData").refresh();
            },
            // onChangeTaxAmount:function(oEvent){
            //    debugger;
            //    var oModel = this.getView().getModel("appView");
            //    var taxPercentage = oModel.getProperty("/taxAmount");
            //    var oAmount = oModel.getProperty("/totalValue")

            //      var oPercentValue = ((oAmount*taxPercentage) / 100).toFixed(2);
            //         let finalValue = parseFloat(oAmount) + parseFloat(oPercentValue);
            //         oModel.setProperty("/totalValueReference",finalValue);
            //        // oExpenseData.MARKUP = parseFloat(value);
            // },
            onChangeAmount: function (oEvent) {
              
                var oContext = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var oExpenseData = this.getView().getModel("oExpenseData").getProperty(oContext);
                var value = oEvent.getSource().getValue();
                var CalcType = oExpenseData.CALCTYPE;
                var oAmount = oExpenseData.AMOUNT;
           //     var oMarkup = oAmount;

                // var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                if (CalcType === "1") {
                    // oDraftInvoiceData.BillingAmount = oDraftInvoiceData.Amount;
                    oExpenseData.MARKUP = parseFloat(value);
                } else if (CalcType === "2") {
                    
                    var oPercentValue = ((oAmount*value) / 100).toFixed(2);
                    oExpenseData.BILLINGAMOUNT = parseFloat(oAmount) + parseFloat(oPercentValue);
                    oExpenseData.MARKUP = parseFloat(value);
                } else if (CalcType === "3") {

                    oExpenseData.BILLINGAMOUNT = parseFloat(oAmount) + parseFloat(value);
                    oExpenseData.MARKUP = parseFloat(value);
                } else if (CalcType === "4") {
                    oExpenseData.BILLINGAMOUNT = parseFloat(value);
                    oExpenseData.MARKUP = parseFloat(value);
                }

                // var oResourceData = this.getView().getModel("oInvoiceResourceData").getData();
                // for(var i=0; i < oResourceData.results.length; i++) {
                //     totalResourceBiling = totalResourceBiling + oData.results[i].BillingAmount;
                // }
                // var oExpenseData = this.getView().getModel("oExpenseData").getData();
                // for(var i=0; i < oExpenseData.results.length; i++) {
                //     totalExpenseBiling = totalExpenseBiling + oData.results[i].BillingAmount;
                // }
                // var oMaterialData = this.getView().getModel("oMaterialData").getData();
                // for(var i=0; i < oMaterialData.results.length; i++) {
                //     totalMaterialBiling = totalMaterialBiling + oData.results[i].BillingAmount;
                // }
                // var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                // this.getView().getModel("appView").setProperty("/totalValue", totalValue);
                // this.calculateTotalAmount();
                this.onSelectionChange();
                this.getView().getModel("oExpenseData").refresh();
            },
            onChangeQuantity: function(oEvent) {
                var oContext = oEvent.getSource().getParent().getParent().getBindingContextPath();
                var oDraftInvoiceData = this.getView().getModel("oMaterialData").getProperty(oContext);
                var hours = oEvent.getSource().getValue();
                // var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;
                var oNewValue = oDraftInvoiceData.UNITPRICE*hours;
                    oDraftInvoiceData.BILLINGAMOUNT = oNewValue;

                    // this.calculateTotalAmount();
                    this.onSelectionChange();
                // this.getView().getModel().setProperty(sPath + "/Hours", oResources.Hours);
                // var oResourceData = this.getView().getModel("oInvoiceResourceData").getData();
                // for(var i=0; i < oResourceData.results.length; i++) {
                //     totalResourceBiling = totalResourceBiling + oData.results[i].BillingAmount;
                // }
                // var oExpenseData = this.getView().getModel("oExpenseData").getData();
                // for(var i=0; i < oExpenseData.results.length; i++) {
                //     totalExpenseBiling = totalExpenseBiling + oData.results[i].BillingAmount;
                // }
                // var oMaterialData = this.getView().getModel("oMaterialData").getData();
                // for(var i=0; i < oMaterialData.results.length; i++) {
                //     totalMaterialBiling = totalMaterialBiling + oData.results[i].BillingAmount;
                // }
                // var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                // this.getView().getModel("appView").setProperty("/totalValue", totalValue);
            
                this.getView().getModel("oDraftInvoiceData").refresh();
            },
            onPrintInvoice1: function () {
                this.busyDialog = new sap.m.BusyDialog({
                    title: "Loading Data",
                    text: "Retreiving PDF"
                });
                this.busyDialog.open();
                var urlToRead = '/ZTHBT0022';
                var filter = new sap.ui.model.Filter("InvoiceID", "EQ", "12345");
                var that1 = this;
                //?$expand=to_Components
                var data1;
                this.getOwnerComponent()
                    .getModel()
                    .read(urlToRead, {
                        urlParameters: {
                            "$expand": "Resources,Expense,Material"
                        },
                        filters: [filter],
                        method: "GET",
                        success: function (oData, response) {
                            console.log(oData);
                            data1 = '<?xml version="1.0" encoding="utf-8"?>' +
                                '<data>' +
                                '<INVOICENO>' + oData.results[0].InvoiceID + '</INVOICENO>' +
                                '<INVOICEDATE>' + oData.results[0].InvDate + '</INVOICEDATE>' +
                                '<RESOURCE>';

                            for (let index in oData.results[0].Resources.results) {
                                let oResources = oData.results[0].Resources.results[index];
                                data1 = data1 + '<DATA>' +
                                    '<D_INVOICE>' + oResources.InvoiceID + '</D_INVOICE>' +
                                    '<YEARMONTH>' + oResources.YearMonth + '</YEARMONTH>' +
                                    '<EMPID>' + oResources.EmpID + '</EMPID>' +
                                    '<EMPNAME>' + oResources.EmpName + '</EMPNAME>' +
                                    '<GRADE>' + oResources.Grade + '</GRADE>' +
                                    '<BELONGS>' + oResources.Belongs + '</BELONGS>' +
                                    '<CURR>' + oResources.Curr + '</CURR>' +
                                    '<UNITPRICE>' + oResources.UnitPrice + '</UNITPRICE>' +
                                    '<HOURS>' + oResources.Hours + '</HOURS>' +
                                    '<BILLINGAMOUNT>' + oResources.BillingAmount + '</BILLINGAMOUNT>' +
                                    `</DATA>`;
                            }
                            data1 = data1 + '</RESOURCE>' + '<EXPENSE>';
                            for (let index in oData.results[0].Expense.results) {
                                let oExpense = oData.results[0].Expense.results[index];
                                data1 = data1 + '<DATA>' +
                                    '<NOTE>' + oExpense.Note + '</NOTE>' +
                                    '<BILLINGAMOUNT>' + oExpense.BillingAmount + '</BILLINGAMOUNT>' +
                                    `</DATA>`;
                            }
                            data1 = data1 + '</EXPENSE>' + '<MATERIAL>';
                            for (let index in oData.results[0].Material.results) {
                                let oExpense = oData.results[0].Material.results[index];
                                data1 = data1 + '<DATA>' +
                                    '<DESCRIPTION>' + oExpense.MaterialDesc + '</DESCRIPTION>' +
                                    '<UNITPRICE>' + oExpense.UnitPrice + '</UNITPRICE>' +
                                    '<QUANTITY>' + oExpense.Quan + '</QUANTITY>' +
                                    '<BILLINGAMOUNT>' + oExpense.BillingAmount + '</BILLINGAMOUNT>' +
                                    `</DATA>`;
                            }
                            data1 = data1 + '</MATERIAL>' + '</data>';
                            var encdata1 = btoa(data1);

                            var urlToRead = '/ZAdobeService' + '?xmlData=' + encdata1;
                            that1.getOwnerComponent().getModel("zcdsehbtc0001").read(urlToRead, {
                                urlParameters: {
                                    "xmlData": encdata1,
                                    "xdpTemplate": "HODraftDocumentForm/HODraft"
                                },
                                method: "GET",
                                success: function (data, response) {
                                    console.log(data);
                                    var decodedPdfContent = atob(data.results[0].pdfFile);
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
                                    that1.busyDialog.close();
                                    that1._PDFViewer.open();
                                }
                            });
                        }
                    });

            },
            onAddResource: function () {
                if (!this._oResourceCreateDialogFragment) {
                    // load asynchronous XML fragment
                    this._oResourceCreateDialogFragment = sap.ui.xmlfragment("InvoiceResourceDialog",
                        "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.ResourceCreateDialog", this);
                    this.getView().addDependent(this._oResourceCreateDialogFragment);
                }
                this._onInitializeResourceDialog();
                // this._onInitializeSalesRateEditDialog(oModelData);
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
            _onInitializeResourceDialog: function () {
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idyearMonth").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idEmpID").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idName").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idHours").setValue("");
                sap.ui.core.Fragment.byId("InvoiceResourceDialog", "idBillingAmount").setValue("");
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
                
                this._oResourceModel = this.getView().getModel("oInvoiceResourceData").getData();
                this._oResourceModel.push(itemResource);
                this._oResourceCreateDialogFragment.close();
                this.onSelectionChange();
                this.getView().getModel("oInvoiceResourceData").refresh(true);
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
                // var BillingAmount = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBMarkup").getValue();
                var BillingAmount = sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").getValue();

                var itemExpense = {
                    "COSTELEMENT": CostElement,
                    "NOTE": Note,
                    "ITEMTEXT": ItemText,
                    "AMOUNT": Amount,
                    "CALCTYPE": CalcType,
                    "MARKUP": Markup,
                    "BILLINGAMOUNT": BillingAmount
                };

                this._oExpenseModel = this.getView().getModel("oExpenseData").getData();
                this._oExpenseModel.push(itemExpense);
                this._oExpenseCreateDialogFragment.close();
                this.onSelectionChange();
                this.getView().getModel("oExpenseData").refresh(true);
            },
            onAddMaterialDialog: function () {
                var oMaterialData = this.getView().getModel("appView").getData();
                var itemMaterial = {
                    "MATERIALDESC": oMaterialData.material.MATERIALDESC,
                    "UNITPRICE": oMaterialData.material.UNITPRICE,
                    "CURRENCY": oMaterialData.material.CURRENCY,
                    "UOM": oMaterialData.material.UOM,
                    "QUAN": oMaterialData.material.QUAN,
                    "BILLINGAMOUNT": oMaterialData.material.BILLINGAMOUNT
                };

                this._oMaterialModel = this.getView().getModel("oMaterialData").getData();
                this._oMaterialModel.push(itemMaterial);
                this._oMaterialCreateDialogFragment.close();
                this.onSelectionChange();
                this.getView().getModel("oMaterialData").refresh(true);
            },
            totalFormatter: function (results) {
                return results.length;
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
            saveMasterInvoice: function () {
                if (!this._validateBeforeSave()) {
                    var oMessage = "Please fill manadatory parameters";
                    this.dialogMessage("Error", oMessage)
                    return;
                }
                var oInvdate = this.getView().byId("_IDGenText1").getValue();
                if (!oInvdate) {
                    this.getView().byId("_IDGenText1").setValueState("Error");
                    var oMessage = "Please fill manadatory parameters";
                    this.dialogMessage("Error", oMessage)
                    return;
                }
                this.busyDialog = new sap.m.BusyDialog();
				this.busyDialog.open();
                var oDataModel = this.getView().getModel();
                var invoiceDate = this.getView().getModel("appView").getProperty("/invoiceDate")

                    oDataModel.createEntry("/ZTHBT0022", {
                        properties: {
                            INVDATE: invoiceDate,
                            TOTALAMOUNT: String(this.getView().getModel("appView").getProperty("/totalValue")),
                            TAXAMOUNT: parseInt(this.getView().getModel("appView").getProperty("/taxAmount")),
                            COMPANYCODE: this.companyCode,
                            PROJECTID: this.projectID,
                        }
                    });

                var that1 = this;
                if (oDataModel.hasPendingChanges()) {
                    oDataModel.submitChanges({
                        success: function (oResponse, oData) {
                            var invoiceID = oResponse.__batchResponses[0].__changeResponses[0].data.INVOICEID;
                            this.onSaveChanges(invoiceID);
                        }.bind(this),
                        error: function () {
                            MessageToast.show("Error while Saving Invoice!");
                            this.busyDialog.close();
                        }.bind(this),
                    });
                }
            },
            onSaveChanges: function (InvoiceID) {
                this.INVOICEID = InvoiceID;
                var oTable = this.getView().byId("idInvoiceResourceTable");
                var aSelectedItems = oTable.getSelectedItems();
                var oModel = this.getView().getModel();
                var oDataModel = this.getView().getModel();
                // var invoiceDate = this.getView().getModel("appView").getProperty("/invoiceDate")

                //     oDataModel.createEntry("/ZTHBT0022", {
                //         properties: {
                //             InvoiceID: this.InvoiceID,
                //             InvDate: invoiceDate,
                //             TotalAmount: this.getView().getModel("appView").getProperty("/totalValue"),
                //             TaxAmount: this.getView().getModel("appView").getProperty("/taxAmount")
                //         }
                //     });
                for (var i = aSelectedItems.length - 1; i >= 0; i--) { //start with highest index first 
                    var oItemContextPath = aSelectedItems[i].getBindingContext("oInvoiceResourceData").getPath();
                    var aPathParts = oItemContextPath.split("/");
                    var iIndex = aPathParts[aPathParts.length - 1]; //Index to delete into our array of objects

                    this.oInvoiceResourceData = this.getView().getModel("oInvoiceResourceData").getData();

                    // var oDataModel = this.getView().getModel();
                    
                    oDataModel.createEntry("/ZTHBT0023", {
                        properties: {
                            INVOICEID_INVOICEID: this.INVOICEID,
                            YEARMONTH: this.oInvoiceResourceData[iIndex].YEARMONTH,
                            EMPID: this.oInvoiceResourceData[iIndex].EMPID,
                            EMPNAME: this.oInvoiceResourceData[iIndex].EMPNAME,
                            GRADE: this.oInvoiceResourceData[iIndex].GRADE,
                            BELONGS: this.oInvoiceResourceData[iIndex].BELONGS,
                            UNITPRICE: this.oInvoiceResourceData[iIndex].UNITPRICE,
                            HOURS: this.oInvoiceResourceData[iIndex].HOURS,
                            // CURRENCY: this.oInvoiceResourceData[iIndex].CURR,
                            // CURR: this.oInvoiceResourceData[iIndex].CURRENCY,
                            // CURRENCY: this.oInvoiceResourceData[iIndex].CURRENCY,
                            CURR: this.oInvoiceResourceData[iIndex].CURR,
                            BILLINGAMOUNT: this.oInvoiceResourceData[iIndex].BILLINGAMOUNT
                        }
                    });
                }

                var oTableExpense = this.getView().byId("idExpense");
                var aSelectedItemsExpense = oTableExpense.getSelectedItems();
                // var oModel = this.getView().getModel();
                for (var i = aSelectedItemsExpense.length - 1; i >= 0; i--) { //start with highest index first 
                    var oItemContextPath = aSelectedItemsExpense[i].getBindingContext("oExpenseData").getPath();
                    var aPathParts = oItemContextPath.split("/");
                    var iIndex = aPathParts[aPathParts.length - 1]; //Index to delete into our array of objects

                    this.oExpenseData = this.getView().getModel("oExpenseData").getData();

                    // var oDataModel = this.getView().getModel();
                    
                    oDataModel.createEntry("/ZTHBT0024", {
                        properties: {
                            INVOICEID_INVOICEID: this.INVOICEID,
                            COSTELEMENT: this.oExpenseData[iIndex].COSTELEMENT,
                            NOTE: this.oExpenseData[iIndex].NOTE,
                            ITEMTEXT: this.oExpenseData[iIndex].ITEMTEXT,
                            AMOUNT: this.oExpenseData[iIndex].AMOUNT,
                            CALCTYPE: this.oExpenseData[iIndex].CALCTYPE,
                            CURRENCY: this.oExpenseData[iIndex].CURRENCY,
                            MARKUP: this.oExpenseData[iIndex].MARKUP,
                            BILLINGAMOUNT: this.oExpenseData[iIndex].BILLINGAMOUNT
                        }
                    });
                }

                //Material
                this.oMaterialData = this.getView().getModel("oMaterialData").getData();
        
                for(var i=0; i < this.oMaterialData.length; i++ ) {
                    oDataModel.createEntry("/ZTHBT0025", {
                        properties: {
                            INVOICEID_INVOICEID: this.INVOICEID,
                            MATERIALDESC: this.oMaterialData[iIndex].MATERIALDESC,
                            CURRENCY: this.oMaterialData[iIndex].CURRENCY,
                            UNITPRICE: this.oMaterialData[iIndex].UNITPRICE,
                            QUAN: this.oMaterialData[iIndex].QUAN,
                            UOM: this.oMaterialData[iIndex].UOM,
                            BILLINGAMOUNT: this.oMaterialData[iIndex].BILLINGAMOUNT
                        }
                    });
                }

                var that1 = this;
                if (oDataModel.hasPendingChanges()) {
                    oDataModel.submitChanges({
                        success: function () {
                            // this.getView().byId("idReSubmit").setVisible(false);
                            // this.getView().byId("idSubmitApproval").setVisible(false);
                            // this.getView().byId("idReject").setVisible(false);
                            // this.busyDialog.close();    
                            // var message = "Invoice Create Successfully ID:" + that1.InvoiceID;
                            // this.oMessageDialog = new Dialog({
                            //     type: 'Message',
                            //     title: 'Success',
                            //     state: 'Success',
                            //     content: new sap.m.Text({ text: message }),
                            //     beginButton: new sap.m.Button({
                            //         type: sap.m.ButtonType.Emphasized,
                            //         text: "OK",
                            //         press: function () {
                            //             this.oMessageDialog.close();
                            //             that1.getOwnerComponent().getRouter().navTo("RouteDraftInvoiceDisplay", {
                            //                             sPath: "ZTHBT0022('" + that1.InvoiceID + "')"                     
                            //                         })
                            //         }.bind(this)
                            //     })
                            // });
                            // this.dialogMessage("Error", oMessage) ;
                            this.getView().getModel("appView").setProperty("/hasInputVisible", true);
                            this.getView().getModel("appView").setProperty("/hasTextVisible", false);
                            this.busyDialog.close();
                            MessageToast.show("Invoice Create Successfully ID:" + that1.INVOICEID, {

                                onClose: function () {
                                    that1.getOwnerComponent().getRouter().navTo("RouteDraftInvoiceDisplay", {
                                        sPath: "ZTHBT0022('" + that1.INVOICEID + "')",
                                        companyCode: that1.companyCode,
                                        projectID: that1.projectID,
                                        dateFrom: that1.dateFrom,
                                        dateTo: that1.dateTo    
                                                            
                                    })
                                    
                                    
                                }
                            });
                        }.bind(this),
                        error: function () {
                            this.busyDialog.close();  
                            MessageToast.show("Error while updating!");
                        }.bind(this),
                    });
                }

            },
            onSelectionChange: function(oEvent) {
                var oTable = this.getView().byId("idInvoiceResourceTable");
                var aSelectedItems = oTable.getSelectedItems();

                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;

                for (var i = aSelectedItems.length - 1; i >= 0; i--) { //start with highest index first 
                    var oItemContextPath = aSelectedItems[i].getBindingContext("oInvoiceResourceData").getPath();
                    var aPathParts = oItemContextPath.split("/");
                    var iIndex = aPathParts[aPathParts.length - 1]; //Index to delete into our array of objects

                    this.oInvoiceResourceData = this.getView().getModel("oInvoiceResourceData").getData();
                    totalResourceBiling = totalResourceBiling + parseFloat(this.oInvoiceResourceData[iIndex].BILLINGAMOUNT);

                }

                var oTableExpense = this.getView().byId("idExpense");
                var aSelectedItemsExpense = oTableExpense.getSelectedItems();
                // var oModel = this.getView().getModel();
                for (var i = aSelectedItemsExpense.length - 1; i >= 0; i--) { //start with highest index first 
                    var oItemContextPath = aSelectedItemsExpense[i].getBindingContext("oExpenseData").getPath();
                    var aPathParts = oItemContextPath.split("/");
                    var iIndex = aPathParts[aPathParts.length - 1]; //Index to delete into our array of objects

                    this.oExpenseData = this.getView().getModel("oExpenseData").getData();

                    totalExpenseBiling = totalExpenseBiling + parseFloat(this.oExpenseData[iIndex].BILLINGAMOUNT);

                }

                //Material
                this.oMaterialData = this.getView().getModel("oMaterialData").getData();

                for(var i=0; i < this.oMaterialData.length; i++ ) {
                    totalMaterialBiling = totalMaterialBiling + parseFloat(this.oMaterialData[i].BILLINGAMOUNT);
                }

                var totalValue = totalResourceBiling + parseInt(totalExpenseBiling) + totalMaterialBiling;
                this.getView().getModel("appView").setProperty("/totalValue", totalValue);
               // this.getView().getModel("appView").setProperty("/totalValueReference",totalValue)

              },
              _validateBeforeSave: function () {

                var aFinalcontrols = [];
                var aControls = this.getView().getControlsByFieldGroupId("fgUser");
                aControls.forEach(function (oControl) {
                    var value,
                        sElementName = oControl.getMetadata().getElementName();
                    if (oControl.getProperty("fieldGroupIds")[0] === "fgUser") {
                        aFinalcontrols.push(oControl);
                        oControl.setValueState("Error");
                        
    
                        if (sElementName.indexOf(".Input") !== -1) {
                            value = oControl.getValue();
                            if (value !== "") {
                                //do validation
                                oControl.setValueState("None");
                            }
                        }
                        
    
                    }
                });
                var bValidated = aFinalcontrols.every(function (oControl) {
                    return (oControl.getValueState() === "None");
    
                });
    
                return (bValidated);
            },
            dialogMessage: function (title, message) {
                
                this.oMessageDialog = new Dialog({
                    type: 'Message',
                    title: title,
                    state: 'Error',
                    content: new sap.m.Text({ text: message }),
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "OK",
                        press: function () {
                            this.oMessageDialog.close();
                        }.bind(this)
                    })
                });
            

            this.oMessageDialog.open();
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
                    
                    var oPercentValue = ((oAmount*value) / 100).toFixed(2);
                    amt = oAmount + parseInt(oPercentValue);
                } else if (CalcType === "3") {

                    amt = oAmount + parseInt(value);
                } else if (CalcType === "4") {
                    amt = parseInt(value);
                }

                sap.ui.core.Fragment.byId("InvoiceExpenseDialog", "idBillingAmount").setValue(amt);

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
            calculateTotalBillingAmount: function () {
                var totalResourceBiling = 0, totalExpenseBiling = 0, totalMaterialBiling = 0;

                // this.getView().getModel().setProperty(sPath + "/Hours", oResources.Hours);
                var oData = this.getView().getModel("oDraftInvoiceData").getData();
                for(var i=0; i < oData.RESOURCES.results.length; i++) {
                    totalResourceBiling = totalResourceBiling + oData.RESOURCES.results[i].BILLINGAMOUNT;
                }
                for(var i=0; i < oData.EXPENSE.results.length; i++) {
                    totalExpenseBiling = totalExpenseBiling + oData.EXPENSE.results[i].BILLINGAMOUNT;
                }
                for(var i=0; i < oData.MATERIAL.results.length; i++) {
                    totalMaterialBiling = totalMaterialBiling + oData.MATERIAL.results[i].BILLINGAMOUNT;
                }
                var totalValue = totalResourceBiling + totalExpenseBiling + totalMaterialBiling;
                oData.TOTALAMOUNT = totalValue;
            
                this.getView().getModel("oDraftInvoiceData").refresh();
            },
        });
    });
