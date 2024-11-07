sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/core/Fragment",
],
    function (Controller, Formatter, Fragment) {
        "use strict";

        return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightDetail", {
            formatter: Formatter,
            onInit: function () {

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("AirFlightDetail").attachPatternMatched(this.fnObjectMatched, this);
            },

            fnObjectMatched: async function (oEvent) {
                var sFlightId = "/" + oEvent.getParameter("arguments").DetailPath,
                    oView = this.getView();
                await this.fnRestoreUIModel();
                oView.bindElement({
                    path: sFlightId,
                    parameters: { expand: "ToDepartureAiport,ToDestinationAirport,ToAirline" },
                    events: {
                        dataRequested: function () {
                            oView.setBusy(true);
                        },
                        dataReceived: function (oData) {
                            oView.setBusy(false);
                        },
                        change: function (oData) {
                            oView.setBusy(false);
                        }

                    }

                });
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
                var sEmail = oEvent.getParameter("value"),
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
                var sUrl = oEvent.getParameter("value"),
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
                var sPhone = oEvent.getParameter("value"),
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
                var sYear = oEvent.getParameter("value"),
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
                var oModel = this.getView().getModel(),
                    bIsChanged = false,
                    sBatchGroup = "saveDeepGroup",
                    sChangeSet = "saveDeepChangeSet",
                    oView = this.getView(),
                    oI18n = this.getOwnerComponent().getModel("i18n");


                oModel.setDeferredGroups(oModel.getDeferredGroups().concat([sBatchGroup]));
                /* Détermination de changements */
                bIsChanged = oModel.hasPendingChanges(true);

                /* Update des changements */
                var oChanges = oModel.getPendingChanges();
                for (var key in oChanges) {
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
                    var aSavePromises = [];
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
                var oI18n = this.getOwnerComponent().getModel("i18n"),
                    oView = this.getView();

                oView.setBusy(false);
                sap.m.MessageToast.show(oI18n.getProperty("msgSaveSuccess"))
            },
            fnUpdateErrorCallback: function () {
                var oI18n = this.getOwnerComponent().getModel("i18n"),
                    oView = this.getView();

                oView.setBusy(false);
                sap.m.MessageToast.show(oI18n.getProperty("msgUpdateError"))
            }
        });
    });