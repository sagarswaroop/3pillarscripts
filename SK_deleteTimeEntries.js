/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/record','N/search'], function(record,search) {

    function getInputData() {
        return search.create({
            type: "timebill",
            filters:
            [
               ["date","within","1-Feb-2024","2-Mar-2024"], 
               "AND", 
               ["approvalstatus","anyof","3"], 
               "AND", 
               ["type","anyof","A"], 
               "AND", 
               ["count(internalid)","greaterthan","1"], 
               "AND", 
               ["sum(durationdecimal)","greaterthan","8"]
            ],
            columns:
            [
               search.createColumn({
                  name: "date",
                  summary: "GROUP",
                  sort: search.Sort.ASC,
                  label: "Date"
               }),
               search.createColumn({
                  name: "subsidiarynohierarchy",
                  summary: "GROUP",
                  label: "Subsidiary (no hierarchy)"
               }),
               search.createColumn({
                  name: "employee",
                  summary: "GROUP",
                  label: "Employee"
               }),
               search.createColumn({
                  name: "internalid",
                  summary: "COUNT",
                  label: "Internal ID"
               }),
               search.createColumn({
                  name: "durationdecimal",
                  summary: "SUM",
                  label: "Duration (Decimal)"
               }),
               search.createColumn({
                  name: "internalid",
                  summary: "MAX",
                  label: "Internal ID"
               })
            ]
         });
    }

    function map(context) {
        // log.debug({
        //     title: "context",
        //     details: context
        // });

        const data = JSON.parse(context.value);

        let internalId = data.values['MAX(internalid)'];

        log.debug("internal id is: "+internalId);

        const deletedRecord = record.delete({
            type: record.Type.TIME_BILL,
            id: internalId
        });
        
        log.debug("deleted record: ",deletedRecord);
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
