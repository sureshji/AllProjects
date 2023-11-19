sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/m/MessageBox',
    // 'sap/m/MessageToast',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/core/Fragment",
    "sap/ui/core/Core",
    "sap/ui/core/library"
], function (Controller, MessageBox, Filter, FilterOperator, Fragment, Core, CoreLibrary) {
    'use strict'
    var ValueState = CoreLibrary.ValueState,
        sFlag;

    return Controller.extend('com.yokogawa.zhmm0016.controller.SelectionPage', {
        onInit: function () {
            sFlag = true;
            // var date = new Date();
            // this.ValidOnDate = this.byId("idValidOn").setValue(date);
            var bwModel = this.getOwnerComponent().getModel('s4');
            var oModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModel, "oModel");
            var that = this;
            //that.byId("idValidOn").setValue(new Date);
            bwModel.read("/I_MaterialStdVH", {
                urlParameters: {
                    "$top": "2000",
                    "$skip": "0",
                },
                success: function (oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    oModel.setProperty("/MaterialData", oData.results);
                },
                error: function (mResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(mResponse.message);

                }
            });
            //var oSalesOrganizationModel = new sap.ui.model.json.JSONModel();
            bwModel.read("/C_SalesDocSalesOrganizationVH", {
                success: function (oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    oModel.setProperty("/SalesOrganizationData", oData.results);
                },
                error: function (mResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(mResponse.message);

                }
            });

            // var oDischanneModel = new sap.ui.model.json.JSONModel();
            bwModel.read("/C_Dischannelvaluehelp", {
                success: function (oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    oModel.setProperty("/DischanneData", oData.results);
                },
                error: function (mResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(mResponse.message);
                }
            });

            // var oPlantModel = new sap.ui.model.json.JSONModel();
            bwModel.read("/I_PlantStdVH", {
                success: function (oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    oModel.setProperty("/PlantData", oData.results);
                },
                error: function (mResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(mResponse.message);

                }
            });

            // var oLanguageModel = new sap.ui.model.json.JSONModel();
            bwModel.read("/I_Language", {
                success: function (oData, oResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    oModel.setProperty("/LanguageData", oData.results);
                },
                error: function (mResponse) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(mResponse.message);

                }
            });
        },
        onExecuteButtonPress: function (oEvent) {
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "ZSEM_ZHMMR00003",
                    action: "display"
                },
                params: {}
            })) || "";
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            });
        },
        onBeforeRendering: function () {
            this.getView().getModel('zhmm0016').setData({
                MaterialNumber: '',
                SalesOrganization: '',
                Plant: '',
                DistributionChannel: '',
                ValidOn: '',//new Date(),
                LanguageKey: '',
                RSP: '1'
            })
        },
        onValueHelpDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Material", FilterOperator.Contains, sValue);
            var bwModel = this.getOwnerComponent().getModel('s4');
            var that = this;
            bwModel.read("/I_MaterialStdVH", {
                urlParameters: {
                    "$top": "2000",
                    "$skip": "0",
                },
                filters: [oFilter],
                success: function (oData, oResponse) {
                    let temp = []
                    oData.results.map((v, i) => {
                        temp.push({
                            Material: v.Material,
                            Material_Text: v.Material_Text
                        })
                    })
                    let oModel = that.getView().getModel("oModel");
                    oModel.setProperty("/MaterialData", temp)
                },
                error: function (mResponse) {
                }
            });
        },
        onSalesOrganizationValueHelpDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("SalesOrganization", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        onDistributionChannelValueHelpDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("DistributionChannel", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        onPlantValueHelpDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("Plant", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        onLanguageKeyValueHelpDialogSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("LanguageISOCode", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        onMaterialValueHelpRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();
            oView.destroyDependents();
            this._pValueHelpDialog = null;
            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: 'com.yokogawa.zhmm0016.view.fragment.MaterialValueHelp',
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // oDialog.getBinding("items").filter([new Filter("Material", FilterOperator.Contains, sInputValue)]);
                oDialog.open(sInputValue);
            });
        },
        onValueHelpDialogClose: function (oEvent) {
            var sDescription,
                sSelectedKey,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sSelectedKey = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();

            this.byId("idMaterialNumber").setValue(sSelectedKey);

        },
        onSalesOrganizationValueHelpRequest: function (oEvent) {
            var oView = this.getView();
            oView.destroyDependents();
            this._pSalesOrganizationValueHelpDialog = null;
            if (!this._pSalesOrganizationValueHelpDialog) {
                this._pSalesOrganizationValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.yokogawa.zhmm0016.view.fragment.SalesOrgValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pSalesOrganizationValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding
                // oDialog.getBinding("items").filter([new Filter("A4ZCPIF0186CASE_NO", FilterOperator.Contains, sInputValue)]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });
        },
        onSalesOrganizationValueHelpDialogClose: function (oEvent) {
            var sDescription,
                sSelectedKey,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sSelectedKey = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();

            this.byId("idSalesOrganization").setValue(sSelectedKey);

        },
        onDistributionChannelValueHelpRequest: function (oEvent) {
            var oView = this.getView();
            oView.destroyDependents();
            this._pDistributionChannelValueHelpDialog = null;
            if (!this._pDistributionChannelValueHelpDialog) {
                this._pDistributionChannelValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.yokogawa.zhmm0016.view.fragment.DistChannelValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pDistributionChannelValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding
                //  oDialog.getBinding("items").filter([new Filter("A4ZCPIF0186CASE_NO", FilterOperator.Contains, sInputValue)]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });
        },
        onDistributionChannelValueHelpDialogClose: function (oEvent) {
            var sDescription,
                sSelectedKey,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sSelectedKey = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();

            this.byId("idDistributionChannel").setValue(sSelectedKey);

        },
        onPlantValueHelpRequest: function (oEvent) {
            var oView = this.getView();
            oView.destroyDependents();
            this._pPlantValueHelpDialog = null;
            if (!this._pPlantValueHelpDialog) {
                this._pPlantValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.yokogawa.zhmm0016.view.fragment.PlantValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pPlantValueHelpDialog.then(function (oDialog) {
                oDialog.open();
            });
        },
        onPlantValueHelpDialogClose: function (oEvent) {
            var sDescription,
                sSelectedKey,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sSelectedKey = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();

            this.byId("idPlant").setValue(sSelectedKey);

        },
        onLanguageKeyValueHelpRequest: function (oEvent) {
            var oView = this.getView();
            oView.destroyDependents();
            this._pLanguageKeyValueHelpDialog = null;
            if (!this._pLanguageKeyValueHelpDialog) {
                this._pLanguageKeyValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.yokogawa.zhmm0016.view.fragment.LanguageKeyValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pLanguageKeyValueHelpDialog.then(function (oDialog) {
                // Create a filter for the binding
                //  oDialog.getBinding("items").filter([new Filter("A4ZCPIF0186CASE_NO", FilterOperator.Contains, sInputValue)]);
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });
        },
        onLanguageKeyValueHelpDialogClose: function (oEvent) {
            var sDescription,
                sSelectedKey,
                oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);

            if (!oSelectedItem) {
                return;
            }

            sSelectedKey = oSelectedItem.getTitle();
            sDescription = oSelectedItem.getDescription();

            this.byId("idLanguageKey").setValue(sSelectedKey);

        },
        handleChange: function (oEvent) {
            var oDP = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            if (bValid) {
                oDP.setValueState(ValueState.None);
                sFlag = true;
            } else {
                oDP.setValueState(ValueState.Error);
                sFlag = false;
            }
        },

        onGoExecuteButtonPress: async function (oEvent) {
            let oView = this.getView();
            let oResourceBundle = oView.getModel('i18n').getResourceBundle();
            let oData = oView.getModel('zhmm0016').getData();

            if (oData.MaterialNumber === '' || oData.ValidOn === '' || oData.LanguageKey === '' || oData.RSP === '') {
                MessageBox.error(oResourceBundle.getText('ERROR_MISSING_MANDATORY_FIELDS'))
                return
            }
            if (sFlag) {
                let oValidOnDate = new Date(oData.ValidOn)
                let aFilters_S4 = [
                    new Filter({ path: 'MaterialNumber', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                    new Filter({ path: 'SalesOrganization', operator: FilterOperator.EQ, value1: oData.SalesOrganization }),
                    new Filter({ path: 'DistributionChannel', operator: FilterOperator.EQ, value1: oData.DistributionChannel }),
                    new Filter({ path: 'Plant', operator: FilterOperator.EQ, value1: oData.Plant }),
                    new Filter({ path: 'ValidOn', operator: FilterOperator.EQ, value1: new Date(oData.ValidOn) }),
                    new Filter({ path: 'LanguageKey', operator: FilterOperator.EQ, value1: oData.LanguageKey }),
                    new Filter({ path: 'RSP', operator: FilterOperator.EQ, value1: oData.RSP })
                ]
                let aContent = [{
                    sPath: '/ZCDSEHMMC0030',
                    aFilters: aFilters_S4
                }]
                const oData_S4 = await this._getReadPromise(oView.getModel('s4'), aContent).then(response => {
                    console.log("response ", response)
                    let result = response.__batchResponses && response.__batchResponses.length > 0 && response.__batchResponses[0].data.results && response.__batchResponses[0].data.results.length > 0 ? response.__batchResponses[0].data.results[0] : {};
                    let messageId = result.MessageId
                    let messageText = result.MessageText
                    if (messageText != '') {
                        MessageBox.error(oResourceBundle.getText(messageText))
                    } else {
                        // sap.ui.core.BusyIndicator.show()
                        this.getOwnerComponent().getRouter().navTo('RouteObjectPage')
                    }

                }).catch(error => {
                    console.log("Fetch data fails ", error)
                    alert(JSON.stringify(error))
                    MessageBox.error(JSON.stringify(error))
                })

                // oSelectionData = oData_S4.__batchResponses[0]
                // oSelectionData.Table = oData_S4.__batchResponses[0]
            } else {
                MessageBox.error('Please input a valid date');
            }

        },
        _getReadPromise: function (oModel, aContent) {
            return new Promise(function (resolve, reject) {
                let sGroup = jQuery.sap.uid()

                oModel.setDeferredGroups([sGroup])

                aContent.forEach(o => {
                    oModel.read(o.sPath, {
                        groupId: sGroup,
                        filters: o.aFilters
                    })
                })

                oModel.submitChanges({
                    groupId: sGroup,
                    success: function (oResponse) {
                        resolve(oResponse)
                    },
                    error: function (oError) {
                        reject(oError)
                    }
                })
            })
        }

    })
})