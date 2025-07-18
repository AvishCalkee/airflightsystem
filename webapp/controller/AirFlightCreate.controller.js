sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	'sap/ui/core/date/UI5Date',
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
],
	function (Controller, JSONModel, MessageBox, UI5Date, MessageToast,Filter) {
		"use strict";

		return Controller.extend("fiori.bootcamp.airflightsystem.controller.AirFlightCreate", {
			onInit: function () {
				var oView = this.getView();
				var oBookingModel = new JSONModel({});
				oView.setModel(oBookingModel, "Booking");
				var oCrewModel = new JSONModel([]);
				oView.setModel(oCrewModel, "CrewModel");

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("AirFlightCreate").attachPatternMatched(this.fnIntModel, this);

			},

			fnIntModel: function (oEvent) {

				var oModel = new JSONModel({
					Destination: "",
					Departure: "",
					CreationDate: UI5Date.getInstance(),
					FlightStatus: "In creation",
					AilineId: "",
					FlightId: "",
					DestinationAirportCode: "",
					OriginAirportCode: "",
					DepartureDateTime: UI5Date.getInstance(),
					ArrivalDateTime: "",
					FlightDuration: ""

				});

				this.getView().setModel(oModel);
				this.getView().bindElement({ path: "/" });
				var oModel = this.getOwnerComponent().getModel();
				this.getView().byId("cbxFrom").setBusy(true);
				this.getView().byId("cbxTo").setBusy(true);
				oModel.read("/AirportSet", {

					method: "GET",
					success: function (data, textStatus, jqXHR) {
						var oModelList = new JSONModel();
						oModelList.setData(data.results);
						this.getView().setModel(oModelList, "oAirPort");
						this.getView().byId("cbxFrom").setBusy(false);
						this.getView().byId("cbxTo").setBusy(false);
					}.bind(this),
					error: function (data, textStatus, jqXHR) {
						this.getView().byId("cbxFrom").setBusy(false);
						this.getView().byId("cbxTo").setBusy(false);
					}.bind(this)
				});

				var oDestinationModel = new JSONModel();
				oDestinationModel.setData(this.getOwnerComponent().getModel("flightDestination_global_json_model").getData());
				this.getView().setModel(oDestinationModel);

				var oCreationDate = this.getView().byId("dpCreationDate");
				oCreationDate.setValue(new Date());
				oCreationDate.setEditable(false);

				var oStatus = this.getView().byId("ilStatus");
				oStatus.setText("In creation");
			},

			fnSave: function (oEvent) {
				var oModel = this.getOwnerComponent().getModel(),
					oFlightData = this.getView().getModel().getData(),
					FlightEntity = JSON.parse(JSON.stringify(oFlightData)),
					aCrew = this.getView().getModel("CrewModel").getData();

				if (this.fnBRequiredFields(FlightEntity)) {
					MessageBox.error("Required fields missing");
					return;
				}

				oModel.setUseBatch(true);
				oModel.setDeferredGroups(["creationGroup"]);
				oModel.setChangeGroups({
					"*": {
						groupId: "creationGroup",
						changeSetId: "FlightCreate"
					}
				});



				FlightEntity.FlightStatus = "A";
				delete FlightEntity.Departure;
				delete FlightEntity.Destination;
				delete FlightEntity.OriginAirportName;
				delete FlightEntity.CreationDate;
				delete FlightEntity.DestinationAirportName;
				delete FlightEntity.DestinationCountries;
				delete FlightEntity.AirlineName;

				//Remove offset errors
				if (FlightEntity.ArrivalDateTime != undefined && FlightEntity.DepartureDateTime != undefined0) {
					FlightEntity.ArrivalDateTime = FlightEntity.ArrivalDateTime.slice(1, -5);
					FlightEntity.DepartureDateTime = FlightEntity.DepartureDateTime.slice(1, -5);
				}
				//FlightEntity.crew = aCrew;
				this.getView().setBusy(true);

				oModel.create("/FlightSet", FlightEntity, {
					groupId: "creationGroup"
				});

				aCrew.forEach(function (objCrew) {
					oModel.create("/CrewSet", objCrew, {
						groupId: "creationGroup"
					});
				}.bind(this));


				var savePromises = [new Promise(function (resolve, reject) {
					oModel.submitChanges({
						groupId: "creationGroup",
						success: resolve,
						error: reject
					});
				})];

				Promise.all(savePromises).then(function (oSuccess) {
					var flightResponse = "",
						newFlightId = "";

					//If there were no exceptions, get the id of the created flight
					if (Object.keys(oSuccess[0].__batchResponses[0])[0] === "__changeResponses") {
						//We got responses to our batch request, get the one related to the 
						//Flight entity
						flightResponse = oSuccess[0].__batchResponses[0].__changeResponses.find(function (response) {
							return response.data.__metadata.type === "ZGW_ZD_FLIGHTSYSTEM_SRV.Flight";
						});
						//Get the newly created entity's id
						newFlightId = flightResponse.data.FlightId;
					}

					this.getView().setBusy(false);
					MessageToast.show("Saved Successfully");

					//Navigate to details page
					this.fnNavigateToDetailPage(newFlightId);

				}.bind(this),
					function (oError) {
						MessageToast.error("Error occured");
					}.bind(this));

			},

			/*handle date change - formatting*/
			onHandleDateChange: function (oEvent) {

			},
			/*Airline valuehelp*/
			onRequestAirline: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getOwnerComponent().getModel();
				this.getView().setBusy(true);
				oModel.read("/AirlineSet", {
					success: jQuery.proxy(this.getAirlineList, this),
					error: jQuery.proxy(this.getAirlineListFailure, this)
				});

			},
			getAirlineList: function (oData, response) {
				this.getView().setBusy(false);
				var AirlineValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Airline Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "AirlineId",
					descriptionKey: "AirlineName",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());

						AirlineValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						AirlineValueHelp.close();
					},
					afterClose: function () {
						AirlineValueHelp.destroy();
					}
				});

				AirlineValueHelp.setKey("AirlineId");

				AirlineValueHelp.setRangeKeyFields([{
					label: "Airline Id",
					key: "AilineId"
				}, {
					label: "Airline Name",
					key: "HrtbAirportname"

				},{
					label: "Country Name",
					key: "CountryName"
				},
			
			]);

				var airlineF4ColModel = new sap.ui.model.json.JSONModel();
				airlineF4ColModel.setData({
					cols: [{
						label: "Airline Id",
						template: "AilineId"
					}, {
						label: "Airline Name",
						template: "HrtbAirportname"

					}, {
						label: "Operating Country",
						template: "CountryName"

					}]
				});

				AirlineValueHelp.setModel(airlineF4ColModel, "columns");
				var airlineF4RowsModel = new sap.ui.model.json.JSONModel();
				airlineF4RowsModel.setData(oData.results);
				AirlineValueHelp.setModel(airlineF4RowsModel);

				if (AirlineValueHelp.getTable().bindRows) {
					AirlineValueHelp.getTable().bindRows("/");
				}

				if (AirlineValueHelp.getTable().bindItems) {
					var oTable = AirlineValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				AirlineValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airline",
							name: "AilineId",
							label: "Airline Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airline",
							name: "HrtbAirportname",
							label: "Airline Name",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airline",
							name: "CountryName",
							label: "Operating Country",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (AirlineValueHelp.theTable.getBinding("rows")) {
							oBinding = AirlineValueHelp.theTable.getBinding("rows");
						} else if (AirlineValueHelp.theTable.getBinding("items")) {
							oBinding = AirlineValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new Filter("AilineId", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new Filter("HrtbAirportname", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("AirlineBasicSearch").getValue() !== "") {
							let oFilterCode = new Filter("AilineId", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirlineBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new Filter("HrtbAirportname", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirlineBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new sap.ui.model.Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "AirlineBasicSearch",
						search: function (event) {
							let airlineBasicSearchText = event.getSource().getValue();
							if (airlineBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (AirlineValueHelp.theTable.getBinding("rows")) {
									oBinding = AirlineValueHelp.theTable.getBinding("rows");
								} else if (AirlineValueHelp.theTable.getBinding("items")) {
									oBinding = AirlineValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new Filter("AilineId", sap.ui.model.FilterOperator.Contains,
									airlineBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new Filter("HrtbAirportname", sap.ui.model.FilterOperator.Contains,
									airlineBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				AirlineValueHelp.setFilterBar(oFilterBar);
			},
			getAirlineListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},
			/*Flight valuehelp*/
			onRequestFlight: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getOwnerComponent().getModel();
				this.getView().setBusy(true);
				oModel.read("/FlightSet", {
					success: jQuery.proxy(this.getFlightList, this),
					error: jQuery.proxy(this.getFlightListFailure, this)
				});

			},
			getFlightList: function (oData, response) {
				this.getView().setBusy(false);
				var FlightValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Flight Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "FlightId",
					descriptionKey: "FlightNo",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());

						FlightValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						FlightValueHelp.close();
					},
					afterClose: function () {
						FlightValueHelp.destroy();
					}
				});

				FlightValueHelp.setKey("FlightId");

				FlightValueHelp.setRangeKeyFields([{
					label: "Flight Id",
					key: "FlightId"
				}, {
					label: "Flight No",
					key: "FlightNo"
				}]);

				var flightF4ColModel = new sap.ui.model.json.JSONModel();
				flightF4ColModel.setData({
					cols: [{
						label: "Flight Id",
						template: "FlightId"
					}, {
						label: "Flight No",
						template: "FlightNo"

					}, {
						label: "Airline Id",
						template: "AirlineId"

					}, {
						label: "OriginAirportCode",
						template: "Origin Airport Code"

					}]
				});

				FlightValueHelp.setModel(flightF4ColModel, "columns");
				var flightF4RowsModel = new sap.ui.model.json.JSONModel();
				flightF4RowsModel.setData(oData.results);
				FlightValueHelp.setModel(flightF4RowsModel);

				if (FlightValueHelp.getTable().bindRows) {
					FlightValueHelp.getTable().bindRows("/");
				}

				if (FlightValueHelp.getTable().bindItems) {
					var oTable = FlightValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}
				FlightValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "FlightId",
							label: "Flight Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "FlightNo",
							label: "Flight No",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "AirlineId",
							label: "Airline Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Flight",
							name: "OriginAirportCode",
							label: "Origin Airport Code",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (FlightValueHelp.theTable.getBinding("rows")) {
							oBinding = FlightValueHelp.theTable.getBinding("rows");
						} else if (FlightValueHelp.theTable.getBinding("items")) {
							oBinding = FlightValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new Filter("FlightId", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new Filter("FlightNo", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("FlightBasicSearch").getValue() !== "") {
							let oFilterCode = new Filter("FlightId", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"FlightBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new Filter("FlightNo", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"FlightBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "FlightBasicSearch",
						search: function (event) {
							let flightBasicSearchText = event.getSource().getValue();
							if (flightBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (FlightValueHelp.theTable.getBinding("rows")) {
									oBinding = FlightValueHelp.theTable.getBinding("rows");
								} else if (FlightValueHelp.theTable.getBinding("items")) {
									oBinding = FlightValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new Filter("FlightId", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new Filter("FlightNo", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				FlightValueHelp.setFilterBar(oFilterBar);
			},
			getFlightListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},

			/*Airport code valuehelp*/
			onRequestAirportCode: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getOwnerComponent().getModel();
				this.getView().setBusy(true);
				oModel.read("/AirportSet", {
					success: jQuery.proxy(this.getAirportList, this),
					error: jQuery.proxy(this.getAirportListFailure, this)
				});

			},
			getAirportList: function (oData, response) {
				this.getView().setBusy(false);
				var AirportValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Airport Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "AirportCode",
					descriptionKey: "AirportName",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());
						this.oInput.fireChange();
						AirportValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						AirportValueHelp.close();
					},
					afterClose: function () {
						AirportValueHelp.destroy();
					}
				});

				AirportValueHelp.setKey("AirportCode");

				AirportValueHelp.setRangeKeyFields([{
					label: "Airport Code",
					key: "AirportCode"
				}, {
					label: "Airport Name",
					key: "AirportName"
				}]);

				var airportF4ColModel = new sap.ui.model.json.JSONModel();
				airportF4ColModel.setData({
					cols: [{
						label: "Airport Code",
						template: "AirportCode"
					}, {
						label: "Airport Name",
						template: "AirportName"

					}, {
						label: "Country",
						template: "Country"

					}, {
						label: "City",
						template: "City"

					}]
				});

				AirportValueHelp.setModel(airportF4ColModel, "columns");
				var airportF4RowsModel = new sap.ui.model.json.JSONModel();
				airportF4RowsModel.setData(oData.results);
				AirportValueHelp.setModel(airportF4RowsModel);

				if (AirportValueHelp.getTable().bindRows) {
					AirportValueHelp.getTable().bindRows("/");
				}

				if (AirportValueHelp.getTable().bindItems) {
					var oTable = AirportValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				AirportValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "AirportCode",
							label: "Airport Code",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "AirportName",
							label: "Airport Name",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "Country",
							label: "Country",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Airport",
							name: "City",
							label: "City",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (AirportValueHelp.theTable.getBinding("rows")) {
							oBinding = AirportValueHelp.theTable.getBinding("rows");
						} else if (AirportValueHelp.theTable.getBinding("items")) {
							oBinding = AirportValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new Filter("AirportCode", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new Filter("AirportName", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("AirportBasicSearch").getValue() !== "") {
							let oFilterCode = new Filter("AirportCode", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirportBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new Filter("AirportName", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"AirportBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "AirportBasicSearch",
						search: function (event) {
							let flightBasicSearchText = event.getSource().getValue();
							if (flightBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (AirportValueHelp.theTable.getBinding("rows")) {
									oBinding = AirportValueHelp.theTable.getBinding("rows");
								} else if (AirportValueHelp.theTable.getBinding("items")) {
									oBinding = AirportValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new Filter("AirportCode", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new Filter("AirportName", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				AirportValueHelp.setFilterBar(oFilterBar);
			},
			getAirportListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},

			onRequestCrew: function (oEvent) {
				this.oInput = oEvent.getSource();
				var oModel = this.getOwnerComponent().getModel();
				this.getView().setBusy(true);
				oModel.read("/CrewSet", {
					success: jQuery.proxy(this.getCrewList, this),
					error: jQuery.proxy(this.getCrewListFailure, this)
				});

			},
			getCrewList: function (oData, response) {
				this.getView().setBusy(false);
				var CrewValueHelp = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
					title: "Crew Value Help",
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					key: "CrewId",
					descriptionKey: "Role",
					ok: jQuery.proxy(function (oControlEvent) {
						this.oInput.setValue(oControlEvent.getParameter("tokens")[0].getKey());
						CrewValueHelp.close();
					}, this),
					cancel: function (oControlEvent) {
						CrewValueHelp.close();
					},
					afterClose: function () {
						CrewValueHelp.destroy();
					}
				});

				CrewValueHelp.setKey("CrewId");

				CrewValueHelp.setRangeKeyFields([{
					label: "Crew Id",
					key: "CrewtId"
				}, {
					label: "Role",
					key: "Role"
				}]);

				var crewF4ColModel = new sap.ui.model.json.JSONModel();
				crewF4ColModel.setData({
					cols: [{
						label: "Crew Id",
						template: "CrewId"
					}, {
						label: "Role",
						template: "Role"

					}, {
						label: "Last Name",
						template: "LastName"

					}, {
						label: "First Name",
						template: "FirstName"

					}]
				});

				CrewValueHelp.setModel(crewF4ColModel, "columns");
				var crewF4RowsModel = new sap.ui.model.json.JSONModel();
				crewF4RowsModel.setData(oData.results);
				CrewValueHelp.setModel(crewF4RowsModel);

				if (CrewValueHelp.getTable().bindRows) {
					CrewValueHelp.getTable().bindRows("/");
				}

				if (CrewValueHelp.getTable().bindItems) {
					var oTable = CrewValueHelp.getTable();

					oTable.bindAggregation("items", "/", function (sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function (column) {
								let colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				CrewValueHelp.open();

				//Filter bar creation
				let oFilterBar = new sap.ui.comp.filterbar.FilterBar({
					//  id: "F4SupplierDialog",
					advancedMode: true,
					filterBarExpanded: false,
					filterGroupItems: [
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "CrewId",
							label: "Crew Id",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "Role",
							label: "Role",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "LastName",
							label: "Last Name",
							control: new sap.m.Input()
						}),
						new sap.ui.comp.filterbar.FilterGroupItem({
							groupName: "Crew",
							name: "FirstName",
							label: "First Name",
							control: new sap.m.Input()
						})
					],
					search: function (oEvent) {
						let aSelectionSet = oEvent.getParameters().selectionSet;
						let oBinding;
						if (CrewValueHelp.theTable.getBinding("rows")) {
							oBinding = CrewValueHelp.theTable.getBinding("rows");
						} else if (CrewValueHelp.theTable.getBinding("items")) {
							oBinding = CrewValueHelp.theTable.getBinding("items");
						}
						let aFilterItems = [];
						let bAllFieldsEmpty = true;
						let oFilter = {};
						let aFilter = [];
						if (aSelectionSet[0].getValue() !== "") {
							let oFilterCode = new Filter("CrewId", sap.ui.model.FilterOperator.Contains, aSelectionSet[0].getValue());
							aFilterItems.push(oFilterCode);
							bAllFieldsEmpty = false;
						}
						if (aSelectionSet[1].getValue() !== "") {
							let oFilterName = new Filter("Role", sap.ui.model.FilterOperator.Contains, aSelectionSet[1].getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (sap.ui.getCore().byId("CrewBasicSearch").getValue() !== "") {
							let oFilterCode = new Filter("CrewId", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"CrewBasicSearch").getValue());
							aFilterItems.push(oFilterCode);
							let oFilterName = new Filter("Role", sap.ui.model.FilterOperator.Contains, sap.ui.getCore().byId(
								"CrewBasicSearch").getValue());
							aFilterItems.push(oFilterName);
							bAllFieldsEmpty = false;
						}
						if (!bAllFieldsEmpty) {
							oFilter = new Filter(aFilterItems, false);
							aFilter.push(oFilter);
						}
						oBinding.filter(aFilter);
					}
				});

				//Check when the below condition is satisfied
				if (oFilterBar.setBasicSearch) {
					oFilterBar.setBasicSearch(new sap.m.SearchField({
						showSearchButton: sap.ui.Device.system.phone,
						placeholder: "{i18n>SRCH}",
						id: "CrewBasicSearch",
						search: function (event) {
							let flightBasicSearchText = event.getSource().getValue();
							if (flightBasicSearchText !== "") {
								let aFilterItems = [];
								let oFilter = {};
								let aFilter = [];
								let oBinding;
								if (CrewValueHelp.theTable.getBinding("rows")) {
									oBinding = CrewValueHelp.theTable.getBinding("rows");
								} else if (CrewValueHelp.theTable.getBinding("items")) {
									oBinding = CrewValueHelp.theTable.getBinding("items");
								}
								let oFilterCode = new Filter("CrewId", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterCode);
								let oFilterName = new Filter("Role", sap.ui.model.FilterOperator.Contains,
									flightBasicSearchText);
								aFilterItems.push(oFilterName);
								oFilter = new Filter(aFilterItems, false);
								aFilter.push(oFilter);
								oBinding.filter(aFilter);
							}
						}
					}));
				}
				CrewValueHelp.setFilterBar(oFilterBar);
			},
			getCrewListFailure: function (oError) {
				this.getView().setBusy(false);
				let oMessage = oError.message;
				MessageBox.error(oMessage, {
					title: "Error"
				});
			},
			/*Save Booking
			onPressSaveBooking: function (oEvent) {
				var that = this;
				this.getView().setBusy(true);
				var oModel = this.getView().getModel();
				var oBookingModel = this.getView().getModel("Booking");
				var oBookingObj = oBookingModel.getData();

				oModel.create("/", oBookingObj, {
					method: "POST",
					success: function (oData, response) {
						that.getView().setBusy(false);
						MessageBox.success(response.success.message.value);
					}.bind(that),
					error: function (oError) {
						that.getView().setBusy(false);
						MessageBox.error(oError.error.message.value);
					}.bind(that)
				});

			},*/
			/*Cancel Booking - clear booking screen*/
			/*onPressCancelBooking: function (oEvent) {
				
				window.history.go(-1);

			},*/
			onAddCrew: function (oEvent) {
				this.getView().getModel("CrewModel").setProperty("/", this.getView().getModel("CrewModel").getProperty("/").concat({
					"CrewId": "",
					"LastName": "",
					"FirstName": "",
					"Role": ""
				}));
			},
			onDeleteCrew: function (oEvent) {
				var oCrewModel = this.getView().getModel("CrewModel");
				var aCrewData = oCrewModel.getData();
				var oTable = this.getView().byId("idCrewTable");

				var oSelectedIndex = parseInt(oTable.getSelectedContexts()[0].getPath().split("/")[1]);
				aCrewData.splice(oSelectedIndex, 1);
				oCrewModel.setData(aCrewData);
				oCrewModel.refresh();

			},
			handleChange: function (oEvent) {
				var oDateTimePicker1 = this.getView().byId("dpDepatrueDate");
				var oDateTimePicker2 = this.getView().byId("dpArrivalDate");

				var oDate1 = oDateTimePicker1.getDateValue();
				var oDate2 = oDateTimePicker2.getDateValue();

				if (oDate1 && oDate2) {
					var diffInMs = Math.abs(oDate2 - oDate1);

					var diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // Difference in minutes
					var diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); // Difference in hours
					var diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Difference in days

					var oResultText = this.getView().byId("idDurationTxt");
					//oResultText.setText(diffInHours + " hours");
				} else {
					MessageToast.show("Please select both dates.");
				}
			},
			/*onChangeDestination: function () {
				var oComboBoxFrom = this.getView().byId("idDepartureFrom");
				var oComboBoxTo = this.getView().byId("idDepartureTo");

				var sCountryFrom = oComboBoxFrom.getSelectedKey();
				var sCountryTo = oComboBoxTo.getSelectedKey();

				if (sCountryFrom && sCountryTo && sCountryFrom === sCountryTo) {
					// Display error message
					MessageBox.error("Destination From and Destination To cannot be the same.");

					// Set value state to Error
					oComboBoxFrom.setValueState("Error");
					oComboBoxTo.setValueState("Error");
				} else {
					oComboBoxFrom.setValueState("None");
					oComboBoxTo.setValueState("None");
				}
			},*/
			fnNavigateToDetailPage: function (newFlightId) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("AirFlightDetail", { DetailPath: "FlightSet('" + newFlightId + "')" });
			},

			fnBRequiredFields: function (oEntity) {
				if (oEntity.CreationDate === '' || oEntity.CreationDate != undefined) {
					return true;
				} else if (oEntity.AilineId === '' || oEntity.AilineId === undefined) {
					return true;
				} else if (oEntity.AirlineName === '' || oEntity.AirlineName === undefined) {
					return true;
				} else if (oEntity.FlightNo === '' || oEntity.FlightNo === undefined) {
					return true;
				} else if (oEntity.DestinationAirportCode === '' || oEntity.DestinationAirportCode === undefined) {
					return true;
				} else if (oEntity.DestinationAirportName === '' || oEntity.DestinationAirportName === undefined) {
					return true;
				} else if (oEntity.OriginAirportCode === '' || oEntity.OriginAirportCode === undefined) {
					return true;
				} else if (oEntity.OriginAirportName === '' || oEntity.OriginAirportName === undefined) {
					return true;
				} else if (oEntity.DepartureDateTime === '' || oEntity.DepartureDateTime === undefined) {
					return true;
				} else if (oEntity.ArrivalDateTime === '' || oEntity.ArrivalDateTime === undefined) {
					return true;
				}
				return false;
			},

			fnTrackChange: function (oEvent) {
				var oView = this.getView(),
					oModel = oView.getModel(),
					sSelectedKeyFrom = oModel.getProperty('/DestinationAirportCode'),
					sSelectedKeyTo = oModel.getProperty('/OriginAirportCode'),
					aAirport = this.getView().getModel("oAirPort").getProperty("/"),
					sSelectedObjFrom = '',
					sSelectedObjTo = '',
					oI18n = this.getOwnerComponent().getModel("i18n");

				if (sSelectedKeyTo === sSelectedKeyFrom) {
					// Display error message
					MessageBox.error(oI18n.getProperty("msgErrorSameDesAndArrival"));
					oView.getModel("UIModel").setProperty("/TravelState", "Error");
				} else {
					oView.getModel("UIModel").setProperty("/TravelState", "None");
					sSelectedObjFrom = aAirport.find(obj => obj.AirportCode === sSelectedKeyFrom);
					sSelectedObjTo = aAirport.find(obj => obj.AirportCode === sSelectedKeyTo);
					if (sSelectedObjFrom !== undefined) {
						oModel.setProperty("/DestinationAirportName", sSelectedObjFrom.AirportName);
					}
					if (sSelectedObjTo !== undefined) {
						oModel.setProperty("/OriginAirportName", sSelectedObjTo.AirportName);
					}
				}
			}
		});
	});