/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function getInputData() {

        var purchaseorderSearchObj = search.create({
            type: "vendorcredit",
            filters:
                [
                    ["item", "anyof", "362"],
                    "AND",
                    ["type", "anyof", "VendCred"]
                ],
            columns:
                [
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "type", label: "Type" }),
                ]
        });
        var searchResultCount = purchaseorderSearchObj.runPaged().count;
        log.debug("purchaseorderSearchObj result count", searchResultCount);

        return purchaseorderSearchObj;
    }

    function map(context) {
        var dataValue = JSON.parse(context.value);
        var ITEMID = "item";
        log.debug("", dataValue);

        try {
            var currRecord = record.load({
                type: record.Type.VENDOR_CREDIT,
                id: dataValue.id,
                isDynamic: true
            });


            var lineNo = currRecord.findSublistLineWithValue({
                sublistId: "item",
                fieldId: "item",
                value: 362
            });

            if (lineNo > -1) {
                var lineDepartment = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "department",
                    line: lineNo
                });

                var lineDescription = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "description",
                    line: lineNo
                });

                var quantity = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: lineNo
                });

                var rate = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "rate",
                    line: lineNo
                });

                var taxCode = currRecord.getSublistValue({
                    sublistId: "item",
                    fieldId: "taxcode",
                    line: lineNo
                });

                // var location = currRecord.getSublistValue({
                //     sublistId: "item",
                //     fieldId: "location",
                //     line: lineNo
                // });

                // log.debug("currRecord",currRecord);

                var recordLine = currRecord.selectLine({
                    sublistId: "item",
                    line: lineNo
                });

                recordLine.setCurrentSublistValue({
                    sublistId: ITEMID,
                    fieldId: "item",
                    value: 1405,
                    ignoreFieldChange: true
                });

                recordLine.setCurrentSublistValue({
                    sublistId: ITEMID,
                    fieldId: "department",
                    value: lineDepartment,
                    ignoreFieldChange: true
                });

                recordLine.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "description",
                    value: lineDescription,
                    ignoreFieldChange: true
                });

                recordLine.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    value: quantity,
                    ignoreFieldChange: true
                });

                recordLine.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "rate",
                    value: rate,
                    ignoreFieldChange: true
                });

                recordLine.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "taxcode",
                    value: taxCode,
                    ignoreFieldChange: true
                });

                // recordLine.setCurrentSublistValue({
                //     sublistId: "item",
                //     fieldId: "location",
                //     value: location,
                //     ignoreFieldChange: true
                // });

                recordLine.commitLine({
                    sublistId: "item",
                    ignoreRecalc: true
                });

                var savedRecord = currRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });

            }
            log.debug("saved record: " + savedRecord);

        } catch (error) {
            log.error("error", error);
        }
    }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        // reduce: reduce,
        summarize: summarize
    }
});