/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@author Sagar Kumar
 *@description it create and delete the child substitution item on master item create and delete
 */
define(['N/search', 'N/runtime', 'N/record', "N/ui/serverWidget"], function (search, runtime, record, serverWidget) {

    function getItemData(currRecId, seqNumber) {
        var dataObj = {
            custrecord_msi_name: seqNumber || "",
            custrecord_msi_item: currRecId || "",
            custrecord_msi_prefered_bin: "",
            custrecord_msi_taa_compliancy: "",
            custrecord_msi_sterline_ns: "",
            custrecord_msi_vendor: "",
            custrecord_msi_latex: "",
            custrecord_msi_purhcase_cost: "",
            custrecord_msi_onhandqty: ""
        }

        var inventoryitemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", currRecId]
                ],
            columns:
                [
                    search.createColumn({ name: "custitem_taa", label: "TAA" }),
                    search.createColumn({ name: "custitem_is_steriled", label: "Sterile" }),
                    search.createColumn({ name: "vendor", label: "Preferred Vendor" }),
                    search.createColumn({ name: "custitem_mm_lates", label: "Latex" }),
                    search.createColumn({ name: "quantityonhand", label: "On Hand" }),
                    search.createColumn({ name: "cost", label: "Purchase Price" }),
                    search.createColumn({
                        name: "internalid",
                        join: "binNumber",
                        label: "Internal ID"
                    })
                ]
        });
        inventoryitemSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results

            dataObj.custrecord_msi_latex = result.getValue("custitem_mm_lates");
            dataObj.custrecord_msi_onhandqty = result.getValue("quantityonhand");
            dataObj.custrecord_msi_purhcase_cost = result.getValue("cost");
            dataObj.custrecord_msi_sterline_ns = result.getValue("custitem_is_steriled");
            dataObj.custrecord_msi_taa_compliancy = result.getValue("custitem_taa");
            dataObj.custrecord_msi_vendor = result.getValue("vendor");
            dataObj.custrecord_msi_prefered_bin = result.getValue({
                name: "internalid",
                join: "binNumber",
                label: "Internal ID"
            });

            return true;
        });

        log.debug("dataObj", dataObj)

        return dataObj;
    }

    function hideColumnField(formObj, sublistId, fieldId) {
        try {
            const formSublist = formObj.getSublist({
                id: sublistId
            });
            if (formSublist) {
                const formField = formSublist.getField({
                    id: fieldId
                });
                if (formField && typeof formField !== 'undefined' && formField !== null) {
                    formField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                }
            }
        } catch (error) {
            log.error({
                title: 'Error occurred when hiding field',
                details: JSON.stringify({
                    sublistId: sublistId,
                    fieldId: fieldId
                })
            });
        }
    }

    function beforeLoad(context) {

        if (context.newRecord.type == 'lotnumberedinventoryitem') {

            var hideFld = context.form.addField({
                id: 'custpage_hide_buttons_sk',
                label: 'not shown - hidden',
                type: serverWidget.FieldType.INLINEHTML
            });

            // if (context.type = context.UserEventType.VIEW) {
            //     var scr = "";
            //     scr += 'jQuery("#recmachcustrecord_mns_source_item_main_form").hide();';
            //     // scr += 'jQuery("#tbl_custpage_dad_button_recmachcustrecord_mns_source_item").hide();';
            //     // scr += 'jQuery("#tdbody_custpage_dad_button_recmachcustrecord_mns_source_item").hide();';
            // } else {
            //     hideColumnField(context.form, 'recmachcustrecord_mns_source_item', 'Custom_EDIT_raw');
            // }

            var scr = "";
            scr += 'jQuery("#recmachcustrecord_mns_source_item_main_form").hide();';
            scr += 'jQuery("#recmachcustrecord_mns_source_item__tab a").hide();';

            hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
        }

    }

    function afterSubmit(context) {
        const currRecord = context.newRecord;
        const lineLimit = runtime.getCurrentScript().getParameter({ name: 'custscript_subs_item_limit' });
        const currRecId = currRecord.id;
        const recordType = currRecord.type;

        log.debug("recordType", recordType);

        log.debug("record type: ", context.type);

        try {
            if (context.type == context.UserEventType.CREATE /* && recordType == 'lotnumberedinventoryitem' */) {
                let dataObj = getItemData(currRecId);

                for (let index = 0; index < lineLimit; index++) {
                    if (index == 0) {
                        let objRecord = record.create({
                            type: "customrecord_manual_subs_itm",
                        });

                        objRecord.setValue({
                            fieldId: "custrecord_mns_source_item",
                            value: currRecId,
                        });

                        objRecord.setValue({
                            fieldId: "custrecord_msi_name",
                            value: "1",
                        });

                        for (const key in dataObj) {
                            if (dataObj.hasOwnProperty.call(dataObj, key)) {

                                log.debug("key", key);
                                const element = dataObj[key];

                                if (key != "custrecord_msi_name") {
                                    log.debug("value", element);
                                    objRecord.setValue({
                                        fieldId: key,
                                        value: element,
                                    });
                                }
                            }
                        }

                        objRecord.save({
                            ignoreMandatoryFields: true
                        });

                    } else {
                        let objRecord = record.create({
                            type: "customrecord_manual_subs_itm",
                        });

                        objRecord.setValue({
                            fieldId: "custrecord_mns_source_item",
                            value: currRecId,
                            ignoreFieldChange: true
                        });

                        objRecord.setValue({
                            fieldId: "custrecord_msi_name",
                            value: (index + 1),
                            ignoreFieldChange: true
                        });

                        objRecord.save({
                            ignoreMandatoryFields: true
                        });
                    }
                }
            }
            else if (context.type == context.UserEventType.EDIT) {
                let recordData = "";
                let itemId = currRecord.getValue({
                    fieldId: "custitem_sub_item"
                });

                let seqNumber = currRecord.getValue({
                    fieldId: "custitem_sub_no"
                });

                if(itemId > 0 && seqNumber >0){
                    recordData = getItemData(itemId, seqNumber);
                }
                var customrecord_manual_subs_itmSearchObj = search.create({
                    type: "customrecord_manual_subs_itm",
                    filters:
                        [
                            ["custrecord_mns_source_item", "anyof", currRecId],
                            "AND",
                            ["custrecord_msi_name", "equalto", seqNumber]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = customrecord_manual_subs_itmSearchObj.runPaged().count;
                log.debug("customrecord_manual_subs_itmSearchObj result count", searchResultCount);
                customrecord_manual_subs_itmSearchObj.run().each(function (result) {
                    const updatedRecord = record.submitFields({
                        type: "customrecord_manual_subs_itm",
                        id: result.getValue("internalid"),
                        values: recordData,
                    });
                    return true;
                });

                var customrecord_manual_subs_itmSearchObj = search.create({
                    type: "customrecord_manual_subs_itm",
                    filters:
                        [
                            ["custrecord_msi_item", "anyof", "@NONE@"],
                            "AND",
                            ["custrecord_msi_name", "contains", "1"],
                            "AND",
                            ["custrecord_mns_source_item", "anyof", currRecId]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = customrecord_manual_subs_itmSearchObj.runPaged().count;
                log.debug("customrecord_manual_subs_itmSearchObj result count", searchResultCount);
                customrecord_manual_subs_itmSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    const emptyDataObj = {
                        custrecord_msi_prefered_bin: "",
                        custrecord_msi_taa_compliancy: "",
                        custrecord_msi_sterline_ns: "",
                        custrecord_msi_vendor: "",
                        custrecord_msi_latex: "",
                        custrecord_msi_purhcase_cost: "",
                        custrecord_msi_onhandqty: ""
                    }

                    record.submitFields({
                        type: "customrecord_manual_subs_itm",
                        id: result.getValue("internalid"),
                        values: emptyDataObj
                    });
                    return true;
                });

                // log.debug("updated record : " + updatedRecord);
            }
        } catch (error) {
            log.error("error during execution of code: ", error)
        }
    }

    return {
        beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
