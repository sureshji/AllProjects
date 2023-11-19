/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comyokogawazhmm0024/com.yokogawa.zhmm0024/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
