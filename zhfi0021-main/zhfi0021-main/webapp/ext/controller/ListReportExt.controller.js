sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
], function (MessageToast, Filter) {
    'use strict';

    return {
        // onInit: function () {
        //     debugger;
        //     //this.byId("GridTable")._getSelectionPlugin().setSelectionMode("MultiToggle");
        // },
        // onPressPrint: function (oEvent) {
        //     debugger;

        // },
        onBeforeRebindTableExtension: function (oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            var oSmartTable = oEvent.getSource();
            var oSmartFilter = oSmartTable.getSmartFilterId();
            var compCode = this.getView().byId(oSmartFilter).getControlByKey("FIELD4").getTokens();
            var docDate = this.getView().byId(oSmartFilter).getControlByKey("FIELD86").getTokens();
            var businessPlace = this.getView().byId(oSmartFilter).getControlByKey("FIELD87").getTokens();
            var todaysDate = new Date();
            var timeZoneOffSet = todaysDate.getTimezoneOffset();
            var i = 0;
            var aFilters = [];
            if (compCode.length > 0) {
                for (i = 0; i < compCode.length; i++) {
                    aFilters.push(new Filter("FIELD4", "EQ", compCode[i].data("row").CompanyCode));
                }
            }

            if (businessPlace.length > 0) {
                for (i = 0; i < businessPlace.length; i++) {
                    aFilters.push(new Filter("FIELD87", "EQ", businessPlace[i].data("range").value1));
                }
            }

            var dateVal, dateVal2;
            var that = this;
            if (docDate.length > 0) {
                for (i = 0; i < docDate.length; i++) {
                    dateVal = docDate[i].data("range").value1;
                    var timeoffset = dateVal.getTimezoneOffset();

                    if (docDate[i].data("range").value2) {
                        dateVal2 = docDate[i].data("range").value2;
                        var timeoffset1 = dateVal.getTimezoneOffset();
                        aFilters.push(new Filter("FIELD86", docDate[i].data("range").operation, (dateVal.getTime() - (timeoffset * 60000)), (dateVal2.getTime() - (timeoffset1 * 60000))));
                    }
                    else
                        aFilters.push(new Filter("FIELD86", docDate[i].data("range").operation, dateVal.getTime() - (timeoffset * 60000)));
                }
            }

            that.getOwnerComponent().getModel().read("/ZCDSEHFIC0014", {
                filters: aFilters,
                success: function (oData, oResponse) {
                    that.getView().setBusy(false);
                    console.log(oData.results);
                    that.getView().getModel("JSON_model").setProperty("/JSONData", oData.results)
                },
                error: function (mResponse) {
                    that.getView().setBusy(false);
                }
            })
        },
        onPressPrint: function () {
            var oView = this.getView();
            var aTableData = oView.getModel("JSON_model").getProperty("/JSONData");

            let Finaltext = '';
            let aText = [];
            for (var i = 0; i < aTableData.length; i++) {
                let text = '';
                for (var j = 1; j < Object.values(aTableData[i]).length; j++) {
                    text += Object.values(aTableData[i])[j] + "\t" 
                }
                aText.push(text);
            }
            for (var q = 0; q < aText.length; q++) {
                Finaltext += aText[q] + "\n"
            }
            const blob = new Blob([Finaltext], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Vat Data Download";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };
});