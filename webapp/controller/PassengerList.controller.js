sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/formatter"
    ],
    function(BaseController,Formatter) {
      "use strict";
  
      return BaseController.extend("fiori.bootcamp.airflightsystem.controller.PassengerList", {
        formatter: Formatter,
        onInit: function() {
        },
        onRefreshTableContent: function (oEvent) {
            this.getView().byId("stPassengerList").rebindTable();
        },
        fnOnBeforeRebindTable: function (oEvent) {
           // oEvent.getParameter("bindingParams").parameters["expand"] = "ToPassenger";
           oEvent.getSource().attachEventOnce("dataReceived",null,this.onDataReceived,this);
        },

        onDataReceived: function(oEvent,oData){
               this.getView().getModel("UIModel").setProperty("/iCountDataReceived", this.getView().getModel("UIModel").getProperty("/iCountDataReceived") + 1);
               this.getOwnerComponent().getEventBus().publish("channelAirFlight", "BusyModifButton", this.getView());
        },
      });
    }
  );