sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/formatter"
    ],
    function(BaseController,Formatter) {
      "use strict";
  
      return BaseController.extend("fiori.bootcamp.airflightsystem.controller.BaggageList", {
        formatter: Formatter,
        onInit: function() {
        },
        onRefreshTableContent: function (oEvent) {
            this.getView().byId("sTBaggage").rebindTable()
        },
      });
    }
  );