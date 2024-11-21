sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime info for the device the UI5 app is running on as JSONModel
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        fnInitCustomizing: function (oUIModel, oComponent){
            oComponent.pInitCustomizingReady = new Promise (resolve => oUIModel.attachRequestCompleted(function (){
                oComponent.oDefaultCustomizing = JSON.parse(JSON.stringify(oUIModel.getData()));
                resolve();
            }))

        },
        createBaggageModel : function (){
            let oBaggageDetails = {
                "items": []
            };
            let oModel = new JSONModel(oBaggageDetails);
            return oModel;
        },
        createViewCrewModel : function (){
            let oCrewDetails = {
                selectedFlightId: null,
                "items": []
            };
            let oModel = new JSONModel(oCrewDetails);
            return oModel;
        }
    };

});