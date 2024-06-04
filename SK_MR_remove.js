/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function getInputData() {
        return search.create({
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
                    search.createColumn({ name: "statusref", label: "Status" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "department", label: "Department" }),
                    search.createColumn({ name: "location", label: "Location" })
                ]
        });

    }

    function map(context) {
        const dataValue = JSON.parse(context.value);
        log.debug("", dataValue);

        try {
            var recordObj = record.load({
                type: record.Type.VENDOR_CREDIT,
                id: dataValue.id,
                isDynamic: false
            });

            var lineNo = recordObj.findSublistLineWithValue({
                sublistId: "item",
                fieldId: "item",
                value: 1405
            });

            log.debug("line no: " + lineNo);

            recordObj.removeLine({
                sublistId: "item",
                line: lineNo,
                ignoreRecalc: true
            });

            var savedRecord = recordObj.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });

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