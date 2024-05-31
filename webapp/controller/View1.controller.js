sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
],
    function (Controller, JSONModel, Fragment) {
        "use strict";

        return Controller.extend("com.sap.goodssupply.controller.View1", {
            onInit: function () {

                let data = [
                    {
                        "items": "item 1 - Material item",
                        "shipqty": "1",
                        "expecteddate": "01.05.2024",
                        "inspectionlevel": "1",

                    },
                    {
                        "items": "item 2 - Material item",
                        "shipqty": "2",
                        "expecteddate": "01.05.2024",
                        "inspectionlevel": "2"

                    }
                ];
                let sDropdown = [
                    {
                        "filename": "Production Plan/Schedule.xls",
                        "mediaType": "sap-icon://excel-attachment",



                    },
                    {
                        "filename": "Project Doc-s(DRW,DTS,QCP/ITP).pdf",
                        "mediaType": "sap-icon://pdf-attachment",


                    },{
                        "filename": "Packing List",
                        "mediaType": "sap-icon://doc-attachment",


                    },
                    {
                        "filename": "Test and Material Certificates",
                        "mediaType": "sap-icon://doc-attachment",


                    },
                    {
                        "filename": "Preliminary Photos",
                        "mediaType": "sap-icon://doc-attachment",


                    },
                    {
                        "filename": "Manufacturer Data Book",
                        "mediaType": "sap-icon://doc-attachment",


                    },
                    {
                        "filename": "Dispatch Note",
                        "mediaType": "sap-icon://doc-attachment",


                    },
                    {
                        "filename": "Guarantee Letter of Customs duties payment",
                        "mediaType": "sap-icon://excel-attachment",


                    },
                    {
                        "filename": "Delivery Note",
                        "mediaType": "sap-icon://doc-attachment",


                    }
                    
                ];
                let contractData = [{ conNo: "12" },
                { conNo: "1234 Description" },
                ];

                let calloffData = [{ callOff: "23" },
                { callOff: "C" },
                { callOff: "3456 Description" }
                ];
                let contract = new JSONModel(contractData);
                this.getView().setModel(contract, "con")

                let calloff = new JSONModel(calloffData);
                this.getView().setModel(calloff, "call")

                let omodel = new JSONModel(data);
                this.getView().setModel(omodel, "myModel");
                let gmodel = new JSONModel(sDropdown);
                this.getView().setModel(gmodel, "sModel");

            },
            itemValidationCallback: function (oItemInfo) {
                const { oItem, iTotalItemsForUpload } = oItemInfo;
                var oUploadSetTableInstance = this.byId("UploadSetTable");
                var oSelectedItems = oUploadSetTableInstance.getSelectedItems();
                var oSelectedItemForUpdate = oSelectedItems.length === 1 ? oSelectedItems[0] : null;
                if (oSelectedItemForUpdate && oSelectedItemForUpdate.getFileName() === "-" && iTotalItemsForUpload === 1) {
                    return new Promise((resolve) => {
                        if (oSelectedItemForUpdate) {
                            var oContext = oSelectedItemForUpdate.getBindingContext();
                            var data = oContext && oContext.getObject ? oContext.getObject() : {};

                            /* Demonstration use case of Setting the header field if required to be passed in API request headers to
                                    inform backend with document type captured through user input */
                            oItem.addHeaderField(new CoreItem(
                                {
                                    key: "existingDocumentID",
                                    text: data ? data.id : ""
                                }
                            ));
                        }
                        resolve(oItem);
                    });
                } else {
                    var oItemPromise = new Promise((resolve, reject) => {
                        this.oItemsProcessor.push({
                            item: oItem,
                            resolve: resolve,
                            reject: reject
                        });
                    });
                    if (iTotalItemsForUpload === 1) {
                        this.openFileUploadDialog();
                    } else if (iTotalItemsForUpload === this.oItemsProcessor.length) {
                        this.openFileUploadDialog();
                    }
                    return oItemPromise;
                }
            },
            contractHelp: function () {
                if (!this.contract) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "com.sap.goodssupply.view.fragment.Contract",
                        controller: this
                    }).then(oDialog => {
                        this.contract = oDialog
                        this.getView().addDependent(oDialog)
                        oDialog.open()
                    })
                } else {
                    this.contract.open()
                }
            },

            onCancelContract: function () {
                this.contract.close();

            },
            calloffHelp: function () {
                if (!this.calloff) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "com.sap.goodssupply.view.fragment.Calloff",
                        controller: this
                    }).then(oDialog => {
                        this.calloff = oDialog
                        this.getView().addDependent(oDialog)
                        oDialog.open()
                    })
                } else {
                    this.calloff.open()
                }
            },
            onCalloffcancel: function () {
                this.calloff.close();

            },
        });
    });
