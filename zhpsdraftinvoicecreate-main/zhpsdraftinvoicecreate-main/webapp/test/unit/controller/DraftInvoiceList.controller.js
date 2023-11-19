/*global QUnit*/

sap.ui.define([
	"comyokogawa/zhpsdraftinvoicecreate/controller/DraftInvoiceList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("DraftInvoiceList Controller");

	QUnit.test("I should test the DraftInvoiceList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
