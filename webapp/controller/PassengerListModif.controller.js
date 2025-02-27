sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "../model/formatter"
    ],
    function(BaseController,Formatter) {
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
				this.getModel("EditPassengerList").setProperty("/", this.getModel("EditPassengerList").getProperty("/").concat({
					"PassengerId": "",
					"FirstName": "",
					"LastName": "",
					"PassportNum": "",
					"Email": "",
					"Nationality": "",
					"DOB": "",
					"FlightId": "",
					"SeatNum": "",
					
				}));
            },

            fnDeletePassenger: function (oEvent) {
                var that = this;
                var i18n = this.getOwnerComponent().getModel("i18n");
                var oConfigModel = this.getView().getModel("UIConfig");
    
                var oSelectedContexts = this.getView().byId("EditPassengerList").getSelectedItems();
                if (oSelectedContexts.length === 0) {
                    sap.m.MessageBox.error(i18n.getProperty("NoSelection"));
                } else {
                    sap.m.MessageBox.confirm(
                        i18n.getProperty("confirmDelete"), {
                            onClose: (function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.OK) {
                                    var bPECSaved = false;
                                    oSelectedContexts.forEach(function (oItemToDelete) {
                                        var sPath = oItemToDelete.getBindingContext("EditPassengerList").getPath();
                                        var sId = that.getModel("EditPassengerList").getProperty(sPath + "/PassengerId");
                                        if (sId === "") {
                                            var iIndex = sPath.substr(1);
                                            that.getModel("EditPassengerList").getData().splice(that.getView().byId("stPassengerListModif").getItems().length - 1, 1); 
                                            that.getModel("EditPassengerList").updateBindings(); 
                                        } 
                                    });

                                    /*Delete Button Handling*/
                                    if (this.getView().byId("stPassengerListModif").getItems().length === 0) {
                                        oConfigModel.setProperty("/pecTableBtn/deleteDisable", false);
                                    } else {
                                        oConfigModel.setProperty("/pecTableBtn/deleteDisable", true);
                                    }
                                } else if (oAction === sap.m.MessageBox.Action.CANCEL) {
                                    this.getView().byId("stPassengerListModif").removeSelections(true);
                                }
                                this.fnUpdatePassengerCount();
                            }).bind(this)
                        }
                    );
                }
            },

            fnUpdatePassengerCount: function (){
                var oConfigModel = oView.getModel("UIConfig"),
                sCount = this.getView().byId("stPassengerListModif").getItems().length;;
                oConfigModel.setProperty("count/Passengers", " (" + sCount + ")");
            }
      });
    }
  );