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

        }
    };

});