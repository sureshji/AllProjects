sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, Filter, FilterOperator, MessageBox) {
        "use strict";

        return Controller.extend("com.yokogawa.zhmm0012.controller.MaterialCodeProductionLTRef", {
            onInit: function () {
                this.getView().setModel(models.createSuffixParameters(), "LocalSuffixParametersModel");
                this.bindPlant();
                this.getView().setModel(new sap.ui.model.json.JSONModel({ results: [] }), "oModelSelect");
            },

            bindPlant: function(){
                var oModel = this.getOwnerComponent().getModel();
                oModel.setDefaultBindingMode("TwoWay");
                var sPath = this.getOwnerComponent().getModel().createEntry("/ZCDSEHPPC0023", {
                  properties: {
                    Plant : ''
                  }
                });
                this.getView().byId("idSmartForm").setBindingContext(sPath);
                this.getView().byId("idSmartForm").bindElement(sPath.getPath());
            },

            onSuffixConditionAdd: function (oEvent) {
                var oSuffixParametersModel = this.getView().getModel("LocalSuffixParametersModel").getData();
                if (oSuffixParametersModel.suffix.length >= 5) {
                    alert(`Can't add more than 5 suffix `);
                    return;
                }


                oSuffixParametersModel.suffix.push({
                    "suffixLevel": '',
                    "operation": 'EQUAL',
                    "suffixValue": ''
                });

                this.getView().getModel("LocalSuffixParametersModel").setProperty("/isGlobalOperatorEnabled", oSuffixParametersModel.suffix.length <= 1 ? false : true)

                this.getView().getModel("LocalSuffixParametersModel").setProperty('/suffix', oSuffixParametersModel.suffix);

            },

            onSuffixConditionRemove: function (oEvent) {
                var oSuffixParametersModel = this.getView().getModel("LocalSuffixParametersModel").getData();
                oSuffixParametersModel.suffix.pop();
                this.getView().getModel("LocalSuffixParametersModel").setProperty('/suffix', oSuffixParametersModel.suffix);
                this.getView().getModel("LocalSuffixParametersModel").setProperty("/isGlobalOperatorEnabled", oSuffixParametersModel.suffix.length <= 1 ? false : true)

            },
            onOperatorChange: function (oEvent) {
                debugger;
                if (oEvent.getParameters().value == 'AND' || oEvent.getParameters().value == 'OR') {
                    this.byId("_IDGenButton1").setEnabled(true);
                    this.byId("_IDGenButton2").setEnabled(true);
                } else {
                    this.byId("_IDGenButton1").setEnabled(false);
                    this.byId("_IDGenButton2").setEnabled(false);
                }

            },
            onGo: function (oEvent) {
                var oSuffixParametersModel = this.getView().getModel("LocalSuffixParametersModel");
                var sModel = oSuffixParametersModel.getProperty('/model');
                var aTokens = this.getView().byId('InputfieldPlant').getTokens();
                var sPlantData = aTokens.map(function (oToken) {
                    return oToken.getKey();
                }).join(",");
                oSuffixParametersModel.setProperty('/plant', sPlantData);

                if (!sPlantData || !sPlantData.trim()) {
                    MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("enterPlant"));
                    return;
                }

                if (!sModel || !sModel.trim()) {
                    MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("enterModel"));
                    return;
                }

                var suffixData = oSuffixParametersModel.getData().suffix;
                for (const suffix of suffixData) {
                    var isBothFieldsEmpty = true;
                    if (suffix.suffixLevel) {
                        isBothFieldsEmpty = false;
                    }
                    if (suffix.suffixValue) {
                        isBothFieldsEmpty = false;
                    }

                    if (!isBothFieldsEmpty) {
                        if (!(suffix.suffixLevel && suffix.suffixValue)) {
                            MessageBox.error(`Enter both Suffix level/Option Group and Suffix Value/Option-Value.`);
                            return;
                        }
                    }
                }

                var oMaterialTable = this.getView().byId('materialCodeTable');
                var aFilterConditions = [
                    new Filter({ path: "Plant", operator: FilterOperator.EQ, value1: sPlantData }),
                    new Filter({ path: "Model", operator: FilterOperator.EQ, value1: sModel }),
                ];

                for (const suffix of suffixData) {
                    if (suffix.suffixLevel && suffix.suffixValue) {
                        aFilterConditions.push(new Filter({ path: "SuffixLevel", operator: FilterOperator.EQ, value1: suffix.suffixLevel }));
                        aFilterConditions.push(new Filter({ path: "SuffixValue", operator: suffix.operation == "EQUAL" ? FilterOperator.EQ : FilterOperator.NE, value1: suffix.suffixValue }));
                    }
                }

                if (suffixData.length > 1) {
                    var sGlobalOperator = oSuffixParametersModel.getProperty('/globalOperator');
                    aFilterConditions.push(new Filter({ path: "GlobalOperator", operator: FilterOperator.EQ, value1: sGlobalOperator }));
                }

                var filters = new Filter(aFilterConditions, true);
                oMaterialTable._oTable.getBinding().filter(filters, "Application");
            },

            onModelSelection: function (oEvent) {
                var oFilter = new sap.ui.model.Filter("MODEL", 'EQ', oEvent.getSource().getSelectedKey()
                );
                this.getOwnerComponent().getModel().read("/ZTBHT0032", {
                    filters: [oFilter],
                    success: function (oData) {
                        var uniqueRows = [];
                        oData.results.sort((a,b) => a.SUFFIXLEVEL - b.SUFFIXLEVEL);
                        
                        oData.results.forEach(element => {
                            if (uniqueRows.filter(x => x.SUFFIXLEVEL == element.SUFFIXLEVEL).length == 0){
                                uniqueRows.push(element);
                            }
                        });
                        this.getView().getModel("oModelSelect").setProperty("/results", uniqueRows);
                    }.bind(this),
                    error: function (oError) {

                    }.bind(this)
                });
            },
            onCancel : function(){
                this.getView().byId("idSmartForm").unbindElement();
                this.bindPlant();
                this.getView().getModel("LocalSuffixParametersModel").setProperty("/model",'');
                this.getView().getModel("LocalSuffixParametersModel").setProperty("/suffix",[]);
                this.onSuffixConditionAdd();
                this.getView().byId('materialCodeTable').setTableBindingPath("");
                this.getView().byId('materialCodeTable').rebindTable();
            }
        });
    });
