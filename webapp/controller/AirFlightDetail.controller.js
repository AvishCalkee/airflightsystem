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

        fnObjectMatched: async function (oEvent){
            var sFlightId = "/"+oEvent.getParameter("arguments").DetailPath,
            oView = this.getView();
            await this.fnRestoreUIModel();
            oView.bindElement({path : sFlightId,
                parameters:{expand:"ToAirport"},
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
        },

        fnRestoreUIModel : async function (){
            var oOwnerComponent = this.getOwnerComponent(),
                oUIModel = this.getView().getModel("UIModel");

            await oOwnerComponent.pInitCustomizingReady;

            return new Promise((resolve, reject) => {
                var oInitialUIModel = JSON.parse(JSON.stringify(oOwnerComponent.oDefaultCustomizing));
                oUIModel.setData(oInitialUIModel);
                resolve();
            });

        }






    });
});