/*global QUnit*/

sap.ui.define([
	"comyokogawa/zhmm0015/controller/Selectionscreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Selectionscreen Controller");

	QUnit.test("I should test the Selectionscreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
