sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
],
function (Controller,Formatter) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightList", {
       formatter: Formatter,

        onInit: function () {
           
        },

        onBeforeRebindTable: function(oEvent) {
			oEvent.getParameter("bindingParams").parameters["expand"] = "ToCrew";
            oEvent.getSource().attachEventOnce("dataReceived",null,this.onDataReceived,this);


		},

        onDataReceived: function(oEvent,aFilter){
              console.log(oEvent);
        },

		fnOnBookingNewFlight: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("AirFlightCreate");
		},

        fnOnItemPress: function(oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("AirFlightDetail",{DetailPath: oEvent.getParameter("listItem").getBindingContext().getPath().substr(1)
            });
        }
    });
});
