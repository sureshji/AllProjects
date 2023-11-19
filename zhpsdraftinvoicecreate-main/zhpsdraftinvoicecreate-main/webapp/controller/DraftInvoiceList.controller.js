sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/Fragment",
    'sap/ui/model/type/String',
    'sap/m/Token',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, TypeString, Token) {
        "use strict";

        return Controller.extend("com.yokogawa.zhpsdraftinvoicecreate.controller.DraftInvoiceList", {
            onInit: function () {
                this.oColModel = new JSONModel(sap.ui.require.toUrl("com/yokogawa/zhpsdraftinvoicecreate/model") + "/columnsModel.json");
                this.oProjModel = new JSONModel(sap.ui.require.toUrl("com/yokogawa/zhpsdraftinvoicecreate/model") + "/projectDefModel.json");
                this.oS4Model = this.getOwnerComponent().getModel("ZSRVBHHR0001");
                // this.getView().setModel(this.oS4Model);
            },
             /**
	        * Event handle for on selection change
	        * @param {sap.ui.base.Event} oEvent oEvent core event base object
	        */	
              onSelectList: function(oEvent){

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                
                var aSelectedPaths = oEvent.getSource().getSelectedContextPaths();
                var sSelectedPath = aSelectedPaths[0];
                var oDataModel = this.getView().getModel();


                oRouter.navTo("RouteDraftInvoiceDisplay", {
                    sPath : sSelectedPath.substr(1), 
                    companyCode: "" ,
                    projectID: "" ,
                    dateFrom: "" ,
                    dateTo: ""                                            
                });

            },
            onCreate: function () {
                if (!this._oInvoiceHistoryDailogFragment) {
                    // load asynchronous XML fragment
                    this._oInvoiceHistoryDailogFragment = sap.ui.xmlfragment("InvoiceHistorySelectionDialog",
                        "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.InvoiceCreateDialog", this);
                    this.getView().addDependent(this._oInvoiceHistoryDailogFragment);
                }
                // this._onInitializeSalesRateEditDialog(oModelData);
                this._oInvoiceHistoryDailogFragment.open();
                // this.getOwnerComponent().getRouter().navTo("RouteSalesRateRegistration");
            },
            onCancelCreateDialog: function () {
                this._oInvoiceHistoryDailogFragment.close();
                this._oInvoiceHistoryDailogFragment.destroy();
            },
            onCreateInvoice: function () {
                if (!this._validateBeforeSave()) {
                    return;
                }
                var companyCode = sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idCompanyCode").getValue();
                var projectID = sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idProjectID").getValue();
                var dateRange = sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idDate").getValue();
                var date = dateRange.split(" - ");
                var dateFrom = date[0]; 
                dateFrom = dateFrom.replace("/","-");
                dateFrom = dateFrom.replace("/","-");
                var dateTo = date[1];
                dateTo = dateTo.replace("/","-");
                dateTo = dateTo.replace("/","-");
                this.getOwnerComponent().getRouter().navTo("RouteDraftInvoiceCreate", {
                    companyCode: companyCode,
                    projectID: projectID,
                    dateFrom: dateFrom,
                    dateTo: dateTo                     
                })
            },
            onValueHelpRequested: function() {
                var aCols = this.oColModel.getData().cols;
    
                Fragment.load({
                    name: "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.CompanyCodeSearchHelp",
                    controller: this
                }).then(function name(oFragment) {
                    this._oValueHelpDialog = oFragment;
                    this.getView().addDependent(this._oValueHelpDialog);

                    this._oValueHelpDialog.setRangeKeyFields([{
                        label: "Company Code",
                        key: "CompanyCode",
                        type: "string",
                        typeInstance: new TypeString({}, {
                            maxLength: 7
                        })
                    }]);
    
    
                    this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                        oTable.setModel(this.oS4Model);
                        oTable.setModel(this.oColModel, "columns");
    
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", "/CompanyCode");
                        }
                        
    
                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/CompanyCode", function () {
                                return new ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new Label({ text: "{" + column.template + "}" });
                                    })
                                });
                            });
                        }
    
                        this._oValueHelpDialog.update();
                    }.bind(this));
                    
                    var oToken = new Token();
                    // oToken.setKey(this._oInputCompanyCode.getSelectedKey());
                    // oToken.setText(this._oInputCompanyCode.getValue());
                    // this._oValueHelpDialog.setTokens([oToken]);
                    this._oValueHelpDialog.open();
                }.bind(this));
    
            },
            onValueHelpRequestedProject: function() {
                var aCols = this.oProjModel.getData().cols;
    
                Fragment.load({
                    name: "com.yokogawa.zhpsdraftinvoicecreate.view.fragments.ProjectDefinitionSearchHelp",
                    controller: this
                }).then(function name(oFragment) {
                    this._oValueHelpDialogProject = oFragment;
                    this.getView().addDependent(this._oValueHelpDialogProject);
    
                    this._oValueHelpDialogProject.getTableAsync().then(function (oTable) {
                        oTable.setModel(this.oS4Model);
                        oTable.setModel(this.oProjModel, "columns");
    
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", "/Project");
                        }
                        var companyCode = sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idCompanyCode").getValue();
                        if (companyCode !== "") {
                            var oFilter = new sap.ui.model.Filter("vbukr", "EQ", companyCode);
                            if (oTable.bindRows) {
                                oTable.getBinding("rows").filter(oFilter);
                            }

                            if (oTable.bindItems) {
                                oTable.getBinding("items").filter(oFilter);
                            }
                        }
    
                        if (oTable.bindItems) {
                            oTable.bindAggregation("items", "/Project", function () {
                                return new ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        return new Label({ text: "{" + column.template + "}" });
                                    })
                                });
                            });
                        }
    
                        this._oValueHelpDialogProject.update();
                    }.bind(this));
                    var companyCode = sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idCompanyCode").getValue();;
                    sap.ui.getCore().byId("_IDGenInput1").setValue(companyCode);
    
                    var oToken = new Token();
                    // oToken.setKey(this._oInputProjectDef.getSelectedKey());
                    // oToken.setText(this._oInputProjectDef.getValue());
                    // this._oValueHelpDialogProject.setTokens([oToken]);
                    this._oValueHelpDialogProject.open();
                }.bind(this));
    
            },
            onFilterBarSearchProject: function (oEvent) {
                // var sSearchQuery = this._oBasicSearchField.getValue(),
                    var aSelectionSet = oEvent.getParameter("selectionSet");
                    var operator;
                   var value;
                 var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        var val = oControl.getValue();
                        if (val.includes("*")) {
                            var splitVal = val.split('*');
                            value = splitVal[0]; 
                            operator = "StartsWith";
                        } else {
                            operator = "Contains";
                            value = oControl.getValue();
                        }

                        
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: operator,
                            value1: value
                        }));
                    }
     
                     return aResult;
                 }, []);
     
                 this._filterTableProject(new Filter({
                     filters: aFilters,
                     and: true
                 }));
             },
             _filterTableProject: function (oFilter) {
                var _oValueHelpDialogProject = this._oValueHelpDialogProject;
    
                _oValueHelpDialogProject.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(oFilter);
                    }
    
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(oFilter);
                    }
    
                    _oValueHelpDialogProject.update();
                });
            },
            onValueHelpOkPressProject: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
    
                if (aTokens.length > 0) {
                    sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idProjectID").setValue(aTokens[0].getKey());
                }
                // this.getView().byId("idProjecttext").setText(aTokens[0].getText());
                this._oValueHelpDialogProject.close();
                this._oValueHelpDialogProject.destroy();
            },
            onValueHelpCancelPressProject: function () {
                this._oValueHelpDialogProject.close();
                this._oValueHelpDialogProject.destroy();
            },
    
            onValueHelpAfterCloseProject: function () {
                this._oValueHelpDialogProject.destroy();
            },
            onValueHelpOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
    
                if (aTokens.length > 0) {
                    // this._oInputCompanyCode.setValue(aTokens[0].getKey());
                    sap.ui.core.Fragment.byId("InvoiceHistorySelectionDialog", "idCompanyCode").setValue(aTokens[0].getKey());
                    // sap.ui.getCore().byId("idCompanyCode").setValue(aTokens[0].getKey());
                }
                // sap.ui.getCore().byId("idCompanyCode").setValue(aTokens[0].getText());
                // this.getView().byId("idComapnytext").setText(aTokens[0].getText());
                this._oValueHelpDialog.close();
                this._oValueHelpDialogP.destroy();
            },
            onValueHelpCancelPress: function () {
                this._oValueHelpDialog.close();
                this._oValueHelpDialog.destroy();
            },
    
            onValueHelpAfterClose: function () {
                this._oValueHelpDialog.destroy();
            },
            onFilterBarSearch: function (oEvent) {
                var aSelectionSet = oEvent.getParameter("selectionSet");
                var operator;
                var value;
             var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                 if (oControl.getValue()) {
                     var val = oControl.getValue();
                     if (val.includes("*")) {
                         var splitVal = val.split('*');
                         value = splitVal[0]; 
                         operator = "StartsWith";
                     } else {
                         operator = "Contains";
                         value = oControl.getValue();
                     }

                     
                     aResult.push(new Filter({
                         path: oControl.getName(),
                         operator: operator,
                         value1: value
                     }));
                 }
 
                 return aResult;
             }, []);
 
 
             this._filterTable(new Filter({
                 filters: aFilters,
                 and: true
             }));
         },
 
         _filterTable: function (oFilter) {
             var oValueHelpDialog = this._oValueHelpDialog;
 
             oValueHelpDialog.getTableAsync().then(function (oTable) {
                 if (oTable.bindRows) {
                     oTable.getBinding("rows").filter(oFilter);
                 }
 
                 if (oTable.bindItems) {
                     oTable.getBinding("items").filter(oFilter);
                 }
 
                 oValueHelpDialog.update();
             });
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
        });
    });
