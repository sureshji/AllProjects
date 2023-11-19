/*global QUnit*/

sap.ui.define([
	"comyokogawa/zhmm0012/controller/MaterialCodeProductionLTRef.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MaterialCodeProductionLTRef Controller");

	QUnit.test("I should test the MaterialCodeProductionLTRef controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
