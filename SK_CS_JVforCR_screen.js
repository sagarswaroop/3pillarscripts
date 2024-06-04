/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
define(['N/url', 'N/search', 'N/currentRecord', 'N/query', 'N/ui/message'], function(url, search, currentRecord, query, message) {

    function pageInit(context) {
        
    }

    function getFormateDate(today) {

        let date = today.getDate();
        let month = monthNames[today.getMonth()];
        let year = today.getFullYear();

        var fullDate = date + '-' + month + '-' + year;
        return fullDate;
    }

    function ReassignButton() {
        debugger;

        let curRec = currentRecord.get();
        // let year = new Date().getFullYear();

        let fieldValue = curRec.getText({
            fieldId: "custpage_month"
        });

        let data = fieldValue.split(":")[2].split(" ");

        let month = monthNames.indexOf(data[1]);
        let year = parseInt(data[2]);


        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0);

        firstDay = getFormateDate(firstDay);
        lastDay = getFormateDate(lastDay);

        let suiteletURL = url.resolveScript({
            scriptId: "customscript_3pl_curr_rev_screen",
            deploymentId: "customdeploy_3pl_curr_rev_screen"
        });
        
        window.onbeforeunload = null
        window.open(suiteletURL + '&viewtrans=T' + '&fromdate=' + firstDay + '&todate=' + lastDay + '&month=' + month, "_self");
        //newwindow.close();
    }

    function saveRecord(context) {
        
    }

    function validateField(context) {
        
    }

    function fieldChanged(context) {
        
    }

    function postSourcing(context) {
        
    }

    function lineInit(context) {
        
    }

    function validateDelete(context) {
        
    }

    function validateInsert(context) {
        
    }

    function validateLine(context) {
        
    }

    function sublistChanged(context) {
        
    }

    return {
        pageInit: pageInit,
        ReassignButton : ReassignButton,
        // saveRecord: saveRecord,
        // validateField: validateField,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
