sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
 
	return Controller.extend("fiori.bootcamp.airflightsystem.controller.PassengerSection", {
 
		onRefreshTableContent: function (oEvent) {
			this.getView().byId("stPassengerList").rebindTable()
		},

		fnOnBeforeRebindTable: function (oEvent) {
			//var mBindingParams = oEvent.getParameter("bindingParams");
			//mBindingParams.parameters.expand = "ToPassenger";
		}
 
	});
 
});