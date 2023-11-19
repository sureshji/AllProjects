sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/yokogawa/zhps0005/test/integration/FirstJourney',
		'com/yokogawa/zhps0005/test/integration/pages/ZCDSEHPSC0009List',
		'com/yokogawa/zhps0005/test/integration/pages/ZCDSEHPSC0009ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZCDSEHPSC0009List, ZCDSEHPSC0009ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/yokogawa/zhps0005') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZCDSEHPSC0009List: ZCDSEHPSC0009List,
					onTheZCDSEHPSC0009ObjectPage: ZCDSEHPSC0009ObjectPage
                }
            },
            opaJourney.run
        );
    }
);