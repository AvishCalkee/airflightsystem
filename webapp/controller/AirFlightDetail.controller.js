sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
],
    function (Controller, Formatter, Fragment, JSONModel, DateFormat) {
        "use strict";

        return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightDetail", {
            formatter: Formatter,
            onInit: function () {

                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("AirFlightDetail").attachPatternMatched(this.fnObjectMatched, this);
            },

            fnObjectMatched: async function (oEvent) {
                let sFlightId = "/" + oEvent.getParameter("arguments").DetailPath,
                    oView = this.getView();
                    
                this.getView().getModel("crewModel").setProperty("/selectedFlightId", sFlightId)

                await this.fnRestoreUIModel();
                oView.bindElement({
                    path: sFlightId,
                    parameters: { expand: "ToDepartureAiport,ToDestinationAirport,ToAirline" },
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: function (result) {
                            let oFlightData = result.getParameter("data");
                            // Safely check if FlightDuration exists and has milliseconds
                            let flightDurationMs = oFlightData.FlightDuration && oFlightData.FlightDuration.ms ? oFlightData.FlightDuration.ms : 0;

                            let oData = {
                                FlightStatus: oFlightData.FlightStatus,
                                FlightDuration: this._fnConvertMsToTime(flightDurationMs),
                                ArrivalDateTime: oFlightData.ArrivalDateTime,
                                DepartureDateTime: oFlightData.DepartureDateTime,
                                DestinationAirportCode: oFlightData.DestinationAirportCode,
                                OriginAirportCode: oFlightData.OriginAirportCode,
                                AirlineId: oFlightData.AirlineId,
                                FlightNo: oFlightData.FlightNo,
                                FlightId: oFlightData.FlightId
                            };

                            let Model = new JSONModel(oData);
                            this.getView().setModel(Model, "FlightDetailsModel");
                            oView.setBusy(false);
                        }.bind(this),
                        change: function (oData) {
                            oView.setBusy(false);
                        }

                    }

                });

                this._fnCallBaggageSet();
                
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
            },
            fnOnCancel: function (oEvent) {
                this.getView().getModel("UIModel").setProperty("/modifMode", false);
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
                    oI18n = this.getOwnerComponent().getModel("i18n");


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
                    oView.setBusy(true);
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
            }
        });
    });