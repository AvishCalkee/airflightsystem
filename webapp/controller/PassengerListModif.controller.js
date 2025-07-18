sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/formatter",
        "sap/m/MessageBox"
    ],
    function(BaseController,Formatter,MessageBox) {
      "use strict";
  
      return BaseController.extend("fiori.bootcamp.airflightsystem.controller.PassengerListModif", {
        formatter: Formatter,
        onInit: function() {
            var eventBus = this.getOwnerComponent().getEventBus();
            eventBus.subscribe("channelAirFlight", "PopulateEditPassengerTable", this.fnPopulateEditTable, this);
        },

        fnPopulateEditTable: function (vChannelName, vEventName, oController) {
			var oView = this.getView(),
				
				stPassengerList = oController.getView().byId("viewPassengerList").getController().byId("stPassengerList"),
				array = [],
				sCount,
				contextPath,
				object;

			oView.getModel("EditPassengerList").setData(array);
			for (var i = 0; i < stPassengerList.getTable().getItems().length; i++) {
				contextPath = stPassengerList.getTable().getItems()[i].getBindingContextPath(),
					object = oView.getModel().getObject(contextPath);
				// object.PassengerId = object.PassengerId;
				// object.FirstName = object.FirstName;
				
				// object.LastName = object.LastName;
				// object.Email = object.Email;
                // object.LastName = 
				array.push(object);
			}
			oView.getModel("EditPassengerList").setData(array);
            this.fnUpdatePassengerCount();
		},

        fnAddPassenger: function () {
				this.getView().getModel("EditPassengerList").setProperty("/", this.getView().getModel("EditPassengerList").getProperty("/").concat({
					"PassengerId": "",
					"FirstName": "",
					"LastName": "",
					"PassportNumber": '0',
					"Email": "",
					"Nationality": "",
					"DateOfBirth": new Date(),
					"FlightId": "",
					"SeatNumber": 0,
					
				}));
            },

            fnDeletePassenger: function (oEvent) {
                var that = this,
                    i18n = this.getOwnerComponent().getModel("i18n"),
                    oConfigModel = this.getView().getModel("UIModel"),
                    oView = this.getView();
    
                var oSelectedContexts = this.getView().byId("stPassengerListModif").getSelectedItems();
                if (oSelectedContexts.length === 0) {
                    MessageBox.error(i18n.getProperty("NoSelection"));
                } else {
                    MessageBox.confirm(
                        i18n.getProperty("confirmDelete"), {
                            onClose: (function (oAction) {
                                if (oAction === MessageBox.Action.OK) {
                                    var bPECSaved = false;
                                    oSelectedContexts.forEach(function (oItemToDelete) {
                                        var sPath = oItemToDelete.getBindingContext("EditPassengerList").getPath();
                                        var sId = oView.getModel("EditPassengerList").getProperty(sPath + "/PassengerId");
                                        if (sId !== undefined) {
                                            var iIndex = sPath.substr(1);
                                            oView.getModel("EditPassengerList").getData().splice(oView.byId("stPassengerListModif").getItems().length - 1, 1); 
                                            oView.getModel("EditPassengerList").updateBindings();
                                        } 
                                    });
                                     

                                    /*Delete Button Handling*/
                                    if (oView.byId("stPassengerListModif").getItems().length === 0) {
                                        oConfigModel.setProperty("/passengerTableBtn/deleteDisable", false);
                                    } else {
                                        oConfigModel.setProperty("/passengerTableBtn/deleteDisable", true);
                                    }
                                } else if (oAction === MessageBox.Action.CANCEL) {
                                    oView.byId("stPassengerListModif").removeSelections(true);
                                }
                                this.fnUpdatePassengerCount();
                            }).bind(this)
                        }
                    );
                }
            },

            fnUpdatePassengerCount: function (){
                var oView = this.getView(),
                    oConfigModel = oView.getModel("UIModel"),
                    sCount = oView.byId("stPassengerListModif").getItems().length;
                    oConfigModel.setProperty("count/Passengers", " (" + sCount + ")");
            },

            fnSave: function (sBatchGroup, sChangeSet, oView) {
                /* Conversion du JSONModel dans le oDataModel v2 */
    
                var bHasChanges = false,
                    oCreatePEC,
                    oModifiedPEC,
                    oODataModel = oView.getModel(),
                    oEditPassengerModel = this.getView().getModel("EditPassengerList");
    
                /* Collecter l'image originale des PEC (issu du OData Modèle sans nom */
                var smartTableItems = oView.byId("viewPassengerList").getController().byId("stPassengerList").getTable().getItems(),
                    oDataModelElements = [];
    
                for (var i = 0; i < smartTableItems.length; i++) {
                    var item = oODataModel.getObject(smartTableItems[i].getBindingContextPath());
                    item.bindingContextPath = smartTableItems[i].getBindingContextPath();
                    oDataModelElements.push(item);
                }
    
                /* Collecter l'image modifiée des PEC (issu du JSON Modèle 'PEC' */
                var aModifiPassengerList = oView.byId("viewPassengerListModif").getController().byId("stPassengerListModif").getItems();
    
                /*Tentative creation*/
                for (var j = 0; j < aModifiPassengerList.length; j++) {
                    var oPassengerEditModel = oEditPassengerModel.getObject(aModifiPassengerList[j].getBindingContextPath());
                    
                    var oPassenger = oDataModelElements.find(function (oEl) {
                        return oEl.PassengerId === oPassengerEditModel.PassengerId;
                    });

                    if (!oPassenger) {
                        /*  Création d'un nouvel PEC */
                        
                        var oCreatePassenger = {
                            FlightId: this.getView().getBindingContext().getObject().FlightId,
                            PassengerId: oPassengerEditModel.PassengerId,
                            FirstName: oPassengerEditModel.FirstName,
                            LastName: oPassengerEditModel.LastName, 
                            Email: oPassengerEditModel.Email,
                            PassportNumber: oPassengerEditModel.PassportNumber,
                            Nationality: oPassengerEditModel.Nationality,
                            SeatNumber:oPassengerEditModel.SeatNumber,
                            DateOfBirth:oPassengerEditModel.DateOfBirth,
                        };
                        oODataModel.create("/PassengerSet", oCreatePassenger, {
                            urlParameters: {
                                DocumentType: "Flight",
                                DocumentId: this.getView().getBindingContext().getObject().FlightId
                            },
                            groupId: sBatchGroup,
                            changeSetId: sChangeSet
                        });
                        bHasChanges = true;
                    }else{
                           /* Passenger  MJA*/
                        var bModelChanged = this.fnHasChanges(oPassengerEditModel, oPassenger);
                        if(bModelChanged){
                            var sPath = "/PassengerSet(PassengerId='" + oPassengerEditModel.PassengerId + "')";
                            //var sPath = "/Passengers(PassengerId='" + oPassengerEditModel.PassengerId + "',FlightID='" + this.getView().getBindingContext().getObject().FlightId + "')";
                       var  oModifiedPassenger = {
                            FlightId: this.getView().getBindingContext().getObject().FlightId,
                            PassengerId: oPassengerEditModel.PassengerId,
                            FirstName: oPassengerEditModel.FirstName,
                            LastName: oPassengerEditModel.LastName, 
                            Email: oPassengerEditModel.Email,
                            PassportNumber: oPassengerEditModel.PassportNumber,
                            Nationality: oPassengerEditModel.Nationality,
                            SeatNumber:oPassengerEditModel.SeatNumber,
                            DateOfBirth:oPassengerEditModel.DateOfBirth,
                        };
    
                        oODataModel.update(sPath, oModifiedPassenger, {
                            groupId: "saveDeepGroup"
                        });
                        bHasChanges = true;
                        }
                    }
                }

                for (var k = 0; k < oDataModelElements.length; k++) {
                    var oPassengerModel = aModifiPassengerList.find(function (oEl) {
                        var oPassengerEditModel = oEditPassengerModel.getObject(oEl.getBindingContextPath());
                        return (oPassengerEditModel.PassengerId === oDataModelElements[k].PassengerId);
                    });
                    if (!oPassengerModel) {
                        // Le passager du oDataModel n'a pas été trouvée dans le dirty model => il s'agit d'une suppression
                        var sSuppPath = oDataModelElements[k].bindingContextPath;
                        oODataModel.remove(sSuppPath, {
                            context: this.getView().getBindingContext(),
                            groupId: "saveDeepGroup"
                        });
                        bHasChanges = true;
                    }
                }
   
                return bHasChanges;
            }, 

            fnHasChanges: function (editModelPassenger, originalModelPassenger) {
                var aKeys = Object.keys(editModelPassenger);
                for (var i = 0; i < aKeys.length; i++) {
                    if (editModelPassenger[aKeys[i]] !== originalModelPassenger[aKeys[i]] && (aKeys[i] !== "__metadata")) {
                        return editModelPassenger[aKeys[i]];
                    }
    
                    
                }
                return ;
            }
      });
    }
  );