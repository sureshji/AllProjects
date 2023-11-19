sap.ui.define([
    "sap/ui/test/opaQunit"
], function (opaTest) {
    "use strict";

    var Journey = {
        run: function() {
            QUnit.module("First journey");

            opaTest("Start application", function (Given, When, Then) {
                Given.iStartMyApp();

                Then.onTheZCDSEHPSC0009List.iSeeThisPage();

            });


            opaTest("Navigate to ObjectPage", function (Given, When, Then) {
                // Note: this test will fail if the ListReport page doesn't show any data
                When.onTheZCDSEHPSC0009List.onFilterBar().iExecuteSearch();
                Then.onTheZCDSEHPSC0009List.onTable().iCheckRows();

                When.onTheZCDSEHPSC0009List.onTable().iPressRow(0);
                Then.onTheZCDSEHPSC0009ObjectPage.iSeeThisPage();

            });

            opaTest("Teardown", function (Given, When, Then) { 
                // Cleanup
                Given.iTearDownMyApp();
            });
        }
    }

    return Journey;
});