/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/search'], function (search) {

    function getItemData(currRecId) {
        var dataObj = {
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

    function fieldChanged(context) {

        const CurrentRecord = context.currentRecord;
        var subItemId = "recmachcustrecord_mns_source_item";
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;


        try {
            if (sublistName === subItemId && sublistFieldName === 'custrecord_msi_item') {
                let itemId = CurrentRecord.getCurrentSublistValue({
                    sublistId: subItemId,
                    fieldId: "custrecord_msi_item"
                });

                const dataObj = getItemData(itemId);

                for (const key in dataObj) {
                    if (dataObj.hasOwnProperty.call(dataObj, key)) {
                        const element = dataObj[key];

                        CurrentRecord.setCurrentSublistValue({
                            sublistId: subItemId,
                            fieldId: key,
                            value: element,
                            ignoreFieldChange: true
                        });

                    }
                }
            }
        } catch (error) {
            log.debug("error on fieldchange: ", error);
        }


    }

    function lineInit(context) {
        var currRecord = context.currentRecord;
        var subItemId = "recmachcustrecord_mns_source_item";

        var name = currRecord.getCurrentSublistValue({
            sublistId: subItemId,
            fieldId: "custrecord_msi_name"
        });

        if(name)
        jQuery("#tbl_recmachcustrecord_mns_source_item_insert").remove();

    }


    function pageInit(context) {
        // jQuery("#recmachcustrecord_mns_source_item_main_form").remove();
        jQuery("#tbl_newrec961").remove();
        jQuery("#tbl_custpage_dad_button_recmachcustrecord_mns_source_item").remove();
    }

    function validateLine(context) {
        var currRecord = context.currentRecord;
        var subItemId = "recmachcustrecord_mns_source_item";

        var name = currRecord.getCurrentSublistValue({
            sublistId: subItemId,
            fieldId: "custrecord_msi_name"
        });

        let itemId = currRecord.getCurrentSublistValue({
            sublistId: subItemId,
            fieldId: "custrecord_msi_item"
        });

        if (!name) {
            alert("You can't enter for new line. Please Contact to Administrator.");
            return false;
        } else {
            const dataObj = getItemData(itemId);

            for (const key in dataObj) {
                if (dataObj.hasOwnProperty.call(dataObj, key)) {
                    const element = dataObj[key];

                    currRecord.setCurrentSublistValue({
                        sublistId: subItemId,
                        fieldId: key,
                        value: element,
                        ignoreFieldChange: true
                    });

                }
            }
            return true;
        }
    }

    return {
        pageInit: pageInit,
        // saveRecord: saveRecord,
        // validateField: validateField,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
