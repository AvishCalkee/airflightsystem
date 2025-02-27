sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], 
function (JSONModel, DateFormat) {
    "use strict";

    return {

        fnFlightStatus: function(flightStatus) {
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        
            switch (flightStatus) {
                case 'A':
                    return oResourceBundle.getText("onTime");
                case 'G':
                    return oResourceBundle.getText("delay");
                case 'X':
                    return oResourceBundle.getText("cancel");
                case 'D':
                    return oResourceBundle.getText("divert");
                default:
                    return 'Unknown Status';
            }
            
                
		},

        fnFlightStatusState: function(flightState) {
            switch (flightState) {
                case 'A':
                    return sap.ui.core.IndicationColor.Indication04;
                case 'G':
                    return sap.ui.core.IndicationColor.Indication03;
                case 'X':
                    return sap.ui.core.IndicationColor.Indication02;
                case 'D':
                    return sap.ui.core.IndicationColor.Indication06;
                default:
                    return sap.ui.core.IndicationColor.None;
            }
        },

        fnFlightStatusIcon: function(flightIcon) {
            switch (flightIcon) {
                case 'A':
                    return "sap-icon://accept";
                case 'G':
                    return "sap-icon://lateness";
                case 'X':
                    return "sap-icon://decline";
                case 'D':
                    return "sap-icon://journey-change";
                default:
                    return "";
            }
        },

        fnFormatDate: function(oDate){
            var oDateFormat = DateFormat.getDateTimeInstance({pattern: "HH:mm MMM dd, yyyy"}),
                sDate = oDateFormat.format(oDate);
            
            return sDate;
        },

        fnFlightDuration: function(oDuration){
            var hours = Math.floor(oDuration.ms / (1000 * 60 * 60));
            var minutes = Math.floor((oDuration.ms % (1000 * 60 * 60)) / (1000 * 60));

            var formattedTime = hours + "hrs " + minutes + "mins";
        
            return formattedTime;
        },

        fnWeightState : function (iWeight){
            if (iWeight > 1){
                return 'Warning';
            }
            return 'Success';
            
        },
        fnFlightDuration: function (dDepartureTime, dArrivalTime){
            var start = new Date(dDepartureTime);
            var end = new Date(dArrivalTime);

            var durationMs = end - start; // Duration in milliseconds

            var seconds = Math.floor((durationMs / 1000) % 60);
            var minutes = Math.floor((durationMs / (1000 * 60)) % 60);
            var hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
            var days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

            return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        }
    };

});