sap.ui.define([
    "sap/ui/model/Filter", 
    "sap/ui/comp/smartfilterbar/SmartFilterBar", 
    "sap/m/ComboBox",
	"sap/m/MessageBox"
], function (Filter, SmartFilterBar, ComboBox,MessageBox) {
    "use strict";
    return {
        onInit:function(){
            this.selectedBar = 0;
            this.deletionCB1 = 0;
            this.deletionCB2 = 0;
            this.deletionCB3 = 0;
            this.getView().byId("listReportFilter").setShowClearOnFB(true);
            this.getOwnerComponent().getModel("ZSRVBHCM0001").setSizeLimit(2000);
            this.byId("listReportFilter").attachFilterChange(this.onChangePlant.bind(this));
        },
        onAfterRendering:function(){
            this.getView().byId("listReportFilter").setShowClearOnFB(true);
        },
        onSelectionChange:function(oEvent){
            var cbSelectedKey = oEvent.getSource().getSelectedItem().getProperty("key");
            if(cbSelectedKey === "matnr"){
                this.getView().byId("Material").setVisible(true);
                this.getView().byId("template::IconTabFilter-0").setVisible(true);
                this.getView().byId("template::IconTabFilter-1").setVisible(false);
                this.selectedBar = 0;
            }
            else{
                this.selectedBar = 1;
                this.getView().byId("Material").setVisible(true);
                this.getView().byId("template::IconTabFilter-0").setVisible(false);
                this.getView().byId("template::IconTabFilter-1").setVisible(true);
            }
        },
        getCustomAppStateDataExtension: function (oCustomData) {
            if (oCustomData) {
                var oCustomField1 = this.oView.byId("SelectOption");
                if (oCustomField1) {
                    oCustomData.SelectOption = oCustomField1.getSelectedKey();
                }
            }
            var oGlobalFilter = this.getView().byId("listReportFilter");
            if (this.getView().byId("idSelectOption").getSelectedKey() === "matnr") this.getView().byId("template::IconTabFilter-1").setVisible(false);
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            if (oCustomData) {
                if (oCustomData.SelectOption) {
                    var oComboBox = this.oView.byId("SelectOption");
                    oComboBox.setSelectedKey(
                        oCustomData.SelectOption
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function(oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};
            var that = this;
            // setTimeout(function () {
            //     if(that.selectedBar === 0) that.getView().byId("listReport-0-knobj").setVisible(false);
            //     else that.getView().byId("listReport-1-knobj").setVisible(false);
            // }, 2000);
            
            oBindingParams.sorter.push(new sap.ui.model.Sorter("matnr", false)); 
            oBindingParams.sorter.push(new sap.ui.model.Sorter("plnal", false));
            oBindingParams.sorter.push(new sap.ui.model.Sorter("plnfl", false));
            oBindingParams.sorter.push(new sap.ui.model.Sorter("vornr", false));
            if(this.selectedBar === Number(oEvent.getParameter("id").charAt(oEvent.getParameter("id").length-1))){
                this.getView().byId("template::IconTabBar").setExpanded(true);
                var oSmartTable = this.getView().byId("GridTable-0");  
            }
            else{
                this.getView().byId("template::IconTabBar").setExpanded(false);
            }
            if(this.deletionCB3 === 0 ){
                oBindingParams.filters.push(new Filter("delete_opr", "EQ", "true"));
                oBindingParams.filters.push(new Filter("delete_opr", "EQ", "false"));
            }
            else  oBindingParams.filters.push(new Filter("delete_opr", "EQ", "true"));
            if(this.deletionCB2 === 0){
                oBindingParams.filters.push(new Filter("delkz", "EQ", "true"));
                oBindingParams.filters.push(new Filter("delkz", "EQ", "false"));
            }
            else  oBindingParams.filters.push(new Filter("delkz", "EQ", "true"));
            if(this.deletionCB1 === 0){
                oBindingParams.filters.push(new Filter("loekz", "EQ", "true"));
                oBindingParams.filters.push(new Filter("loekz", "EQ", "false"));
            }
            else oBindingParams.filters.push(new Filter("loekz", "EQ", "true"));
        },
        onDeletionChange1:function(oEvent){
            if(oEvent.getSource().getSelectedItem()) {
                var cbSelectedKey = oEvent.getSource().getSelectedItem().getProperty("key");
                if(cbSelectedKey === "yesNo"){
                    this.deletionCB1 = 0;
                }
                else{
                    this.deletionCB1 = 1;
                }
            }
            else{
                this.deletionCB1 = 0;
            }
        },
        onDeletionChange2:function(oEvent){
            if(oEvent.getSource().getSelectedItem()) {
                var cbSelectedKey = oEvent.getSource().getSelectedItem().getProperty("key");
                if(cbSelectedKey === "yesNo"){
                    this.deletionCB2 = 0;
                }
                else{
                    this.deletionCB2 = 1;
                }
            }
            else{
                this.deletionCB2 = 0;
            }
        },
        onDeletionChange3:function(oEvent){
            if(oEvent.getSource().getSelectedItem()) {
                var cbSelectedKey = oEvent.getSource().getSelectedItem().getProperty("key");
                if(cbSelectedKey === "yesNo"){
                    this.deletionCB3 = 0;
                }
                else{
                    this.deletionCB3 = 1;
                }
            }
            else{
                this.deletionCB3 = 0;
            }
        },
        onChangePlant: function (oEvent) {
            var parameters = oEvent.getParameters();
            if(oEvent.getSource()._oClearButtonOnFB._buttonPressed !== false){
                this.getView().byId("_IDGenComboBox1").setSelectedKey("yesNo");
                this.getView().byId("_IDGenComboBox2").setSelectedKey("yesNo");
                this.getView().byId("_IDGenComboBox3").setSelectedKey("yesNo");
            }
            else if (parameters && parameters.getParameter("id").includes("werks")) {
                var id = parameters.getParameter("id");
                var oFilters = [];
                var tokens = this.byId(id).getProperty("value").match(/\(([^)]+)\)/)[1];
                if (tokens.length > 0) {
                    oFilters.push(new Filter("Plant", "EQ", tokens));
                    var that = this;
                    this.getOwnerComponent().getModel("ZSRVBHCM0001").read("/plant", {
                        filters: oFilters,
                        success: function (res) {
                            var message = "";
                                var found = res.results.filter(function (object) {
                                    return object.Plant === tokens;
                                });
                                if (!found || found.length === 0) {
                                    message += "You are not authorized to plant " + tokens + "\n";
                                    that.byId(id).setValue();
                                }
                            if (message !== "") {
                                MessageBox.error(message);
                            }
                        }
                    });
                }
            }
        },

    };
});