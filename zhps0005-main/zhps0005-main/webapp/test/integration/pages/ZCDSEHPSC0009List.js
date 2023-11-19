sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.yokogawa.zhps0005',
            componentId: 'ZCDSEHPSC0009List',
            entitySet: 'ZCDSEHPSC0009'
        },
        CustomPageDefinitions
    );
});