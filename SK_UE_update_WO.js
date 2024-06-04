/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeLoad(context) {
        
    }

    function beforeSubmit(context) {
        
    }

    function afterSubmit(context) {
        const record = context.newRecord;

        let totalLines = record.getLineCount({
            sublistId: "item"
        });

        
        record.submitFields({
            type: context.type,
            id: context.newRecord.id,
            values: {}
            
        })
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
