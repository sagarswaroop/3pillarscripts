/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/runtime','N/record'], function(runtime,record) {

    function getInputData() {
        var result = runtime.getCurrentScript().getParameter({ name: 'custscript_3pl_del_rec_list' });
        log.debug("result",result);
        var jsonres = JSON.parse(result);

        return jsonres;
    }

    function map(context) {
        try {
            var datakey = context.key;
            var recordInternalId = JSON.parse(context.value);

            const deletedRecord = record.delete({
                type: 'fxreval',
                id: recordInternalId
            });

            log.debug("deleted record : ",deletedRecord);
        } catch (error) {
            log.debug({
                title: "Error on Currency Revaluation Delete process",
                details: error
            })
        }
    }

    function summarize(summary) {
        
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    }
});
