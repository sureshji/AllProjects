sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox",
    "sap/m/MultiComboBox",
    "sap/m/Input",
    'sap/ui/core/Fragment',
    "sap/m/PDFViewer",
    "sap/base/security/URLWhitelist",
    "sap/m/Select",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    'sap/ui/model/FilterOperator',
], function (Filter, SmartFilterBar, ComboBox, MultiComboBox, Input, Fragment, PDFViewer, URLWhitelist, Select, MessageToast, MessageBox, FilterOperator) {
    "use strict";
    return {
        onInit: function () {
            console.log('test');
            this.uiModel = this.getOwnerComponent().getModel("ui");
            this.uiModel.setData({
                listReportActionBtnEditMode: false,
                displayPreview: false,
                displayPrint: false,
                outputOptionSelected:0,
                printerOptionSelected:0,
                search: {
                    Process_flag: "PartsRequest12",
                    issue_flag: "Y2",
                    Kanban_type: "",
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
            
            this.getPrintQueues();
        
            // if(this.byId("GridTable").getColumns()[0].getLabel().getText() === 'Traffic Light'){
            //     var template = new sap.ui.core.Icon({
            //         src:"sap-icon://circle-task-2",
            //         color:"{= ${color} === '' ? '#1d2d3e' : '#bb0000'}"
            //     });
            //     this.byId("GridTable").getColumns()[0].setTemplate(template)
            // }
        },
        _LanguageMapper: function () {
            var sLoginLangu = sap.ui.getCore().getConfiguration().getLanguage();
            console.log(sLoginLangu);
            switch (sLoginLangu) {
                case 'en':
                    return 'E';
                case 'zh-Hans':
                    return '1';
                case 'zh-CN':
                    return '1';
                case 'pt-PT':
                    return 'P';
                case 'ja-JP':
                    return 'J';
                case 'ru-RU':
                    return 'R';
                case 'ko-KR':
                    return '3';
                default:
                    return 'E';
            }
        },
        _ConvertLanguageKeyToISO: function(languageKey){
            switch (languageKey) {
                case 'E':
                    return 'EN'
                case '1':
                    return 'ZH'
                case 'P':
                    return 'PT'
                case 'J':
                    return 'JA'
                case 'R':
                    return 'RU'
                case '3':
                    return 'KO'
                default:
                    return 'EN';
            }
        },
        getCustomAppStateDataExtension: function (oCustomData) {
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            if (oCustomData) {
                var oCustomField1 = this.oView.byId("TargetOutput");
                if (oCustomField1) {
                    oCustomData.Issue_Type = oCustomField1.getSelectedKey();
                }
                var oCustomField2 = this.oView.byId("Issue_Type");
                if (oCustomField2) {
                    oCustomData.Issue_Type = oCustomField2.getSelectedKey();
                }
            }
        },
        onClose: function () {
            this._oDialogOutputSelection.then(function (oDialog) {
                oDialog.close();
            });
        },
        onInitSmartFilterBarExtension: function () {
            var oCustomField1 = this.oView.byId("TargetOutput");
            if (oCustomField1) {
                oCustomField1.setSelectedKey("F");
            }
            var oCustomField2 = this.oView.byId("Issue_Type");
            if (oCustomField2) {
                oCustomField2.setSelectedKey("F");
            }
//Putting Default Language in the 
            const languageKey = this._LanguageMapper();
            const languageCode = this._ConvertLanguageKeyToISO(languageKey);
            const oSMartFilter = this.getView().byId('listReportFilter');
            if(oSMartFilter) {
                var oFilterData = oSMartFilter.getFilterData();
                if(!oFilterData){
                    oFilterData = {};
                }
                oFilterData.Lang =  languageCode;
                oSMartFilter.setFilterData(oFilterData);
            }
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                if (oCustomData.TargetOutput) {
                    var oComboBox = this.oView.byId("TargetOutput");
                    oComboBox.setSelectedKey(
                        oCustomData.TargetOutput
                    );
                }
                if (oCustomData.Issue_Type) {
                    var oComboBox = this.oView.byId("Issue_Type");
                    oComboBox.setSelectedKey(
                        oCustomData.Issue_Type
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};

            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("TargetOutput");
                if (oCustomControl instanceof ComboBox) {
                    var vCategory = oCustomControl.getSelectedKey();
                    switch (vCategory) {
                        case "F":
                            oBindingParams.filters.push(new Filter("Target_Output", "EQ", "F"));
                            break;
                        case "B":
                            oBindingParams.filters.push(new Filter("Target_Output", "EQ", "B"));
                            break;
                        case "A":
                            oBindingParams.filters.push(new Filter("Target_Output", "EQ", "A"));
                            break;
                        default:
                            break;
                    }
                }
                var oCustomControl1 = oSmartFilterBar.getControlByKey("Issue_Type");
                if (oCustomControl1 instanceof ComboBox) {
                    var vCategory = oCustomControl1.getSelectedKey();
                    switch (vCategory) {
                        case "F":
                            oBindingParams.filters.push(new Filter("Issue_Type", "EQ", "F"));
                            break;
                        case "R":
                            oBindingParams.filters.push(new Filter("Issue_Type", "EQ", "R"));
                            break;
                        default:
                            break;
                    }
                }
                var oCustomControl2 = oSmartFilterBar.getControlByKey("TargetSheet");
                if (oCustomControl2 instanceof MultiComboBox) {
                    this.targetOutputSheet = oCustomControl2.getSelectedKeys();

                }
                this.languageKey = oSmartFilterBar.getFilterData().Lang.items[0].key;
            }
        },
        getPrintQueues: function () {
            // var that = this;
            // this.getOwnerComponent().getModel().read('/PrinterConfiguration',{
            //     success: function(oData) {

            //     }
            // })
            // var settings = {
            //     "url": $.sap.getModulePath("com.yokogawa.zhpp0028") + "/qm/api/v1/rest/queues",
            //     "method": "GET",
            //     "headers": {
            //         "DataServiceVersion": "2.0", "Accept": "application/json"
            //     }
            // };

            // $.ajax(settings).done(function (response) {
            //     that.getView().getModel("ui").setProperty("/aQueues", response);
            // });
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
                    name: "com.yokogawa.zhpp0028.ext.fragments.OutputSelection",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            that._oDialogOutputSelection.then(function (oDialog) {
                oDialog.open();
                Fragment.byId("OutputSelection", "defaultPrinter").setSelected(false);
                Fragment.byId("OutputSelection", "specifyPrinter").setSelected(false);
                that.getView().getModel("ui").setProperty("/SpecifiedPrinter", "");
            });
        },
        onValueHelpSpecifyPrinter: function () {
            var that = this;
            var oView = this.getView();
            if (!this._oDialogPrintQueue) {
                this._oDialogPrintQueue = Fragment.load({
                    id: "OutputSelection",
                    name: "com.yokogawa.zhpp0028.ext.fragments.Select",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            that._oDialogPrintQueue.then(function (oDialog) {
                for(let selectedOutputSheet of that.targetOutputSheet) {
                    //to be discussed . Already discussed with Sravan and Radha on 02.11.2023.
                    //asked to hard code report ID = 3
                }
                

                var oContexts = that.extensionAPI.getSelectedContexts();
                var oPlantArray = [];
                var oWorkCenterArray = [];
                var oPlantFilters = [];
                var oWCFilters = [];
                oContexts.forEach(async function (object, index) {
                    var sPath = object.sPath;
                    var modelData = that.getView().getModel().getData(sPath);
                    if(!oWorkCenterArray.includes(modelData.Work_Center)) {
                        oWorkCenterArray.push(modelData.Work_Center);
                        oWCFilters.push(new Filter({
                            path: 'KEY2',
                            operator: FilterOperator.EQ,
                            value1: modelData.Work_Center
                        }) )
                    }
                    if(!oPlantArray.includes(modelData.Plant )) {
                        oPlantArray.push(modelData.Plant );
                        oPlantFilters.push(new Filter({
                            path: 'KEY1',
                            operator: FilterOperator.EQ,
                            value1: modelData.Plant
                        }) )
                    }
                });

                let oPlantFilterFinal = new Filter({
                    filters: oPlantFilters,
                    and:false
                });
                let oWCFilterFinal = new Filter({
                    filters: oWCFilters,
                    and:false
                });
                let oReportFilter = new Filter({
                    path: 'REPORTID',
                    operator: FilterOperator.EQ,
                    value1: 3
                });
                let oFilterFinal = new Filter({
                    filters:[oPlantFilterFinal,oWCFilterFinal,oReportFilter],
                    and : true
                })
                    var oTable = sap.ui.getCore().byId(`OutputSelection--mySelectDialog`);
                    if(oTable) {
                        var oTableBinding = oTable.getBinding("items");
                        if(oTableBinding) {
                            oTableBinding.filter([oFilterFinal]);
                        }
                    }

                oDialog.open();
                oDialog.clearSelection(false);
            });
        },
        onQDialogClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (oSelectedItem) {
                this.getView().getModel("ui").setProperty("/SpecifiedPrinter", oSelectedItem.getCells()[0].getTitle());
            }
        },

        onQueueSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oBinding = oEvent.getParameter("itemsBinding");
            if (sValue) {
                oBinding.filter([new Filter({ filters: [new Filter("qdescription", FilterOperator.Contains, sValue), new Filter("qname", FilterOperator.Contains, sValue)], and: false })]);
            } else {
                oBinding.filter([]);
            }

        },
        onPrint: function () {
            var oUiData = this.getView().getModel("ui").getData();
            switch (oUiData.outputOptionSelected) {
                case 0:
                    this.getView().getModel("ui").setProperty("/TextDownload", false);
                    this.getView().getModel("ui").setProperty("/PDFDownload", false);
                    this.getView().getModel("ui").setProperty("/SendTOQueue", true);
                    this.getProductionData();
                    break;
                case 1:
                    this.onPDFDownload();
                    break;
                case 2:
                     this.onTextDownload();
                     break;
                default:
                    break;
            }
            
        },
        onPDFDownload: function () {
            this.getView().getModel("ui").setProperty("/SendTOQueue", false);
            this.getView().getModel("ui").setProperty("/TextDownload", false);
            this.getView().getModel("ui").setProperty("/PDFDownload", true);
            this.getProductionData();

        },
        onTextDownload: function () {
            this.getView().getModel("ui").setProperty("/TextDownload", true);
            this.getView().getModel("ui").setProperty("/PDFDownload", false);
            this.getView().getModel("ui").setProperty("/SendTOQueue", false);
            this.getProductionData();

        },
        getSubLineData: async function (totalCount, prodOrder) {
            var that = this;
            var urlToRead = `/FrontData`;
            var oFilter = [];
            oFilter.push(
                new Filter(
                    "PROD_NO",
                    FilterOperator.EQ,
                    prodOrder
                )
            );

            // oFilter.push(
            //     new Filter(
            //         "lang",
            //         FilterOperator.EQ,
            //         "EN"
            //     )
            // );
            await that.getOwnerComponent().getModel().read(urlToRead, {
                filters: oFilter,
                urlParameters: {
                    "$expand": "to_MinMaxTable,to_ParentChildTable"
                },
                success: function (res) {
                    var aZCDSEHPPB0068 = res;
                    if (res.results.length == 0) {
                        MessageBox.error("No data found to download or print");
                        return;
                    }

                    var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderSubLineForm(aZCDSEHPPB0068))));
                    var jsondata1 = {
                        "xdpTemplate": "ProductionOrderSubline/ProductionOrderSubline",
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder:prodOrder });
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    }
                },
                error: that.readErrorMessages.bind(this)
            });
        },
        getMainLineData: async function (totalCount, prodOrder) {
            var that = this;
            var urlToRead = `/mailLineFormCombined`;
            var oFilter = [];
            oFilter.push(
                new Filter(
                    "prodno",
                    FilterOperator.EQ,
                    prodOrder
                )
            );

            oFilter.push(
                new Filter(
                    "lang",
                    FilterOperator.EQ,
                    "EN"
                )
            );
            await that.getOwnerComponent().getModel().read(urlToRead, {
                filters: oFilter,
                urlParameters: {
                    "$expand": "to_ORDERITEM,to_SERIALITEM"
                },
                success: function (res) {
                    var aZCDSEHPPB0068 = res;
                    if (res.results.length == 0) {
                        MessageBox.error("No data found to download or print");
                        return;
                    }

                    var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderMainLineForm(aZCDSEHPPB0068))));
                    var jsondata1 = {
                        "xdpTemplate": "ProductionOrderMainLineForm/MainLineForm",
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder:prodOrder });
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    }
                },
                error: that.readErrorMessages.bind(this)
            });
        },
        get9788Form: async function (totalCount, prodOrder, plannerGrp) {
            var that = this;
            var urlToRead = `/ProductionPartBTypeForm2?ProdOrder=1003391`;
            var oFilter = [];
            oFilter.push(
                new Filter(
                    "prodno",
                    FilterOperator.EQ,
                    prodOrder
                )
            );
            // var urlPath = "/srv-api/v2/deviation-management/" + sPath + "/DeviationManagementService.recycleNCR";
            var urlPath = $.sap.getModulePath("com.yokogawa.zhpp0028") + "/v2/zapibps0022/ProductionPartBTypeForm2?ProdOrder=" + prodOrder;
            var that1 = this;
            jQuery.ajax({
                url: urlPath,
                method: "GET",
                contentType: "application/json",
                success: function (res) {
                    var aZCDSEHPPB0068 = res.d.ProductionPartBTypeForm2;
                    // if(res.results.length == 0) {
                    //     MessageBox.error("No data found to download or print");
                    //     return;getProductionOrderPartLump1
                    // }

                    // var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartBXMLForm2(aZCDSEHPPB0068))));
                    var encdata;
                    var formName;
                    if (plannerGrp == 2) {
                        encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartBXMLForm2(aZCDSEHPPB0068))));
                        formName = "9788BTypeForm/9788BTypeForm";
                    } else if (plannerGrp == 3 || plannerGrp == 1 || plannerGrp == 4) {
                        encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartLump1(aZCDSEHPPB0068))));
                        formName = "ProductionOrderLump1/ProductionOrderLump1";
                    } else if (plannerGrp == 6) {
                        encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartLump2(aZCDSEHPPB0068))));
                        formName = "ProductionOrderLump2/ProductionOrderLump2";
                    }
                    var jsondata1 = {
                        "xdpTemplate": formName,
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder:prodOrder });
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    };
                }.bind(this),
                error: that.readErrorMessages.bind(this)
            });
            // var urlToRead = `/ZTHBT0029`;
            // await that.getOwnerComponent().getModel().read(urlToRead, {
            //     // filters: oFilter,
            //     // urlParameters: {
            //     //     "ProdOrder": prodOrder
            //     // },
            //     success: function (res) {
            //         var aZCDSEHPPB0068 = res;
            //         if(res.results.length == 0) {
            //             MessageBox.error("No data found to download or print");
            //             return;
            //         }

            //         var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartBXMLForm2(aZCDSEHPPB0068))));
            //         var jsondata1 = {
            //             "xdpTemplate": "9788BTypeForm/9788BTypeForm",
            //             "xmlData": encdata,
            //         };
            //         that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068 });
            //         if (that.totalCount === that.index) {
            //             that.printAllDocuments(that.allDocuments);
            //         }
            //     },
            //     error: that.readErrorMessages.bind(this)
            // });
        },
        get9789Form: async function (totalCount, prodOrder, plannerGrp) {
            var that = this;
            // var urlToRead = `/ProductionPartBTypeForm2?ProdOrder=1003391`;
            var oFilter = [];
            oFilter.push(
                new Filter(
                    "prodno",
                    FilterOperator.EQ,
                    prodOrder
                )
            );
            // var urlPath = "/srv-api/v2/deviation-management/" + sPath + "/DeviationManagementService.recycleNCR";
            var urlPath = $.sap.getModulePath("com.yokogawa.zhpp0028") + "/v2/zapibps0022/ProductionPartBTypeForm?ProdOrder=" + prodOrder;
            var that1 = this;
            jQuery.ajax({
                url: urlPath,
                method: "GET",
                contentType: "application/json",
                success: function (res) {
                    var aZCDSEHPPB0068 = res.d.ProductionPartBTypeForm;
                    // if(res.results.length == 0) {
                    //     MessageBox.error("No data found to download or print");
                    //     return;getProductionOrderPartLump1
                    // }

                    // var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartBXMLForm2(aZCDSEHPPB0068))));
                    var encdata;
                    var formName;

                    encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderPartBXML(aZCDSEHPPB0068))));
                    formName = "ProductionOrderSet2Form/ProductionOrderSet2Form";

                    var jsondata1 = {
                        "xdpTemplate": formName,
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder:prodOrder });
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    };
                }.bind(this),
                error: that.readErrorMessages.bind(this)
            });

        },
        getProductionOrderSheetData: async function (totalCount, urlToRead,prodOrder) {
            var that = this;
            // var urlToRead = `/ProductionOrderSheetCombined('1000120')`;
            that.getOwnerComponent().getModel().read(urlToRead, {
                urlParameters: {
                    "$expand": "to_OpertaionsListColumn1,to_OpertaionsListColumn2,to_OpertaionsListColumn3"
                },
                success: function (res) {
                    var aZCDSEHPPB0068 = res;

                    var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderXML(aZCDSEHPPB0068))));
                    var jsondata1 = {
                        "xdpTemplate": "ProductionOrderSheet/ProductionOrderSheet",
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder: prodOrder});
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    }
                },
                error: that.readErrorMessages.bind(this)
            });
        },
        getProductionOrderRecordSheetData: async function (totalCount, urlToRead,prodOrder) {
            var that = this;
            // var urlToRead = `/ProcessRecordSheetCombined('1000120')`;
            that.getOwnerComponent().getModel().read(urlToRead, {
                urlParameters: {
                    "$expand": "to_OpertaionsList"
                },
                success: function (res) {
                    var aZCDSEHPPB0068 = res;

                    var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderRecordXML(aZCDSEHPPB0068))));
                    var jsondata1 = {
                        "xdpTemplate": "ProcessRecordSheet/ProcessRecordSheet",
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder:prodOrder });
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    }
                },
                error: that.readErrorMessages.bind(this)
            });
        },
        getProductionOrderChildPartListData: async function (urlToRead, prodOrder) {
            var that = this;
            await that.getOwnerComponent().getModel().read(urlToRead, {
                urlParameters: {
                    "$expand": "to_Components"
                },
                success: function (res) {
                    var aZCDSEHPPB0068 = res;

                    var encdata = btoa(unescape(encodeURIComponent(that.getProductionOrderChildPartXML(aZCDSEHPPB0068))));
                    var jsondata1 = {
                        "xdpTemplate": "ChildPartList/ChildPartList",
                        "xmlData": encdata,
                    };
                    that.allDocuments.push({ jsondata1: jsondata1, res: aZCDSEHPPB0068,prodOrder:prodOrder });
                    if (that.totalCount === that.index) {
                        that.printAllDocuments(that.allDocuments);
                    }
                },
                error: that.readErrorMessages.bind(this)
            });
        },
        getProductionData: function (oEvent) {
            var that = this;
            var oContexts = this.extensionAPI.getSelectedContexts();

            var data = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>`;
            sap.ui.core.BusyIndicator.show(0);
            this.totalCount = oContexts.length - 1;
            var allDocuments = [];
            this.allDocuments = [];
            // var sProcess_flag = this.uiModel.getProperty("/search/Process_flag");
            var outputSheet = this.targetOutputSheet;
            var sTargetSheet_type = '1';
            // var urlToRead = `/ProductionOrderSheetCombined('1000120')`;
            sap.ui.getCore().getMessageManager().removeAllMessages();
            oContexts.forEach(async function (object, index) {
                ;
                that.index = index
                var sPath = object.sPath;
                var modelData = that.getView().getModel().getData(sPath);
                var urlToRead;
                // SRVBHPP0008/ZCDSEHPPB0069?$filter=kanbanid%20eq%20%27351%27%20and%20language%20eq%20%27EN%27
                for (var i = 0; i < outputSheet.length; i++) {
                    sTargetSheet_type = outputSheet[0];
                    if (sTargetSheet_type === "1") {
                        urlToRead = `/ProductionOrderSheetCombined('${modelData.Prod_Ord}')`;
                        await that.getMainLineData(index, modelData.Prod_Ord);
                    };
                    if (sTargetSheet_type === "2") {
                        urlToRead = `/ProductionOrderSheetCombined('${modelData.Prod_Ord}')`;
                        await that.getSubLineData(index, modelData.Prod_Ord);
                    };
                    if (sTargetSheet_type === "3") {
                        urlToRead = `/ChildPartListCombined(ProductionOrderNo='${modelData.Prod_Ord}',lang='${that.languageKey}')`
                        await that.getProductionOrderChildPartListData(urlToRead, modelData.Prod_Ord);
                    };
                    if (sTargetSheet_type === "4") {
                        urlToRead = `/ProcessRecordSheetCombined(OrderNumber='${modelData.Prod_Ord}',Language='${that.languageKey}')`;
                        await that.getProductionOrderRecordSheetData(index, urlToRead,modelData.Prod_Ord);
                    };
                    if (sTargetSheet_type === "5") {
                        urlToRead = `/ProductionOrderSheetCombined(OrderNumber='${modelData.Prod_Ord}',Language='${that.languageKey}')`;
                        await that.getProductionOrderSheetData(index, urlToRead,modelData.Prod_Ord);
                    };
                    if (sTargetSheet_type === "6") {
                        if (modelData.Planner_Group == "5") {
                            await that.get9789Form(index, modelData.Prod_Ord, modelData.Planner_Group);
                        } else {
                            await that.get9788Form(index, modelData.Prod_Ord, modelData.Planner_Group);
                        }
                    }
                }

            });
            // that.printAllDocuments(this.allDocuments);

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
        getForm2Key: function () {
            var data = "Plant" + "," + "Production Order Type" + "," + "Work Center" + "," + "MRP Controller" + "," + "Production Supervisor" + "," +
                "Linkage Number" + "," + "Sales Document" + "," + "Sales Document Item" + "," + "WBS Element" + "," + "Production Order" + "," +
                "Scheduled start date" + "," + "Scheduled finish date" + "," + "Material Number" + "," + "Posting date for modification" + "," + "Language Key" + "," + "Target Output" + "," +
                "Issue Type" + "," + "Material Type" + "," + "Serial" + "," + "Serial Sign" + "," + "Numbering issue" + "," + "Total Order Quantity" + "," +
                "Unit" + "," + "Project Definition" + "," + "MS Code" + "," + "Combined MS code Control No" + "," + "Combined MS Code Indicator" + "," + "Inquiry ID" + "," +
                "Message" + "," + "Planner Group";

            return data;
        },
        printAllDocuments: function (documents) {
            var that = this;
            var csvData = "";
            sap.ui.core.BusyIndicator.show(0)
            if (this.getView().getModel("ui").getProperty("/TextDownload")) {

                csvData = that.getForm2Key() + '\n';
                documents.forEach(function (resObject) {
                    csvData += that.getForm2Data(resObject.res) + '\n';
                });

                that.exportToCSV(csvData);
                sap.ui.core.BusyIndicator.hide();
            } else {
                documents.forEach(function (res) {
                    that.openPDF(res.jsondata1, res.res,res.prodOrder);
                });
            }
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
        openPDF: function (jsondata1, res,prodOrder) {
            var that = this;
            jsondata1.formType = "print";
            jsondata1.formLocale = "";
            jsondata1.taggedPdf = 1;
            jsondata1.embedFont = 0;
            var that = this;
            var jsondata = JSON.stringify(jsondata1);
            // var jsondata = jsondata1;
            var dest = $.sap.getModulePath("com.yokogawa.zhpp0028") + '/dest-adsrestapi';
            var url_render = dest + "/v1/adsRender/pdf?templateSource=storageName&TraceLevel=2";
            sap.ui.core.BusyIndicator.show(0)
            $.ajax({
                url: url_render,
                type: "post",
                contentType: "application/json",
                data: jsondata,
                success: function (a, textStatus, jqXHR) {
                    if (that.getView().getModel("ui").getProperty("/SendTOQueue")) {
                        that.sendToPrintQueue(a, res);
                    } else {
                        that.showPDF(a,prodOrder,jsondata1.xdpTemplate);
                    }
                },
                error: function (data) {
                    console.log(data);
                    sap.ui.core.BusyIndicator.hide()
                    console.log("error while getting pdf content");
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
        sendToPrintQueue: function (a, res) {
            var that = this;
            const fd = new FormData();
            var blob = that.ataURIToBlob("data:application/pdf;base64," + a.fileContent);
            fd.append('file', blob, res.Prod_Ord + ".pdf");
            var settings = {
                "url": $.sap.getModulePath("com.yokogawa.zhpp0028") + "/dm/api/v1/rest/print-documents",

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
                    "url": $.sap.getModulePath("com.yokogawa.zhpp0028") + "/qm/api/v1/rest/print-tasks/" + response,
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
                                "documentName": res.Prod_Ord + ".pdf"
                            }
                        ]
                    }),
                };

                $.ajax(settings).done(function (response) {
                    sap.ui.core.BusyIndicator.hide();
                    that.updateZTHBT0029Entry();
                    var oContexts = that.extensionAPI.getSelectedContexts();
                    oContexts.forEach(function (info) {
                        var object = info.getPath();
                        that.getView().getModel().setProperty(object + "/message", "X");
                    });
                    MessageBox.success("Document sent to print queue successfully");
                    // that.extensionAPI.rebindTable(true);
                });
            });
        },
        updateZTHBT0029Entry: function () {
            var that = this;
            var oContexts = this.extensionAPI.getSelectedContexts();
            //var xdpTempalge = 'PickingListReportsSetForm/SetForm'
            sap.ui.core.BusyIndicator.show(0);
            sap.ui.getCore().getMessageManager().removeAllMessages();
            that.getOwnerComponent().getModel().resetChanges(null, true);
            // that.getOwnerComponent().getModel().setDeferredGroups(["ZTHBT0028"]);
            var format1 = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "PThh'H'mm'M'ss'S'" });
            oContexts.forEach(function (info) {
                var object = info.getObject();
                var action = "create";
                var path = "/ZTHBT0028";
                var Process_flag = 1;
                if (Process_flag) {
                    // Process_flag = object.Process_flag;
                    action = "update";
                    path = "/ZTHBT0028(PRODUCTIONORDER='" + object.Prod_Ord.toString() + "',ZZPLANT='" + object.Plant + "',ZZG_PRINTED_REV='" + object.Printed_Rev + "')";
                }
                that.getOwnerComponent().getModel()[action](path, {
                    // PRODUCTIONORDER:  object.Prod_Ord.toString(),
                    // ZZPLANT:  object.Plant,
                    // ZZG_PRINTED_REV:  object.Printed_Rev,
                    ZPRINT: "X"
                });
            });
            that.getOwnerComponent().getModel().submitChanges({
                success: function (res) {
                    sap.ui.core.BusyIndicator.hide(0);
                    that.getView().getModel().refresh();
                },
                error: that.readErrorMessages.bind(that)
            })
        },
        showPDF: function (a,prodOrder,xdpTemplate) {
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
            var downloadFn = function (oEvent) {
                console.log('download is called');
                let templateArray = xdpTemplate.split("/");
                let derivedFormName = templateArray[0];
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, `${derivedFormName}_${prodOrder}.pdf`);
                }
                else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) {
                        var url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", `${derivedFormName}_${prodOrder}.pdf`);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                } 
            }
            if (!this._PDFViewer) {
                this._PDFViewer = new sap.m.PDFViewer({
                    width: "auto",
                    source: _pdfurl,
                    showDownloadButton: false,
                    loaded: downloadFn

                });
                jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
            }
            this._PDFViewer.setSource(_pdfurl);
            // this.getView().getModel().setProperty(this.extensionAPI.getSelectedContexts()[0].getPath() + "/message" , "X");
            var sissue_flag = this.uiModel.getProperty("/search/issue_flag");
            if (sissue_flag === "Y1") {
                this.changeStatus();
            }
            // this.updateZTHBT0030Entry();
            // var oContexts = this.extensionAPI.getSelectedContexts();
            // oContexts.forEach(function (info) {
            //     var object = info.getPath();
            //     that.getView().getModel().setProperty(object + "/message" , "X");
            // });
            this._PDFViewer.open();
            // that.extensionAPI.rebindTable(true);

            sap.ui.core.BusyIndicator.hide();
        },
        getProductionOrderXML: function (object) {
            var today = new Date();
            let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
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
                `<PARENTITEM>` + oData.ParentItem + `</PARENTITEM>` +
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
                    `<LATEST_SCHEDULE_FINISH_DATE>` + oDataC1.LatestScheduleFinishDate1 + `</LATEST_SCHEDULE_FINISH_DATE>` +
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
                        `<LATEST_SCHEDULE_FINISH_DATESG>` + oDataC2.LatestScheduleFinishDate1 + `</LATEST_SCHEDULE_FINISH_DATESG>` +
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
                        `<LATEST_SCHEDULE_FINISH_DATETG>` + oDataC3.LatestScheduleFinishDate1 + `</LATEST_SCHEDULE_FINISH_DATETG>` +
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
            data1 = data1 + `</ITEM>`;

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

            data1 = data1 + `</data>`;
            return data1;
        },
        getProductionOrderRecordXML: function (object) {
            var today = new Date();
            let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<HEADER><ORDERNUMBER>` + oData.OrderNumber + `</ORDERNUMBER>` +
                `<TITLE>` + oData.title + `</TITLE>` +
                `<PRODUCTIONVERSION>` + oData.ProductionVersion + `</PRODUCTIONVERSION>` +
                `<WORKCENTER>` + oData.WorkCenter + `</WORKCENTER>` +
                `<MATERIALDESCRIPTION>` + oData.MaterialDescription + `</MATERIALDESCRIPTION>` +
                `<TRANSPROD>` + oData.TransProd + `</TRANSPROD>` +
                `<MODEL>` + oData.Model + `</MODEL>` +
                `<IVTRYPROD>` + oData.Ivtryprod + `</IVTRYPROD>` +
                `<TRWORKCENTER>` + oData.TRWorkCenter + `</TRWORKCENTER>` +
                `<STORAGELOCATION>` + oData.StorageLocation + `</STORAGELOCATION>` +
                `<STORAGEBIN>` + oData.StorageBin + `</STORAGEBIN>` +
                `<PARTSNO>` + oData.PartsNo + `</PARTSNO>` +
                `<STORE>` + oData.Store + `</STORE>` +
                `<MFGORDERPLANNEDTOTALQTY>` + oData.MfgOrderPlannedTotalQty + `</MFGORDERPLANNEDTOTALQTY>` +
                `<PRODUCTIONUNIT>` + oData.ProductionUnit + `</PRODUCTIONUNIT>` +
                `<MFGORDERSCHEDULEDSTARTDATE>` + oData.MFGStartDate + `</MFGORDERSCHEDULEDSTARTDATE>` +
                `<MFGORDERSCHEDULEDENDDATE>` + oData.MFGEndDate + `</MFGORDERSCHEDULEDENDDATE>` +
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
            return data1;
        },
        getProductionOrderChildPartXML: function (object) {
            var today = new Date();
            let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<HEADER><PRODUCTIONORDERNO>` + oData.ProductionOrderNo + `</PRODUCTIONORDERNO>` +
                `<RESERVATION>` + oData.Reservation + `</RESERVATION>` +
                `<MATERIALNUMBER>` + oData.MaterialNumber + `</MATERIALNUMBER>` +
                `<MATERIALDESCRIPTIONH>` + oData.MaterialDescriptionH + `</MATERIALDESCRIPTIONH>` +
                `<ORDERQTY>` + oData.OrderQty + `</ORDERQTY>` +
                `<BASEUNITMEASURE>` + oData.BaseUnitMeasure + `</BASEUNITMEASURE>` +
                `<STARTDATE>` + oData.StartDate1 + `</STARTDATE>` +
                `<ENDDATE>` + oData.EndDate1 + `</ENDDATE>` +
                `<STORAGELOCATION>` + oData.StorageLocation + `</STORAGELOCATION>` +
                `<REPRINT>` + '' + `</REPRINT>` +
                `<ISSUEDATE>` + oData.IssueDate + `</ISSUEDATE>` +
                `</HEADER>` + `<ITEMS>`;
            var components = oData.to_Components.results;
            components.sort((a, b) => {
                var x = a["PartNumber"].toLowerCase();
                var y = b["PartNumber"].toLowerCase();
                if (a["dumps"] < b["dumps"]) {
                    return 1;
                }
                if (a["dumps"] > b["dumps"]) {
                    return -1;
                }
                if (a["PartNumber"] < b["PartNumber"]) {
                    return -1;
                }
                if (a["PartNumber"] > b["PartNumber"]) {
                    return 1;
                }

            });
            for (let index in components) {
                let oComponent = components[index];
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
            return data1;
        },
        getProductionOrderMainLineForm: function (object) {
            var today = new Date();
            let oData = object.results[0];
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            // var data1;
            let data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<HEADER>` +
                `<ModelSuffixFlag>` + oData.ModelSuffixFlag + `</ModelSuffixFlag>` +
                `<ModelSuffixA>` + oData.ModelSuffixA + `</ModelSuffixA>` +
                `<ModelSuffixB>` + oData.ModelSuffixB + `</ModelSuffixB>` +
                `<OptionFlag>` + oData.OptionFlag + `</OptionFlag>` +
                `<OptionA>` + oData.OptionA + `</OptionA>` +
                `<OptionB>` + oData.OptionB + `</OptionB>` +
                `<ProductCareer>` + oData.ProductCareer + `</ProductCareer>` +
                `<ItemQtyFlag>` + oData.ItemQtyFlag + `</ItemQtyFlag>` +
                `<CompQty>` + oData.CompQty + `</CompQty>` +
                `<CompTotalQty>` + oData.CompTotalQty + `</CompTotalQty>` +
                `<SProdScheduledD>` + oData.SProdScheduledD + `</SProdScheduledD>` +
                `<CompletionSchedD>` + oData.CompletionSchedD + `</CompletionSchedD>` +
                `<CompletionInstDFlag>` + oData.CompletionInstDFlag + `</CompletionInstDFlag>` +
                `<CompletionInstD>` + oData.CompletionInstD + `</CompletionInstD>` +
                `<ItemName>` + oData.ItemName + `</ItemName>` +
                `<TokuchuNoFlag>` + oData.TokuchuNoFlag + `</TokuchuNoFlag>` +
                `<TokuchuNo>` + oData.TokuchuNo + `</TokuchuNo>` +
                `<ApprovalNo>` + oData.ApprovalNo + `</ApprovalNo>` +
                `<IMFlag>` + oData.IMFlag + `</IMFlag>` +
                `<IM>` + oData.IM + `</IM>` +
                `<XJFlag>` + oData.XJFlag + `</XJFlag>` +
                `<XJNo>` + oData.XJNo + `</XJNo>` +
                `<QANo>` + oData.QANo + `</QANo>` +
                `<TestCertificateFlag>` + oData.TestCertificateFlag + `</TestCertificateFlag>` +
                `<TestCertificate>` + oData.TestCertificate + `</TestCertificate>` +
                `<SeparateWSNOFlag>` + oData.SeparateWSNOFlag + `</SeparateWSNOFlag>` +
                `<SeparateWSNO>` + oData.SeparateWSNO + `</SeparateWSNO>` +
                `<WarrantyCard>` + oData.WarrantyCard + `</WarrantyCard>` +
                `<TokuchuNote>` + oData.TokuchuNote + `</TokuchuNote>` +
                `<DOCLanguage>` + oData.DOCLanguage + `</DOCLanguage>` +
                `<NuclearSign>` + oData.NuclearSign + `</NuclearSign>` +
                `<TempStorage>` + oData.TempStorage + `</TempStorage>` +
                `<ItemNoteFlag>` + oData.ItemNoteFlag + `</ItemNoteFlag>` +
                `<ItemNote1>` + oData.ItemNote1 + `</ItemNote1>` +
                `<ItemNote2>` + oData.ItemNote2 + `</ItemNote2>` +
                `<ItemNote3>` + oData.ItemNote3 + `</ItemNote3>` +
                `<MFGMemo1>` + oData.MFGMemo1 + `</MFGMemo1>` +
                `<MFGMemo2>` + oData.MFGMemo2 + `</MFGMemo2>` +
                `<MFGMemo3>` + oData.MFGMemo3 + `</MFGMemo3>` +
                `<SalesPersonName>` + oData.SalesPersonName + `</SalesPersonName>` +
                `<ProdApprovalPersonName>` + oData.ProdApprovalPersonName + `</ProdApprovalPersonName>` +
                `<LevelingGRNO>` + oData.LevelingGRNO + `</LevelingGRNO>` +
                `<StartProdNo>` + oData.StartProdNo + `</StartProdNo>` +
                `<PModeOrderTypeConfNo>` + oData.PModeOrderTypeConfNo + `</PModeOrderTypeConfNo>` +
                `<ProdNo>` + oData.prodno + `</ProdNo>` +
                `<ProdNoRev>` + oData.ProdNoRev + `</ProdNoRev>` +
                `<SRClassification>` + oData.SRClassification + `</SRClassification>` +
                `<InstTypeA>` + oData.InstTypeA + `</InstTypeA>` +
                `<ProdTypeA>` + oData.ProdTypeA + `</ProdTypeA>` +
                `<EndUser>` + oData.EndUser + `</EndUser>` +
                `<CountryCode>` + oData.CountryCode + `</CountryCode>` +
                `<Linkage>` + oData.Linkage + `</Linkage>` +
                `<OIC>` + oData.OIC + `</OIC>` + `<BODY1>`;
            for (let index in oData.to_ORDERITEM) {
                let oOrdInstData = oData.to_ORDERITEM[index];
                data1 = data1 + `<DATA>` +
                    `<OrderInstructionFlag>` + oOrdInstData.OrderInstructionFlag + `</OrderInstructionFlag>` +
                    `<OrderInstructionTitle>` + oOrdInstData.OrderInstructionTitle + `</OrderInstructionTitle>` +
                    `<Min>` + oOrdInstData.Order_Min + `</Min>` +
                    `<Max>` + oOrdInstData.Order_Max + `</Max>` +
                    `<Unit>` + oOrdInstData.Order_Unit + `</Unit>` +
                    `<Factor>` + oOrdInstData.Factor + `</Factor>` +
                    `<Features>` + oOrdInstData.Features + `</Features>` + `</DATA>`;
            }
            data1 = data1 + `</BODY1>` +
                `<CombinationGr>` + oData.CombinationGr + `</CombinationGr>` +
                `<CombPrCh>` + oData.CombPrCh + `</CombPrCh>` +
                `<CombPInst>` + oData.CombPInst + `</CombPInst>` +
                `<Pairs>` + oData.Pairs + `</Pairs>` + `<BODY2>`;
            for (let index in oData.to_SERIALITEM) {
                let oSerialData = oData.to_SERIALITEM[index];
                data1 = data1 + `<DATA>` +
                    `<ParentChild>` + oSerialData.ParentChild + `</ParentChild>` +
                    `<Serial>` + oSerialData.Serial + `</Serial>` +
                    `<Item>` + oSerialData.Item + `</Item>` +
                    `<Comp>` + oSerialData.Comp + `</Comp>` +
                    `<Model>` + oSerialData.Model + `</Model>` +
                    `<SProdSchedD>` + oSerialData.SProdSchedD + `</SProdSchedD>` +
                    `<CompScheD>` + oSerialData.CompScheD + `</CompScheD>` +
                    `<XJNo>` + oSerialData.XJNo + `</XJNo>` +
                    `<ProcessNo1>` + oSerialData.ProcessNo1 + `</ProcessNo1>` +
                    `<OpnCd1>` + oSerialData.OpnCd1 + `</OpnCd1>` +
                    `<WorkCenter1>` + oSerialData.WorkC1 + `</WorkCenter1>` +
                    `<OperationText1>` + oSerialData.OprTxt1 + `</OperationText1>` +
                    `<WorkCenterText1>` + oSerialData.WorkCTxt1 + `</WorkCenterText1>` +
                    `<ManHourLabor11>` + oSerialData.ManHL1 + `</ManHourLabor11>` +
                    `<ManHourLabor12>` + oSerialData.ManHL2 + `</ManHourLabor12>` +
                    `<ManHourLabor13>` + oSerialData.ManHL3 + `</ManHourLabor13>` +
                    `<ProcessFinishSchDate>` + oSerialData.PFSchDate + `</ProcessFinishSchDate>` +
                    `<ProdProcessQR>` + oSerialData.ProdPQR + `</ProdProcessQR>` +
                    `</DATA>`;
            }
            data1 = data1 + `</BODY2>` +
                `<MaterialCode1>` + oData.MaterialCode1 + `</MaterialCode1>` +
                `<MaterialCode2>` + oData.MaterialCode2 + `</MaterialCode2>` +
                `<MaterialCode>` + oData.MaterialCode + `</MaterialCode>` +
                `<ItemName1>` + oData.ItemName1 + `</ItemName1>` +
                `<ItemName2>` + oData.ItemName2 + `</ItemName2>` +
                `<MSCode1>` + oData.MSCode1 + `</MSCode1>` +
                `<MSCode2>` + oData.MSCode2 + `</MSCode2>` +
                `<MSCode3>` + oData.MSCode3 + `</MSCode3>` +
                `<MSCode4>` + oData.MSCode4 + `</MSCode4>` +
                `<SerialNo>` + oData.SerialNo + `</SerialNo>` +
                `<CompQtyB>` + oData.CompQtyB + `</CompQtyB>` +
                `<PONo>` + oData.PONo + `</PONo>` +
                `<ProjectDefinition>` + oData.ProjectDefinition + `</ProjectDefinition>` +
                `<LinkageB>` + oData.LinkageB + `</LinkageB>` +
                `<OICB>` + oData.OICB + `</OICB>` +
                `<SublineNo>` + oData.SublineNo + `</SublineNo>` +
                `<Article1>` + oData.Article1 + `</Article1>` +
                `<Article2>` + oData.Article2 + `</Article2>` +
                `<Article3>` + oData.Article3 + `</Article3>` +
                `<Article4>` + oData.Article4 + `</Article4>` +
                `<Article5>` + oData.Article5 + `</Article5>` +
                `<Article6>` + oData.Article6 + `</Article6>` +
                `<Article7>` + oData.Article7 + `</Article7>` +
                `<Article8>` + oData.Article8 + `</Article8>` +
                `<Article9>` + oData.Article9 + `</Article9>` +
                `<Article10>` + oData.Article10 + `</Article10>` +
                `<Article11>` + oData.Article11 + `</Article11>` +
                `<StockTitle>` + oData.StockTitle + `</StockTitle>` +
                `<InstTypeC>` + oData.InstTypeC + `</InstTypeC>` +
                `<ProdTypeC>` + oData.ProdTypeC + `</ProdTypeC>` +
                `<STOCKTITLE2>` + oData.StockTitle2 + `</STOCKTITLE2>` +
                `<STOCKTITLE3>` + oData.StockTitle3 + `</STOCKTITLE3>` +
                `<PNOC>` + oData.PNOC + `</PNOC>` +
                `<STOCKTITLE4>` + oData.StockTitle4 + `</STOCKTITLE4>` +
                `<SERNR>` + oData.Sernr + `</SERNR>` +
                `<STOCKTITLE5>` + oData.StockTitle5 + `</STOCKTITLE5>` +
                `<RECEIVEPLACE>` + oData.ReceivePlace + `</RECEIVEPLACE>` +
                `<STOCKTITLE6>` + oData.StockTitle6 + `</STOCKTITLE6>` +
                `<STORAGELOCATION>` + oData.StorageLocation + `</STORAGELOCATION>` +
                `<STOCKTITLE7>` + oData.StockTitle7 + `</STOCKTITLE7>` +
                `<STARTNO>` + oData.StartNo + `</STARTNO>` +
                `<OICA3>` + oData.OIAC3 + `</OICA3>` +
                `<LevelingGRNOName>` + oData.LevelingGRNOName + `</LevelingGRNOName>` +
                `<REISSUEARTICLE>` + oData.ReissueArticle + `</REISSUEARTICLE>` +
                `<REPORTID>` + oData.ReportId + `</REPORTID>` +
                `</HEADER>` + `</data>`;
            return data1;
        },
        getProductionOrderSubLineForm: function (object) {
            // var today = new Date();
            let oData = object.results[0];
            let XMLPayload = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` + `<DATA>` + `<GT_DATA>`;
            for (let index in oData) {
                let oSublineData = oData[index];
                XMLPayload = XMLPayload +
                    `<DATA>` +
                    `<PROD_NO>` + oSublineData.PROD_NO + `</PROD_NO>` +
                    `<OPERATION_NUMBER>` + oSublineData.OPERATION_NUMBER + `</OPERATION_NUMBER>` +
                    `<LANGUAGE>` + oSublineData.LANGUAGE + `</LANGUAGE>` +
                    `<SUBLINE_NAME>` + oSublineData.subline_name + `</SUBLINE_NAME>` +
                    `<SUBLINE_NO>` + oSublineData.subline_no + `</SUBLINE_NO>` +
                    `<SPROD_SCH_DT_FLG>` + oSublineData.sprod_sch_dt_flg + `</SPROD_SCH_DT_FLG>` +
                    `<SPROD_SCHEDULE_DT>` + oSublineData.sprod_schedule_dt + `</SPROD_SCHEDULE_DT>` +
                    `<COMPL_SCH_DT_FLG>` + oSublineData.compl_sch_dt_flg + `</COMPL_SCH_DT_FLG>` +
                    `<COMPL_SCH_DT>` + oSublineData.compl_sch_dt + `</COMPL_SCH_DT>` +
                    `<COMPL_INST_DT_FLG>` + oSublineData.compl_inst_dt_flg + `</COMPL_INST_DT_FLG>` +
                    `<COMPL_INST_DT>` + oSublineData.compl_inst_dt + `</COMPL_INST_DT>` +
                    `<LEVELING_GRNO_NAME>` + oSublineData.leveling_grno_name + `</LEVELING_GRNO_NAME>` +
                    `<LEVELING_GRNO>` + oSublineData.leveling_grno + `</LEVELING_GRNO>` +
                    `<START_PROD>` + oSublineData.start_prod + `</START_PROD>` +
                    `<INST_TYPE>` + oSublineData.inst_type + `</INST_TYPE>` +
                    `<PROD_TYPE>` + oSublineData.prod_type + `</PROD_TYPE>` +
                    `<QTY_FLG>` + oSublineData.qty_flg + `</QTY_FLG>` +
                    `<COMP_QTY>` + oSublineData.comp_qty + `</COMP_QTY>` +
                    `<COMP_QTY_TOT>` + oSublineData.comp_qty_tot + `</COMP_QTY_TOT>` +
                    `<COMP_UNIT>` + oSublineData.comp_unit + `</COMP_UNIT>` +
                    `<SERIAL_NO>` + oSublineData.serial_no + `</SERIAL_NO>` +
                    `<NUCLEAR_SIGN>` + oSublineData.nuclear_sign + `</NUCLEAR_SIGN>` +
                    `<SUFFIX_FLG>` + oSublineData.suffix_flg + `</SUFFIX_FLG>` +
                    `<SUFFIX>` + oSublineData.suffix + `</SUFFIX>` +
                    `<OPTION_FLG>` + oSublineData.option_flg + `</OPTION_FLG>` +
                    `<OPTION_VAL>` + oSublineData.option_val + `</OPTION_VAL>` +
                    `<PROD_CAREER_FLG>` + oSublineData.prod_career_flg + `</PROD_CAREER_FLG>` +
                    `<PROD_CAREER>` + oSublineData.prod_career + `</PROD_CAREER>` +
                    `<XJ>` + oSublineData.xj + `</XJ>` +
                    `<SAFE_FLG>` + oSublineData.safe_flg + `</SAFE_FLG>` +
                    `<SAFE_NO>` + oSublineData.safe_no + `</SAFE_NO>` +
                    `<QWBX_FLG>` + oSublineData.qwbx_flg + `</QWBX_FLG>` +
                    `<QWBX_NO>` + oSublineData.qwbx_no + `</QWBX_NO>` +
                    `<WS_FLG>` + oSublineData.ws_flg + `</WS_FLG>` +
                    `<WS_NO>` + oSublineData.ws_no + `</WS_NO>` +
                    `<IM>` + oSublineData.im + `</IM>` +
                    `<TEST_CERT>` + oSublineData.test_cert + `</TEST_CERT>` +
                    `<WARRANTY_CARD>` + oSublineData.warranty_card + `</WARRANTY_CARD>` +
                    `<DOC_LANG>` + oSublineData.doc_lang + `</DOC_LANG>` +
                    `<ITEM_ARTICLE1>` + oSublineData.item_article1 + `</ITEM_ARTICLE1>` +
                    `<ITEM_ARTICLE2>` + oSublineData.item_article2 + `</ITEM_ARTICLE2>` +
                    `<LINKAGE_NO>` + oSublineData.linkage_no + `</LINKAGE_NO>` +
                    `<OIC>` + oSublineData.oic + `</OIC>` +
                    `<REV>` + oSublineData.rev + `</REV>` +
                    `<REPRINT_FLG>` + oSublineData.reprint_flg + `</REPRINT_FLG>` +
                    `<REPORT_ID>` + oSublineData.report_id + `</REPORT_ID>` +
                    `<CONFIRMATION_NO>` + oSublineData.confirmation_no + `</CONFIRMATION_NO>` +
                    `<OVERFLOW>` + oSublineData.overflow + `</OVERFLOW>` +
                    `<TITLE_ID>` + oSublineData.title_id + `</TITLE_ID>` +
                    `<SERIAL>` + oSublineData.serial + `</SERIAL>` +
                    `<COMB_GR>` + oSublineData.comb_gr + `</COMB_GR>` +
                    `<COMB_PRCH>` + oSublineData.comb_prch + `</COMB_PRCH>` +
                    `<COMB_PINST>` + oSublineData.comb_pinst + `</COMB_PINST>` +
                    `<PAIRS>` + oSublineData + `</PAIRS>` +
                    `<GT_MINMAX>`;
                for (let i in oSublineData.to_MinMaxTable) {
                    let oOrdInstData = oSublineData.to_MinMaxTable[i];
                    XMLPayload = XMLPayload + `<DATA>` +
                        `<PROD_NO>` + oOrdInstData.PROD_NO + `</PROD_NO>` +
                        `<OPERATION_NUMBER>` + oOrdInstData.OPERATION_NUMBER + `</OPERATION_NUMBER>` +
                        `<LANGUAGE>` + oOrdInstData.LANGUAGE + `</LANGUAGE>` +
                        `<TITLE_ID>` + oOrdInstData.title_id + `</TITLE_ID>` +
                        `<TITLE>` + oOrdInstData.title + `</TITLE>` +
                        `<MIN_VAL>` + oOrdInstData.min_val + `</MIN_VAL>` +
                        `<MAX_VAL>` + oOrdInstData.max_val + `</MAX_VAL>` +
                        `<UNIT>` + oOrdInstData.unit + `</UNIT>` +
                        `<FACTOR>` + oOrdInstData.factor + `</FACTOR>` +
                        `<FEATURE>` + oOrdInstData.feature + `</FEATURE>` +
                        `</DATA>`;
                }
                XMLPayload = XMLPayload + `</GT_MINMAX>` + `<GT_PARENTCHILD>`;
                for (let j in oSublineData.to_ParentChildTable) {
                    let oParentChildData = oSublineData.to_ParentChildTable[j];
                    XMLPayload = XMLPayload + `<DATA>` +
                        `<PROD_NO>` + oParentChildData.PROD_NO + `</PROD_NO>` +
                        `<OPERATION_NUMBER>` + oParentChildData.OPERATION_NUMBER + `</OPERATION_NUMBER>` +
                        `<LANGUAGE>` + oParentChildData.LANGUAGE + `</LANGUAGE>` +
                        `<SERIAL>` + oParentChildData.serial + `</SERIAL>` +
                        `<PARENT_CHILD>` + oParentChildData.parent_child + ` </PARENT_CHILD>` +
                        `<ITEM>` + oParentChildData.item + `</ITEM>` +
                        `<COMP>` + oParentChildData.comp + `</COMP>` +
                        `<MODEL>` + oParentChildData.model + `</MODEL>` +
                        `<COMP_SCH_DT>` + oParentChildData.comp_sch_dt + `</COMP_SCH_DT>` +
                        `<SPROD_SCHEDULE_DT>` + oParentChildData.sprod_schedule_dt + `</SPROD_SCHEDULE_DT>` +
                        `<XJ_NO>` + oParentChildData.xj_no + `</XJ_NO>` +
                        `</DATA>`;
                }
                XMLPayload = XMLPayload +
                    `</GT_PARENTCHILD>` +
                    `</DATA>`;
            }
            XMLPayload = XMLPayload + `</GT_DATA>` + `</DATA>` + `</data>`;
            return XMLPayload;
        },
        getProductionOrderPartBXML: function (object) {
            var today = new Date();
            let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<HEADER><ZZTYPE2ORDER>` + oData.ZZTYPE2ORDER + `</ZZTYPE2ORDER>` +
                `<ZZTYPE2ITEM>` + oData.ZZTYPE2ITEM + `</ZZTYPE2ITEM>` +
                `<ARBPL>` + oData.ARBPL + `</ARBPL>` +
                `<GSTRP>` + oData.GSTRP + `</GSTRP>` +
                `<LEVELLINGGROUP>` + oData.LEVELLINGGROUP + `</LEVELLINGGROUP>` +
                `<ZZPRDSTNO>` + oData.ZZPRDSTNO + `</ZZPRDSTNO>` +
                `<AUFNR>` + oData.AUFNR + `</AUFNR>` +
                `<TYPE2CAT>` + oData.TYPE2CAT + `</TYPE2CAT>` +
                `<KDAUF>` + oData.KDAUF + `</KDAUF>` +
                `<KDPOS>` + oData.KDPOS + `</KDPOS>` +
                `<GLTRP>` + oData.GLTRP + `</GLTRP>` +
                `<COMPNO>` + oData.COMPNO + `</COMPNO>` +
                `<ZZMSCODE>` + oData.ZZMSCODE + `</ZZMSCODE>` +
                `<GLTRP1>` + oData.GLTRP + `</GLTRP1>` +
                `<ZZTYPE2STATUS>` + oData.ZZTYPE2STATUS + `</ZZTYPE2STATUS>` +
                `<KTEXT>` + oData.KTEXT + `</KTEXT>` +
                `<TYPE2NOTE>` + oData.TYPE2NOTE + `</TYPE2NOTE>` +
                `<MATNR>` + oData.MATNR + `</MATNR>` +
                `<SMATNR>` + oData.SMATNR + `</SMATNR>` +
                `<CUOBJ>` + oData.CUOBJ + `</CUOBJ>` +
                `<ZZ1_ALIASNAME_PRD>` + oData.ZZ1_ALIASNAME_PRD + `</ZZ1_ALIASNAME_PRD>` +
                `<SERIALNUMBER>` + oData.SERIALNUMBER + `</SERIALNUMBER>` +
                `<ZZ1_MANUFARTICLE_PLT>` + oData.ZZ1_MANUFARTICLE_PLT + `</ZZ1_MANUFARTICLE_PLT>` +
                `<NUCLEARCODE>` + oData.NUCLEARCODE + `</NUCLEARCODE>` +
                `<MODEL>` + oData.MODEL + `</MODEL>` +
                `<SPECCODE>` + oData.SPECCODE + `</SPECCODE>` +
                `<PRODUCTCAREER>` + oData.PRODUCTCAREER + `</PRODUCTCAREER>` +
                `<XJNO>` + oData.XJNO + `</XJNO>` +
                `<SAFEPROOFNO>` + oData.SAFEPROOFNO + `</SAFEPROOFNO>` +
                `<QWBOXNO>` + oData.QWBOXNO + `</QWBOXNO>` +
                `<WORKSHEETCODE>` + oData.WORKSHEETCODE + `</WORKSHEETCODE>` +
                `<NOTE2>` + oData.NOTE2 + `</NOTE2>` +
                `<NOTE3>` + oData.NOTE3 + `</NOTE3>` +
                `<NOTE4>` + oData.NOTE4 + `</NOTE4>` +
                `<NOTE5>` + oData.NOTE5 + `</NOTE5>` +
                `<NOTE6>` + oData.NOTE6 + `</NOTE6>` +
                `<NOTE7>` + oData.NOTE7 + `</NOTE7>` +
                `<NOTE8>` + oData.NOTE8 + `</NOTE8>` +
                `<ISSUEDATE>` + oData.ISSUEDATE + `</ISSUEDATE>` +
                `<ISSUETIME>` + oData.ISSUETIME + `</ISSUETIME>` +
                `<COPYORORIGINAL>` + oData.COPYORORIGINAL + `</COPYORORIGINAL>` +
                `<BLANK1>` + oData.BLANK1 + `</BLANK1>` +
                `<BLANK2>` + oData.BLANK2 + `</BLANK2>` +
                `<JOBNOTE1>` + oData.JOBNOTE1 + `</JOBNOTE1>` +
                `<JOBNOTE2>` + oData.JOBNOTE2 + `</JOBNOTE2>` +
                `<JOBNOTE3>` + oData.JOBNOTE3 + `</JOBNOTE3>` +
                `<JOBNOTE4>` + oData.JOBNOTE4 + `</JOBNOTE4>` +
                `<JOBITEMNOTE1>` + oData.JOBITEMNOTE1 + `</JOBITEMNOTE1>` +
                `<JOBITEMNOTE2>` + oData.JOBITEMNOTE2 + `</JOBITEMNOTE2>` +
                `<JOBITEMNOTE3>` + oData.JOBITEMNOTE3 + `</JOBITEMNOTE3>` +
                `<JOBITEMNOTE4>` + oData.JOBITEMNOTE4 + `</JOBITEMNOTE4>` +
                `<JOBITEMNOTE5>` + oData.JOBITEMNOTE5 + `</JOBITEMNOTE5>` +
                `<JOBITEMNOTE6>` + oData.JOBITEMNOTE6 + `</JOBITEMNOTE6>` +
                `<JOBITEMNOTE7>` + oData.JOBITEMNOTE7 + `</JOBITEMNOTE7>` +
                `<JOBITEMNOTE8>` + oData.JOBITEMNOTE8 + `</JOBITEMNOTE8>` +
                `<JOBITEMNOTE9>` + oData.JOBITEMNOTE9 + `</JOBITEMNOTE9>` +
                `<JOBITEMNOTE10>` + oData.JOBITEMNOTE10 + `</JOBITEMNOTE10>` +
                `<VRKME>` + oData.VRKME + `</VRKME>` +
                `<KWMENG>` + oData.KWMENG + `</KWMENG>` +
                `<ZZ1LINKNO>` + oData.ZZ1LINKNO + `</ZZ1LINKNO>` +
                `</HEADER>` + `<ITEMS_L>`;

            for (let index in oData.TOITEML) {
                let oOperationData = oData.TOITEML[index];
                data1 = data1 + `<DATA>` +
                    `<ZZTYPE2ORDER>` + oOperationData.ZZTYPE2ORDER + `</ZZTYPE2ORDER>` +
                    `<ZZTYPE2ITEM>` + oOperationData.ZZTYPE2ITEM + `</ZZTYPE2ITEM>` +
                    `<MATNR>` + oOperationData.MATNR + `</MATNR>` +
                    `<WERKS>` + oOperationData.WERKS + `</WERKS>` +
                    `<ZZTYPE2STATUS>` + oOperationData.ZZTYPE2STATUS + `</ZZTYPE2STATUS>` +
                    `<GSMNG>` + oOperationData.GSMNG + `</GSMNG>` +
                    `<MEINS>` + oOperationData.MEINS + `</MEINS>` +
                    `<PLNUM>` + oOperationData.PLNUM + `</PLNUM>` +
                    `<LGORT>` + oOperationData.LGORT + `</LGORT>` +
                    `<TYPE2NOTE>` + oOperationData.TYPE2NOTE + `</TYPE2NOTE>` +
                    `</DATA>`
            }
            data1 = data1 + `</ITEMS_L>` + `<ITEMS_R>`;
            for (let index in oData.TOITEMR) {
                let oOperationData = oData.TOITEMR[index];
                data1 = data1 + `<DATA>` +
                    `<ZZTYPE2ORDER>` + oOperationData.ZZTYPE2ORDER + `</ZZTYPE2ORDER>` +
                    `<ZZTYPE2ITEM>` + oOperationData.ZZTYPE2ITEM + `</ZZTYPE2ITEM>` +
                    `<MATNR>` + oOperationData.MATNR + `</MATNR>` +
                    `<WERKS>` + oOperationData.WERKS + `</WERKS>` +
                    `<ZZTYPE2STATUS>` + oOperationData.ZZTYPE2STATUS + `</ZZTYPE2STATUS>` +
                    `<GSMNG>` + oOperationData.GSMNG + `</GSMNG>` +
                    `<MEINS>` + oOperationData.MEINS + `</MEINS>` +
                    `<PLNUM>` + oOperationData.PLNUM + `</PLNUM>` +
                    `<LGORT>` + oOperationData.LGORT + `</LGORT>` +
                    `<TYPE2NOTE>` + oOperationData.TYPE2NOTE + `</TYPE2NOTE>` +
                    `</DATA>`;
            }

            data1 = data1 + `</ITEMS_R>` + `</data>`;
            console.log(data1);
            return data1;
        },
        getProductionOrderPartBXMLForm2: function (object) {
            var today = new Date(); let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<HEADER> <DATA><PARTSWORKCENTERNAME>` + oData.PARTSWORKCENTERNAME + `</PARTSWORKCENTERNAME>` +
                `<PARTSWORKCENTER>` + oData.PARTSWORKCENTER + `</PARTSWORKCENTER>` +
                `<SCHEDULEDSTARTPRODDATE>` + oData.SCHEDULEDSTARTPRODDATE + `</SCHEDULEDSTARTPRODDATE>` +
                `<SCHEDULEDCOMPLETEDATE>` + oData.SCHEDULEDCOMPLETEDATE + `</SCHEDULEDCOMPLETEDATE>` +
                `<LEVELINGGRNONAME>` + oData.LEVELINGGRNONAME + `</LEVELINGGRNONAME>` +
                `<LEVELINGGRNO>` + oData.LEVELINGGRNO + `</LEVELINGGRNO>` +
                `<STARTPRODNO>` + oData.STARTPRODNO + `</STARTPRODNO>` +
                `<STARTPRODUCTIONQUANTITY>` + oData.STARTPRODUCTIONQUANTITY + `</STARTPRODUCTIONQUANTITY>` +
                `<PRODUCTIONQUANTITY>` + oData.PRODUCTIONQUANTITY + `</PRODUCTIONQUANTITY>` +
                `<SERIALNO>` + oData.SERIALNO + `</SERIALNO>` +
                `<NUCLEARCODE>` + oData.NUCLEARCODE + `</NUCLEARCODE>` +
                `<REPORTID>` + oData.REPORTID + `</REPORTID>` +
                `<BASICSPECIFICATION>` + oData.BASICSPECIFICATION + `</BASICSPECIFICATION>` +
                `<XJNO>` + oData.XJNO + `</XJNO>` +
                `<OPTIONALSPECIFICATION1>` + oData.OPTIONALSPECIFICATION1 + `</OPTIONALSPECIFICATION1>` +
                `<SAFEPROOFNO>` + oData.SAFEPROOFNO + `</SAFEPROOFNO>` +
                `<OPTIONALSPECIFICATION2>` + oData.OPTIONALSPECIFICATION2 + `</OPTIONALSPECIFICATION2>` +
                `<QWBOXNO>` + oData.QWBOXNO + `</QWBOXNO>` +
                `<PRODUCTCAREER>` + oData.PRODUCTCAREER + `</PRODUCTCAREER>` +
                `<WORKSHEET>` + oData.WORKSHEET + `</WORKSHEET>` +
                `<NOTE0>` + oData.NOTE0 + `</NOTE0>` +
                `<NOTE1>` + oData.NOTE1 + `</NOTE1>` +
                `<NOTE2>` + oData.NOTE2 + `</NOTE2>` +
                `<NOTE3>` + oData.NOTE3 + `</NOTE3>` +
                `<NOTE4>` + oData.NOTE4 + `</NOTE4>` +
                `<NOTE5>` + oData.NOTE5 + `</NOTE5>` +
                `<NOTE6>` + oData.NOTE6 + `</NOTE6>` +
                `<NOTE7>` + oData.NOTE7 + `</NOTE7>` +
                `<NOTE8>` + oData.NOTE8 + `</NOTE8>` +
                `<NOTE9>` + oData.NOTE9 + `</NOTE9>` +
                `<NOTE10>` + oData.NOTE10 + `</NOTE10>` +
                `<NOTE11>` + oData.NOTE11 + `</NOTE11>` +
                `<NOTE12>` + oData.NOTE12 + `</NOTE12>` +
                `<ISSUEDATE>` + oData.ISSUEDATE + `</ISSUEDATE>` +
                `<ISSUETIME>` + oData.ISSUETIME + `</ISSUETIME>` +
                `<COPYORORIGINAL>` + oData.COPYORORIGINAL + `</COPYORORIGINAL>` +
                `<PRODORDERNO>` + oData.PRODORDERNO + `</PRODORDERNO>` +
                `<CURRENTPAGENUMBER>` + oData.CURRENTPAGENUMBER + `</CURRENTPAGENUMBER>` +
                `<TOTALNUMBEROFPAGES>` + oData.TOTALNUMBEROFPAGES + `</TOTALNUMBEROFPAGES>` +
                `<BTYPEPRODNO>` + oData.BTYPEPRODNO + `</BTYPEPRODNO>` +
                `<PRINTERID>` + oData.PRINTERID + `</PRINTERID>` +
                `</DATA>` +
                `</HEADER>` + `<PARTSNOTE>`;

            for (let index in oData.PARTSNOTE) {
                let oOperationData = oData.PARTSNOTE[index];
                data1 = data1 + `<DATA>` +
                    `<PARTSWORKCENTERNAME>` + oOperationData.PARTSWORKCENTERNAME + `</PARTSWORKCENTERNAME>` +
                    `<PARTSWORKCENTER>` + oOperationData.PARTSWORKCENTER + `</PARTSWORKCENTER>` +
                    `<SCHEDULEDSTARTPRODDATE>` + oOperationData.SCHEDULEDSTARTPRODDATE + `</SCHEDULEDSTARTPRODDATE>` +
                    `<SCHEDULEDCOMPLETEDATE>` + oOperationData.SCHEDULEDCOMPLETEDATE + `</SCHEDULEDCOMPLETEDATE>` +
                    `<LEVELINGGRNONAME>` + oOperationData.LEVELINGGRNONAME + `</LEVELINGGRNONAME>` +
                    `<LEVELINGGRNO>` + oOperationData.LEVELINGGRNO + `</LEVELINGGRNO>` +
                    `<STARTPRODNO>` + oOperationData.STARTPRODNO + `</STARTPRODNO>` +
                    `<STARTPRODUCTIONQUANTITY>` + oOperationData.STARTPRODUCTIONQUANTITY + `</STARTPRODUCTIONQUANTITY>` +
                    `<PRODUCTIONQUANTITY>` + oOperationData.PRODUCTIONQUANTITY + `</PRODUCTIONQUANTITY>` +
                    `<SERIALNO>` + oOperationData.SERIALNO + `</SERIALNO>` +
                    `<NUCLEARCODE>` + oOperationData.NUCLEARCODE + `</NUCLEARCODE>` +
                    `<REPORTID>` + oOperationData.REPORTID + `</REPORTID>` +
                    `<ISSUEDATE>` + oOperationData.ISSUEDATE + `</ISSUEDATE>` +
                    `<ISSUETIME>` + oOperationData.ISSUETIME + `</ISSUETIME>` +
                    `<COPYORORIGINAL>` + oOperationData.COPYORORIGINAL + `</COPYORORIGINAL>` +
                    `<PRODORDERNO>` + oData.BTYPEPRODNO + `</PRODORDERNO>` +
                    `<BTYPEPRODNO>` + oData.BTYPEPRODNO + `</BTYPEPRODNO>` +
                    `<PARTSNOTEITEMS>`;
                // `</DATA>` + `</ITEMS_L>` + `</ITEMS_R>`;
            }
            for (let index in oData.PARTSNOTEITEM) {
                let oOperationData = oData.PARTSNOTEITEM[index];
                data1 = data1 + `<DATA>` +
                    `<PARTSNOTEO>` + oOperationData.PARTSNOTEO + `</PARTSNOTEO>` +
                    `<PARTSNOO>` + oOperationData.PARTSNOO + `</PARTSNOO>` +
                    `<QUANTITYO>` + oOperationData.QUANTITYO + `</QUANTITYO>` +
                    `<PARTSNOTEE>` + oOperationData.PARTSNOTEE + `</PARTSNOTEE>` +
                    `<PARTSNUMBERE>` + oOperationData.PARTSNUMBERE + `</PARTSNUMBERE>` +
                    `<QUANTITYE>` + oOperationData.QUANTITYE + `</QUANTITYE>` +
                    `</DATA>`;
            }

            data1 = data1 + `</PARTSNOTEITEMS>` + `</DATA>` + `</PARTSNOTE>` + `</data>`;
            console.log(data1);
            return data1;
        },
        getProductionOrderPartLump1: function (object) {
            var today = new Date(); let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
            var title = "Production Order Lump 1"
            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<Header> <DATA><Title>` + title + `</Title>` +
                `<PARTSWORKCENTERNAME>` + oData.PARTSWORKCENTERNAME + `</PARTSWORKCENTERNAME>` +
                `<PARTSWORKCENTER>` + oData.PARTSWORKCENTER + `</PARTSWORKCENTER>` +
                `<SCHEDULEDSTARTPRODDATE>` + oData.SCHEDULEDSTARTPRODDATE + `</SCHEDULEDSTARTPRODDATE>` +
                `<SCHEDULEDCOMPLETEDATE>` + oData.SCHEDULEDCOMPLETEDATE + `</SCHEDULEDCOMPLETEDATE>` +
                `<LEVELINGGRNONAME>` + oData.LEVELINGGRNONAME + `</LEVELINGGRNONAME>` +
                `<LEVELINGGRNO>` + oData.LEVELINGGRNO + `</LEVELINGGRNO>` +
                `<STARTPRODNO>` + oData.STARTPRODNO + `</STARTPRODNO>` +
                `<STARTPRODUCTIONQUANTITY>` + oData.STARTPRODUCTIONQUANTITY + `</STARTPRODUCTIONQUANTITY>` +
                `<PRODUCTIONQUANTITY>` + oData.PRODUCTIONQUANTITY + `</PRODUCTIONQUANTITY>` +
                `<SERIALNO>` + oData.SERIALNO + `</SERIALNO>` +
                `<NUCLEARCODE>` + oData.NUCLEARCODE + `</NUCLEARCODE>` +
                `<REPORTID>` + oData.REPORTID + `</REPORTID>` +
                `<BASICSPECIFICATION>` + oData.BASICSPECIFICATION + `</BASICSPECIFICATION>` +
                `<XJNO>` + oData.XJNO + `</XJNO>` +
                `<OPTIONALSPECIFICATION1>` + oData.OPTIONALSPECIFICATION1 + `</OPTIONALSPECIFICATION1>` +
                `<SAFEPROOFNO>` + oData.SAFEPROOFNO + `</SAFEPROOFNO>` +
                `<OPTIONALSPECIFICATION2>` + oData.OPTIONALSPECIFICATION2 + `</OPTIONALSPECIFICATION2>` +
                `<QWBOXNO>` + oData.QWBOXNO + `</QWBOXNO>` +
                `<PRODUCTCAREER>` + oData.PRODUCTCAREER + `</PRODUCTCAREER>` +
                `<WORKSHEET>` + oData.WORKSHEET + `</WORKSHEET>` +
                `<LINKAGENUMBER>` + oData.WORKSHEET + `</LINKAGENUMBER>` +
                `<MFGMEMO1>` + oData.NOTE0 + `</MFGMEMO1>` +
                `<MFGMEMO2>` + oData.NOTE1 + `</MFGMEMO2>` +
                `<MFGMEMO3>` + oData.NOTE2 + `</MFGMEMO3>` +
                `<NOTE5>` + oData.NOTE5 + `</NOTE5>` +
                `<NOTE6>` + oData.NOTE6 + `</NOTE6>` +
                `<NOTE7>` + oData.NOTE7 + `</NOTE7>` +
                `<NOTE8>` + oData.NOTE8 + `</NOTE8>` +
                `<NOTE9>` + oData.NOTE9 + `</NOTE9>` +
                `<NOTE10>` + oData.NOTE10 + `</NOTE10>` +
                `<NOTE11>` + oData.NOTE11 + `</NOTE11>` +
                `<NOTE12>` + oData.NOTE12 + `</NOTE12>` +
                `<NOTE13>` + oData.NOTE11 + `</NOTE13>` +
                `<NOTE14>` + oData.NOTE12 + `</NOTE14>` +
                `<PARTSNOTE>` + oData.NOTE12 + `</PARTSNOTE>` +
                `<PARTSNUMBER>` + oData.NOTE11 + `</PARTSNUMBER>` +
                `<ORDERQUANTITY>` + oData.NOTE12 + `</ORDERQUANTITY>` +
                `<ISSUEDATE>` + oData.ISSUEDATE + `</ISSUEDATE>` +
                `<ISSUETIME>` + oData.ISSUETIME + `</ISSUETIME>` +
                `<COPYORORIGINAL>` + oData.COPYORORIGINAL + `</COPYORORIGINAL>` +
                `<PRODORDERNO>` + oData.PRODORDERNO + `</PRODORDERNO>` +
                `<BTYPEPRODNO>` + oData.BTYPEPRODNO + `</BTYPEPRODNO>` +
                `<TORIMATOMEDAY>` + oData.CURRENTPAGENUMBER + `</TORIMATOMEDAY>` +
                `<TORIMATOMETIME>` + oData.TOTALNUMBEROFPAGES + `</TORIMATOMETIME>` +
                `</DATA>` +
                `</Header>`;

            data1 = data1 + `</data>`;
            console.log(data1);
            return data1;
        },
        getProductionOrderPartLump2: function (object) {
            var today = new Date(); let oData = object;
            if (!object) {
                object = {};
            }
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = "" + today.getHours() + today.getMinutes() + today.getSeconds();
            var data1;
            data1 = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>` + `<data>` +
                `<Header> <DATA><PARTSWORKCENTERNAME>` + oData.PARTSWORKCENTERNAME + `</PARTSWORKCENTERNAME>` +
                `<PARTSWORKCENTER>` + oData.PARTSWORKCENTER + `</PARTSWORKCENTER>` +
                `<SCHEDULEDSTARTPRODDATE>` + oData.SCHEDULEDSTARTPRODDATE + `</SCHEDULEDSTARTPRODDATE>` +
                `<SCHEDULEDCOMPLETEDATE>` + oData.SCHEDULEDCOMPLETEDATE + `</SCHEDULEDCOMPLETEDATE>` +
                `<LEVELINGGRNONAME>` + oData.LEVELINGGRNONAME + `</LEVELINGGRNONAME>` +
                `<LEVELINGGRNO>` + oData.LEVELINGGRNO + `</LEVELINGGRNO>` +
                `<STARTPRODNO>` + oData.STARTPRODNO + `</STARTPRODNO>` +
                `<STARTPRODUCTIONQUANTITY>` + oData.STARTPRODUCTIONQUANTITY + `</STARTPRODUCTIONQUANTITY>` +
                `<PRODUCTIONQUANTITY>` + oData.PRODUCTIONQUANTITY + `</PRODUCTIONQUANTITY>` +
                `<SERIALNO>` + oData.SERIALNO + `</SERIALNO>` +
                `<NUCLEARCODE>` + oData.NUCLEARCODE + `</NUCLEARCODE>` +
                `<REPORTID>` + oData.REPORTID + `</REPORTID>` +
                `<BASICSPECIFICATION>` + oData.BASICSPECIFICATION + `</BASICSPECIFICATION>` +
                `<XJNO>` + oData.XJNO + `</XJNO>` +
                `<OPTIONALSPECIFICATION1>` + oData.OPTIONALSPECIFICATION1 + `</OPTIONALSPECIFICATION1>` +
                `<SAFEPROOFNO>` + oData.SAFEPROOFNO + `</SAFEPROOFNO>` +
                `<OPTIONALSPECIFICATION2>` + oData.OPTIONALSPECIFICATION2 + `</OPTIONALSPECIFICATION2>` +
                `<QWBOXNO>` + oData.QWBOXNO + `</QWBOXNO>` +
                `<PRODUCTCAREER>` + oData.PRODUCTCAREER + `</PRODUCTCAREER>` +
                `<WORKSHEET>` + oData.WORKSHEET + `</WORKSHEET>` +
                `<ITEMS>`;

            for (let index in oData.PARTSNOTEITEM) {
                let oOperationData = oData.PARTSNOTEITEM[index];
                data1 = data1 + `<DATA>` +
                    `<LINKAGENUMBER>` + oData.LINKAGENUMBER + `</LINKAGENUMBER>` +
                    `<MFGMEMO1>` + oData.NOTE0 + `</MFGMEMO1>` +
                    `<MFGMEMO2>` + oData.NOTE1 + `</MFGMEMO2>` +
                    `<MFGMEMO3>` + oData.NOTE2 + `</MFGMEMO3>` +
                    `<NOTE5>` + oData.NOTE5 + `</NOTE5>` +
                    `<NOTE6>` + oData.NOTE6 + `</NOTE6>` +
                    `<NOTE7>` + oData.NOTE7 + `</NOTE7>` +
                    `<NOTE8>` + oData.NOTE8 + `</NOTE8>` +
                    `<NOTE9>` + oData.NOTE9 + `</NOTE9>` +
                    `<NOTE10>` + oData.NOTE10 + `</NOTE10>` +
                    `<NOTE11>` + oData.NOTE11 + `</NOTE11>` +
                    `<NOTE12>` + oData.NOTE12 + `</NOTE12>` +
                    `<NOTE13>` + oData.NOTE11 + `</NOTE13>` +
                    `<NOTE14>` + oData.NOTE12 + `</NOTE14>` +
                    `<PRODORDERNO>` + oData.PRODORDERNO + `</PRODORDERNO>` +
                    `<BTYPEPRODNO>` + oData.PRODORDERNO + `</BTYPEPRODNO>` +
                    `<TORIMATOMEDAY>` + oData.NOTE11 + `</TORIMATOMEDAY>` +
                    `<TORIMATOMETIME>` + oData.NOTE12 + `</TORIMATOMETIME>` +
                    `</DATA>`;
            }

            data1 = data1 + `</ITEMS>` +
                `<PARTSNOTE>` + oData.NOTE12 + `</PARTSNOTE>` +
                `<PARTSNUMBER>` + oData.PRODORDERNO + `</PARTSNUMBER>` +
                `<ORDERQUANTITY>` + oData.NOTE12 + `</ORDERQUANTITY>` +
                `<ISSUEDATE>` + oData.ISSUEDATE + `</ISSUEDATE>` +
                `<ISSUETIME>` + oData.ISSUETIME + `</ISSUETIME>` +
                `<COPYORORIGINAL>` + oData.COPYORORIGINAL + `</COPYORORIGINAL>` +
                `</DATA>` +
                `</Header>`;

            data1 = data1 + `</data>`;
            console.log(data1);
            return data1;
        },
    };
});