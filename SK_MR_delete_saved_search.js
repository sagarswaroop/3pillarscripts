/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/search'], function(search) {

    function getInputData() {
       return search.create({
            type: "savedsearch",
            filters:
            [
                ["lastrunon","within","1-Jan-2015 12:00 am","14-Dec-2021 11:59 pm"]
            ],
            columns:
            [
               search.createColumn({name: "id", label: "ID"}),
               search.createColumn({name: "title", label: "Title"})
            ]
         });
        
    }

    function map(context) {
        const dataKey = context.key;
        const dataValue = JSON.parse(context.value);

        log.debug("data value: "+dataValue.values.id,dataValue);

        var deletedSearch = search.delete({
            id: dataValue.values.id
        });

        log.debug("delete search: ",deletedSearch);

        
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
