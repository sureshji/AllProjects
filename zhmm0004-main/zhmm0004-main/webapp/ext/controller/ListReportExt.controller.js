var aData = [];
sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox",
    "sap/m/MessageBox"
], function (Filter, SmartFilterBar, ComboBox, MessageBox) {
    "use strict";
    return {
        onAfterRendering: function (oEvent) {
            var that = this;
            setTimeout(() => {
                let filterFields = that.byId('listReportFilter')._aFields;

                let goBtnSID = that.byId('listReportFilter')._oSearchButton.sId;
                let plantSID, storageLocSID, addWorkCodeSID, stockTypeSID, vendorSID,
                    matNoSID, matTypeSID, salesDocNoSID, salesDocIemSID, linkNoSID, cusSID;

                filterFields.forEach(e => {
                    if (e.fieldName == 'LGORT') storageLocSID = e.control.sId;
                    else if (e.fieldName == 'WERKS') plantSID = e.control.sId;
                    else if (e.fieldName == 'atwkc') addWorkCodeSID = e.control.sId;
                    else if (e.fieldName == 'stock_type') stockTypeSID = e.control.sId;
                    else if (e.fieldName == 'lifnr') vendorSID = e.control.sId;
                    else if (e.fieldName == 'MATNR') matNoSID = e.control.sId;
                    else if (e.fieldName == 'vbeln') salesDocNoSID = e.control.sId;
                    else if (e.fieldName == 'MTART') matTypeSID = e.control.sId;
                    else if (e.fieldName == 'posnr') salesDocIemSID = e.control.sId;
                    else if (e.fieldName == 'linkno') linkNoSID = e.control.sId;
                    else if (e.fieldName == 'kunnr') cusSID = e.control.sId;
                });

                let plant = that.byId(plantSID)
                let storageLoc = that.byId(storageLocSID)
                let addWorkCode = that.byId(addWorkCodeSID)
                let stockType = that.byId(stockTypeSID)
                let vendor = that.byId(vendorSID)
                let matNo = that.byId(matNoSID)
                let salesDocNo = that.byId(salesDocNoSID)
                let matType = that.byId(matTypeSID)
                let salesDocIem = that.byId(salesDocIemSID)
                let linkNo = that.byId(linkNoSID)
                let cus = that.byId(cusSID)
                let goBtn = that.byId(goBtnSID)

                let autoFillStorage = () => {
                    if (plant.getValue().length > 0 && (addWorkCode.getTokens().length > 0 || addWorkCode.getValue().length > 0)) {
                        storageLoc.setValue('151A')
                    }
                }

                let vendorInput = () => {
                    if (vendor.getTokens().length > 0) {
                        stockType.getItems().map(e => {
                            e.getText().toLowerCase().includes('vendor') == false ? e.setEnabled(false) : e.setEnabled(true)
                        });
                    } else if (storageLoc.getTokens().length > 0 || storageLoc.getValue().length > 0) {
                        stockType.getItems().map(e => {
                            e.getText().toLowerCase() == 'customer consignment stock' ? e.setEnabled(false) : e.setEnabled(true)
                        });
                    } else if (addWorkCode.getTokens().length > 0 || addWorkCode.getValue().length > 0) {
                        stockType.getItems().map(e => {
                            e.getText().toLowerCase() == 'additional work stock' ? e.setEnabled(true) : e.setEnabled(false)
                        });
                    } else if (salesDocNo.getTokens().length > 0 || salesDocIem.getTokens().length > 0 || linkNo.getTokens().length > 0) {
                        stockType.getItems().map(e => {
                            let eName = e.getText().toLowerCase();
                            if (eName == 'sales order stock' || eName == 'additional work stock' || eName == 'delivery status stock') e.setEnabled(true)
                            else e.setEnabled(false)
                        });
                    } else if (cus.getTokens().length > 0 || cus.getValue().length > 0) {
                        stockType.getItems().map(e => {
                            e.getText().toLowerCase() == 'customer consignment stock' ? e.setEnabled(true) : e.setEnabled(false)
                        });
                    }
                }

                stockType.attachChange('', (oEvent) => {
                    console.log(oEvent)
                    let selectedItem = oEvent.getParameters("selectedItems").value;
                    let alreadyAddCodeSel = false
                    stockType.getSelectedItems().map(e => {
                        if (e.getText().toLowerCase() == 'additional work stock') alreadyAddCodeSel = true
                    });
                    if (selectedItem.toLowerCase() == 'additional work stock' || alreadyAddCodeSel) {
                        cus.setEnabled(false)
                        vendor.setEnabled(false)
                        storageLoc.setEnabled(false)
                        storageLoc.setValue('151A')
                    } else {
                        cus.setEnabled(true)
                        vendor.setEnabled(true)
                        storageLoc.setEnabled(true)
                    }
                })

                plant.attachBrowserEvent('change', autoFillStorage)
                addWorkCode.attachBrowserEvent('change', autoFillStorage)
                stockType.attachBrowserEvent('click', vendorInput)
                // goBtn.attachPress(that.onClickOfGo, that)
            }, 3000)

        },
        getCustomAppStateDataExtension: function (oCustomData) {
            var aStockTypeKey = [],
                sFlag = true;
            var aFilterData = this.byId("listReportFilter").getFilters();
            // var otokenA001 = new sap.m.Token({
            //     key: "A001",
            //     text: "Staging (A001)"
            // });
            // var otokenA002 = new sap.m.Token({
            //     key: "A002",
            //     text: "Staging 2 (A002)"
            // });
            // var otokenA003 = new sap.m.Token({
            //     key: "A003",
            //     text: "Staging 3 (A003)"
            // });
            // var otokenA004 = new sap.m.Token({
            //     key: "A004",
            //     text: "Staging 4 (A004)"
            // });
            if (aFilterData.length > 0) {
                for (var p = 0; p < aFilterData[0].aFilters.length; p++) {
                    if (aFilterData[0].aFilters[0].sPath === "stock_type") {
                        aStockTypeKey.push(aFilterData[0].aFilters);
                        if (aStockTypeKey[0].length > 0) {
                            for (var a = 0; a < aStockTypeKey[0].length; a++) {
                                if (aStockTypeKey[0][a].oValue1 === "Additional Work Stock") {
                                    sFlag = false;
                                    this.byId("listReportFilter-filterItemControl_BASIC-LGORT").setEditable(false);
                                    this.byId("listReportFilter-filterItemControl_BASIC-kunnr").setEditable(false);
                                    this.byId("listReportFilter-filterItemControl_BASIC-lifnr").setEditable(false);
                                    this.byId("listReportFilter-filterItemControl_BASIC-kunnr").destroyTokens();
                                    this.byId("listReportFilter-filterItemControl_BASIC-lifnr").destroyTokens();
                                    return;
                                } else {
                                    sFlag = true;
                                }
                            }
                        }
                    }
                    if (aFilterData[0].aFilters[0].sPath === undefined) {
                        if (aFilterData[0].aFilters[p].aFilters[0].sPath === "stock_type") {
                            aStockTypeKey.push(aFilterData[0].aFilters[p].aFilters);
                            if (aStockTypeKey[0].length > 0) {
                                for (var a = 0; a < aStockTypeKey[0].length; a++) {
                                    if (aStockTypeKey[0][a].oValue1 === "Additional Work Stock") {
                                        sFlag = false;
                                        this.byId("listReportFilter-filterItemControl_BASIC-LGORT").setEditable(false);
                                        this.byId("listReportFilter-filterItemControl_BASIC-kunnr").setEditable(false);
                                        this.byId("listReportFilter-filterItemControl_BASIC-lifnr").setEditable(false);
                                        this.byId("listReportFilter-filterItemControl_BASIC-kunnr").destroyTokens();
                                        this.byId("listReportFilter-filterItemControl_BASIC-lifnr").destroyTokens();
                                        return;
                                    } else {
                                        sFlag = true;
                                    }
                                }

                            }
                        }
                    }
                }
                if (sFlag == true) {
                    this.byId("listReportFilter-filterItemControl_BASIC-LGORT").setEditable(true);
                    this.byId("listReportFilter-filterItemControl_BASIC-lifnr").setEditable(true);
                    this.byId("listReportFilter-filterItemControl_BASIC-kunnr").setEditable(true);
                }
            } else {
                this.byId("listReportFilter-filterItemControl_BASIC-LGORT").setEditable(true);
                this.byId("listReportFilter-filterItemControl_BASIC-lifnr").setEditable(true);
                this.byId("listReportFilter-filterItemControl_BASIC-kunnr").setEditable(true);
                return;
            }
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                if (oCustomData.stock_type) {
                    var oComboBox = this.oView.byId("custStockTypeFilterId");
                    oComboBox.setSelectedKey(
                        oCustomData.stock_type
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function (oEvent) {
            console.log('called')
            let filterFields = this.byId('listReportFilter')._aFields;

            let plantSID, storageLocSID, addWorkCodeSID, stockTypeSID, vendorSID,
                matNoSID, matTypeSID, salesDocNoSID, salesDocIemSID, linkNoSID, cusSID;

            filterFields.forEach(e => {
                if (e.fieldName == 'LGORT') storageLocSID = e.control.sId;
                else if (e.fieldName == 'WERKS') plantSID = e.control.sId;
                else if (e.fieldName == 'atwkc') addWorkCodeSID = e.control.sId;
                else if (e.fieldName == 'stock_type') stockTypeSID = e.control.sId;
                else if (e.fieldName == 'lifnr') vendorSID = e.control.sId;
                else if (e.fieldName == 'MATNR') matNoSID = e.control.sId;
                else if (e.fieldName == 'vbeln') salesDocNoSID = e.control.sId;
                else if (e.fieldName == 'MTART') matTypeSID = e.control.sId;
                else if (e.fieldName == 'posnr') salesDocIemSID = e.control.sId;
                else if (e.fieldName == 'linkno') linkNoSID = e.control.sId;
                else if (e.fieldName == 'kunnr') cusSID = e.control.sId;
            });

            let plant = this.byId(plantSID)
            let storageLoc = this.byId(storageLocSID)
            let stockType = this.byId(stockTypeSID)
            let addWorkCode = this.byId(addWorkCodeSID)

            let selectedStockType = stockType.getSelectedKeys().join(' ');
            let isselected = selectedStockType.includes('Additional Work Stock');
            let plantData = plant.getValue();
            let storageLocData = storageLoc && storageLoc.getTokens() && storageLoc.getTokens().length > 0 ? storageLoc.getTokens() : storageLoc.getValue();
            let addWorkData = addWorkCode.getTokens()
            if (addWorkData.length == 0) addWorkData = addWorkCode.getValue()

            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};

            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("stock_type");
                if (addWorkData.length > 0 && !isselected) {
                    MessageBox.warning("Please select Addtional Work Stock", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            MessageToast.show("Action selected: " + sAction);
                        }
                    });
                    oBindingParams.filters.push(new Filter("Supplier", "EQ", "SAP13232"));
                }
            }

        }
    };
});