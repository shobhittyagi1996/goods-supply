sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/UploadSetwithTable",
    "sap/m/upload/UploadSetwithTableItem",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/ui/core/Item",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Element"
],
    function (Controller, JSONModel, UploadSetwithTable, UploadSetwithTableItem, MessageBox, Fragment, MessageToast, Dialog, Button, mobileLibrary, Text, coreLibrary, CoreItem, Filter, FilterOperator, Element) {
        "use strict";

        return Controller.extend("com.sap.goodssupply.controller.View1", {
            onInit: function () {
                var oModel = new JSONModel();
                this.getView().setModel(oModel);
                this.oUploadSetTable = this.byId("UploadSetTable");
                this.documentTypes = this.getFileCategories();
                this.oItemsProcessor = [];

                let data = [
                    {
                        "items": "item 1 - Material item",
                        "orderedqty": "1",
                        "shipqty": "1",
                        "expecteddate": "01.05.2024",
                        "inspectionlevel": "1",
                        "unitofmeasure":"PCS"

                    },
                    {
                        "items": "item 2 - Material item",
                        "orderedqty": "2",
                        "shipqty": "1",
                        "expecteddate": "01.05.2024",
                        "inspectionlevel": "2",
                        "unitofmeasure":"PCS"

                    }
                ];
                let logModel = new JSONModel([{
                    "logDateTime": "2024-04-01",
                    "logTitle": "KPO Dept Commented",
                    "logComments": "Point No 3 in MOM adjusted.",
                    "loggedBy": "User@kpo.kz",
    
                },
                {
                    "logDateTime": "2024-04-05",
                    "logTitle": "Supplier Commented",
                    "logComments": "Describe more on point 3 in MOM Attached",
                    "loggedBy": "supplier@gmail.com",
    
                },
                {
                    "logDateTime": "2024-04-09",
                    "logTitle": "Process Started",
                    "logComments": "MoM Registered",
                    "loggedBy": "VQ@kpo.kz",
    
                }]);
                let sDropdown = [
                    
                    {
                        "filename": "Packing List",
                        "mediaType": "sap-icon://doc-attachment",


                    },
                    
                    {
                        "filename": "Preliminary Photos",
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
                this.getView().setModel(logModel, "logModel");

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
           
            handleConfirmation: function () {
                debugger
                var oData = this._fileUploadFragment.getModel().getData();
                var oSelectedItems = oData.selectedItems;
    
                if (oSelectedItems && oSelectedItems.length) {
                    oSelectedItems.forEach(function (oItem) {
                        var oItemToUploadRef = oItem.itemInstance;
                        // setting the header field for custom document type selected
                        oItemToUploadRef.addHeaderField(new CoreItem({
                            key: "documentType",
                            text: oItem.fileCategorySelected
                        }));
                        oItem.fnResolve(oItemToUploadRef);
                    });
                }
                this._fileUploadFragment.destroy();
                this._fileUploadFragment = null;
                this._oFilesTobeuploaded = [];
                this.oItemsProcessor = [];
            },
            isAddButtonEnabled: function (aSelectedItems) {
                if (aSelectedItems && aSelectedItems.length) {
                    if (aSelectedItems.some(function (item) {
                        return !item.fileCategorySelected;
                    })) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            },
            openFileUploadDialog: function () {
                var items = this.oItemsProcessor;
    
                if (items && items.length) {
    
                    this._oFilesTobeuploaded = items;
    
                    var oItemsMap = this._oFilesTobeuploaded.map(function (oItemProcessor) {
    
                        return {
                            fileName: oItemProcessor.item.getFileName(),
                            fileCategorySelected: this.documentTypes[0].categoryId,
                            itemInstance: oItemProcessor.item,
                            fnResolve: oItemProcessor.resolve,
                            fnReject: oItemProcessor.reject
                        };
                    }.bind(this));
                    var oModel = new JSONModel({
                        "selectedItems": oItemsMap,
                        "types": this.documentTypes
    
                    });
                    if (!this._fileUploadFragment) {
                        Fragment.load({
                            name: "com.sap.goodssupply.view.fragment.FileUpload",
                            id: this.getView().getId() + "-file-upload-dialog",
                            controller: this
                        })
                            .then(function (oPopover) {
                                this._fileUploadFragment = oPopover;
                                this.getView().addDependent(oPopover);
                                oPopover.setModel(oModel);
                                oPopover.open();
                            }.bind(this));
                    } else {
                        this._fileUploadFragment.setModel(oModel);
                        this._fileUploadFragment.open();
                    }
                }
            },
            closeFileUplaodFragment: function () {
                this._fileUploadFragment.close();
            },
            uploadFilesHandler: function () {
                var oUploadSetTableInstance = this.byId("UploadSetTable");
    
                oUploadSetTableInstance.fileSelectionHandler();
            },
            onUploadCompleted: function (oEvent) {
                var oModel = this.getView().getModel();
                var iResponseStatus = oEvent.getParameter("status");
    
                // check for upload is sucess
                if (iResponseStatus === 201) {
                    oModel.refresh(true);
                    setTimeout(function () {
                        MessageToast.show("Document Added");
                    }, 1000);
                }
    
            },
            getFileCategories: function () {
                return [
                    { categoryId: "DN", categoryText: "Delivery Note" },
                    { categoryId: "PL", categoryText: "Packing List" },
                    { categoryId: "PP", categoryText: "Preliminary Photos" },
                    { categoryId: "GL", categoryText: "Guarantee Letter of customs duties payment" },
                    
                ];
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
