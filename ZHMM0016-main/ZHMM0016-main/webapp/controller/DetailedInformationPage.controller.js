sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (Controller, Filter, FilterOperator) {
    'use strict'

    return Controller.extend('com.yokogawa.zhmm0016.controller.DetailedInformationPage', {

        onInit: function () {
            let oView = this.getView()

            this.getOwnerComponent().getRouter()?.getRoute("RouteDetailedInformationPage").attachPatternMatched(async function (oEvent) {
                let oModel = oView.getModel('zhmm0016')
                let oData = oModel.getData()

                let aFilters_S4 = [
                    new Filter({ path: 'MaterialNumber', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                    new Filter({ path: 'SalesOrganization', operator: FilterOperator.EQ, value1: oData.SalesOrganization }),
                    new Filter({ path: 'DistributionChannel', operator: FilterOperator.EQ, value1: oData.DistributionChannel }),
                    new Filter({ path: 'Plant', operator: FilterOperator.EQ, value1: oData.Plant }),
                    new Filter({ path: 'ValidOn', operator: FilterOperator.EQ, value1: new Date(oData.ValidOn) }),
                    new Filter({ path: 'LanguageKey', operator: FilterOperator.EQ, value1: oData.LanguageKey }),
                    new Filter({ path: 'RSP', operator: FilterOperator.EQ, value1: oData.RSP })
                ]
                let oValidOnDate = new Date(oData.ValidOn)
                let sValidOnDate = `${oValidOnDate.getFullYear().toString()}${oValidOnDate.getMonth().toString().padStart(2, '0')}${oValidOnDate.getDate().toString().padStart(2, '0')}`

                let sValidOnDate_CHAR_8 = `${oValidOnDate.getFullYear().toString()}${oValidOnDate.getMonth().toString().padStart(2, '0')}${oValidOnDate.getDate().toString().padStart(2, '0')}`

                let sValidOnDate_CHAR_14 = `${sValidOnDate_CHAR_8}000000`

                switch (oEvent.getParameter("arguments").InformationType) {
                    case 'CombinationCheck':
                        oModel.setProperty('/header/BUPFPGPL/visible', false)
                        oModel.setProperty('/header/Material/visible', false)
                        oModel.setProperty('/header/MaterialDescription/visible', false)
                        oModel.setProperty('/header/PMKCode/visible', false)
                        oModel.setProperty('/header/PMKCodeDescription/visible', false)
                        oModel.setProperty('/header/SalesOrg/visible', false)
                        oModel.setProperty('/header/SalesOrgDescription/visible', false)
                        oModel.setProperty('/header/ValidOn/visible', false)
                        // CrossApp Navigation
                        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                        var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                            target: {
                                semanticObject: "ZSEM_ZHMMR00003",
                                action: "display"
                            },
                            params: {
                                material_number : oData.MaterialNumber,
                            }
                        })) || "";
                        oCrossAppNavigator.toExternal({
                            target: {
                                shellHash: hash
                            }
                        });
                        break;
                    case 'OrderInstruction':
                        oModel.setProperty('/header/BUPFPGPL/visible', false)
                        oModel.setProperty('/header/Material/visible', false)
                        oModel.setProperty('/header/MaterialDescription/visible', false)
                        oModel.setProperty('/header/PMKCode/visible', false)
                        oModel.setProperty('/header/PMKCodeDescription/visible', false)
                        oModel.setProperty('/header/SalesOrg/visible', false)
                        oModel.setProperty('/header/SalesOrgDescription/visible', false)
                        oModel.setProperty('/header/ValidOn/visible', false)
                        // CrossApp Navigation
                        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                        var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                            target: {
                                semanticObject: "ZSEM_ZHMMR00003",
                                action: "display"
                            },
                            params: {
                                //material_number : oData.MaterialNumber,
                            }
                        })) || "";
                        oCrossAppNavigator.toExternal({
                            target: {
                                shellHash: hash
                            }
                        });
                        break;
                    case 'DiscountForReps':
                        oModel.setProperty('/header/BUPFPGPL/visible', true)
                        oModel.setProperty('/header/Material/visible', true)
                        oModel.setProperty('/header/MaterialDescription/visible', true)
                        oModel.setProperty('/header/PMKCode/visible', false)
                        oModel.setProperty('/header/PMKCodeDescription/visible', false)
                        oModel.setProperty('/header/SalesOrg/visible', true)
                        oModel.setProperty('/header/SalesOrgDescription/visible', true)
                        oModel.setProperty('/header/ValidOn/visible', true)
                        
                        const oData_0028 = await this._getReadPromise(oView.getModel('s4'), [{
                            sPath: '/ZCDSEHMMC0028',
                            aFilters: [
                            new Filter({ path: 'MaterialNumber', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                            new Filter({ path: 'SalesOrganization', operator: FilterOperator.EQ, value1: oData.SalesOrganization }),
                            new Filter({ path: 'ValidOn', operator: FilterOperator.EQ, value1: new Date(oData.ValidOn) }),
                            new Filter({ path: 'LanguageKey', operator: FilterOperator.EQ, value1: oData.LanguageKey })
                            ]
                        }])
                        var Data_0028 = oData_0028 && oData_0028.__batchResponses && oData_0028.__batchResponses.length > 0 && oData_0028.__batchResponses[0].data && oData_0028.__batchResponses[0].data.results && oData_0028.__batchResponses[0].data.results ? oData_0028.__batchResponses[0].data.results : [];
                        this.getView().getModel('zhmm0016').setProperty('/discountForReps_items', Data_0028);
                        break;

                    case 'SalesAreaLimit':
                        oModel.setProperty('/header/BUPFPGPL/visible', false)
                        oModel.setProperty('/header/Material/visible', true)
                        oModel.setProperty('/header/MaterialDescription/visible', true)
                        oModel.setProperty('/header/PMKCode/visible', false)
                        oModel.setProperty('/header/PMKCodeDescription/visible', false)
                        oModel.setProperty('/header/SalesOrg/visible', false)
                        oModel.setProperty('/header/SalesOrgDescription/visible', false)
                        oModel.setProperty('/header/ValidOn/visible', false)

                        let Sales_final_Array  = [];
                        //Suffix level,
                        var sSales_BW_0069= await this._getReadPromise(oView.getModel('bw-0069'), [{
                            sPath: `/ZBQIF0505_001(ZVAOO0052='${oData.MaterialNumber}')/Results`,
                            aFilters: [
                                new Filter({ path: 'A4ZCPIF0505MODEL', operator: FilterOperator.EQ, value1: oData.MaterialNumber })
                                //  new Filter({ path: 'A4ZCPIF0508DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_14 }),
                                //  new Filter({ path: 'A4ZCPIF0508DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_14 })
                            ]
                        }])

                        var sSales_BW_0070= await this._getReadPromise(oView.getModel('bw-0070'), [{
                            sPath: `/ZBQIF0076_001(ZVAOO0075='')/Results`,
                            aFilters: [
                                new Filter({ path: 'A4ZCPIF0076SALE_RESTRIC', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                                // new Filter({ path: 'A4ZCPIF0453DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_14 }),
                                // new Filter({ path: 'A4ZCPIF0508DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_14 })
                            ]
                        }])

                        if (sSales_BW_0069.__batchResponses[0].statusCode == 200) {
                            sSales_BW_0069 = sSales_BW_0069.__batchResponses[0].data.results
                        }
                        if (sSales_BW_0070.__batchResponses[0].statusCode == 200) {
                            sSales_BW_0070= sSales_BW_0070.__batchResponses[0].data.results
                        }

                        //BW_0249.__batchResponses[0].data.results.length > 0 ? this._getReadPromise(BW_0249) : this._getReadPromise(BW_0251)
                        let sData1 = [...sSales_BW_0069, ...sSales_BW_0070];

                       let aFilters_Sales = [
                            // new Filter({ path: 'land1', operator: FilterOperator.EQ, value1: oData.LanguageKey }),
                            new Filter({ path: 'languagekey', operator: FilterOperator.EQ, value1: oData.LanguageKey })
                        ]

                        let aSales_Content = [{
                            sPath: '/ZCDSEHMMC0020',
                            aFilters: aFilters_Sales
                        }]


                        var oData_0020= await this._getReadPromise(oView.getModel('s4'), aSales_Content)
                        oData_0020 =  oData_0020 && oData_0020.__batchResponses && oData_0020.__batchResponses.length > 0 && oData_0020.__batchResponses[0].data && oData_0020.__batchResponses[0].data.results && oData_0020.__batchResponses[0].data.results ? oData_0020.__batchResponses[0].data.results : [];
                        //Limitation
                        var BW_0069 = await this._getReadPromise(oView.getModel('bw-0069'), [{
                            sPath: `/ZBQIF0505_001(ZVAOO0052='${oData.MaterialNumber}')/Results`,
                            aFilters: [
                                new Filter({ path: 'A4ZCPIF0505SALES_YN', operator: FilterOperator.EQ, value1: sData.A4ZCPIF0453SALES_YN }),
                            ]
                        }])
                        BW_0069 = BW_0069.__batchResponses[0].data.results

                        for (let sBw_0069 of sSales_BW_0069) {

                            let Sales_temp_obj = {}
                            Sales_temp_obj.spec_level = sBw_0069.A4ZCPIF0505SUFFIX_LEVEL;
                            Sales_temp_obj.spec_code = sBw_0069.A4ZCPIF0505SUFFIX_ID;
                            Sales_temp_obj.Country_code = " ";
                            Sales_temp_obj.Country_Name = " ";
                            if (sBw_0069.A4ZCPIF0505SALES_YN == '1') {
                                Sales_temp_obj.limitation = "Not Limited";
                            } else if (sBw_0069.A4ZCPIF0505SALES_YN == '2') {
                                Sales_temp_obj.limitation = "Limited";
                            } else {
                                Sales_temp_obj.limitation = " ";
                            }
                            Sales_temp_obj.Date_from = sBw_0069.A4ZCPIF0505DATE_FROM_T;
                            Sales_temp_obj.Date_to = sBw_0069.A4ZCPIF0505DATE_TO_T;


                            for (let sBw_0070 of sSales_BW_0070) {
                                for (let oS4_0020 of oData_0020) {
                                    if (oS4_0020.land1 == sBw_0070.A4ZCPIF0076COUNTRY_CODE) {
                                        Sales_temp_obj.Country_Name = oS4_0020.landx
                                    }

                                }
                                Sales_final_Array.push(Sales_temp_obj)
                            }
                        }
                        oModel.setProperty('SalesAreaLimit_items', Sales_final_Array)
                        break;
                    case 'SoldToLimit':
                        oModel.setProperty('/header/BUPFPGPL/visible', false)
                        oModel.setProperty('/header/Material/visible', true)
                        oModel.setProperty('/header/MaterialDescription/visible', true)
                        oModel.setProperty('/header/PMKCode/visible', false)
                        oModel.setProperty('/header/PMKCodeDescription/visible', false)
                        oModel.setProperty('/header/SalesOrg/visible', false)
                        oModel.setProperty('/header/SalesOrgDescription/visible', false)
                        oModel.setProperty('/header/ValidOn/visible', false)

                        let final_Array = [];
                        //Suffix level,
                        var BW_0249 = await this._getReadPromise(oView.getModel('bw-0249'), [{
                            sPath: `/ZBQIF0508_001(ZVAOO0015='${oData.MaterialNumber}')/Results`,
                            aFilters: [
                                new Filter({ path: 'A4ZCPIF0508MODEL', operator: FilterOperator.EQ, value1: oData.MaterialNumber })
                                //  new Filter({ path: 'A4ZCPIF0508DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_14 }),
                                //  new Filter({ path: 'A4ZCPIF0508DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_14 })
                            ]
                        }])

                        var BW_0251 = await this._getReadPromise(oView.getModel('bw-0251'), [{
                            sPath: `/ZBQIF0453_001(ZVAOO0034='${oData.MaterialNumber}')/Results`,
                            aFilters: [
                                new Filter({ path: 'A4ZCPIF0453MODEL', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                                // new Filter({ path: 'A4ZCPIF0453DATE_TO', operator: FilterOperator.LE, value1: sValidOnDate_CHAR_14 }),
                                // new Filter({ path: 'A4ZCPIF0508DATE_FROM', operator: FilterOperator.GE, value1: sValidOnDate_CHAR_14 })
                            ]
                        }])

                        if (BW_0249.__batchResponses[0].statusCode == 200) {
                            BW_0249 = BW_0249.__batchResponses[0].data.results
                        }
                        if (BW_0251.__batchResponses[0].statusCode == 200) {
                            BW_0251 = BW_0251.__batchResponses[0].data.results
                        }

                        //BW_0249.__batchResponses[0].data.results.length > 0 ? this._getReadPromise(BW_0249) : this._getReadPromise(BW_0251)
                        let sData = [...BW_0249, ...BW_0251];

                        let aFilters_Sold_to = [
                            // new Filter({ path: 'kunnr', operator: FilterOperator.EQ, value1: sData.A4ZCPIF0453CONTRACTOR_C }),
                            new Filter({ path: 'languagekey', operator: FilterOperator.EQ, value1: oData.LanguageKey })
                        ]

                        let aContent = [{
                            sPath: '/ZCDSEHMMC0026',
                            aFilters: aFilters_Sold_to
                        }]

                        var oData_0026 = await this._getReadPromise(oView.getModel('s4'), aContent)
                        oData_0026 = oData_0026.__batchResponses[0].data.results
                        //Limitation
                        var BW_0069 = await this._getReadPromise(oView.getModel('bw-0069'), [{
                            sPath: `/ZBQIF0505_001(ZVAOO0052='${oData.MaterialNumber}')/Results`,
                            aFilters: [
                                new Filter({ path: 'A4ZCPIF0505SALES_YN', operator: FilterOperator.EQ, value1: sData.A4ZCPIF0453SALES_YN }),
                            ]
                        }])
                        BW_0069 = BW_0069.__batchResponses[0].data.results

                        for (let sBwData of sData) {

                            let temp_obj = {}
                            temp_obj.spec_level = sBwData.A4ZCPIF0508SUFFIX_LEVEL;
                            temp_obj.spec_code = sBwData.A4ZCPIF0508SUFFIX_ID;
                            temp_obj.coustomer_code = sBwData.A4ZCPIF0508CONTRACTOR_C;
                            temp_obj.Customer_Name = " ";
                            temp_obj.limitation = " ";
                            temp_obj.Date_from = sBwData.A4ZCPIF0508DATE_FROM;
                            temp_obj.Date_to = sBwData.A4ZCPIF0508DATE_TO;

                            for (let oD of BW_0069) {
                                if (oD.A4ZCPIF0453SALES_YN == 1) {
                                    temp_obj.limitation = "Not Limited"
                                } else if (oD.A4ZCPIF0453SALES_YN == 2) {
                                    temp_obj.limitation = "Limited"
                                } else {
                                    temp_obj.limitation = ""
                                }
                            }

                            for (let oSold_to of oData_0026) {
                                if ( oSold_to.KUNNR == temp_obj.coustomer_code) {
                                    temp_obj.Customer_Name = oSold_to.KUNNR
                                }
                            }
                            final_Array.push(temp_obj)
                        }
                        console.log(final_Array)
                        this.getView().getModel('zhmm0016').setProperty('/SoldToLimit_items', final_Array)
                        break;
                    case 'TransferFactor':
                        oModel.setProperty('/header/BUPFPGPL/visible', true)
                        oModel.setProperty('/header/Material/visible', true)
                        oModel.setProperty('/header/MaterialDescription/visible', true)
                        oModel.setProperty('/header/PMKCode/visible', true)
                        oModel.setProperty('/header/PMKCodeDescription/visible', true)
                        oModel.setProperty('/header/SalesOrg/visible', false)
                        oModel.setProperty('/header/SalesOrgDescription/visible', false)
                        oModel.setProperty('/header/ValidOn/visible', true)
                        
                        const oData_0027 = await this._getReadPromise(oView.getModel('s4'),[{
                            sPath: '/ZCDSEHMMC0027',
                            aFilters: [
                                new Filter({ path: 'MaterialNumber', operator: FilterOperator.EQ, value1: oData.MaterialNumber }),
                                new Filter({ path: 'ValidOn', operator: FilterOperator.EQ, value1: new Date(oData.ValidOn) }),
                                new Filter({ path: 'LanguageKey', operator: FilterOperator.EQ, value1: oData.LanguageKey })
                            ]
                        }])
                        var Data_0027 =  oData_0027 && oData_0027.__batchResponses && oData_0027.__batchResponses.length > 0 && oData_0027.__batchResponses[0].data && oData_0027.__batchResponses[0].data.results && oData_0027.__batchResponses[0].data.results ? oData_0027.__batchResponses[0].data.results : [];
                        oModel.setProperty('/table/transferFactor/items', Data_0027);
                        break;

                    default:
                        break;
                }
            }.bind(this))
        },
        _getReadPromise: function (oModel, aContent) {
            return new Promise(function (resolve, reject) {
                let sGroup = jQuery.sap.uid()
                oModel.setDeferredGroups([sGroup])
                aContent.forEach(o => {
                    oModel.read(o.sPath, {
                        groupId: sGroup,
                        filters: o.aFilters
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
        }
        // _getSoldtoLimitTableData: function (temp_Array) {
        //     return new Promise(function (resolve, reject) {
        //         temp_Array.filter(value => { })


        //     })
        // }

    })
})