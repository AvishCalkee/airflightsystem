sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
 
	return Controller.extend("fiori.bootcamp.airflightsystem.controller.PassengerSection", {
 
		onRefreshTableContent: function () {
            var oTable = this.getView().byId("PassengerList");
            oTable.getBinding("items").refresh();
		}
 
	});
 
});