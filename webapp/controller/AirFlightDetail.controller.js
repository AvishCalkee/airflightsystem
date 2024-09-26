sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightDetail", {
        onInit: function () {

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("AirFlightDetail").attachPatternMatched(this.fnObjectMatched,this);
        },

        fnObjectMatched: function (oEvent){
            var sFlightId = "/"+oEvent.getParameter("arguments").DetailPath,
            oView = this.getView();
            oView.bindElement({path : sFlightId,
                parameters:{},
                events:{
                  dataRequested: function (){
                    oView.setBusy(true);
                  },
                  dataReceived: function (oData){
                    oView.setBusy(false);
                  },
                  change: function (oData){
                    oView.setBusy(false);
                  }

                }

            });
        }



    });
});