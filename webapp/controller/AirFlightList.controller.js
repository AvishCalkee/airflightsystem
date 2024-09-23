sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightList", {
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
