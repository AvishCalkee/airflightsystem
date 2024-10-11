sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
],
function (Controller,Formatter) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightList", {
       formatter: Formatter,

        onInit: function () {
           //Flight status value help
           var oFlightStatusModel = this.getOwnerComponent().getModel("flightStatus_global_json_model");
           this.getView().byId("flightStatusId").setModel(oFlightStatusModel);
        },

        onBeforeRebindTable: function(oEvent) {
			oEvent.getParameter("bindingParams").parameters["expand"] = "ToCrew";
            
            var aFilters = oEvent.getParameter("bindingParams").filters;
            var oFilters = [];

            var sFlightID = this.byId("oFlightIdFilter").getValue() !== "";
            if(sFlightID) {
                oFilters.push(new sap.ui.model.Filter("FlightId", "EQ", this.byId("oFlightIdFilter").getValue()));
            }

            var sDestAirport = this.byId("oDestAirportCodeFilter").getValue() !== "";
            if(sDestAirport) {
                oFilters.push(new sap.ui.model.Filter("DestinationAirportCode", "EQ", this.byId("oDestAirportCodeFilter").getValue()));
            }

            var sOriginAirport = this.byId("oOriginAirportCodeFilter").getValue() !== "";
            if(sOriginAirport) {
                oFilters.push(new sap.ui.model.Filter("OriginAirportCode", "EQ", this.byId("oOriginAirportCodeFilter").getValue()));
            }

            var sAirlineID = this.byId("oAirlineIdFilter").getValue() !== "";
            if(sAirlineID) {
                oFilters.push(new sap.ui.model.Filter("AirlineId", "EQ", this.byId("oAirlineIdFilter").getValue()));
            }

            var sFlightStatus = this.byId("flightStatusId").getSelectedKey() !== "";
            if(sFlightStatus) {
                oFilters.push(new sap.ui.model.Filter("FlightStatus", "EQ", this.byId("flightStatusId").getSelectedKey()));
            }

            if (oFilters.length !== 0){
                aFilters.push(new sap.ui.model.Filter({
                    filters: oFilters,
                    and: true
                }));
            }

            oEvent.getSource().attachEventOnce("dataReceived",aFilters,this.onDataReceived,this);
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
