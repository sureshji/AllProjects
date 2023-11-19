sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/m/MessageBox',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/m/Token',
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",

], function (Controller, MessageToast, MessageBox, Filter, FilterOperator, Token, JSONModel, CoreLibrary) {
	'use strict'
	var ValueState = CoreLibrary.ValueState;
	return Controller.extend('com.yokogawa.zhmm0015.controller.Selectionscreen', {

		onBeforeRendering: function () {
			let oResourceBundle = this.getView().getModel('i18n').getResourceBundle()

			var sMode = this.getView().getModel('zhmm0015').getProperty('/selected')
			// if (sMode === 'NormalMode') {
			let today = new Date()
			var enddate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			var endtime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			// }
			let oModel = this.getView().getModel('zhmm0015');
			oModel.setData({
				items: [{
					key: 'NormalMode',
					text: oResourceBundle.getText('NormalMode')
				}, {
					key: 'RecoveryMode',
					text: oResourceBundle.getText('RecoveryMode')
				}
				],
				selected: 'NormalMode',
				Material: {
					value: []
				},
				tableItems: [],
				enddate: enddate,
				endtime: endtime
			})

			var fnValidator = function (args) {
				var text = args.text;
				return new Token({ key: text, text: text });
			};

			let oMatnr = this.byId('MaterialNumber')
			oMatnr.addValidator(fnValidator);
			oMatnr.attachTokenUpdate(function (oEvent) {
				var sType = oEvent.getParameter("type"),
					aAddedTokens = oEvent.getParameter("addedTokens"),
					aRemovedTokens = oEvent.getParameter("removedTokens"),
					aContexts = oModel.getProperty('/Material/value')

				switch (sType) {
					// add new context to the data of the model, when new token is being added
					case "added":
						aAddedTokens.forEach(function (oToken) {
							aContexts.push({ key: oToken.getKey(), text: oToken.getText() });
						});
						break;
					// remove contexts from the data of the model, when tokens are being removed
					case "removed":
						aRemovedTokens.forEach(function (oToken) {
							aContexts = aContexts.filter(function (oContext) {
								return oContext.key !== oToken.getKey();
							});
						});
						break;
					default: break;
				}

				oModel.setProperty("MaterialNumber/value", aContexts);
			})
		},

		onPressOfExecute: function (oEvent) {
			var data = [];
			var oView = this.getView()
			let oModel = this.getView().getModel('zhmm0015');
			var sMode = oModel.getProperty('/selected')

			if (this._hasValidationErrors(this)) {
				return
			}
			switch (sMode) {
				case "RecoveryMode":
					let oMatnr = oView.getModel('zhmm0015').getData()
					var sMaterialNumber = oMatnr.Material.value[0].key;

					let oPromise_vb31 = this._getReadPromise(oView.getModel('vb31'), [{ sPath: `/ZBQIF0051_001(ZVAOO0029='${sMaterialNumber}')/Results`, aFilters: [] }])
					let oPromise_vb32 = this._getReadPromise(oView.getModel('vb32'), [{ sPath: `/ZBQIF0052_001(ZVAOO0059='${sMaterialNumber}')/Results`, aFilters: [] }])
					let oPromise_vb33 = this._getReadPromise(oView.getModel('vb33'), [{ sPath: `/ZBQIF0059_001(ZVAOO0040='${sMaterialNumber}')/Results`, aFilters: [] }])
					let oPromise_vb34 = this._getReadPromise(oView.getModel('vb34'), [{ sPath: `/ZBQIF0078_001(ZVAOO0010='${sMaterialNumber}')/Results`, aFilters: [] }])

					const oAllPromise = Promise.all([
						oPromise_vb31,
						oPromise_vb32,
						oPromise_vb33,
						oPromise_vb34
					])

					oAllPromise
						.then(function (aResponses) {
							MessageToast.show('Received data from BW')

							let oStagingData = this._getDataForStaging(aResponses)
							let aStagingData = []
							let aStagingDataTemp = []
							let aFilters = []
							let oPromise

							// if (sMode === 'NormalMode') {
							aStagingData = oStagingData.aDataForStaging_36.map(oStagingData => ({
								sPath: '/ZTHBT0036',
								oData: oStagingData
							}))

							aStagingDataTemp = oStagingData.aDataForStaging_96.map(oStagingData => ({
								sPath: '/ZTHBT0096',
								oData: oStagingData
							}))

							aStagingData = aStagingData.concat(aStagingDataTemp)

							oPromise = this._getCreatePromise(oView.getModel(), aStagingData)
							// } else {
							// 	aFilters = [
							// 		new Filter({
							// 			path: 'MATERIAL_NUMBER',
							// 			operator: FilterOperator.EQ,
							// 			value1: sMaterialNumber
							// 		})
							// 	]

							// 	aStagingData = oStagingData.aDataForStaging_36.map(oStagingData => ({
							// 		sPath: `/ZTHBT0036(RECORD_CLASSIFICATION='${oStagingData.RECORD_CLASSIFICATION}'`
							// 			+ `,MATERIAL_NUMBER='${oStagingData.MATERIAL_NUMBER}',MATERIAL_TYPE='${oStagingData.MATERIAL_TYPE}'`
							// 			+ `,MATERIAL_GROUP='${oStagingData.MATERIAL_GROUP}',PRODUCT_HIERACHY='${oStagingData.PRODUCT_HIERACHY}'`
							// 			+ `,EXT_MATERIAL_GRP='${oStagingData.EXT_MATERIAL_GRP}',LAB_DESIGN_OFFICE='${oStagingData.LAB_DESIGN_OFFICE}')`,
							// 		oData: oStagingData
							// 	}))

							// 	aStagingDataTemp = oStagingData.aDataForStaging_96.map(oStagingData => ({
							// 		sPath: `/ZTHBT0096(RECORD_CLASSIFICATION='${oStagingData.RECORD_CLASSIFICATION}'`
							// 			+ `,MATERIAL_NUMBER='${oStagingData.MATERIAL_NUMBER}',MATERIAL_DESCRIPTION='${oStagingData.MATERIAL_DESCRIPTION}'`
							// 			+ `,LANGUAGE_KEY='${oStagingData.LANGUAGE_KEY}')`,
							// 		oData: oStagingData
							// 	}))
							// 	oPromise = this._getUpdatePromise(oView.getModel(), aStagingData)
							// }
							oPromise
								.then(function (oResponse) {
									MessageToast.show('BTP tables updated successfully')

									aFilters = oMatnr.Material.value.map(function (matnr) {
										return new Filter({
											path: 'MATERIAL_NUMBER',
											operator: FilterOperator.EQ,
											value1: matnr.key
										})
									})
									let bFilters = [];
									bFilters = oMatnr.Material.value.map(function (matnr) {
										return new Filter({
											path: 'MODEL',
											operator: FilterOperator.EQ,
											value1: matnr.key
										})
									})


									let aRequests_BTP = [{
										sPath: "/ZTHBT0034",
										//aFilters: [new Filter({ path: '', operator: 'EQ', value1: '' })]
									}, {
										sPath: "/ZTHBT0035",
										//aFilters: [new Filter({ path: '', operator: 'EQ', value1: '' })]
									}, {
										sPath: "/ZTHBT0036",
										aFilters: aFilters
									}, {
										sPath: "/ZTHBT0096",
										aFilters: aFilters
										//aFilters: [new Filter({ path: '', operator: 'EQ', value1: '' })]
									},
									//  {
									// 	sPath: "/ZTHBT0032",
									// 	bFilters: bFilters
									// 	//aFilters: [new Filter({ path: '', operator: 'EQ', value1: '' })]
									// }, {
									// 	sPath: "/ZTHBT0033",
									// 	bFilters: bFilters
									// 	//aFilters: [new Filter({ path: '', operator: 'EQ', value1: '' })]
									// }
								]

									this._getReadPromise(oView.getModel(), aRequests_BTP)
										.then(function (oResponse_btp) {
											let aMaterialData = this._getDataForMaterialCreation(oResponse_btp).map(oMaterialData => ({
												sPath: '/ZCDSEHMMC0019',
												oData: oMaterialData
											}))

											this._getCreatePromise(oView.getModel('s4'), aMaterialData)
												.then(function (oResponse) {
													// MessageToast.show('Material(s) created in S4 successfully')

													let aProcessedData = []

													oResponse.__batchResponses.forEach(function (oBathResponse) {
														oBathResponse.__changeResponses.forEach(function (oChangeResponse) {
															aProcessedData.push(oChangeResponse.data)
														})
													})

													oView.getModel('zhmm0015').setProperty('/tableItems', aProcessedData)
												})
										}.bind(this))
								}.bind(this))
						}.bind(this))
					break;
				case "NormalMode":
					var userInfo = sap.ushell.Container.getService("UserInfo"),
						today = new Date(),
						dd = today.getDate(),
						MM = (today.getMonth() + 1),
						yyyy = today.getFullYear(),
						url_render = $.sap.getModulePath("com.yokogawa.zhmm0015") + "/scheduler/jobs/398809/schedules",
						newData = {
							data: data,
							description: "Job scheduled by " + userInfo.getFullName() + " on " + MM + '/' + dd + '/' + yyyy,
							active: true,
							type: "one-time",
							time: "now"
						}
					$.ajax({
						url: url_render,
						type: 'POST',
						data: JSON.stringify(newData),
						contentType: "application/json",
						success: function (data) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.success("Job Schedule id: " + data.scheduleId + "was created successfully");
						},
						error: function (e) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error("error: " + e);
						}
					});

					break;
				default: break;
			}
		},

		_getCreatePromise: function (oModel, aContent) {
			return new Promise(function (resolve, reject) {
				var sGroup = jQuery.sap.uid()

				oModel.setDeferredGroups([sGroup])

				aContent.forEach(oContent => {
					oModel.create(oContent.sPath, oContent.oData, {
						groupId: sGroup,
					})
				})

				oModel.submitChanges({
					groupId: sGroup,
					success: function (oResponse) {
						resolve(oResponse)
					},
					error: function (oError) {
						reject(oError)
					}
				})
			})
		},

		_getReadPromise: function (oModel, aContent) {
			return new Promise(function (resolve, reject) {
				var sGroup = jQuery.sap.uid()

				oModel.setDeferredGroups([sGroup])

				aContent.forEach(oContent => {
					oModel.read(oContent.sPath, {
						groupId: sGroup,
						filters: oContent.aFilters
					})
				})

				oModel.submitChanges({
					groupId: sGroup,
					success: function (oResponse) {
						resolve(oResponse)
					},
					error: function (oError) {
						reject(oError)
					}
				})
			})
		},

		_getUpdatePromise: function (oModel, aContent) {
			return new Promise(function (resolve, reject) {
				var sGroup = jQuery.sap.uid()

				oModel.setDeferredGroups([sGroup])

				aContent.forEach(oContent => {
					oModel.update(oContent.sPath, oContent.oData, {
						groupId: sGroup
					})
				})

				oModel.submitChanges({
					groupId: sGroup,
					success: function (oResponse) {
						resolve(oResponse)
					},
					error: function (oError) {
						reject(oError)
					}
				})
			})
		},

		_getDataForStaging: function (aResponses) {
			let aResults_vb31 = aResponses[0].__batchResponses[0].data.results
			let aResults_vb32 = aResponses[1].__batchResponses[0].data.results
			let aResults_vb33 = aResponses[2].__batchResponses[0].data.results
			let aResults_vb34 = aResponses[3].__batchResponses[0].data.results
			let aDataForStaging_36 = []
			let aDataForStaging_96 = []

			aResults_vb31.forEach(ov31 => {
				let vProdH = ov31.A4ZCPIF0051STATISTICS_0.concat(ov31.A4ZCPIF0051STATISTICS_1, ov31.A4ZCPIF0051STATISTICS_C)
				let oDataForStagging = {
					RECORD_CLASSIFICATION: 'H',
					MATERIAL_NUMBER: ov31.A4ZCPIF0051SUPERVISE_MO,
					MATERIAL_TYPE: ov31.A4ZCPIF0051MATERIAL_TYP,
					MATERIAL_GROUP: ov31.A4ZCPIF0051MATERIAL_GRO,
					PRODUCT_HIERACHY: ov31.A4ZCPIF0051STATISTICS_0,
					EXT_MATERIAL_GRP: ov31.A4ZCPIF0051EXT_MATERIAL,
					SEC_EXPORT_ITM: ov31.A4ZCPIF0051SECURITY_EXP,
				}

				let ov32 = aResults_vb32.find(o => { o.A4ZCPIF0052MODEL === ov31.A4ZCPIF0051SUPERVISE_MO })

				if (ov32) {
					oDataForStagging.NETWEIGHT = ov32.A4ZCPIF0052WEIGHT_UNIT
					oDataForStagging.WARRANTY_PERIOD = ov32.A00A9WDUEY7H9FAHLKHZ357T4O
				}

				let ov33 = aResults_vb33.find(o => { o.A4ZCPIF0059PARTS_NO === ov31.A4ZCPIF0051SUPERVISE_MO })
				if (ov33 && ov33.A4ZCPIF0059SALE_PMK_COD) {
					oDataForStagging.LAB_DESIGN_OFFICE = ov33.A4ZCPIF0059SALE_PMK_COD
				} else {
					oDataForStagging.LAB_DESIGN_OFFICE = ov31.A4ZCPIF0051PMK_CODE
				}
				aDataForStaging_36.push(oDataForStagging)
			})

			aResults_vb34.forEach(ov34 => {
				aDataForStaging_96.push({
					RECORD_CLASSIFICATION: 'T',
					MATERIAL_NUMBER: ov34.A4ZCPIF0078SUPERVISE_MO,
					LANGUAGE_KEY: ov34.A4ZCPIF0078LANG_TYPE,
					MATERIAL_DESCRIPTION: ov34.A4ZCPIF0078MODEL_DESCRI
				})
			})

			return {
				aDataForStaging_36: aDataForStaging_36,
				aDataForStaging_96: aDataForStaging_96
			}
		},

		_getDataForMaterialCreation: function (oResponse) {
			let aMaterialData = [];
			let aResults_0034 = oResponse.__batchResponses[0].data.results
			let aResults_0035 = oResponse.__batchResponses[1].data.results
			let aResults_0036 = oResponse.__batchResponses[2].data.results
			let aResults_0096 = oResponse.__batchResponses[3].data.results

			aResults_0036.forEach((oResults_0036) => {
				let oMaterialData = {
					MaterialNumber: oResults_0036.MATERIAL_NUMBER,
					RecordClassification: oResults_0036.RECORD_CLASSIFICATION,
					MaterialType: oResults_0036.MATERIAL_TYPE,
					BaseUom: oResults_0036.BASE_UOM,
					ProdH: oResults_0036.PRODUCT_HIERACHY,
					LabOffice: oResults_0036.LAB_DESIGN_OFFICE,
					ExtMatGrp: oResults_0036.EXT_MATERIAL_GRP,
					MaterialGrp: oResults_0036.MATERIAL_GROUP,
					OldMatNum: oResults_0036.OLD_MATERIAL_NUMBER,
					WeightUnit: oResults_0036.WEIGHT_UNIT,
					NetWeight: oResults_0036.NETWEIGHT,
					LangKey: '',
					MaterialDesc: '',
					Division: '',
					GenItmCat: '',
					IndustrySector: '',
				}

				let oResults_0096 = aResults_0096.find(o => o.MATERIAL_NUMBER === oResults_0036.MATERIAL_NUMBER)

				if (oResults_0096) {
					oMaterialData.LangKey = oResults_0096.LANGUAGE_KEY
					oMaterialData.MaterialDesc = oResults_0096.MATERIAL_DESCRIPTION
				}

				let oResults_0035 = aResults_0035.find(o =>
					o.MaterialType === oResults_0036.MATERIAL_TYPE
					// && o.MaterialNumber === oResults_0036.MATERIAL_NUMBER
				)

				if (oResults_0035 && oResults_0035.AppClassRequired === 'Y') {
					let oResults_0034 = aResults_0034.find(o =>
						o.ZZG_APP_CLASS === oResults_0035.ApplicationClass
						&& o.MTART === oResults_0035.MaterialType
					)
					if (oResults_0034) {
						oMaterialData.AppClassification = oResults_0034.ZZG_APP_CLASS
						oMaterialData.Division = oResults_0034.SPART
						oMaterialData.GenItmCat = oResults_0034.MTPOS_MARA
						oMaterialData.IndustrySector = oResults_0034.MBRSH
						oMaterialData.WeightUnit = oResults_0034.GEWEI
						oMaterialData.MatGrpPacking = oResults_0034.MAGRV
						oMaterialData.ConfigMat = oResults_0034.KZKFG
					}

					if (oResults_0034 && (oMaterialData.BaseUom === undefined || oMaterialData.BaseUom === null || oMaterialData.BaseUom === '')) {
						oMaterialData.BaseUom = oResults_0034.MEINS
					}

				} else if (oResults_0035.MaterialType === 'YHAL' || oResults_0035.MaterialType === 'YROH'){
					let oResults_0034 = aResults_0034.find(o =>
						o.ZZG_APP_CLASS === 'A'
						&& o.MTART === oResults_0035.MaterialType
					)
					if (oResults_0034) {
						oMaterialData.AppClassification = oResults_0034.ZZG_APP_CLASS
						oMaterialData.Division = oResults_0034.SPART
						oMaterialData.GenItmCat = oResults_0034.MTPOS_MARA
						oMaterialData.IndustrySector = oResults_0034.MBRSH
						oMaterialData.WeightUnit = oResults_0034.GEWEI
						oMaterialData.MatGrpPacking = oResults_0034.MAGRV
						oMaterialData.ConfigMat = oResults_0034.KZKFG
					}

					if (oResults_0034 && (oMaterialData.BaseUom === undefined || oMaterialData.BaseUom === null || oMaterialData.BaseUom === '')) {
						oMaterialData.BaseUom = oResults_0034.MEINS
					}

				}


				aMaterialData.push(oMaterialData)
			})

			return aMaterialData
		},
		handleChange: function (oEvent) {
            var oText = this.byId("textResult"),
                oDP = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            this._iEvent++;

            if (bValid) {
                oDP.setValueState(ValueState.None);
            } else {
                oDP.setValueState(ValueState.Error);
            }
        },

		_hasValidationErrors: function (oController) {
			let aControlIds = [
				'StartDate',
				'StartTime',
				'EndDate',
				'EndTime'
			]
			let bHasError = false

			var sStartDate = {}
			var sEndDate = {}

			aControlIds.forEach(sId => {
				let oControl = oController.byId(sId)

				if (oControl.getValue() === '' & oControl.getEnabled()) {
					bHasError = true
					oControl.setValueState('Error')
					oControl.setValueStateText('Field is required')
				}
				if (sId == 'StartDate') {
					sStartDate = oControl.getValue()
				}

				if (sId == 'EndDate') {
					sEndDate = oControl.getValue()
				}


			})

			if (new Date(sStartDate) > new Date(sEndDate)) {
				MessageBox.show('Start Date is greater than End date')
				bHasError = true
			}

			return bHasError
		},

	})
})