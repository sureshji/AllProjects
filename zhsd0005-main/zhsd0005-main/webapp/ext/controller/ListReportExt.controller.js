sap.ui.define([
    "sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(MessageToast,JSONModel) {
    'use strict';
    var sFlag = false;

    return {
        onInit:function(){
            var oDialogModel = new JSONModel();
            this.getView().setModel(oDialogModel, "oDialogModel");
            oDialogModel.setProperty("/data",[]);
            this.getView().byId("listReport").setRequestAtLeastFields("SalesOrg,DistributionChannel,Division,DocumentNo,Payer,PayerName,BillToParty,BillToName,OutputType,Language,NetValue,DocCurrency,OutputStatus,Suffix,OrdInst,FormLang,AddressNo,BillingDate,ShipToParty,OutformLC,FormIndic,IRNQRCode,PDF,MSGID,MSGNO,MSGTP,MSGTX,BillingType,StatusUpdateUname,StatusUpdateDate,StatusUpdateTime,PDF1,PDF2,Unit,Tax,OutputFormat");
        },
        onBeforeRebindTableExtension: function (oEvent) {
            this.byId("GridTable")._getSelectionPlugin().setSelectionMode("MultiToggle");
        },
        onPressPrint: function (oEvent) {
            var that = this;
            var oJsonData = {};
            var text,
                aData = [];
            var aContexts = that.extensionAPI.getSelectedContexts();
            var oDialogModel = this.getView().getModel("oDialogModel");
            var arr = oDialogModel.getData().data;
            aContexts.forEach(element => {
                let data = element.getModel().getObject(element.getPath());
                for(var i=0;i<arr.length;i++){
                    if(arr[i].path === element.getPath()){
                        
                        if(arr[i].Unit) data.Unit = arr[i].Unit;
                        if(arr[i].Tax) data.Tax = arr[i].Tax;
                    }
                }
                // Set jSon data for oData call
                var taxValue = "",unitValue = "";
                if(data.Tax === "X"|| data.Tax === '') taxValue = "'X'";
                else if(data.Tax === "Y") taxValue = "''";
                if(data.Unit === "X" || data.Unit === '') unitValue = "'X'";
                else if(data.Unit === "Y") unitValue = "''";
                oJsonData = {
                    DistributionChannel: data.DistributionChannel ? "'" + data.DistributionChannel + "'" : '',
                    Division: data.Division ? "'" + data.Division + "'" : '',
                    DocumentNo: data.DocumentNo ? "'" + data.DocumentNo + "'" : "''",
                    MSGID: data.MSGID ? "'" + data.MSGID + "'" : "''",
                    MSGNO: data.MSGNO ? "'" + data.MSGNO + "'" : "''",
                    MSGTP: data.MSGTP ? "'" + data.MSGTP + "'" : "''",
                    MSGTX: data.MSGTX ? "'" + data.MSGTX + "'" : "''",
                    PDF: data.PDF ? "'" + data.PDF + "'" : "''",
                    SalesOrg: data.SalesOrg ? "'" + data.SalesOrg + "'" : "''",
                    AddressNo: data.AddressNo ? "'" + data.AddressNo + "'" : "''",
                    BillToName: data.BillToName ? "'" + data.BillToName + "'" : "''",
                    BillingDate: data.BillingDate ? "datetime'" + JSON.stringify(data.BillingDate).split(".")[0].replace('"', '') + "'" : '',
                    BillingType: data.BillingType ? "'" + data.BillingType + "'" : "''",
                    DocCurrency: data.DocCurrency ? "'" + data.DocCurrency + "'" : "''",
                    FormIndic: data.FormIndic ? "'" + data.FormIndic + "'" : "''",
                    FormLang: data.FormLang ? "'" + data.FormLang + "'" : "''",
                    IRNQRCode: data.IRNQRCode ? "'" + data.IRNQRCode + "'" : "''",
                    Language: data.Language ? "'" + data.Language + "'" : "''",
                    NetValue: data.NetValue ? "'" + data.NetValue + "'" : "''",
                    OrdInst: data.OrdInst ? "'" + data.OrdInst + "'" : "''",
                    OutformLC: data.OutformLC ? "'" + data.OutformLC + "'" : "''",
                    OutputStatus: data.OutputStatus ? "'" + data.OutputStatus + "'" : "''",
                    OutputType: data.OutputType ? "'" + data.OutputType + "'" : "''",
                    Payer: data.Payer ? "'" + data.Payer + "'" : "''",
                    PayerName: data.PayerName ? "'" + data.PayerName + "'" : "''",
                    ShipToParty: data.ShipToParty ? "'" + data.ShipToParty + "'" : "''",
                    StatusUpdateDate: data.StatusUpdateDate ? "datetime'" + JSON.stringify(data.StatusUpdateDate).split(".")[0].replace('"', '') + "'" : '',
                    StatusUpdateTime: data.StatusUpdateTime ? "datetime'" + JSON.stringify(data.StatusUpdateTime).split(".")[0].replace('"', '') + "'" : '',
                    StatusUpdateUname: data.StatusUpdateUname ? "'" + data.StatusUpdateUname + "'" : "''",
                    Suffix: data.Suffix ? "'" + data.Suffix + "'" : "''",
                    Tax: taxValue,
                    Unit: unitValue,
                    BillToParty: data.BillToParty ? "'" + data.BillToParty + "'" : "''",
                    OutputFormat: data.OutputFormat ? "'" + data.OutputFormat + "'" : "''"
                }

                aData.push(oJsonData);
            });
            sap.ui.core.BusyIndicator.show();
            this.aData = aData;
            this.printLength = aData.length;
            this.exeSecLength = 0;
            this.exeLength = 0;
            that.fnAction(this.exeLength);


        },
        fnAction:function(length){
            var that = this;
            if(length !== that.printLength){
                that.fnPayload(that.aData[length]);
            }
        },
        fnPayload:function(payload){
            var oJsonData = payload
            var that =this;
            that.getOwnerComponent().getModel().create("/PRINT", {}, {
                urlParameters: payload,
                success: function (res) {
                    that.exeLength ++;
                    sap.ui.core.BusyIndicator.hide(0);
                    if (res.PRINT.pdf.length === 0) {
                        sap.m.MessageBox.error("No Response");
                        return;
                    }
                    // else if (res.PRINT[0].MSGTP === "E") {
                    //     MessageBox.error(res.results[0].MSGTX);
                    //     return;
                    // }
                    else {
                        var nDate = new Date(), nTime, fName;
                        fName = oJsonData.SalesOrg.replace(/[^a-zA-Z0-9]/g, "") + "_" + oJsonData.Payer.replace(/[^a-zA-Z0-9]/g, "") + "_" + oJsonData.DocumentNo.replace(/[^a-zA-Z0-9]/g, "");
                        nTime = nDate.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2,useGrouping: false}) + nDate.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2,useGrouping: false}) + nDate.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2,useGrouping: false});
                        nDate = nDate.getFullYear().toString() + (nDate.getMonth() + 1).toString() + nDate.getDate().toString();
                        fName = fName + "_" + nDate + "_" + nTime;
                        if(res.PRINT.pdf !== ""){
                            var decodedPdfContent = atob(res.PRINT.pdf);
                            var byteArray = new Uint8Array(decodedPdfContent.length);
                            for (var i = 0; i < decodedPdfContent.length; i++) {
                                byteArray[i] = decodedPdfContent.charCodeAt(i);
                            }
                            var blob = new Blob([byteArray.buffer], {
                                type: 'application/pdf'
                            });
                            var _pdfurl = URL.createObjectURL(blob);
                            var link = document.createElement('a');
                            link.href = _pdfurl;
                            link.download = fName+ "_1" + '.pdf';
                            link.dispatchEvent(new MouseEvent('click'));
                        }
                        if(res.PRINT.pdf1 !== ""){
                            var decodedPdfContent = atob(res.PRINT.pdf1);
                            var byteArray = new Uint8Array(decodedPdfContent.length);
                            for (var i = 0; i < decodedPdfContent.length; i++) {
                                byteArray[i] = decodedPdfContent.charCodeAt(i);
                            }
                            var blob = new Blob([byteArray.buffer], {
                                type: 'application/pdf'
                            });
                            var _pdfurl = URL.createObjectURL(blob);
                            var link = document.createElement('a');
                            link.href = _pdfurl;
                            link.download =  fName+ "_2" + '.pdf';
                            link.dispatchEvent(new MouseEvent('click'));
                        }
                        if(res.PRINT.pdf2 !== ""){
                            var decodedPdfContent = atob(res.PRINT.pdf2);
                            var byteArray = new Uint8Array(decodedPdfContent.length);
                            for (var i = 0; i < decodedPdfContent.length; i++) {
                                byteArray[i] = decodedPdfContent.charCodeAt(i);
                            }
                            var blob = new Blob([byteArray.buffer], {
                                type: 'application/pdf'
                            });
                            var _pdfurl = URL.createObjectURL(blob);
                            var link = document.createElement('a');
                            link.href = _pdfurl;
                            link.download = fName+ "_3" + '.pdf';
                            link.dispatchEvent(new MouseEvent('click'));
                        }
                    }
                    if (that.exeLength === that.printLength) {
                        var text = "PDF downloaded successfully";
                        sap.m.MessageBox.show(text, {
                            icon: sap.m.MessageBox.Icon.SUCCESS,
                            title: "Success",
                            actions: [sap.m.MessageBox.Action.OK]
                        });
                    }
                    else if(that.exeLength !== that.printLength){
                        that.fnAction(that.exeLength);
                    }
                },
                error: function (oErr) {
                    sap.ui.core.BusyIndicator.hide(0);
                    var text = oErr.message;
                    sap.m.MessageBox.show(text, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: oErr.message,
                        actions: [sap.m.MessageBox.Action.OK]
                    });
                }
            });
        },
        onSelectTax:function(oEvent){
            
			var value = oEvent.getParameters().selected;
            var oDialogModel = this.getView().getModel("oDialogModel");
            var arr = oDialogModel.getData().data;
			if (value === true) {
				var obj = {path:oEvent.getSource().getBindingContext().getPath(),Tax:"X"};
                
                //oEvent.getSource().getBindingContext().getModel().getObject(oEvent.getSource().getBindingContext().getPath()).Tax = "X";
			} else {
				var obj = {path:oEvent.getSource().getBindingContext().getPath(),Tax:"Y"}
                
                //oEvent.getSource().getBindingContext().getModel().getObject(oEvent.getSource().getBindingContext().getPath()).Tax = "Y";
			}
            arr.push(obj);
            oDialogModel.setProperty("/data",arr);
        },
        onSelectUnit:function(oEvent){
            
			var value = oEvent.getParameters().selected;
            var oDialogModel = this.getView().getModel("oDialogModel");
            var arr = oDialogModel.getData().data;
			if (value === true) {
				//oEvent.getSource().getBindingContext().getModel().getObject(oEvent.getSource().getBindingContext().getPath()).Unit = "X";
                
                var obj = {path:oEvent.getSource().getBindingContext().getPath(),Unit:"X"};
			} else {
				//oEvent.getSource().getBindingContext().getModel().getObject(oEvent.getSource().getBindingContext().getPath()).Unit = "Y";
                var obj = {path:oEvent.getSource().getBindingContext().getPath(),Unit:"Y"}
			}
            arr.push(obj);
            oDialogModel.setProperty("/data",arr);
        }

    };
});