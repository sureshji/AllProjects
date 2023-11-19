/*global QUnit*/

sap.ui.define([
	"comyokogawa/zhmm0016/controller/Reportdata.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Reportdata Controller");

	QUnit.test("I should test the Reportdata controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
