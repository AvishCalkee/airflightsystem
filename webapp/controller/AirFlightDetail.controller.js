sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
],
function (Controller,Formatter) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightDetail", {
        formatter: Formatter,
        onInit: function () {

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("AirFlightDetail").attachPatternMatched(this.fnObjectMatched,this);

            /**var oViewModel = new JSONModel({
                modifMode: "false"
            });
            this.getView().setModel(oViewModel, "ViewMode");**/
        },

        fnObjectMatched: async function (oEvent){
            var sFlightId = "/"+oEvent.getParameter("arguments").DetailPath,
            oView = this.getView();
            await this.fnRestoreUIModel();
            oView.bindElement({path : sFlightId,
                parameters:{expand:"ToDepartureAiport,ToDestinationAirport"},
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

        },
        onPressEdit: function(oEvent) {
            this.getView().getModel("ViewMode").setProperty("/modifMode", true);
        },

        fnOnModif: function(oEvent){
            this.getView().getModel("UIModel").setProperty("/modifMode", true);
        },
        fnOnCancel: function(oEvent){
            this.getView().getModel("UIModel").setProperty("/modifMode", false);
        }





    });
});