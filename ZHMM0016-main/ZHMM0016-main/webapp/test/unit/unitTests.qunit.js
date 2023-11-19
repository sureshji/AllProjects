/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comyokogawa/zhmm0016/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
