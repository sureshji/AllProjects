sap.ui.define([
    "sap/ui/model/Filter", 
    "sap/ui/comp/smartfilterbar/SmartFilterBar", 
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    return {
        getCustomAppStateDataExtension: function (oCustomData) {
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            if (!this.oCustomData) {
                this.oCustomData = {};
            }
            var oCustomField1 = this.oView.byId("listTypeId");
            if (oCustomData) {
                if (oCustomField1) {
                    this.oCustomData.listType = oCustomField1.getSelectedKey();
                }
            }
            switch (this.oCustomData.listType) {
                case "":
                    var packingId = this.oView.byId("listReportFilter-filterItemControl_BASIC-packingId");
                    packingId.setEnabled(true);
                    var pickstat = this.oView.byId("listReportFilter-filterItemControl_BASIC-pickstat");
                    pickstat.setEnabled(true);
                    var packstat = this.oView.byId("listReportFilter-filterItemControl_BASIC-packstat");
                    packstat.setEnabled(true);
                    break;
                case "0":
                    var packingId = this.oView.byId("listReportFilter-filterItemControl_BASIC-packingId");
                    packingId.destroyTokens();
                    packingId.setEnabled(false);
                    var pickstat = this.oView.byId("listReportFilter-filterItemControl_BASIC-pickstat");
                    pickstat.setEnabled(true);
                    var packstat = this.oView.byId("listReportFilter-filterItemControl_BASIC-packstat");
                    packstat.setEnabled(true);
                    break;
                case "1":
                    var packingId = this.oView.byId("listReportFilter-filterItemControl_BASIC-packingId");
                    packingId.setEnabled(true);
                    var pickstat = this.oView.byId("listReportFilter-filterItemControl_BASIC-pickstat");
                    pickstat.destroyTokens();
                    pickstat.setEnabled(false);
                    var packstat = this.oView.byId("listReportFilter-filterItemControl_BASIC-packstat");
                    packstat.destroyTokens();
                    packstat.setEnabled(false);
                    break;
                default:
            }
        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                if (oCustomData.listType) {
                    var oComboBox = this.oView.byId("listTypeId");
                    oComboBox.setSelectedKey(
                        oCustomData.listType
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function(oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};

            var oSmartTable = oEvent.getSource();
            var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());
            if (oSmartFilterBar instanceof SmartFilterBar) {
                var oCustomControl = oSmartFilterBar.getControlByKey("listType");
                if (oCustomControl instanceof ComboBox) {
                    var vCategory = oCustomControl.getSelectedKey();
                    switch (vCategory) {
                        // case "0" :
                        // 	oBindingParams.filters.push(new Filter("Supplier", "EQ", "SAP"));
                        // 	break;
                        // case "1" :
                        // 	oBindingParams.filters.push(new Filter("Supplier", "EQ", "OTHERS"));
                        // 	break;
                        default:
                            break;
                    }
                }
            }
        }
    };
});