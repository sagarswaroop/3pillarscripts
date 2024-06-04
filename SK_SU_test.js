/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget'], function(serverWidget) {

    function onRequest(context) {
        var form = serverWidget.createForm({
            title: 'Test Suitelet'
        });

        var recordSublist = form.addSublist({
            id: 'custpage_record',
            type: serverWidget.SublistType.LIST,
            label: "Records"
        });

        recordSublist.addField({
            id: "custpage__attach_file",
            label: "Attachment",
            type: serverWidget.FieldType.DATE
        });

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    }
});
