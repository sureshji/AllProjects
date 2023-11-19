sap.ui.define([
    "sap/ui/model/Filter", 
    "sap/ui/comp/smartfilterbar/SmartFilterBar", 
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    return {
        onInit:function(){
            this.uiModel = this.getOwnerComponent().getModel("ui");
            this.uiModel.setData({
                issue: "Set Issue"
            });   
        },

        onChangeIssue:function(oEvent){

        },
  
        onBeforeRebindTableExtension: function(oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};

            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            var oCustomControl = oSmartFilterBar.getControlByKey("issue");
            var vCategory = oCustomControl.getSelectedKey();
            oBindingParams.filters.push(new Filter("issue", "EQ", vCategory)); 
        },
        triggerBackground: function(oEvent) {
        MessageToast.show("Custom handler invoked.");
        }
    };
});