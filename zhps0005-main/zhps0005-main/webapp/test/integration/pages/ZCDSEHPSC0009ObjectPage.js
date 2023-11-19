sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.yokogawa.zhps0005',
            componentId: 'ZCDSEHPSC0009ObjectPage',
            entitySet: 'ZCDSEHPSC0009'
        },
        CustomPageDefinitions
    );
});