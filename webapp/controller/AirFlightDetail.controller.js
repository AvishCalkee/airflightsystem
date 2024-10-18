sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/core/Fragment",
],
function (Controller,Formatter,Fragment) {
    "use strict";

    return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightDetail", {
        formatter: Formatter,
        onInit: function () {

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("AirFlightDetail").attachPatternMatched(this.fnObjectMatched,this);
        },

        fnObjectMatched: async function (oEvent){
            var sFlightId = "/"+oEvent.getParameter("arguments").DetailPath,
            oView = this.getView();
            await this.fnRestoreUIModel();
            oView.bindElement({path : sFlightId,
                parameters:{expand:"ToDepartureAiport,ToDestinationAirport,ToAirline"},
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

        fnOpenCompanyInfoQuickView: function (oEvent) {
        var oButton = oEvent.getSource(),
        oView = this.getView();

    if (!this._pQuickView) {
        this._pQuickView = Fragment.load({
            id: oView.getId(),
            name: "fiori.bootcamp.airflightsystem.view.fragment.CompanyDetails",
            controller: this
        }).then(function (oQuickView) {
            oQuickView.setModel(this.oModel);
            oView.addDependent(oQuickView);
            return oQuickView;
        }.bind(this));
    }
    this._pQuickView.then(function(oQuickView) {
        oQuickView.openBy(oButton);
    });
},

fnEmailValidation: function(oEvent) {
   var sEmail = oEvent.getParameter("value"),
    emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    InputControl = oEvent.getSource();

   if(emailPattern.test(sEmail)){
    InputControl.setValueState("None");
    InputControl.setValueStateText("");

   }else{
    InputControl.setValueState("Error");
    InputControl.setValueStateText("Enter a valid Email");
   };
   
   if(oEvent.getParameter("value")===""){
    InputControl.setValueState("None");
    InputControl.setValueStateText("");
};

},

fnUrlValidation: function(oEvent) {
    var sUrl = oEvent.getParameter("value"),
    UrlPattern = /^(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?$/,
    InputControl = oEvent.getSource();
 
    if(UrlPattern.test(sUrl)){
     InputControl.setValueState("None");
     InputControl.setValueStateText("");
 
    }else{
     InputControl.setValueState("Error");
     InputControl.setValueStateText("Enter a valid URL");
    };
    
    if(oEvent.getParameter("value")===""){
        InputControl.setValueState("None");
     InputControl.setValueStateText("");
    };
 },

 fnPhoneValidation: function(oEvent) {
    var sPhone = oEvent.getParameter("value"),
    PhonePattern = /^\d{10}$/,
     InputControl = oEvent.getSource();
 
    if(PhonePattern.test(sPhone)){
     InputControl.setValueState("None");
     InputControl.setValueStateText("");
 
    }else{
     InputControl.setValueState("Error");
     InputControl.setValueStateText("Enter a valid Phone Number");
    };

    if(oEvent.getParameter("value")===""){
        InputControl.setValueState("None");
     InputControl.setValueStateText("");
    };
    
 },

 fnYearValidation: function(oEvent) {
    var sYear = oEvent.getParameter("value"),
    YearPattern = /^\d{4}$/,
     InputControl = oEvent.getSource();
 
    if(YearPattern.test(sYear)){
     InputControl.setValueState("None");
     InputControl.setValueStateText("");
 
    }else{
     InputControl.setValueState("Error");
     InputControl.setValueStateText("Enter a valid Year");
    };

    if(oEvent.getParameter("value")===""){
        InputControl.setValueState("None");
     InputControl.setValueStateText("");
    };
    
 }
    });
});