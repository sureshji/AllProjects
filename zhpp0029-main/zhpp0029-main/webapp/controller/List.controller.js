sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, BusyIndicator, MessageToast, Filter, Fragment, ResourceModel, MessageBox, JSONModel) {
        "use strict";

        return Controller.extend("com.yokogawa.zhpp0029.controller.List", {
            onInit: function () {
                var i18nModel = new ResourceModel({
                    bundleName: "com.yokogawa.zhpp0029.i18n.i18n"
                });
                this.getView().setModel(i18nModel, "i18n");
                var oSmartTable = this.getView().byId("LineItemsSmartTable");
                if (oSmartTable) {
                    // oSmartTable.attachBeforeRebindTable(function(oEvent1) {
                    //     // debugger;
                    //     // this.getView().byId("LineItemsSmartTable").rebindTable(true);
                    // }.bind(this));
                }

                var oSmartFilterBar = this.getView().byId("smartFilterBar");
                oSmartFilterBar.attachEvent("filterChange", this.oFilterChangeEvent);

                var oCustomModel = new JSONModel({
                    oDeliveryDateEntered: '',
                    oApprovedFinishDateEntered: '',
                    oSalesOrderEntered: '',
                    oLinkageNumberEntered: '',
                    oProjectDefinitionEntered: '',
                    oMandatoryCheck: ''


                });

                this.getView().setModel(oCustomModel, "oCustomModel");

            },

            statusText: function (sMsg, sStatus) {
                if (sStatus === "Failed") {
                    MessageToast.show(sMsg);
                }
                return sMsg;
            },

            oFilterChangeEvent: function (oEvent) {
                var oChangedField = oEvent.mParameters.mParameters.filterChangeReason;
                if (!oChangedField) {
                    var ids = oEvent.mParameters.mParameters.id.split('-');
                    oChangedField = ids[ids.length - 1];
                }


                if (oChangedField == 'PRDAT') {
                    //    var oDateEntered =   oEvent.mParameters.getSource().getProperty('_semanticFormValue') ;
                    if (oEvent.getSource().getFilterData().hasOwnProperty('PRDAT')) {
                        oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oApprovedFinishDateEntered", 'X');
                        // if (oEvent.getSource().getFilterData().PRDAT.ranges[0].operation == 'EQ') {
                        var oDateEntered = oEvent.getSource().getFilterData().PRDAT;
                    // } else {
                        // oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oApprovedFinishDateEntered", '');
                        // if (oEvent.getSource().getFilterData().PRDAT.ranges[0].operation == 'BT') {
                        // var oDateEntered = oEvent.getSource().getFilterData().PRDAT.ranges[0].value2;
                        // }
                                    
                    var oTodaysDate = new Date();

                    if (oDateEntered < new Date(oTodaysDate.getFullYear(), oTodaysDate.getMonth(), oTodaysDate.getDate())) {
                        MessageBox.error(oEvent.getSource().getParent().getModel("i18n").getResourceBundle().getText("DateIsInThePast"));
                        oEvent.mParameters.getSource().setValueState("Error");
                        return;
                    } else {
                        oEvent.mParameters.getSource().setValueState("None")
                    }

                    if (oDateEntered.toDateString().slice(0, 3) === sap.m.getLocaleData().getDays("abbreviated")[0] || oDateEntered.toDateString().slice(0, 3) === sap.m.getLocaleData().getDays("abbreviated")[6]) {
                        MessageBox.error(oEvent.getSource().getParent().getModel("i18n").getResourceBundle().getText("DateIsInTheWeekends"));
                        oEvent.mParameters.getSource().setValueState("Error");
                        return;
                    } else {
                        oEvent.mParameters.getSource().setValueState("None");
                    }
                } else {
                    oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oApprovedFinishDateEntered", '');
                    oEvent.mParameters.getSource().setValueState("None")
                }



            } else {
                if(oChangedField == 'EDATU') {
            if (oEvent.getSource().getFilterData().hasOwnProperty('EDATU')) {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oDeliveryDateEntered", 'X');
            } else {

                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oDeliveryDateEntered", '');
            }

        }
        if (oChangedField == 'VBELN') {
            if (oEvent.getSource().getFilterData().hasOwnProperty('VBELN')) {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oSalesOrderEntered", 'X');
            } else {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oSalesOrderEntered", '');
            }

        }

        if (oChangedField == 'ZZG_LINKNO') {
            if (oEvent.getSource().getFilterData().hasOwnProperty('ZZG_LINKNO')) {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oLinkageNumberEntered", 'X');
            } else {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oLinkageNumberEntered", '');
            }
        }

        if (oChangedField == 'ZZG_LINKNO' || oChangedField == 'PRJD' ||
            oChangedField == 'VBELN' || oChangedField == 'DISPO' ||
            oChangedField == 'VKBUR_ANA' || oChangedField == 'MATNR' ||
            oChangedField == 'ERDAT' || oChangedField == 'MBDAT' ||
            oChangedField == 'VKGRP_ANA') {
            if ((oEvent.getSource().getFilterData().hasOwnProperty('ZZG_LINKNO') ||
                oEvent.getSource().getFilterData().hasOwnProperty('PRJD') ||
                oEvent.getSource().getFilterData().hasOwnProperty('VBELN') ||
                oEvent.getSource().getFilterData().hasOwnProperty('DISPO') ||
                oEvent.getSource().getFilterData().hasOwnProperty('VKBUR_ANA') ||
                oEvent.getSource().getFilterData().hasOwnProperty('MATNR') ||
                oEvent.getSource().getFilterData().hasOwnProperty('ERDAT') ||
                oEvent.getSource().getFilterData().hasOwnProperty('MBDAT') ||
                oEvent.getSource().getFilterData().hasOwnProperty('VKGRP_ANA'))) {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oMandatoryCheck", 'X');
            } else {
                oEvent.getSource().getParent().getModel("oCustomModel").setProperty("/oMandatoryCheck", '');
            }
        }

    }

            },

    oSelectionTypeChange: function (oEvent) {
        //Enable Disable - Only one Field out of Project Def and Linkage Number

        if (oEvent.getSource().getSelectedKey() == "1") {
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setEnabled(true);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setRequired(true);
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setEnabled(false);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setRequired(false);
        } else {
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setEnabled(true);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setRequired(true);
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setEnabled(false);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setRequired(false);
        }

    },

    onPressGoBtn: function (oEvent) {
        var oValidScenario = '';
        var oDeliveryDateEntered = oEvent.getSource().getParent().getModel("oCustomModel").getProperty("/oDeliveryDateEntered");
        var oApprovedFinishDateEntered = oEvent.getSource().getParent().getModel("oCustomModel").getProperty("/oApprovedFinishDateEntered");
        var oSalesOrderEntered = oEvent.getSource().getParent().getModel("oCustomModel").getProperty("/oSalesOrderEntered");
        var oLinkageNumberEntered = oEvent.getSource().getParent().getModel("oCustomModel").getProperty("/oLinkageNumberEntered");
        var oProjectDefinitionEntered = oEvent.getSource().getParent().getModel("oCustomModel").getProperty("/oProjectDefinitionEntered");
        var oMandatoryCheck = oEvent.getSource().getParent().getModel("oCustomModel").getProperty("/oMandatoryCheck");

        if (oDeliveryDateEntered == 'X' && oSalesOrderEntered == '' && oLinkageNumberEntered == '' &&  oProjectDefinitionEntered == '' ){
            try {
                throw ('Error');
            } catch (oError) {
                MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MandateFields"));
                return;
            }
        }


        if (oMandatoryCheck !== 'X') {
            try {
                throw ('Error');
            } catch (oError) {
                MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NoInputEntered"));
                return;
            }

        }

        if (oDeliveryDateEntered == 'X' && oApprovedFinishDateEntered == 'X') {
            try {
                throw ('Error');
            } catch (oError) {
                MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("DateErrorDelivery_Approve"));
                return;
            }
        }

        if (oDeliveryDateEntered == 'X' && (oSalesOrderEntered == '' || oSalesOrderEntered == undefined) && (oLinkageNumberEntered == '' || oLinkageNumberEntered == undefined) && (oProjectDefinitionEntered == '' || oProjectDefinitionEntered == undefined)) {
            // Check whether Sales Order is entered or not
            try {
                throw ('Error');
            } catch (oError) {
                MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MandateFields"));
                return;
            }

        }

        // if (this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").getRequired()) {
        // var oPRJD = this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").getTokens();
        // if (oPRJD.length < 1) {
        //     MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NoInputEntered"));
        //     try {
        //         throw ('Error');
        //     } catch (oError) {
        //         MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NoInputEntered"));
        //         return;
        //     }

        // } else {
        //     oValidScenario = 'X';
        // }
        // } else {
        //     if (this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").getRequired()) {
        //         var oLinkage = this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").getTokens();
        //         if (oLinkage.length < 1) {
        //             // MessageToast.show(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("MandateFields"));
        //             try {
        //                 throw ('Error');
        //             } catch (oError) {
        //                 MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NoInputEntered"));
        //                 return;
        //             }


        //         } else {
        //             oValidScenario = 'X';
        //         }
        //     }
        // }

        // if (oValidScenario == 'X') {
        //     // Project Definition or Linkage Number is entered
        // } else {

        //     var oSalesOrder = this.getView().byId("smartFilterBar-filterItemControl_BASIC-VBELN").getTokens();
        //     if (oSalesOrder.length < 1) {
        //         try {
        //             throw ('Error');
        //         } catch (oError) {
        //             MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NoInputEntered"));
        //             return;
        //         }
        //     }
        // }

        // var oRequestedDeliverDateSimulationEntered = 

    },

    onBeforeRendering: function (oEvent) {
        this.count = 0;
        this.getOwnerComponent().getModel().setDeferredGroups(['changes', 'GroupId']);
        this.getOwnerComponent().getModel().setUseBatch(true);
        var oModel = this.getView().getModel("currentUserModel");
        var oData = {
            "current_value": "",
            "materialAvailableDate": "",
            "deliveryDate": "",
            "specified_finishDate": "",
            "ZZG_LINKNO": "",
            "VKORG": "",
            "VBELN": "",
            "POSNR": "",
            "ApproverDetails": ""
        };

        oModel.setData(oData);
    },

    onSmartFilterBarInitialize: function (oEvent) {
        if (this.getView().byId("SelectionTypeComboBoxId").getSelectedKey() == "1") {
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setEnabled(true);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setRequired(true);
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setEnabled(false);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setRequired(false);
        } else {
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setEnabled(true);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-ZZG_LINKNO").setRequired(true);
            this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setEnabled(false);
            // this.getView().byId("smartFilterBar-filterItemControl_BASIC-PRJD").setRequired(false);
        }
    },

    onAfterRendering: function (oEvent) {

    },

    oPressExecuteButton: function (oEvent) {
        var that = this;
        var oAnyRowSelected = this.getView().byId("LineItemsSmartTable").getTable().getSelectedIndices();
        if (oAnyRowSelected.length == 0) {
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("AtleastOneRow"));
            return;
        } else {
            // Validate whether date has been entered or not
            var sCombinedOrderExist = false;
            for (let i = 0; i < oAnyRowSelected.length; i++) {
                let j = oAnyRowSelected[i];
                var oUploadedSpecInputDate = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(j).getObject().UASFD;
                var oDeliveryDateRequested = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(j).getObject().EDATU_REQ;
                var oCombinedOrderInsSign = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(j).getObject().CMBOS;
                if (oCombinedOrderInsSign === "X") {
                    sCombinedOrderExist = true;
                } else {
                    sCombinedOrderExist = false;
                }
                if ((oUploadedSpecInputDate == null || oUploadedSpecInputDate == undefined || oUploadedSpecInputDate == "") &&
                    (oDeliveryDateRequested == null || oDeliveryDateRequested == undefined || oDeliveryDateRequested == "")) {
                    var oErrorRow = j + 1;
                    // MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("DateInputIsRequired", [oErrorRow]));
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ApproveSpecFinishDateIsRequired"));
                    return;
                }
            }
        }
        //Defaulting Pop Up
        if (sCombinedOrderExist) {
            MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("CombinedOrderExists"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction == 'OK') {
                        var oDefaultValueForInputField = that.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(0).getObject().CURRENT_USER_DETAILS;
                        that.getView().getModel("currentUserModel").setProperty("/ApproverDetails", oDefaultValueForInputField);
                        if (!that.oApproverDetailsExecutePopUp) {
                            that.oApproverDetailsExecutePopUp = Fragment.load({
                                name: "com.yokogawa.zhpp0029.fragments.ApproverDetailsExecute",
                                controller: that
                            }).then(function (oDialog) {
                                that.getView().addDependent(oDialog);
                                that.oApproverDetailsExecuteDialog = oDialog;
                                oDialog.open();
                            }.bind(that));
                        } else {
                            that.oApproverDetailsExecuteDialog.open();
                        }
                    }
                }
            });
        } else {
            var oDefaultValueForInputField = that.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(0).getObject().CURRENT_USER_DETAILS;
            that.getView().getModel("currentUserModel").setProperty("/ApproverDetails", oDefaultValueForInputField);
            if (!that.oApproverDetailsExecutePopUp) {
                that.oApproverDetailsExecutePopUp = Fragment.load({
                    name: "com.yokogawa.zhpp0029.fragments.ApproverDetailsExecute",
                    controller: that
                }).then(function (oDialog) {
                    that.getView().addDependent(oDialog);
                    that.oApproverDetailsExecuteDialog = oDialog;
                    oDialog.open();
                }.bind(that));
                this.oApproverDetailsExecuteDialog.open();
            }
        }
    },

    onApproverOnExecuteFromPopUp: function (oEvent) {
        var oApproverDetails = this.getView().getModel("currentUserModel").getProperty("/ApproverDetails");
        var that = this;
        var oSelectedIndices = this.getView().byId("TableInsideSmartTableId").getSelectedIndices();

        this.getView().byId("TableInsideSmartTableId").getModel().updateBindings(true);
        this.oApproverDetailsExecuteDialog.close();
        for (let i = 0; i < oSelectedIndices.length; i++) {
            let j = oSelectedIndices[i];
            var oCurrentObject = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(j).getObject();
            oCurrentObject = this.oDateFormatting(oCurrentObject);
            oCurrentObject.TYPEOFMODE = 'E';
            this.getOwnerComponent().getModel().create("/Execute", oCurrentObject, {
                groupId: "GroupId",
                urlParameters: {
                    ZZG_LINKNO: "'" + oCurrentObject.ZZG_LINKNO + "'",
                    PRJD: "'" + oCurrentObject.PRJD + "'",
                    SEQNO: "'" + oCurrentObject.SEQNO + "'",
                    VKORG: "'" + oCurrentObject.VKORG + "'",
                    CURRENT_USER_DETAILS: "'" + oApproverDetails + "'",
                    UASFD: "datetime'" + oCurrentObject.UASFD + "'"
                },
                success: function (res) {
                },
                error: function (oError) {

                }
            })
        }
        this.getOwnerComponent().getModel().submitChanges({
            groupId: "GroupId",
            success: function (res) {
                that.count++;
                BusyIndicator.hide();
                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ApproverDetailsUpdateMessage"));
                if (res.__batchResponses[2].response != undefined) {
                    if (res.__batchResponses[2].response.statusCode == '400' || res.__batchResponses[2].response.statusCode == 400) {
                        //Error
                        MessageToast.show(res.__batchResponses[2].message);
                        return;
                    }
                }
                var oResponseFromBackEnd = res.__batchResponses[2].data.results;
                if (oResponseFromBackEnd.length > 0) {

                    for (let i = 0; i < oResponseFromBackEnd.length; i++) {
                        var oDynamicKey_ZZG_LT_APUSR = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZG_LT_APUSR";
                        that.getView().getModel().setProperty(oDynamicKey_ZZG_LT_APUSR, oResponseFromBackEnd[i].ZZG_LT_APUSR);

                        var oDynamicKey_ZZG_PRD_EDAT = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZG_PRD_EDAT";
                        that.getView().getModel().setProperty(oDynamicKey_ZZG_PRD_EDAT, oResponseFromBackEnd[i].ZZG_PRD_EDAT);

                        var oDynamicKey_ZZG_LT_APDAT = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZG_LT_APDAT";
                        that.getView().getModel().setProperty(oDynamicKey_ZZG_LT_APDAT, oResponseFromBackEnd[i].ZZG_LT_APDAT);

                        var oDynamicKey_MESSAGE = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/MESSAGE";
                        that.getView().getModel().setProperty(oDynamicKey_MESSAGE, oResponseFromBackEnd[i].MESSAGE);

                        var oDynamicKey_CRITICALITY = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/CRITICALITY";
                        that.getView().getModel().setProperty(oDynamicKey_CRITICALITY, oResponseFromBackEnd[i].CRITICALITY);

                        var oDynamicKey_OVERALL_STATUS = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/OVERALL_STATUS";
                        that.getView().getModel().setProperty(oDynamicKey_OVERALL_STATUS, oResponseFromBackEnd[i].OVERALL_STATUS);

                    }

                }
                that.getView().byId("LineItemsSmartTable").rebindTable(true);
            },
            error: function (oError) {
                BusyIndicator.hide();
                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ApproverDetailsUpdateFailedMessage"));
            }
        });
    },

    oPressApproveStatusSpecChange: function (oEvent) {
        var oAnyRowSelected = this.getView().byId("LineItemsSmartTable").getTable().getSelectedIndices();
        if (oAnyRowSelected.length == 0) {
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("AtleastOneRow"));
            return;
        }
        //Defaulting Pop Up
        var oDefaultValueForInputField = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(0).getObject().CURRENT_USER_DETAILS;
        this.getView().getModel("currentUserModel").setProperty("/ApproverDetails", oDefaultValueForInputField);
        if (!this.oApproveStatusSpecChangePopUp) {
            this.oApproveStatusSpecChangePopUp = Fragment.load({
                name: "com.yokogawa.zhpp0029.fragments.ApproverDetailsSpecChange",
                controller: this
            }).then(function (oDialog) {
                this.getView().addDependent(oDialog);
                this.oApproveStatusSpecChangeDialog = oDialog;
                oDialog.open();
            }.bind(this));
        } else {
            this.oApproveStatusSpecChangeDialog.open();
        }
    },

    onCheckBoxSelect: function (oEvent) {

    },

    onApproverOnSpecChangeFromPopUp: function (oEvent) {
        var oApproverDetails = this.getView().getModel("currentUserModel").getProperty("/ApproverDetails");
        var that = this;
        var oSelectedIndices = this.getView().byId("TableInsideSmartTableId").getSelectedIndices();
        this.getView().byId("TableInsideSmartTableId").getModel().updateBindings(true);
        var oTodaysDate = new Date();
        this.oApproveStatusSpecChangeDialog.close();
        for (let i = 0; i < oSelectedIndices.length; i++) {
            let j = oSelectedIndices[i];
            var oCurrentObjectContext = this.getView().byId("TableInsideSmartTableId")._getRowContexts()[j];
            var oCurrentObject = this.getView().getModel().getObject(oCurrentObjectContext.sPath);
            try {
                if (oTodaysDate > oCurrentObject.UASFD) {
                    throw (this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("DateIsInThePast"));

                }
            } catch (oError) {
                MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("DateIsInThePast"));
                return;
            };
            this.getOwnerComponent().getModel().create("/Specchange", oCurrentObject, {
                groupId: "GroupId",
                urlParameters: {
                    ZZG_LINKNO: "'" + oCurrentObject.ZZG_LINKNO + "'",
                    CURRENT_USER_DETAILS: "'" + oApproverDetails + "'",
                    VKORG: "'" + oCurrentObject.VKORG + "'",
                    SEQNO: "'" + oCurrentObject.SEQNO + "'",
                    PRJD: "'" + oCurrentObject.PRJD + "'"
                },
                success: function (res) {
                    // that.count++;
                    // BusyIndicator.hide();
                    // MessageToast.show('Approver updates are Successfull');
                    // console.log(that.count);
                },
                error: function (oError) {
                    // BusyIndicator.hide();
                    // MessageToast.show('Approver updates are Failed');
                }
            });
        }

        this.getOwnerComponent().getModel().submitChanges({
            groupId: "GroupId",
            success: function (res) {
                // that.count++;
                BusyIndicator.hide();
                if (res.__batchResponses[2].response != undefined) {
                    if (res.__batchResponses[2].response.statusCode == '400' || res.__batchResponses[2].response.statusCode == 400) {
                        //Error
                        MessageToast.show(res.__batchResponses[2].message);
                        return;
                    }
                }
                var oResponseFromBackEnd = res.__batchResponses[2].data.results;
                if (oResponseFromBackEnd.length > 0) {
                    for (let i = 0; i < oResponseFromBackEnd.length; i++) {
                        var oDynamicKey_ZZ1_SPCAPPROVERSTATUS_SDI = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZ1_SPCAPPROVERSTATUS_SDI";
                        that.getView().getModel().setProperty(oDynamicKey_ZZ1_SPCAPPROVERSTATUS_SDI, oResponseFromBackEnd[i].ZZ1_SPCAPPROVERSTATUS_SDI);

                        var oDynamicKey_ZZ1_SPCAPPROVERDATE_SDI = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZ1_SPCAPPROVERDATE_SDI";
                        that.getView().getModel().setProperty(oDynamicKey_ZZ1_SPCAPPROVERDATE_SDI, oResponseFromBackEnd[i].ZZ1_SPCAPPROVERDATE_SDI);

                        var oDynamicKey_ZZ1_SPCAPPROVER_SDI = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZ1_SPCAPPROVER_SDI";
                        that.getView().getModel().setProperty(oDynamicKey_ZZ1_SPCAPPROVER_SDI, oResponseFromBackEnd[i].ZZ1_SPCAPPROVER_SDI);

                        var oDynamicKey_MESSAGE = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/MESSAGE";
                        that.getView().getModel().setProperty(oDynamicKey_MESSAGE, oResponseFromBackEnd[i].MESSAGE);

                        var oDynamicKey_CRITICALITY = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/CRITICALITY";
                        that.getView().getModel().setProperty(oDynamicKey_CRITICALITY, oResponseFromBackEnd[i].CRITICALITY);

                        var oDynamicKey_OVERALL_STATUS = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/OVERALL_STATUS";
                        that.getView().getModel().setProperty(oDynamicKey_OVERALL_STATUS, oResponseFromBackEnd[i].OVERALL_STATUS);
                    }
                }

                that.getView().byId("LineItemsSmartTable").rebindTable(true);
                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ApproverDetailsUpdateMessage"));

                console.log(that.count);
            },
            error: function (oError) {
                BusyIndicator.hide();
                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ApproverDetailsUpdateFailedMessage"));

            }
        });
    },

    DeliveryDatePopUpButtonInTableRow: function (oEvent) {
        var ZZG_LINKNO = oEvent.getSource().getParent().getBindingContext().getObject().ZZG_LINKNO;
        var VKORG = oEvent.getSource().getParent().getBindingContext().getObject().VKORG;
        var VBELN = oEvent.getSource().getParent().getBindingContext().getObject().VBELN;
        var POSNR = oEvent.getSource().getParent().getBindingContext().getObject().POSNR;
        this.oCurrentObject = oEvent.getSource().getParent().getBindingContext().getObject();
        this.getView().getModel("currentUserModel").setProperty("/ZZG_LINKNO", ZZG_LINKNO);
        this.getView().getModel("currentUserModel").setProperty("/VKORG", VKORG);
        this.getView().getModel("currentUserModel").setProperty("/VBELN", VBELN);
        this.getView().getModel("currentUserModel").setProperty("/POSNR", POSNR);
        if (!this.oDeliveryDatePopUp) {
            this.oDeliveryDatePopUp = Fragment.load({
                name: "com.yokogawa.zhpp0029.fragments.DeliveryDateSimulation",
                controller: this
            }).then(function (oDialog) {
                this.getView().addDependent(oDialog);
                this.oDialog = oDialog;
                oDialog.open();
            }.bind(this));
        } else {
            this.oDialog.open();
        }


    },

    onDeliveryDateSimulationFromPopUp: function (oEvent) {
        // Simulation --> need to call back end Action
        var that = this;
        var oCurrentObject = this.oCurrentObject;
        var oDeliveryDate = this.getView().getModel("currentUserModel").getProperty("/deliveryDate");
        var oMaterialAvailableDate = this.getView().getModel("currentUserModel").getProperty("/materialAvailableDate");

        if (oDeliveryDate != "" && oDeliveryDate != null && oMaterialAvailableDate != "" && oMaterialAvailableDate != null) {
            // Both should not be given as Input
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("BothDatesEntered"));
            return;
        } else if ((oDeliveryDate == "" || oDeliveryDate == null) && (oMaterialAvailableDate == "" || oMaterialAvailableDate == null)) {
            // Nothing has been entered
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("NoDateEntered"));
            return;
        }

        oCurrentObject = this.oDateFormatting(oCurrentObject);
        var oPopupDatesObject = {};
        oPopupDatesObject.oDeliveryDate = oDeliveryDate;
        oPopupDatesObject.oMaterialAvailableDate = oMaterialAvailableDate;
        if (oPopupDatesObject.oMaterialAvailableDate == "" || oPopupDatesObject.oMaterialAvailableDate == null || oPopupDatesObject.oMaterialAvailableDate == undefined) {
            oPopupDatesObject.oMaterialAvailableDate = new Date(1970);
        } else {
            oPopupDatesObject.oDeliveryDate = new Date(1970);
        }
        oPopupDatesObject = this.oDateFormatting(oPopupDatesObject);


        this.oDialog.close();
        this.getOwnerComponent().getModel().create("/Deliverydatesimulation", oCurrentObject, {
            groupId: "GroupId",
            urlParameters: {
                ZZG_LINKNO: "'" + oCurrentObject.ZZG_LINKNO + "'",
                EDATU_REQ: "datetime'" + oPopupDatesObject.oDeliveryDate + "'",
                MBDAT_REQ: "datetime'" + oPopupDatesObject.oMaterialAvailableDate + "'",
                VKORG: "'" + oCurrentObject.VKORG + "'",
                SEQNO: "'" + oCurrentObject.SEQNO + "'",
                PRJD: "'" + oCurrentObject.PRJD + "'"
            },
            success: function (res) {
            },
            error: function (oError) {
                // BusyIndicator.hide();
                // MessageToast.show('Approver updates are Failed');
            }
        })
        this.getOwnerComponent().getModel().submitChanges({
            groupId: "GroupId",
            success: function (res) {
                // that.count++;
                BusyIndicator.hide();
                if (res.__batchResponses[2].response != undefined) {
                    if (res.__batchResponses[2].response.statusCode == '400' || res.__batchResponses[2].response.statusCode == 400) {
                        //Error
                        MessageToast.show(res.__batchResponses[2].message);
                        return;
                    }
                }

                var oResponseFromBackEnd = res.__batchResponses[2].data.results;
                if (oResponseFromBackEnd.length > 0) {
                    for (let i = 0; i < oResponseFromBackEnd.length; i++) {
                        var oDynamicKey_EDATU_SIM = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/EDATU_SIM";
                        that.getView().getModel().setProperty(oDynamicKey_EDATU_SIM, oResponseFromBackEnd[i].EDATU_SIM);

                        var oDynamicKey_MBDAT_SIM = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/MBDAT_SIM";
                        that.getView().getModel().setProperty(oDynamicKey_MBDAT_SIM, oResponseFromBackEnd[i].MBDAT_SIM);

                        var oDynamicKey_UASFD = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/UASFD";
                        that.getView().getModel().setProperty(oDynamicKey_UASFD, oResponseFromBackEnd[i].UASFD);

                        var oDynamicKey_MESSAGE = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/MESSAGE";
                        that.getView().getModel().setProperty(oDynamicKey_MESSAGE, oResponseFromBackEnd[i].MESSAGE);

                        var oDynamicKey_CRITICALITY = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/CRITICALITY";
                        that.getView().getModel().setProperty(oDynamicKey_CRITICALITY, oResponseFromBackEnd[i].CRITICALITY);

                        var oDynamicKey_OVERALL_STATUS = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/OVERALL_STATUS";
                        that.getView().getModel().setProperty(oDynamicKey_OVERALL_STATUS, oResponseFromBackEnd[i].OVERALL_STATUS);


                    }
                }

                that.getView().byId("LineItemsSmartTable").rebindTable(true);
                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("SimulationSuccess"));

            },
            error: function (oError) {
                BusyIndicator.hide();
                MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("SimulationFailed"));
            }
        });



    },

    oDateFormatting: function (oCurrentObject) {
        if (oCurrentObject.EDATU_REQ != null && oCurrentObject.EDATU_REQ != "") {
            var oMonth_EDATU_REQ = oCurrentObject.EDATU_REQ.getMonth();
            if (oMonth_EDATU_REQ > 8) {
                oMonth_EDATU_REQ = (oMonth_EDATU_REQ + 1);
            } else {
                oMonth_EDATU_REQ = "0" + (oMonth_EDATU_REQ + 1);
            }

            var oDay_EDATU_REQ = oCurrentObject.EDATU_REQ.getDate();
            if (oDay_EDATU_REQ < 10) {
                oDay_EDATU_REQ = "0" + oDay_EDATU_REQ;
            }

            oCurrentObject.EDATU_REQ = oCurrentObject.EDATU_REQ.getFullYear() + "-" + oMonth_EDATU_REQ + "-" + oDay_EDATU_REQ;
            oCurrentObject.EDATU_REQ = oCurrentObject.EDATU_REQ + "T00:00:00";
        }
        if (oCurrentObject.MBDAT_REQ != null && oCurrentObject.MBDAT_REQ != "") {
            var oMonth_MBDAT_REQ = oCurrentObject.MBDAT_REQ.getMonth();
            if (oMonth_MBDAT_REQ > 8) {
                oMonth_MBDAT_REQ = (oMonth_MBDAT_REQ + 1);
            } else {
                oMonth_MBDAT_REQ = "0" + (oMonth_MBDAT_REQ + 1);
            }

            var oDay_MBDAT_REQ = oCurrentObject.MBDAT_REQ.getDate();
            if (oDay_MBDAT_REQ < 10) {
                oDay_MBDAT_REQ = "0" + oDay_MBDAT_REQ;
            }

            oCurrentObject.MBDAT_REQ = oCurrentObject.MBDAT_REQ.getFullYear() + "-" + oMonth_MBDAT_REQ + "-" + oDay_MBDAT_REQ;
            oCurrentObject.MBDAT_REQ = oCurrentObject.MBDAT_REQ + "T00:00:00";
        }
        if (oCurrentObject.oDeliveryDate != null && oCurrentObject.oDeliveryDate != "") {
            var oMonth_oDeliveryDate = oCurrentObject.oDeliveryDate.getMonth();
            if (oMonth_oDeliveryDate > 8) {
                oMonth_oDeliveryDate = (oMonth_oDeliveryDate + 1);
            } else {
                oMonth_oDeliveryDate = "0" + (oMonth_oDeliveryDate + 1);
            }

            var oDay_oDeliveryDate = oCurrentObject.oDeliveryDate.getDate();
            if (oDay_oDeliveryDate < 10) {
                oDay_oDeliveryDate = "0" + oDay_oDeliveryDate;
            }

            oCurrentObject.oDeliveryDate = oCurrentObject.oDeliveryDate.getFullYear() + "-" + oMonth_oDeliveryDate + "-" + oDay_oDeliveryDate;
            oCurrentObject.oDeliveryDate = oCurrentObject.oDeliveryDate + "T00:00:00";
        }

        if (oCurrentObject.oMaterialAvailableDate != null && oCurrentObject.oMaterialAvailableDate != "") {
            var oMonth_oMaterialAvailableDate = oCurrentObject.oMaterialAvailableDate.getMonth();
            if (oMonth_oMaterialAvailableDate > 8) {
                oMonth_oMaterialAvailableDate = (oMonth_oMaterialAvailableDate + 1);
            } else {
                oMonth_oMaterialAvailableDate = "0" + (oMonth_oMaterialAvailableDate + 1);
            }

            var oDay_oMaterialAvailableDate = oCurrentObject.oMaterialAvailableDate.getDate();
            if (oDay_oMaterialAvailableDate < 10) {
                oDay_oMaterialAvailableDate = "0" + oDay_oMaterialAvailableDate;
            }

            oCurrentObject.oMaterialAvailableDate = oCurrentObject.oMaterialAvailableDate.getFullYear() + "-" + oMonth_oMaterialAvailableDate + "-" + oDay_oMaterialAvailableDate;
            oCurrentObject.oMaterialAvailableDate = oCurrentObject.oMaterialAvailableDate + "T00:00:00";
        }

        ///
        if (oCurrentObject.UASFD != null && oCurrentObject.UASFD != "") {
            var oMonth_UASFD = oCurrentObject.UASFD.getMonth();
            if (oMonth_UASFD > 8) {
                oMonth_UASFD = (oMonth_UASFD + 1);
            } else {
                oMonth_UASFD = "0" + (oMonth_UASFD + 1);
            }

            var oDay_UASFD = oCurrentObject.UASFD.getDate();
            if (oDay_UASFD < 10) {
                oDay_UASFD = "0" + oDay_UASFD;
            }

            oCurrentObject.UASFD = oCurrentObject.UASFD.getFullYear() + "-" + oMonth_UASFD + "-" + oDay_UASFD;
            oCurrentObject.UASFD = oCurrentObject.UASFD + "T00:00:00";
        }


        return oCurrentObject;
    },

    onCancelDeliveryDateSimulationFromPopUp: function (oEvent) {
        this.oDialog.close();
    },

    onBeforeRebindTable: function (oEvent) {



        var oSmartTable = oEvent.getSource();
        var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
        var oBindingParams = oEvent.getParameter("bindingParams");
        oBindingParams.parameters = oBindingParams.parameters || {};
        var oSelectionTypeCustomControl = oSmartFilterBar.getControlByKey("SelectionTypeComboBoxKey");
        var oSelectionTypeCustomControlValue = oSelectionTypeCustomControl.getSelectedKey();

        var oCustomControl = oSmartFilterBar.getControlByKey("CustomFilterKey");

        var oLeadTimeRequired = oCustomControl.getSelected();
        switch (oLeadTimeRequired) {
            case true:
                oBindingParams.filters.push(new Filter("SLT_F", "EQ", "Y"));
                break;
            case false:
                oBindingParams.filters.push(new Filter("SLT_F", "EQ", "N"));
                break;
            default:
                break;
        }
    },

    onCancelOnSpecChangeFromPopUp: function (oEvent) {
        this.oApproveStatusSpecChangeDialog.close();
    },


    onCancelOnExecuteFromPopUp: function (oEvent) {
        this.oApproverDetailsExecuteDialog.close();
    },

    oPressAllClearButton: function (oEvent) {
        var that = this;
        var oNumberOfRecordsPresentInTable = this.getView().byId("LineItemsSmartTable").getTable()._iBindingLength;
        if (oNumberOfRecordsPresentInTable > 0) {
            var oApproverDetails = this.getView().getModel("currentUserModel").getProperty("/ApproverDetails");
            for (let i = 0; i < oNumberOfRecordsPresentInTable; i++) {
                let j = i;
                var oCurrentObject = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(j).getObject();
                if (oApproverDetails == null || oApproverDetails == "" || oApproverDetails == undefined) {
                    oApproverDetails = oCurrentObject.CURRENT_USER_DETAILS;
                }

                oCurrentObject.TYPEOFMODE = 'A';
                this.getOwnerComponent().getModel().create("/Execute", oCurrentObject, {
                    groupId: "GroupId",
                    urlParameters: {
                        ZZG_LINKNO: "'" + oCurrentObject.ZZG_LINKNO + "'",
                        PRJD: "'" + oCurrentObject.PRJD + "'",
                        SEQNO: "'" + oCurrentObject.SEQNO + "'",
                        VKORG: "'" + oCurrentObject.VKORG + "'",
                        CURRENT_USER_DETAILS: "'" + oApproverDetails + "'",
                        TYPEOFMODE: "'" + "A" + "'"

                    },
                    success: function (res) {
                    },
                    error: function (oError) {

                    }
                })
            }
            this.getOwnerComponent().getModel().submitChanges({
                groupId: "GroupId",
                success: function (res) {
                    that.count++;
                    BusyIndicator.hide();
                    MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ApproverDetailsUpdateMessage"));
                    if (res.__batchResponses[2].response != undefined) {
                        if (res.__batchResponses[2].response.statusCode == '400' || res.__batchResponses[2].response.statusCode == 400) {
                            //Error
                            MessageToast.show(res.__batchResponses[2].message);
                            return;
                        }
                    }
                    var oResponseFromBackEnd = res.__batchResponses[2].data.results;
                    if (oResponseFromBackEnd.length > 0) {

                        for (let i = 0; i < oResponseFromBackEnd.length; i++) {
                            var oDynamicKey_ZZG_LT_APUSR = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZG_LT_APUSR";
                            that.getView().getModel().setProperty(oDynamicKey_ZZG_LT_APUSR, oResponseFromBackEnd[i].ZZG_LT_APUSR);

                            var oDynamicKey_ZZG_PRD_EDAT = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZG_PRD_EDAT";
                            that.getView().getModel().setProperty(oDynamicKey_ZZG_PRD_EDAT, oResponseFromBackEnd[i].ZZG_PRD_EDAT);

                            var oDynamicKey_ZZG_LT_APDAT = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/ZZG_LT_APDAT";
                            that.getView().getModel().setProperty(oDynamicKey_ZZG_LT_APDAT, oResponseFromBackEnd[i].ZZG_LT_APDAT);

                            var oDynamicKey_MESSAGE = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/MESSAGE";
                            that.getView().getModel().setProperty(oDynamicKey_MESSAGE, oResponseFromBackEnd[i].MESSAGE);

                            var oDynamicKey_CRITICALITY = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/CRITICALITY";
                            that.getView().getModel().setProperty(oDynamicKey_CRITICALITY, oResponseFromBackEnd[i].CRITICALITY);

                            var oDynamicKey_OVERALL_STATUS = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/OVERALL_STATUS";
                            that.getView().getModel().setProperty(oDynamicKey_OVERALL_STATUS, oResponseFromBackEnd[i].OVERALL_STATUS);

                            var oDynamicKey_UASFD = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oResponseFromBackEnd[i].ZZG_LINKNO + "'," + "PRJD='" + oResponseFromBackEnd[i].PRJD + "'," + "SEQNO='" + oResponseFromBackEnd[i].SEQNO + "'," + "VKORG='" + oResponseFromBackEnd[i].VKORG + "')/UASFD";
                            that.getView().getModel().setProperty(oDynamicKey_UASFD, oResponseFromBackEnd[i].UASFD);


                        }

                    }
                    that.getView().byId("LineItemsSmartTable").rebindTable(true);
                },
                error: function (oError) {
                    BusyIndicator.hide();
                    MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ApproverDetailsUpdateFailedMessage"));
                }
            });

        }
        // for (let i = 0; i < oNumberOfRecordsPresentInTable; i++) {
        //     var oCurrentObject = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(i).getObject();
        //     var oDynamicKey_UASFD = "/ZCDSEHSDC0017(ZZG_LINKNO='" + oCurrentObject.ZZG_LINKNO + "'," + "PRJD='" + oCurrentObject.PRJD + "'," + "SEQNO='" + oCurrentObject.SEQNO + "'," + "VKORG='" + oCurrentObject.VKORG + "')/UASFD";
        //     this.getView().getModel().setProperty(oDynamicKey_UASFD, null);
        // }



    },

    onFilterChange: function (oEvent) {

        if (oEvent.mParameters.mParameters.filterChangeReason == 'PRDAT') {
            var oApprovedSpecDateInputFilterScreen = oEvent.mParameters.oSource.mProperties._semanticFormValue;
        }

    },

    oPressSalesOrderDisplay: function (oEvent) {
        var oAnyRowSelected = this.getView().byId("LineItemsSmartTable").getTable().getSelectedIndices();
        if (oAnyRowSelected.length == 0) {
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("AtleastOneRow"));
            return;
        } else {
            if (oAnyRowSelected.length > 1) {
                MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("MoreRowsSelected"));
                return;
            }
            var oSalesDocument = this.getView().byId("LineItemsSmartTable").getTable().getContextByIndex(oAnyRowSelected[0]).getObject().VBELN;
            // var oCrossAppNavigator = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");
            // var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
            //     target: {
            //         semanticObject: "SalesDocument",
            //         action: "display"
            //     },
            //     params: {
            //         "SalesDocument": oSalesDocument
            //     }
            // })) || ""; // generate the Hash to display a Supplier
            // oCrossAppNavigator.toExternal({
            //     target: {
            //         shellHash: hash
            //     }
            // }); 
            var oExternalNav = sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oService) {

                oService.hrefForExternalAsync({
                    target: {
                        semanticObject: "SalesDocument",
                        action: "display"
                    },
                    params: {
                        "SalesDocument": oSalesDocument
                    }
                }).then(function (sHref) {
                    // Place sHref somewhere in the DOM
                    debugger;
                    var url = window.location.href.split('#')[0] + sHref;
                    //Navigate to second app
                    sap.m.URLHelper.redirect(url, true);
                });
            });

        }

    }
        });
    });
