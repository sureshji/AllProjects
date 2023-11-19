sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('com.yokogawa.zhps0005.ext.controller.CustomController', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf com.yokogawa.zhps0005.ext.controller.CustomController
             */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
                this.getView().getContent()[0].getContent().getContent().getItems()[1].setVisible(false);
                this.base.getExtensionAPI().setFilterValues("GIComplete", "EQ", " ");
                this.base.getExtensionAPI().setFilterValues("ClosedProject", "EQ", " ");
			}
		},
		
        onGeneralSelect:function(oEvent){
            debugger
            var selectedItems = oEvent.getParameter("selectedItems");
            var that = this;
            this.getView().getContent()[0].getContent().getContent().getItems()[0].setVisible(true);
            this.getView().getContent()[0].getContent().getContent().getItems()[1].setVisible(false);
            that.base.getExtensionAPI().setFilterValues("GIComplete", "EQ", " ");
            that.base.getExtensionAPI().setFilterValues("ClosedProject", "EQ", " ");
            selectedItems.forEach(element => {
                switch (element.getKey()) {
                    case "0" :
                        that.base.getExtensionAPI().setFilterValues("GIComplete", "EQ", "X");
                        break;
                    case "1" :
                        this.base.getExtensionAPI().setFilterValues("ClosedProject","EQ","Closed");
                        break;
                    case "2" :
                        this.getView().getContent()[0].getContent().getContent().getItems()[0].setVisible(false);
                        this.getView().getContent()[0].getContent().getContent().getItems()[1].setVisible(true);
                        // that.byId("GridTable").getParent().deactivateColumns();//doc_item_no
                        break;
                    default:
                        break;
                }
            });

        },
	});
});
