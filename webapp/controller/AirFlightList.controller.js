sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
],
function (Controller, Formatter) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightList", {
        formatter: Formatter,
        onInit: function () {
           
        },

        onBeforeRebindTable: function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
		},

		fnOnBookingNewFlight: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("AirFlightCreate");
		}
    });
});
