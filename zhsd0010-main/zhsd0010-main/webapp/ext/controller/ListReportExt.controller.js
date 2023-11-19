sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/MultiComboBox",
    "sap/ui/model/json/JSONModel",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Filter, SmartFilterBar, MultiComboBox, JSONModel, library, Spreadsheet, MessageBox, MessageToast) {
    "use strict";
    var csrfToken;
    return {
        onInit: function (oEvt) {
            var oDialogModel = new JSONModel();
            this.getView().setModel(oDialogModel, "oDialogModel");
            var changedData = [];
            this.getView().getModel("oDialogModel").setProperty("/changedData", changedData);
            //this.getView().byId("listReport").setInitiallyVisibleFields("vbeln,kunrg,name1_p,kunnr,name1_b,kschl,vtext,spras,netwr,waerk,vstat,vstat_ddtext,Update_status_ac,PRAT1,PRAT2,PRAT3,PRAT4,adrnr_p,adrnr_b,land1,filter,spras_i,prtid,prtid_l,vkorg,vtweg,spart,fkart,fkdat,datvr,uhrvr,usnam");
            this.getView().byId("listReport").setRequestAtLeastFields("vbeln,kunrg,name1_p,kunnr,name1_b,kschl,vtext,spras,netwr,waerk,vstat,vstat_ddtext,Update_status_ac,PRAT1,PRAT2,PRAT3,PRAT4,adrnr_p,adrnr_b,land1,filter,spras_i,prtid,prtid_l,vkorg,vtweg,spart,fkart,fkdat,datvr,uhrvr,usnam");
            //this.getView().byId("listReport").setRequestAtLeastFields("Update_status_ac,vbeln,kunrg,name1_p,kunnr,name1_b,kschl,vtext,spras,netwr,waerk,vstat,PRAT1,PRAT2,PRAT3,PRAT4,adrnr_p,adrnr_b,land1,filter,spras_i,prtid,prtid_l,vkorg,vtweg,spart,fkart,fkdat,datvr,uhrvr,usnam");
        },
        onAfterRendering: function () {
            var that = this;
            setTimeout(function () {
                that.byId("listReport-btnCopy").setVisible(false);
                var aUrl = $.sap.getModulePath("com.yokogawa.zhsd0010") + "/sap/opu/odata/sap/ZSRVBHSD0008/ZCDSEHSDB0028";
                $.ajax({
                    url: aUrl,
                    type: 'GET',
                    headers: {
                        'x-csrf-token': 'fetch',
                        'Accept': '*/*'
                    },
                    params: {
                        $format: "json"
                    },
                    success: function (data, response, xml) {
                        csrfToken = xml.getResponseHeader('X-CSRF-Token');
                    },
                    error: function (e) {
                        MessageBox.error(e.message);
                    }
                });
            }, 2000);
        },
        getCustomAppStateDataExtension: function (oCustomData) {
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
        },
        onBeforeRebindTableExtension: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};
            var filters = oBindingParams.filters;
            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("filter");
                if (oCustomControl instanceof MultiComboBox) {
                    var vCategory = oCustomControl.getSelectedKeys();
                    for (var i = 0; i < vCategory.length; i++) {
                        oBindingParams.filters.push(new Filter("filter", "EQ", vCategory[i]));
                    }
                }
            }
            var that = this;
            setTimeout(function () {
                that.callValidate(filters);
            }, 3000);
        },
        callValidate: function (filter) {
            var urlPaths = "";
            for (var x = 0; x < filter.length; x++) {
                if (filter[x].sPath) {
                    urlPaths = urlPaths + filter[x].sPath + "='" + filter[x].oValue1 + "'&";
                }
                else {
                    var urlParts = filter[x].aFilters;
                    for (var i = 0; i < urlParts.length; i++) {
                        if (urlParts.length > 0) {
                            var urlSUBPaths = urlParts[i].aFilters;
                            // if(urlSUBPaths.length === 1) urlPaths = urlPaths + urlSUBPaths[0].sPath + "='" + urlSUBPaths[0].oValue1 +"'&";
                            // else{
                            for (var j = 0; j < urlSUBPaths.length; j++) {
                                if (urlSUBPaths[j]) urlPaths = urlPaths + urlSUBPaths[j].sPath + "='" + urlSUBPaths[j].oValue1 + "'&";
                            }
                            // }
                        }
                        //else urlPaths = urlParts[i].aFilters[0].sPath + "='" + urlParts[i].aFilters[0].oValue1 +"'";
                    }
                }
            }
            if (urlParts.length > 0) urlPaths = urlPaths.slice(0, urlPaths.length - 1);
            var that = this;
            sap.ui.core.BusyIndicator.show();
            var aUrl = $.sap.getModulePath("com.yokogawa.zhsd0010") + "/sap/opu/odata/sap/ZSRVBHSD0008/Validate_input?sap-client=120&vbeln=''&kunrg=''&vbeln=''&name1_p=''&kunnr=''&name1_b=''&vtext=''&vbeln=''&spras=''&netwr=0.0m&waerk=''&PRAT1=false&PRAT2=false&PRAT3=false&PRAT4=false&" + urlPaths;
            $.ajax({
                url: aUrl,
                type: 'POST',
                headers: {
                    'x-csrf-token': csrfToken
                },
                contentType: "application/json",
                success: function (success, message) {
                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    var msg = new DOMParser().parseFromString(e.responseText, 'text/xml').getElementsByTagName('message');
                    if (msg.length !== 0) msg = msg[0].textContent;
                    else msg = new DOMParser().parseFromString(e.responseText, 'text/xml').getElementsByTagName('body')[0].textContent;
                    //var responseText = new DOMParser().parseFromString(e.responseText, 'text/xml').getElementsByTagName('message')[0].textContent;
                    MessageBox.error(msg);
                }
            });
        },
        onPDF: function (oEvent) {
            var that = this;
            var oSelectedRows = this.extensionAPI.getSelectedContexts();
            that.getView().setBusy(true); ``
            if (oSelectedRows.length > 0) {
                var rowDetails = [], getCurrentData = {};
                for (var i = 0; i < oSelectedRows.length; i++) {
                    getCurrentData = oSelectedRows[i].getObject();
                    var aFilterIds = ["vbeln", "PRAT1", "PRAT2", "PRAT3", "PRAT4", "kunrg", "name1_p", "kunnr", "name1_b", "kschl", "vtext", "spras", "netwr", "waerk",
                        "vstat", "adrnr_p", "adrnr_b", "land1", "filter", "spras_i", "prtid", "prtid_l",
                        "vkorg", "vtweg", "spart", "fkart", "fkdat", "datvr", "uhrvr", "usnam"];
                    var aFilterValues = [getCurrentData.vbeln, getCurrentData.PRAT1, getCurrentData.PRAT2, getCurrentData.PRAT3, getCurrentData.PRAT4, getCurrentData.kunrg, getCurrentData.name1_p, getCurrentData.kunnr, getCurrentData.name1_b, getCurrentData.kschl, getCurrentData.vtext, getCurrentData.spras, getCurrentData.netwr, getCurrentData.waerk, getCurrentData.vstat, getCurrentData.adrnr_p, getCurrentData.adrnr_b, getCurrentData.land1, getCurrentData.filter, getCurrentData.spras_i, getCurrentData.prtid, getCurrentData.prtid_l, getCurrentData.vkorg, getCurrentData.vtweg, getCurrentData.spart, getCurrentData.fkart, getCurrentData.fkdat, getCurrentData.datvr, getCurrentData.uhrvr, getCurrentData.usnam];
                    var aFilters = that._createSearchFilterObject(aFilterIds, aFilterValues);
                    var oModel = this.getOwnerComponent().getModel();
                    that.noEnteries = oSelectedRows.length;
                    that.currExe = 0;
                    that.feildName = getCurrentData.vkorg + "_" + getCurrentData.kunnr + "_" + getCurrentData.vbeln;
                    oModel.read("/ZCDSEHSDB0051", {
                        filters: aFilters,
                        success: function (oData, oResponse) {
                            (that.currExe)++;
                            var dateValue = new Date();
                            dateValue = dateValue.getFullYear().toString() + (dateValue.getMonth() + 1).toString().padStart(2, '0') + dateValue.getDate().toString().padStart(2, '0') + "_" + dateValue.getHours().toString().padStart(2, '0') + dateValue.getMinutes().toString().padStart(2, '0') + dateValue.getSeconds().toString().padStart(2, '0');
                            that.getView().setBusy(false);
                            var data = oData.results;
                            var decodedPdfContent = atob(data[0].pdf);
                            var byteArray = new Uint8Array(decodedPdfContent.length);
                            for (var i = 0; i < decodedPdfContent.length; i++) {
                                byteArray[i] = decodedPdfContent.charCodeAt(i);
                            }
                            var blob = new Blob([byteArray.buffer], {
                                type: 'application/pdf'
                            });
                            var _pdfurl = URL.createObjectURL(blob);
                            var buttonPressed = that.getOwnerComponent().getModel("ui").getData().button;
                            if (buttonPressed === "create") {
                                var link = document.createElement('a');
                                link.href = _pdfurl;
                                link.download = that.feildName + "_" + dateValue + ".pdf";
                                link.dispatchEvent(new MouseEvent('click'));
                                if (that.currExe === that.noEnteries) {
                                    var text = "Document has been generated successfully";
                                    sap.m.MessageBox.show(text, {
                                        icon: sap.m.MessageBox.Icon.SUCCESS,
                                        title: "Success",
                                        actions: [sap.m.MessageBox.Action.OK]
                                    });
                                }
                            }
                            else {
                                var _PDFViewer = new sap.m.PDFViewer({
                                    width: "auto",
                                    source: _pdfurl
                                });
                                jQuery.sap.addUrlWhitelist("blob");
                                _PDFViewer.open();
                                // that.getOwnerComponent().getModel("ui").setData({
                                //     Source:_pdfurl
                                // });
                                // jQuery.sap.addUrlWhitelist("blob");
                                // if (!that._oDialog) {
                                //     that._oDialog = sap.ui.xmlfragment("com.yokogawa.zhsd0010.ext.fragments.pdfViewer", this);
                                //     that.getView().addDependent(that._oDialog);
                                // }
                                // that._oDialog.open();
                            }

                        },
                        error: function (mResponse) {
                            that.getView().setBusy(false);
                        }
                    });
                }
                // if(i === oSelectedRows.length){

                // }

            }
        },
        onSelectPRAT1: function (oEvent) {
        },
        onSelectPRAT2: function (oEvent) {
        },
        onSelectPRAT3: function (oEvent) {
        },
        onSelectPRAT4: function (oEvent) {
        },
        _createSearchFilterObject: function (aFilterIds, aFilterValues) {
            var aFilters = [], iCount;
            for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
                aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], sap.ui.model.FilterOperator.EQ, aFilterValues[iCount]));
            }
            return aFilters;
        },
        onPrint: function () {
            // if (!this._oDialog) {
            // 	this._oDialog = sap.ui.xmlfragment("com.yokogawa.zhsd0010.ext.fragments.pdfViewer", this);
            // 	this.getView().addDependent(this._oDialog);
            // }
            // this._oDialog.open();
            this.getOwnerComponent().getModel("ui").setData({
                button: "print"
            });
            this.onPDF();
        },
        onCreatePDF: function () {
            this.getOwnerComponent().getModel("ui").setData({
                button: "create"
            });
            this.onPDF();
        },
        onCreateCSV: function () {
            var that = this;
            var oSettings, oSheet, getCurrentData = [];
            var oSelectedRows = this.extensionAPI.getSelectedContexts();
            for (var i = 0; i < oSelectedRows.length; i++) {
                getCurrentData.push(oSelectedRows[i].getObject());
            }
            var oModel = that.getView().getModel();
            var oBuilding = oModel.getServiceMetadata().dataServices.schema[0].entityType.find(x => x.name === 'ZCDSEHSDB0051Type');
            var propertyList = ["vbeln", "PRAT1", "PRAT2", "PRAT3", "PRAT4", "kunrg", "name1_p", "kunnr", "name1_b", "kschl", "vtext", "spras", "netwr", "waerk",
                "vstat", "adrnr_p", "adrnr_b", "land1", "filter", "spras_i", "prtid", "prtid_l",
                "vkorg", "vtweg", "spart", "fkart", "fkdat", "datvr", "uhrvr", "usnam"];
            var excelColumnList = [];
            var excelNameL = getCurrentData[0].vkorg + "_" + getCurrentData[0].kunnr + "_" + getCurrentData[0].adrnr_b + "_";
            var dateValue = new Date();
            dateValue = dateValue.getFullYear().toString() + (dateValue.getMonth() + 1).toString().padStart(2, '0') + dateValue.getDate().toString().padStart(2, '0') + "_" + dateValue.getHours().toString().padStart(2, '0') + dateValue.getMinutes().toString().padStart(2, '0') + dateValue.getSeconds().toString().padStart(2, '0');
            excelNameL = excelNameL + dateValue + ".xlsx";
            propertyList.forEach((value, index) => {
                var colList = {};
                let property = oBuilding.property.find(x => x.name === value);
                colList["label"] = property.extensions.find(x => x.name === 'label').value;
                colList["property"] = value;
                excelColumnList.push(colList);
            });
            //excelColumnList.push(colList);   
            oSettings = {
                workbook: { columns: excelColumnList },
                dataSource: getCurrentData,
                fileName: excelNameL
            };
            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    var text = "Document has been generated successfully";
                    sap.m.MessageBox.show(text, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: "Success",
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                }).finally(function () {
                    oSheet.destroy();
                });
        }
    };
});