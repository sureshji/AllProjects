sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (Controller, Fragment, Filter, FilterOperator) {
    'use strict'
    return Controller.extend('com.yokogawa.zhmm0016.controller.ObjectPage', {

        onInit: async function () {
            let oView = this.getView()
            this.getOwnerComponent().getRouter()?.getRoute("RouteObjectPage").attachPatternMatched(async (oEvent) => {
                let oModel = oView.getModel('zhmm0016');
                let oData = oModel.getData();
                let oObjectPageData = {};

                // let dataFromSelection = JSON.parse(sessionStorage.getItem("dataFromSelection"));
                // console.log("filetrArray ", dataFromSelection)
                let oValidOnDate = new Date(oData.ValidOn)

                //let oValidOnDate = new Date(oData.ValidOn)
                let sValidOnDate = `${oValidOnDate.getFullYear().toString()}${oValidOnDate.getMonth().toString().padStart(2, '0')}${oValidOnDate.getDate().toString().padStart(2, '0')}`
                let sValidOnDate_CHAR_8 = `${oValidOnDate.getFullYear().toString()}${oValidOnDate.getMonth().toString().padStart(2, '0')}${oValidOnDate.getDate().toString().padStart(2, '0')}`

                let sValidOnDate_CHAR_14 = `${sValidOnDate_CHAR_8}000000`;
                
                var dateValue, oTempDate;
                oTempDate = new Date(oData.ValidOn.setHours("00", "00", "00", "00"));
				dateValue = new Date(oTempDate.getTime() + oTempDate.getTimezoneOffset() * (-60000));

                let aFilters_S4 = [
                    new Filter({ path: 'MaterialNumber', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                    new Filter({ path: 'SalesOrganization', operator: FilterOperator.EQ, value1: oData.SalesOrganization }),
                    new Filter({ path: 'DistributionChannel', operator: FilterOperator.EQ, value1: oData.DistributionChannel }),
                    new Filter({ path: 'Plant', operator: FilterOperator.EQ, value1: oData.Plant }),
                    // new Filter({ path: 'ValidOn', operator: FilterOperator.EQ, value1: new Date(oData.ValidOn) }),
                    new Filter({ path: 'ValidOn', operator: FilterOperator.EQ, value1: dateValue }),
                    new Filter({ path: 'LanguageKey', operator: FilterOperator.EQ, value1: oData.LanguageKey }),
                    new Filter({ path: 'RSP', operator: FilterOperator.EQ, value1: oData.RSP })
                ]
                let aContent = [{
                    sPath: '/ZCDSEHMMC0030',
                    aFilters: aFilters_S4
                }, {
                    sPath: '/ZCDSEHMMC0024',
                    aFilters: aFilters_S4
                }]

                // const oData_BW_0031 = await this._getReadPromise(oView.getModel('bw-0031'), [{ sPath: `/ZBQIF0051_001(ZVAOO0029='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0043 = await this._getReadPromise(oView.getModel('bw-0043'), [{ sPath: `/ZBQIF0124_001(ZVAOO0011='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0050 = await this._getReadPromise(oView.getModel('bw-0050'), [{ sPath: `/ZBQIF0192_001(ZVAOO0025='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0066 = await this._getReadPromise(oView.getModel('bw-0066'), [{ sPath: `/ZBQIF0075_001(ZVAOO0050='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0070 = await this._getReadPromise(oView.getModel('bw-0070'), [{ sPath: `/ZBQIF0076_001(ZVAOO0075='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0247 = await this._getReadPromise(oView.getModel('bw-0247'), [{ sPath: `/ZBQIF0432_001(ZVAOO0013='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0249 = await this._getReadPromise(oView.getModel('bw-0249'), [{ sPath: `/ZBQIF0508_001(ZVAOO0015='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0251 = await this._getReadPromise(oView.getModel('bw-0251'), [{ sPath: `/ZBQIF0453_001(ZVAOO0034='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0253 = await this._getReadPromise(oView.getModel('bw-0253'), [{ sPath: `/ZBQIF0436_001(ZVAOO0036='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0040 = await this._getReadPromise(oView.getModel('bw-0040'), [{ sPath: `/ZBQIF0144_001(ZVAOO0062='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0252 = await this._getReadPromise(oView.getModel('bw-0252'), [{ sPath: `/ZBQIF0436_001(ZVAOO0035='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0047 = await this._getReadPromise(oView.getModel('bw-0047'), [{ sPath: `/ZBQIF0165_001(ZVAOO0038='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                // const oData_BW_0243 = await this._getReadPromise(oView.getModel('bw-0243'), [{ sPath: `/ZBQIF0434_001(ZVAOO0046='${oData.MaterialNumber}')/Results`, aFilters: [] }])
                
                var oObjectPage_TableData = [];
                var oObjectPage_FinalTableData = [];
                const oData_S4 = await this._getReadPromise(oView.getModel('s4'), aContent);
                //    let date = oData_S4.__batchResponses[0].data.results[0].ValidOn;
                //    var dateVal;
                //    var orFilter = [];
                //    var andFilter = [];
                //    if (date.length > 0) {
                //     for (i = 0; i < date.length; i++) {
                //         dateVal = date[i].data("range").value1;
                //         var timeoffset = dateVal.getTimezoneOffset();
                //         orFilter.push(new Filter("ValidOn", date[i].data("range").operation, dateVal.getTime() - (timeoffset * 60000)));
                //     }
                //     andFilter.push(new Filter(orFilter, false));
                // }   
                // >> Tokuchu
                
                const oData_BW_0037 = await this._getReadPromise(oView.getModel('bw-0037'), [{
                    sPath: `/ZBQIF0113_001Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0113SUPERVISE_MO', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                        new Filter({ path: 'A4ZCPIF0113DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_14 }),
                        new Filter({ path: 'A4ZCPIF0113DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_14 }),
                        new Filter({ path: 'A4ZCPIF0113TOKUCHU_CHK', operator: FilterOperator.EQ, value1: 'X' })]
                }]);
                const oData_BW_0051 = await this._getReadPromise(oView.getModel('bw-0051'), [{
                    sPath: `/ZBQIF0097_001(ZVAOO00100='${oData.MaterialNumber}')/Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0097DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_14 }),
                        new Filter({ path: 'A4ZCPIF0097DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_14 }),
                        new Filter({ path: 'A4ZCPIF0097TOKUCHU_CHK', operator: FilterOperator.EQ, value1: 'X' })
                    ]
                }]);
                const oData_BW_0044 = await this._getReadPromise(oView.getModel('bw-0044'), [{
                    sPath: `/ZBQIF0163_001(ZVAOO0071='${oData.MaterialNumber}')/Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0163DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0163DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0163TOKUCHU_CHK', operator: FilterOperator.EQ, value1: 'X' })
                    ]
                }]);
                const oData_BW_0242 = await this._getReadPromise(oView.getModel('bw-0242'), [{
                    sPath: `/ZBQIF0438_001(ZVAOO0045='${oData.MaterialNumber}')/Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0438DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0438DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0438TOKUCHU_CHK', operator: FilterOperator.EQ, value1: 'X' })
                    ]
                }]);
                const oData_BW_0244 = await this._getReadPromise(oView.getModel('bw-0244'), [{
                    sPath: `/ZBQIF0446_001(ZVAOO0047='${oData.MaterialNumber}')/Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0446DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0446DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0446TOKUCHU_CHK', operator: FilterOperator.EQ, value1: 'X' })
                    ]
                }]);
                //  >> Sales Area Limit data
                const oData_BW_0069 = await this._getReadPromise(oView.getModel('bw-0069'), [{
                    sPath: `/ZBQIF0505_001(ZVAOO0052='${oData.MaterialNumber}')/Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0505DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0505DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_8 })
                    ]
                }]);
                const oData_BW_0248 = await this._getReadPromise(oView.getModel('bw-0248'), [{
                    sPath: `/ZBQIF0444_001(ZVAOO0014='${oData.MaterialNumber}')/Results`,
                    aFilters: [
                        new Filter({ path: 'A4ZCPIF0444DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_8 }),
                        new Filter({ path: 'A4ZCPIF0444DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_8 })
                    ]
                }]);
                // >> Sales Area Limit
                if (oData_BW_0069.length > 0 && oData_BW_0069.__batchResponses[0].data.results.length > 0) {
                    oObjectPageData.SalesAreaLimit = oData_BW_0069.__batchResponses[0].data.results[0].A4ZCPIF0505SALES_YN
                } else {
                    if (oData_BW_0248.length > 0 && oData_BW_0248.__batchResponses[0].data.results.length > 0) {
                        oObjectPageData.SalesAreaLimit = oData_BW_0248.__batchResponses[0].data.results[0].A4ZCPIF0444SALES_YN
                    }
                };

                // oObjectPageData = oData_S4.__batchResponses[0].data.results[0];
                // oObjectPage_TableData = oData_S4.__batchResponses[1].data.results


                // >> Tokuchu
                if (oData_BW_0037.length > 0 && oData_BW_0037.__batchResponses[0].data.results.length > 0) {
                    oObjectPageData.Tokuchu = oData_BW_0037.__batchResponses[0].data.results[0].A4ZCPIF0113TOKUCHU_CHK
                } else {

                    if (oData_BW_0051.length > 0 && oData_BW_0051.__batchResponses[0].data.results.length > 0) {
                        oObjectPageData.Tokuchu = oData_BW_0051.__batchResponses[0].data.results[0].A4ZCPIF0097TOKUCHU_CHK
                    } else {
                        if (oData_BW_0044.length > 0 && oData_BW_0044.__batchResponses[0].data.results.length > 0) {
                            oObjectPageData.Tokuchu = oData_BW_0044.__batchResponses[0].data.results[0].A4ZCPIF0163TOKUCHU_CHK
                        } else {
                            if (oData_BW_0242.length > 0 && oData_BW_0242.__batchResponses[0].data.results.length > 0) {
                                oObjectPageData.Tokuchu = oData_BW_0242.__batchResponses[0].data.results[0].A4ZCPIF0438TOKUCHU_CHK
                            } else {
                                if (oData_BW_0244.length > 0 && oData_BW_0244.__batchResponses[0].data.results.length > 0) {
                                    oObjectPageData.Tokuchu = oData_BW_0244.__batchResponses[0].data.results[0].A4ZCPIF0446TOKUCHU_CHK
                                }
                            }
                        }
                    }
                }


                for (let sS4_Tabledata of oObjectPage_TableData) {
                    let Final_temp_obj = {}
                    Final_temp_obj.LV_GRP = sS4_Tabledata.LV_GRP;
                    
                 if(Final_temp_obj.LV_GRP == 'SysM') {
                        Final_temp_obj.LV_GRP = sS4_Tabledata.LV_GRP;

                        Final_temp_obj.OrderStartDate = "";
                        Final_temp_obj.AddLT = "";
                        Final_temp_obj.Tokuchu = "";
                    }
                    
                //     else if(Final_temp_obj.LV_GRP == 'Comp') {    
                //     }
                    
                //     oObjectPage_FinalTableData.push(Final_temp_obj)
                //     // }
                }
                oModel.setProperty('/ObjectPage', oObjectPageData)
                console.log(oObjectPage_TableData)
                this.getView().getModel('zhmm0016').setProperty('/oObjectPage_TableData', oObjectPage_TableData)
                // sap.ui.core.BusyIndicator.hide()
            })
        },

        onBeforeRendering: function () {
            let oView = this.getView()
            let oModel = oView.getModel('zhmm0016')
            let oResourceBundle = oView.getModel('i18n').getResourceBundle()
            // this.getView().getModel('zhmm0016').setData({
            //     MaterialNumber: 'A1109EF',
            //     SalesOrganization: '1000',
            //     Plant: '1000',
            //     DistributionChannel: '10',
            //     ValidOn: '8/9/2023',
            //     LanguageKey: 'E',
            //     RSP: '1'
            // })
            // <<<<<
            oModel.setProperty('/infotypes', [{
                key: 'OrderInstruction',
                text: oResourceBundle.getText('OrderInstruction'),
                enabled: true,
                selected: true
            }, {
                key: 'CombinationCheck',
                text: oResourceBundle.getText('CombinationCheck'),
                enabled: true,
                selected: false
            }, {
                key: 'SalesAreaLimit',
                text: oResourceBundle.getText('SalesAreaLimit'),
                enabled: true,
                selected: false
            }, {
                key: 'SoldToLimit',
                text: oResourceBundle.getText('SoldToLimit'),
                enabled: true,
                selected: false
            }, {
                key: 'TransferFactor',
                text: oResourceBundle.getText('TransferFactor'),
                enabled: true,
                selected: false
            }, {
                key: 'DiscountForReps',
                text: oResourceBundle.getText('DiscountForReps'),
                enabled: true,
                selected: false
            }])
            oModel.setProperty('/header', {
                BUPFPGPL: {
                    visible: false
                },
                Material: {
                    visible: false
                },
                MaterialDescription: {
                    visible: false
                },
                PMKCode: {
                    visible: false
                },
                PMKCodeDescription: {
                    visible: false
                },
                SalesOrg: {
                    visible: false
                },
                SalesOrgDescription: {
                    visible: false
                },
                ValidOn: {
                    visible: false
                }
            })
            oModel.setProperty('/table', {
                discountForReps: {
                    columns: [{
                        key: 'SalesOrganization',
                        name: oResourceBundle.getText('SalesOrg')
                    }, {
                        key: 'Customer_code',
                        name: oResourceBundle.getText('CustomerCode')
                    }, {
                        key: 'Customer_name',
                        name: oResourceBundle.getText('CustomerName')
                    }, {
                        key: 'ZZH_PRICE_LIST',
                        name: oResourceBundle.getText('PriceList')
                    }, {
                        key: 'Price_list_description',
                        name: oResourceBundle.getText('PriceListDescription')
                    }, {
                        key: 'FLAG',
                        name: oResourceBundle.getText('Flag')
                    }, {
                        key: 'DISCOUNT',
                        name: oResourceBundle.getText('Discount')
                    }, {
                        key: 'RATEUNIT',
                        name: oResourceBundle.getText('RateUnit')
                    }, {
                        key: 'DATAB',
                        name: oResourceBundle.getText('DateFrom')
                    }, {
                        key: 'DATBI',
                        name: oResourceBundle.getText('DateTo')
                    }],
                    items: []
                },
                salesAreaLimit: {
                    columns: [{
                        key: 'SpecLevel',
                        name: oResourceBundle.getText('SpecLevel')
                    }, {
                        key: 'SpecCode',
                        name: oResourceBundle.getText('SpecCode')
                    }, {
                        key: 'CountryCode',
                        name: oResourceBundle.getText('CountryCode')
                    }, {
                        key: 'CountryName',
                        name: oResourceBundle.getText('CountryName')
                    }, {
                        key: 'Limitation',
                        name: oResourceBundle.getText('Limitation')
                    }, {
                        key: 'DateFrom',
                        name: oResourceBundle.getText('DateFrom')
                    }, {
                        key: 'DateTo',
                        name: oResourceBundle.getText('DateTo')
                    }],
                    items: []
                },
                soldToLimit: {
                    columns: [{
                        key: 'SpecLevel',
                        name: oResourceBundle.getText('SpecLevel')
                    }, {
                        key: 'SpecCode',
                        name: oResourceBundle.getText('SpecCode')
                    }, {
                        key: 'CustomerCode',
                        name: oResourceBundle.getText('CustomerCode')
                    }, {
                        key: 'CustomerName',
                        name: oResourceBundle.getText('CustomerName')
                    }, {
                        key: 'Limitation',
                        name: oResourceBundle.getText('Limitation')
                    }, {
                        key: 'DateFrom',
                        name: oResourceBundle.getText('DateFrom')
                    }, {
                        key: 'DateTo',
                        name: oResourceBundle.getText('DateTo')
                    }],
                    items: []
                },
                transferFactor: {
                    columns: [{
                        key: 'Customer',
                        name: oResourceBundle.getText('CustomerCode')
                    }, {
                        key: 'CustomerName',
                        name: oResourceBundle.getText('CustomerName')
                    }, {
                        key: 'Vendor',
                        name: oResourceBundle.getText('Vendor')
                    }, {
                        key: 'VendorName',
                        name: oResourceBundle.getText('VendorName')
                    }, {
                        key: 'FLAG',
                        name: oResourceBundle.getText('Flag')
                    }, {
                        key: 'TF',
                        name: oResourceBundle.getText('TransferFactorCode')
                    }, {
                        key: 'RateUnit',
                        name: oResourceBundle.getText('RateUnit')
                    }, {
                        key: 'ValidFrom',
                        name: oResourceBundle.getText('ValidFrom')
                    }, {
                        key: 'ValidTo',
                        name: oResourceBundle.getText('ValidTo')
                    }],
                    items: []
                }
            })
        },
        onDetailedInformationButtonPress: function (oEvent) {
            let oView = this.getView()
            // var sInputValue = oEvent.getSource().getValue()
            let oModel = oView.getModel('zhmm0016')
            let selectList = oModel.getProperty('/infotypes')
            let temparray = []
            // key: 'OrderInstruction',
            // text: oResourceBundle.getText('OrderInstruction'),
            // enabled: true,
            // selected: true
            selectList.forEach(e => {
                if (e.key == 'OrderInstruction') e.selected = true
                else e.selected = false
                temparray.push(e)
            });
            oModel.setProperty('/infotypes', temparray)
            let oDetailedInformationDialog = this.loadFragment({
                // id: oView.getId(),
                name: 'com.yokogawa.zhmm0016.view.fragment.DetailedInformationDialog',
                controller: this
            }).then(function (oDialog) {
                oView.addDependent(oDialog)
                return oDialog
            }.bind(this))
            oDetailedInformationDialog.then(function (oDialog) {
                oDialog.open()
            }.bind(this))
        },


        onGoButtonPress: function (oEvent) {
            let oModel = this.getView().getModel('zhmm0016')
            let oSelectedContext = this.byId('InformationType').getSelectedButton().getBindingContext('zhmm0016').getObject()
            oModel.setProperty('/info', {
                key: oSelectedContext.key,
                title: oSelectedContext.text
            })
            this.getOwnerComponent().getRouter().navTo('RouteDetailedInformationPage', {
                InformationType: oSelectedContext.key
            })
        },
        onDialogClose: function (oEvent) {
            oEvent.getSource().getParent().close()
        },
        onDialogAfterClose: function (oEvent) {
            oEvent.getSource().destroy()
        },
        _getReadPromise: function (oModel, aContent) {
            var that = this;
            return new Promise(function (resolve, reject) {
                let sGroup = jQuery.sap.uid();
                let Result_Array = [];
                // oModel.setDeferredGroups([sGroup])
                aContent.map((o) => {
                    oModel.read(o.sPath, {
                        // groupId: sGroup,
                        filters: o.aFilters,
                        success: function (oResponse) {
                            // resolve(oResponse)
                            console.log("success ", oResponse);
                            Result_Array.push(oResponse);
                            if(oResponse.results[0].__metadata.id.includes("ZCDSEHMMC0030") ){
                                var  oObjectPageData = oResponse.results[0];
                                that.getView().getModel('zhmm0016').setProperty('/ObjectPage', oObjectPageData);
                            }
                            else if(oResponse.results[0].__metadata.id.includes("ZCDSEHMMC0024")){
                                var oObjectPage_TableData = oResponse.results;
                                that.getView().getModel('zhmm0016').setProperty('/oObjectPage_TableData', oObjectPage_TableData);
                            }
                            
                        },
                        error: function (oError) {
                            // reject(oError)
                            Result_Array.push([])
                            console.log("Error ", oError)
                        }
                    })

                })
                resolve(Result_Array)
                // oModel.submitChanges({
                //     groupId: sGroup,
                //     success: function (oResponse) {
                //         resolve(oResponse)
                //     },
                //     error: function (oError) {
                //         // reject(oError)
                //         resolve([])
                //     }
                // })
            })
        }
    })
})