sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
],
    function (Controller, Formatter, Fragment, JSONModel, DateFormat,Filter,FilterOperator,MessageBox) {
        "use strict";

        return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightDetail", {
            formatter: Formatter,
            onInit: function () {

                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("AirFlightDetail").attachPatternMatched(this.fnObjectMatched, this);

                this.getView().setModel(new JSONModel(),'EditPassengerList');
            },

            fnObjectMatched: async function (oEvent) {
                let sFlightId = "/" + oEvent.getParameter("arguments").DetailPath,
                    oView = this.getView();
                    
                this.getView().getModel("crewModel").setProperty("/selectedFlightId", sFlightId)

                await this.fnRestoreUIModel();
                oView.bindElement({
                    path: sFlightId,
                    parameters: { expand: "ToDepartureAirport,ToDestinationAirport,ToAirline,ToPassenger" },
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: function (result) {
                            let oFlightData = result.getParameter("data");
                            this.fnFlightOccupation(result.getParameter("data").ToAirline.MaxSeatcap,result.getParameter("data").ToPassenger.length);
                            // Safely check if FlightDuration exists and has milliseconds
                            //let flightDurationMs = oFlightData.FlightDuration && oFlightData.FlightDuration.ms ? oFlightData.FlightDuration.ms : 0;
                            
                            oView.setBusy(false);
                        }.bind(this),
                        change: function (oData) {
                            oView.setBusy(false);
                        }

                    }

                });

                //this._fnCallBaggageSet();
                
            },

            fnFlightOccupation : function (iMaxSeat,iTotalPassenger){
                var iPercentageBook = iTotalPassenger * (100/iMaxSeat);
                if(iPercentageBook>50){
                    this.getView().getModel("UIModel").setProperty("/sOccupationStatus", "Success");
                }else{
                    this.getView().getModel("UIModel").setProperty("/sOccupationStatus", "Warning");
                }
                this.getView().getModel("UIModel").setProperty("/bVisibleFlightOccup", true);
                this.getView().getModel("UIModel").setProperty("/iOccupationPercentage", iPercentageBook);
            },

            _fnConvertMsToTime: function (duration) {

                let seconds = Math.floor((duration / 1000) % 60),
                    minutes = Math.floor((duration / (1000 * 60)) % 60),
                    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

                return (hours < 10 ? "0" + hours : hours) + ":" +
                    (minutes < 10 ? "0" + minutes : minutes) + ":" +
                    (seconds < 10 ? "0" + seconds : seconds);
            },
            onPressGoToAirportWebsite: function (oEvent) {
                // window.location.href = "https://ui5.sap.com";
                sap.m.URLHelper.redirect("https://ui5.sap.com", true);
            },

            fnRestoreUIModel: async function () {
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
                this._pQuickView.then(function (oQuickView) {
                    oQuickView.openBy(oButton);
                });
            },
            onPressEdit: function (oEvent) {
                this.getView().getModel("ViewMode").setProperty("/modifMode", true);
            },

            fnOnModif: function (oEvent) {
                this.getView().getModel("UIModel").setProperty("/modifMode", true);
                this.getOwnerComponent().getEventBus().publish("channelAirFlight", "PopulateEditPassengerTable", this);
            },
            fnOnCancel: function (oEvent) {
                this.getView().getModel("UIModel").setProperty("/modifMode", false);
                this.getOwnerComponent().getEventBus().publish("channelAirFlight", "PopulateEditPassengerTable", this);
            },

            fnEmailValidation: function (oEvent) {
                let sEmail = oEvent.getParameter("value"),
                    emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                    InputControl = oEvent.getSource();

                if (emailPattern.test(sEmail)) {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");

                } else {
                    InputControl.setValueState("Error");
                    InputControl.setValueStateText("Enter a valid Email");
                };

                if (oEvent.getParameter("value") === "") {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");
                };

            },

            fnUrlValidation: function (oEvent) {
                let sUrl = oEvent.getParameter("value"),
                    UrlPattern = /^(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?$/,
                    InputControl = oEvent.getSource();

                if (UrlPattern.test(sUrl)) {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");

                } else {
                    InputControl.setValueState("Error");
                    InputControl.setValueStateText("Enter a valid URL");
                };

                if (oEvent.getParameter("value") === "") {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");
                };
            },

            fnPhoneValidation: function (oEvent) {
                let sPhone = oEvent.getParameter("value"),
                    PhonePattern = /^\d{10}$/,
                    InputControl = oEvent.getSource();

                if (PhonePattern.test(sPhone)) {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");

                } else {
                    InputControl.setValueState("Error");
                    InputControl.setValueStateText("Enter a valid Phone Number");
                };

                if (oEvent.getParameter("value") === "") {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");
                };

            },

            fnYearValidation: function (oEvent) {
                let sYear = oEvent.getParameter("value"),
                    YearPattern = /^\d{4}$/,
                    InputControl = oEvent.getSource();

                if (YearPattern.test(sYear)) {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");

                } else {
                    InputControl.setValueState("Error");
                    InputControl.setValueStateText("Enter a valid Year");
                };

                if (oEvent.getParameter("value") === "") {
                    InputControl.setValueState("None");
                    InputControl.setValueStateText("");
                };

            },
            fnSave: function (oEvent) {
                let oModel = this.getView().getModel(),
                    bIsChanged = false,
                    sBatchGroup = "saveDeepGroup",
                    sChangeSet = "saveDeepChangeSet",
                    oView = this.getView(),
                    oI18n = this.getOwnerComponent().getModel("i18n"),
                    bPassengerChanges = false;

                    
                    bPassengerChanges = this.getView().byId('viewPassengerListModif').getController().fnSave(sBatchGroup,sChangeSet,oView);
                
                    if(this.getView().getModel().getProperty(this.getView().getBindingContext().getPath()+'/OriginAirportCode') === this.getView().getModel().getProperty(this.getView().getBindingContext().getPath()+'/DestinationAirportCode')){
                        MessageBox.error(oI18n.getProperty("msgDiffAirport"));
                        return;
                    }

                oModel.setDeferredGroups(oModel.getDeferredGroups().concat([sBatchGroup]));
                /* Détermination de changements */
                bIsChanged = oModel.hasPendingChanges(true);

                /* Update des changements */
                let oChanges = oModel.getPendingChanges();
                for (let key in oChanges) {
                    if (oChanges.hasOwnProperty(key)) {
                        bIsChanged = true;
                        delete oChanges[key].__metadata;
                        oModel.update("/" + key, oChanges[key], {
                            groupId: sBatchGroup,
                            changeSetId: sChangeSet
                        });
                    }
                }

                /* Effectuer la sauvegarde dans le backend ou ne rien faire. */
                if (bIsChanged) {
                    let aSavePromises = [];
                    this.getView().getModel("UIModel").setProperty("/appBusy", true);
                    // Changement present : lancer la sauvegarde du document par $batch
                    aSavePromises.push(new Promise(function (resolve, reject) {
                        oModel.submitChanges({
                            groupId: sBatchGroup,
                            success: resolve,
                            error: reject
                        });
                    }));
                    Promise.all(aSavePromises).then(function (oSuccess) {
                        this.fnUpdateSuccessCallback();
                    }.bind(this),
                        function (oRrror) {
                            this.fnUpdateErrorCallback();
                        }.bind(this)
                    );

                } else {
                    // Pas de changement
                    //this.fnCancelChanges();
                    sap.m.MessageToast.show(oI18n.getProperty("msgNothingChanged"));
                    //oAppModel.setProperty("/busy", false);
                    oView.setBusy(false);
                }

            },
            fnUpdateSuccessCallback: function () {
                let oI18n = this.getOwnerComponent().getModel("i18n"),
                    oView = this.getView();

                oView.setBusy(false);
                sap.m.MessageToast.show(oI18n.getProperty("msgSaveSuccess"))
            },
            fnUpdateErrorCallback: function () {
                let oI18n = this.getOwnerComponent().getModel("i18n"),
                    oView = this.getView();

                oView.setBusy(false);
                sap.m.MessageToast.show(oI18n.getProperty("msgUpdateError"))
            },
            onRefreshTableContent: function (oEvent) {
                this.getView().byId("stPassengerList").rebindTable()
            },

            _fnCallBaggageSet: function () {

                let oModel = this.getOwnerComponent().getModel();
                //let sPath = "/BaggageSet";  
                let aTable = [];
                this.getView().getModel("BaggageModel").setProperty("/items", []);

                oModel.read("/BaggageSet", {
                    success: function (oData, response) {

                        let oResults = oData.results;
                        if (oResults.length > 0) {

                            for (let eachItemsObject of oResults) {
                                let { BagWeight, PassengerId, BaggageId } = eachItemsObject;
                                let oModel = { BagWeight, PassengerId, BaggageId };
                                aTable.push(oModel);
                            }
                            this.getView().getModel("BaggageModel").setProperty("/items", aTable);
                            this.getView().getModel("BaggageModel").refresh(true);
                        }

                    }.bind(this),
                    error: function (oError) {
                        console.error("Error retrieving data", oError);
                    }
                });
            },

            onViewCrewList: function (oButton) {
                let oModel = this.getView().getModel();
                let sCrewId = this.getView().getModel("crewModel").getProperty("/selectedFlightId");
                let sCrewIdSet = sCrewId + "/ToCrew";
                let aList = [];

                this.getView().getModel("crewModel").setProperty("/items", []);

                this.getOwnerComponent().getModel().read(sCrewIdSet, {
                   
                    success: function (oData) {
                        let oResults = oData.results;
                        if (oResults.length > 0) {

                            for (let eachItemsObject of oResults) {
                                let { FlightId, Role, LastName, FirstName, CrewId } = eachItemsObject;
                                let oModel = { FlightId, Role, LastName, FirstName, CrewId };
                                aList.push(oModel);
                            }
                            this.getView().getModel("crewModel").setProperty("/items", aList);
                            this.getView().getModel("crewModel").refresh(true);
                        }

                        if (!this._crewDialog) {
                            this._crewDialog = sap.ui.xmlfragment("fiori.bootcamp.airflightsystem.view.fragment.CrewList", this);
                            this.getView().addDependent(this._crewDialog);
                        }

                        this._crewDialog.open();
                    }.bind(this),
                    error: function () {
                        MessageToast.show("Failed");
                    }
                });
            },

            onDialogClose: function () {
                if (this._crewDialog) {
                    this._crewDialog.close();
                }
            },
            fnOnValueHelpRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
            
                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "fiori.bootcamp.airflightsystem.view.fragment.AirportValueHelp",
                        controller: this,
                        oInput: sInputValue,
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._pValueHelpDialog.oInput = oEvent.getSource();
                this._pValueHelpDialog.then(function(oDialog) {
                    // Create a filter for the binding
                    oDialog.getBinding("items").filter([new Filter("AirportName", FilterOperator.Contains, sInputValue)]);
                    // Open ValueHelpDialog filtered by the input's value
                    oDialog.open(sInputValue);
                });
             },
            
             fnOnValueHelpSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("AirportName", FilterOperator.Contains, sValue);
            
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },
            
            fnOnValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                oEvent.getSource().getBinding("items").filter([]);
            
                if (!oSelectedItem) {
                    return;
                }
                var sPath = oSelectedItem.getBindingContext().getPath();
                var sSelectedData = oSelectedItem.getBindingContext().getModel().getProperty(sPath);
            
                if(!this._pValueHelpDialog.oInput.getId().includes('inputDepartureAirportCode')){
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/DestinationAirportCode',sSelectedData.AirportCode);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDestinationAirport/AirportCode',sSelectedData.AirportCode);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDestinationAirport/AirportName',sSelectedData.AirportName);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDestinationAirport/City',sSelectedData.City);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDestinationAirport/Country',sSelectedData.Country);
                }else{
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/OriginAirportCode',sSelectedData.AirportCode);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDepartureAirport/AirportCode',sSelectedData.AirportCode);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDepartureAirport/AirportName',sSelectedData.AirportName);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDepartureAirport/City',sSelectedData.City);
                    this.getView().getModel().setProperty(this.getView().getBindingContext().getPath()+'/ToDepartureAirport/Country',sSelectedData.Country);
            
                }
                
            },

        });
    });