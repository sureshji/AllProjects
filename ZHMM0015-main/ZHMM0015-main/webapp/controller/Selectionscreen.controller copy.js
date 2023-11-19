sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function (Controller) {
	'use strict';

	return Controller.extend('com.yokogawa.zhmm0015.controller.Selectionscreen', {

		onBeforeRendering: function () {
			let oResourceBundle = this.getView().getModel('i18n').getResourceBundle()

			this.getView().getModel('zhmm0015').setData({
				items: [{
					key: 'NormalMode',
					text: oResourceBundle.getText('NormalMode')
				}, {
					key: 'RecoveryMode',
					text: oResourceBundle.getText('RecoveryMode')
				}
				],
				selected: 'NormalMode'
			})
		},

		onPressOfExecute: function (oEvent) {
			var oView = this.getView()
			var sMode = this.getView().getModel('zhmm0015').getProperty('/selected')

			if (this._hasValidationErrors(this)) {
				return
			}

			//Reading 34,35 tables
			// this._getReadPromise(oView.getModel(), '/ZTHBT0036')
			//       .then(function (oResponse_34) {
			//         aDependentData = oResponse_34?.__batchResponses[0]?.data.results})

			let oPromise_vb31 = this._getReadPromise(oView.getModel('vb31'), [{ sPath: "/ZBQIF0051_001(ZVAOO0029='AXG4APF05')/Results" }])
			let oPromise_vb32 = this._getReadPromise(oView.getModel('vb32'), [{ sPath: "/ZBQIF0052_001(ZVAOO0059='A1KXCA4')/Results" }])
			let oPromise_vb33 = this._getReadPromise(oView.getModel('vb33'), [{ sPath: "/ZBQIF0059_001(ZVAOO0040='MOB051')/Results" }])
			let oPromise_vb34 = this._getReadPromise(oView.getModel('vb34'), [{ sPath: "/ZBQIF0078_001(ZVAOO0010='A1KXCA4')/Results" }])

			const oAllPromise = Promise.all([
				oPromise_vb31,
				oPromise_vb32,
				oPromise_vb33,
				oPromise_vb34
			])

			oAllPromise
				.then(function (aResponses) {
					let aResults_vb31 = aResponses[0].__batchResponses[0].data.results
					let aResults_vb32 = aResponses[1].__batchResponses[0].data.results
					let aResults_vb33 = aResponses[2].__batchResponses[0].data.results
					let aResults_vb34 = aResponses[3].__batchResponses[0].data.results

					// >> Map BW Data to BTP Data Structure, we might get multiple materials, so it has to be array
					// Add rest of the required fields, same logic for updating other tables too!

					// aResults_vb31[0].A4ZCPIF0051SUPERVISE_MO = "A1KXCA4"
					let finalArray = [...aResults_vb31];

					function combineArray(tempArray, finalArray, searchKey) {

						for (let k = 0; k < finalArray.length; k++) {
							let searchObj = finalArray[k];
							let matchedObj = null;
							for (let i = 0; i < tempArray.length; i++) {
								let obj = tempArray[i];
								if (searchKey != 'A4ZCPIF0051SUPERVISE_MO') obj['A4ZCPIF0051SUPERVISE_MO'] = obj[`${searchKey}`]
								if (obj.A4ZCPIF0051SUPERVISE_MO == searchObj.A4ZCPIF0051SUPERVISE_MO) {
									matchedObj = obj;
									tempArray.splice(i, 1);
								}
							}
							if (matchedObj != null) finalArray[k] = {
								...finalArray[k],
								...matchedObj
							};
						}
						return {
							finalArray,
							tempArray
						};
					}


					// let returnedVal = combineArray(aResults_vb32, finalArray, "MaterialNumber");
					// finalArray = returnedVal.finalArray;
					// finalArray.push(...returnedVal.tempArray);

					// returnedVal = combineArray(aResults_vb33, finalArray, "material");
					// finalArray = returnedVal.finalArray;
					// finalArray.push(...returnedVal.tempArray);

					let returnedVal = combineArray(aResults_vb34, finalArray, "A4ZCPIF0078SUPERVISE_MO");
					finalArray = returnedVal.finalArray;
					finalArray.push(...returnedVal.tempArray);

					console.log(finalArray)

					let aMappedData_36 = [
						{
							sPath: '/ZTHBT0036',
							oData: {
								RECORD_CLASSIFICATION: 'H',
								MATERIAL_NUMBER: '1',
								MATERIAL_TYPE: '1',
								MATERIAL_GROUP: '1',
								PRODUCT_HIERACHY: '1',
								EXT_MATERIAL_GRP: '1',
								LAB_DESIGN_OFFICE: '1',
								INDUSTRY_SECTOR: '',
								DIVISION: '',
								GEN_ITEM_CAT_GRP: '',
								NETWEIGHT: '',
								BASE_UOM: '',
								WEIGHT_UNIT: '',
								OLD_MATERIAL_NUMBER: '',
								DG_INDICATOR: '',
								MAT_GRP_PACKING: '',
								CONFIG_MATERIAL: '',
								INHOUSE_LEAD_TIME: '',
								WARRANTY_PERIOD: ''
							}
						}
					]
					let oPromise_36
					if (sMode === 'NormalMode') {
						oPromise_36 = this._getCreatePromise(oView.getModel(), aMappedData_36)
					} else {
						// >>sPath needs to be updated in the aMappedData while looping
						// /ZTHBT0036(RECORD_CLASSIFICATION='',MATERIAL_NUMBER='',MATERIAL_TYPE='') <<Here insert all keys (only for update)
						oPromise_36 = this._getCreatePromise(oView.getModel(), aMappedData_36)
					}

					oPromise_36
						.then(function (oResponse_36) {
						})
						.catch(oError => {
						})
						.finally(function () {
						});

					// zthbt0096
					var aMappedData_96 = []
						for( let i = 0 ; i < aResults_vb34.length ; i++ ) {
							aMappedData_96[i].MATERIAL_NUMBER = aResults_vb34[i].A4ZCPIF0051SUPERVISE_MO;
							aMappedData_96[i].LANGUAGE_KEY  = aResults_vb34[i].A4ZCPIF0078LANG_TYPE;
							aMappedData_96[i].RECORD_CLASSIFICATION = 'T';
							aMappedData_96[i].MATERIAL_DESCRIPTION.push(aResults_vb34[i].A4ZCPIF0051SUPERVISE_MO)  ;
						}

					// [
					// 	{
					// 		oData: {
					// 			RECORD_CLASSIFICATION: 'T',
					// 			MATERIAL_NUMBER: '1',
					// 			LANGUAGE_KEY: '1',
					// 			MATERIAL_DESCRIPTION: '1'
					// 		}
					// 	}
					// ]
					let oPromise_96
					if (sMode === 'NormalMode') {
						oPromise_96 = this._getCreatePromise(oView.getModel(), [{ sPath: '/ZTHBT0096', aMappedData_96 }])
					} else {
						// >>sPath needs to be updated in the aMappedData while looping
						// <<Here insert all keys (only for update)
						oPromise_96 = this._getCreatePromise(oView.getModel(), aMappedData_96)
					}

					oPromise_96
						.then(function (oResponse_96) {
						})
						.catch(oError => {
						})
						.finally(function () {
						})

				}.bind(this))
				.catch(oError => {
				})
				.finally(function () {
				})

			//update s4 data
			let aMappedData_s4 = [
				{
					"MaterialNumber": '11',
					"RecordClassification": 'H',
					"ProdH": '1234',
					"MaterialType": 'YHAL'
				}
			]
			// let oPromise_s4 = this._getCreatePromise(oView.getModel('s4'), [{ aMappedData_s4 }])
			// oPromise_s4.then(function (oResponses4) {
			// 	let aResults_s4 = oResponses4.MaterialType //_batchResponses[0].data.results

			// }.bind(this))
			// 	.catch(oError => {
			// 		debugger;
			// 	})
			// 	.finally(function () {
			// 		debugger;
			// 		this.getOwnerComponent().getRouter().navTo('RouteResult') //Navigate to Resukt screen 
			// 	})
		},

		_getCreatePromise: function (oModel, aContent) {
			return new Promise(function (resolve, reject) {
				var sGroup = jQuery.sap.uid()

				oModel.setDeferredGroups([sGroup]);

				aContent.forEach(oContent => {
					oModel.create(oContent.sPath, oContent.oData, {
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
				});
			})
		},

		_getReadPromise: function (oModel, aContent) {
			return new Promise(function (resolve, reject) {
				var sGroup = jQuery.sap.uid()

				oModel.setDeferredGroups([sGroup])

				aContent.forEach(oContent => {
					oModel.read(oContent.sPath, {
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
				});
			})
		},

		_hasValidationErrors: function (oController) {
			let aControlIds = [
				'StartDate',
				'StartTime',
				'EndDate',
				'EndTime'
			]
			let bHasError = false

			aControlIds.forEach(sId => {
				let oControl = oController.byId(sId)

				if (oControl.getValue() === '') {
					bHasError = true
					oControl.setValueState('Error')
					oControl.setValueStateText('Field is required')
				}
			})

			return false //bHasError
		}
	});
});