/*global QUnit*/

sap.ui.define([
	"comyokogawazhmm0024/com.yokogawa.zhmm0024/controller/main.controller"
], function (Controller) {
	"use strict";

	QUnit.module("main Controller");

	QUnit.test("I should test the main controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
