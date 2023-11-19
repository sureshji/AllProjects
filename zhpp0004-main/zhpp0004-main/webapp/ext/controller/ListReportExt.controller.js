sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/comp/smartfilterbar/SmartFilterBar",
    "sap/m/ComboBox"
], function (Filter, SmartFilterBar, ComboBox) {
    "use strict";
    var csrfToken;
    return {
        onInit:function(){
            this.selectedBar = 1;
        },
        onSelectionChange:function(oEvent){
            var cbSelectedKey = oEvent.getSource().getSelectedItem().getProperty("key");
            if(cbSelectedKey === '0'){
                this.getView().byId("template::IconTabFilter-1").setVisible(true);
                this.getView().byId("template::IconTabFilter-2").setVisible(false);
                this.selectedBar = 1;
            }
            else{
                this.selectedBar = 2;
                this.getView().byId("template::IconTabFilter-1").setVisible(false);
                this.getView().byId("template::IconTabFilter-2").setVisible(true);
            }
        },
        getCustomAppStateDataExtension: function (oCustomData) {
            this.getView().byId("listReportFilter").setShowClearOnFB(true);
            //the content of the custom field will be stored in the app state, so that it can be restored later, for example after a back navigation.
            //The developer has to ensure that the content of the field is stored in the object that is passed to this method.
            if (!this.oCustomData) {
                this.oCustomData = {};
            }
            var oCustomField1 = this.oView.byId("ComboProcessId");
            if (oCustomField1) {
                this.oCustomData.process = oCustomField1.getSelectedKey();
            }
            // var plantIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-Plant");
            // plantIP.setVisible(false);
            // var plantLabel = this.oView.byId("listReportFilter-filterItem-___INTERNAL_-Plant");
            // plantLabel.setVisible(false);
            switch (this.oCustomData.process) {
                case "":
                    var poIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-PlannedOrder");
                    poIP.setEnabled(false);
                    var soIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-SalesOrder");
                    soIP.setEnabled(false);
                    var soiIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-SalesOrderItem");
                    soiIP.setEnabled(false);
                    // var tabid = this.oView.byId("template::IconTabFilter-1");
                    // tabid.setVisible(false);
                    // // var tableid1= this.oView.byId("GridTable-1");
                    // // tableid1.setVisible(false);
                    // var tabid2 = this.oView.byId("template::IconTabFilter-2");
                    // tabid2.setVisible(false);
                    // // var tableid2= this.oView.byId("GridTable-2");
                    // // tableid2.setVisible(true);
                    this.byId("idExtendButButton-1").setVisible(true);
                    this.byId("idExtendButButton-2").setVisible(false);
                    break;
                case "0":
                    var poIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-PlannedOrder");
                    poIP.setEnabled(true);
                    var soIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-SalesOrder");
                    soIP.setEnabled(false);
                    var soiIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-SalesOrderItem");
                    soiIP.setEnabled(false);
                    this.getView().byId("template::IconTabFilter-2").setVisible(false);
                    // var tabid = this.oView.byId("template::IconTabFilter-1");
                    // tabid.setVisible(true);
                    // // var tableid1= this.oView.byId("GridTable-1");
                    // // tableid1.setVisible(true);
                    // var tabid2 = this.oView.byId("template::IconTabFilter-2");
                    // tabid2.setVisible(false);
                    // // var tableid2= this.oView.byId("GridTable-2");
                    // // tableid2.setVisible(false);
                    this.byId("idExtendButButton-1").setVisible(true);
                    this.byId("idExtendButButton-2").setVisible(false);
                    break;
                case "1":
                    var soIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-SalesOrder");
                    soIP.setEnabled(true);
                    var soiIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-SalesOrderItem");
                    soiIP.setEnabled(true);
                    var poIP = this.oView.byId("listReportFilter-filterItemControl_BASIC-PlannedOrder");
                    poIP.setEnabled(false);
                    // var tabid = this.oView.byId("template::IconTabFilter-1");
                    // tabid.setVisible(false);
                    // // var tableid1= this.oView.byId("GridTable-1");
                    // // tableid1.setVisible(false);                 
                    // var tabid2 = this.oView.byId("template::IconTabFilter-2");
                    // tabid2.setVisible(true);
                    // // var tableid2= this.oView.byId("GridTable-2");
                    // // tableid2.setVisible(true);                   
                    
                    this.byId("idExtendButButton-1").setVisible(false);
                    this.byId("idExtendButButton-2").setVisible(false);
                    break;
                default:
            }


        },
        restoreCustomAppStateDataExtension: function (oCustomData) {
            //in order to restore the content of the custom field in the filter bar, for example after a back navigation,
            //an object with the content is handed over to this method. Now the developer has to ensure that the content of the custom filter is set to the control
            if (oCustomData) {
                if (oCustomData.process) {
                    var oComboBox = this.oView.byId("ComboProcessId");
                    oComboBox.setSelectedKey(
                        oCustomData.process
                    );
                }
            }
        },
        onBeforeRebindTableExtension: function (oEvent) {
            this.byId("GridTable-1")._getSelectionPlugin().setSelectionMode("MultiToggle");
            var oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.parameters = oBindingParams.parameters || {};
            if(this.selectedBar === Number(oEvent.getParameter("id").charAt(oEvent.getParameter("id").length-1))){
                this.getView().byId("template::IconTabBar").setExpanded(true);
            }
            else{
                this.getView().byId("template::IconTabBar").setExpanded(false);
            }

            var oSmartTable = oEvent.getSource();
            var oSmartFilter = oSmartTable.getSmartFilterId();
            var oSmartFilterBar = this.oView.byId(oSmartFilter);
            var oFilterBar = this.oView.byId("listReportFilter");
            var oFilterBarData = oFilterBar.getFilterData();
            // switch (this.selectedBar) {
            //     case "0":
            //         this.getView().byId("template::IconTabBar").setExpanded(true);
            //         // delete oFilterBarData.SalesOrder;
            //         // delete oFilterBarData.SalesOrderItem;
            //         //oBindingParams.filters.push(new Filter("process", "EQ", "0"));
            //         break;
            //     case "1":
            //         //delete oFilterBarData.PlannedOrder;
            //         //oBindingParams.filters.push(new Filter("process", "EQ", "1"));
            //         this.getView().byId("template::IconTabBar").setExpanded(false);
            //         break;
            //     default:
            // }
            oFilterBar.setFilterData(oFilterBarData);




            // if (oSmartFilterBar instanceof SmartFilterBar) {
            //     var oCustomControl = oSmartFilterBar.getControlByKey("process");
            //     if (oCustomControl instanceof ComboBox) {
            //         var vCategory = oCustomControl.getSelectedKey();
            //         switch (vCategory) {
            //             // case "0" :
            //             // 	oBindingParams.filters.push(new Filter("Supplier", "EQ", "SAP"));
            //             // 	break;
            //             // case "1" :
            //             // 	oBindingParams.filters.push(new Filter("Supplier", "EQ", "OTHERS"));
            //             // 	break;
            //             default:
            //                 break;
            //         }
            //     }
            // }

            //
        },
        onFilterChange: function (oEvent) {
            console.log("test");
        },
        onFilterChangeExtension: function (oEvent) {
            console.log("test");
        },
        onValueChanged: function (oEvent) {
            console.log("test");
        },
        // onBeforeRebindTableExtension: function (oEvent) {
        //     this.byId("GridTable")._getSelectionPlugin().setSelectionMode("MultiToggle");
        //     //this.byId("GridTable-2")._getSelectionPlugin().setSelectionMode("MultiToggle");
        // },
        // getCustomAppStateDataExtension: function (oCustomData) {
        //     var selectedBar = Number(this.getView().byId("template::IconTabBar").getSelectedKey());
        //     if (selectedBar == 1) {
        //         if (this.byId("idExtendButButton-1")) {
        //             this.byId("idExtendButButton-1").setVisible(false);
        //         }
        //     }
        // },
        onAfterRendering: function () {
            var aUrl = $.sap.getModulePath("com.yokogawa.zhpp0004") + "/sap/opu/odata/sap/ZSRVBHPP0002/ZCDSEHPPC0007";
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
                    MessageBox.error(e.statusText);
                }
            });
        },
        onPressExtend: function (oEvent) {
            let aContexts = this.extensionAPI.getSelectedContexts();
            //For Extend the row data
            sap.ui.core.BusyIndicator.show();
            aContexts.forEach(element => {
                let sPath = element.getPath();
                let data = element.getModel().getObject(sPath);
                var aUrl = $.sap.getModulePath("com.yokogawa.zhpp0004") + "/sap/opu/odata/sap/ZSRVBHPP0002/ASSIGN_SERIAL?sap-client=120&PlannedOrder='" + data.PlannedOrder + "'&SalesOrder='" + data.SalesOrder + "'&SalesOrderItem='" + data.SalesOrderItem + "'&componentNumber='" + data.componentNumber + "'";
                $.ajax({
                    url: aUrl,
                    type: 'POST',
                    headers: {
                        'x-csrf-token': csrfToken
                    },
                    contentType: "application/json",
                    success: function (data, success, message) {
                        sap.ui.core.BusyIndicator.hide();
                        // MessageBox.success("Sucess");
                        for (var a = 0; a < data.getElementsByTagName("d:status").length; a++) {
                            var msg_type = data.getElementsByTagName("d:status")[a].textContent;
                            var msg_txt = data.getElementsByTagName("d:StatMessage")[a].textContent;
                            element.getModel().setProperty(sPath + "/status", msg_type);
                            element.getModel().setProperty(sPath + "/StatMessage", msg_txt);
                        }
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error(e.statusText);
                    }
                });
            });
        }
    };
});
