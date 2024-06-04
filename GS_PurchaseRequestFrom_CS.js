/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/record', 'N/url', 'N/https', 'N/query'],

	function (currentRecord, search, record, url, https, query) {

		/**
	   * Function to be executed after page is initialized.
	   *
	   * @param {Object} scriptContext
	   * @param {Record} scriptContext.currentRecord - Current form record
	   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	   *
	   * @since 2015.2
	   */
		function pageInit(scriptContext) {

		}
		function fieldChanged(scriptContext) {
			var currentRecord = scriptContext.currentRecord;
			var employee_email = currentRecord.getValue({ fieldId: 'custpage_user_email' });
			if (scriptContext.fieldId == "custpage_vendor") {
				var vendor_id = currentRecord.getValue({ fieldId: 'custpage_vendor' });
				if (vendor_id > 0) {

					var redirectSL = url.resolveScript({
						scriptId: 'customscript_purchase_req_loader',
						deploymentId: 'customdeploy_purchase_req_loader',
						params: { 'get_vend_data': 'T', 'vendor_id': vendor_id },
						returnExternalUrl: true
					});
					var response = https.post({
						url: redirectSL
					});
					//console.log('response - ' + response.body);
					if (response.body != 0) {
						console.log(' get_vend_data response= ' + response.body);
						var str = JSON.parse(response.body);
						currentRecord.setValue({ fieldId: 'custpage_subsidiary', value: str.subsidiary });
						currentRecord.setValue({ fieldId: 'custpage_currency', value: str.currency });
						if (str.count > 1) {
							var subField = currentRecord.getField({ fieldId: 'custpage_subsidiary' });

							subField.isDisabled = false

							subField.removeSelectOption({
								value: null
							});
							for (var subKey in str.subsidiaries) {
								subField.insertSelectOption({
									value: str.subsidiaries[subKey].id,
									text: str.subsidiaries[subKey].name
								});
							}

						}else{
							var subField = currentRecord.getField({ fieldId: 'custpage_subsidiary' });
							subField.isDisabled = true;

							subField.removeSelectOption({
								value: null
							});

							for (var subKey in str.subsidiaries) {
								subField.insertSelectOption({
									value: str.subsidiaries[subKey].id,
									text: str.subsidiaries[subKey].name
								});
							}

							currentRecord.setValue({
								fieldId: "custpage_subsidiary",
								value: str.subsidiaries[subKey].id,
								ignoreFieldChange: true
							});

						}
						if (str.currencies > 1) {
							currentRecord.getField({ fieldId: 'custpage_currency' }).isDisabled = false;;
						}
						var locField = currentRecord.getField({ fieldId: 'custpage_location' });
						locField.removeSelectOption({
							value: null
						});
						for (var i in str.locationArr) {
							locField.insertSelectOption({
								value: str.locationArr[i]['locId'],
								text: str.locationArr[i]['locName']
							});
						}
					}
				} else {
					currentRecord.setValue({ fieldId: 'custpage_subsidiary', value: '' });
				}
			}
			else if (scriptContext.fieldId == "custpage_startdate") {
				var st_date = currentRecord.getValue({ fieldId: 'custpage_startdate' });
				//			console.log('custpage_startdate='+st_date);
				if (st_date) {
					var end_date = new Date(st_date.getFullYear(), '11', '31')
					currentRecord.setValue({ fieldId: 'custpage_enddate', value: end_date });
				} else {
					currentRecord.setValue({ fieldId: 'custpage_enddate', value: ''});
				}

			}else if (scriptContext.fieldId == "custpage_enddate") {

				var en_date = currentRecord.getValue({ fieldId: 'custpage_enddate' });
				var st_date = currentRecord.getValue({ fieldId: 'custpage_startdate' });
				var en_date_year = new Date(en_date).getFullYear();
				var currentYear = new Date().getFullYear();

				if(Date.parse(en_date) <= Date.parse(st_date)){
					alert("End date should be greater than Start date");
					currentRecord.setValue({ fieldId: 'custpage_enddate', value: '' });
				}else if(en_date_year && currentYear != en_date_year){
					alert("End date should be current year");
					currentRecord.setValue({ fieldId: 'custpage_enddate', value: '',ignoreFieldChange: true });
				}

			} else if (scriptContext.fieldId == 'custpage_qty' || scriptContext.fieldId == 'custpage_unit_rate') {
				var qty = scriptContext.currentRecord.getCurrentSublistValue({
					sublistId: 'custpage_item_list',
					fieldId: 'custpage_qty',
				});
				var rate = scriptContext.currentRecord.getCurrentSublistValue({
					sublistId: 'custpage_item_list',
					fieldId: 'custpage_unit_rate',
				});
				if (qty > 0 && rate > 0) {
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'custpage_item_list',
						fieldId: 'custpage_amount',
						value: qty * rate
					});
				} else {
					scriptContext.currentRecord.setCurrentSublistValue({
						sublistId: 'custpage_item_list',
						fieldId: 'custpage_amount',
						value: 0
					});
				}


			} else if (scriptContext.fieldId == "custpage_user_email" && employee_email != "") {

				var employee_id = '';

				var redirectSL = url.resolveScript({
					scriptId: 'customscript_purchase_req_loader',
					deploymentId: 'customdeploy_purchase_req_loader',
					params: { 'validate_email': 'T', 'emp_email': employee_email },
					returnExternalUrl: true
				});

				var response = https.post({
					url: redirectSL
				});
				//				console.log('response - ' + response.body);
				employee_id = response.body;

				if (isNullOrEmpty(employee_id)) {
					alert('ERROR : Invalid Requester Email ' + employee_email);
					currentRecord.setValue({ fieldId: 'custpage_user_email', value: "" });
					currentRecord.setValue({ fieldId: 'custpage_user_id', value: "" });
				} else {
					//		    	 console.log('employee_id='+employee_id);
					currentRecord.setValue({ fieldId: 'custpage_user_id', value: parseInt(employee_id) });
				}
			}
		}
		function saveRecord(scriptContext) {


			var rec = scriptContext.currentRecord;
			var action = rec.getValue({ fieldId: 'custpage_action' });
			var department = rec.getValue({ fieldId: 'custpage_department' });
			var department_text = scriptContext.currentRecord.getText({ fieldId: 'custpage_department' });
			var data = rec.getValue({ fieldId: 'custpage_itemdata' });
			var amount = rec.getValue({ fieldId: 'custpage_total' });
			var currencyAmount = rec.getValue({ fieldId: 'custpage_curr_total' });
			var subs = rec.getValue({ fieldId: 'custpage_subsidiary' });
			var currency = rec.getValue({ fieldId: 'custpage_currency' });
			var vdrInvNo = rec.getValue({ fieldId: 'custpage_vdr_inv_no' });
			var vendor = scriptContext.currentRecord.getValue({ fieldId: 'custpage_vendor' });
			var vendor_text = scriptContext.currentRecord.getText({ fieldId: 'custpage_vendor' });
			var usd_total = 0;


			if (action == 'submitform') {
				var departmentCode = 3; // 202 product delivery.

				if (vendor && department) {
					debugger;
					var redirectSL = url.resolveScript({
						scriptId: 'customscript_validate_acc_dep_suit',
						deploymentId: 'customdeploy_validate_acc_dep_suit_dp',
						params: {
							'vendor': vendor
						}
					});
		
					var response = https.post({
						url: redirectSL
					});
	
					console.log('response - ' + response.body);
	
					if(response.body){
						var value = response.body.split(':');
						var depArr = value[0].split(", ");
						var departments = value[1];
						if (depArr.indexOf(department) == -1) {
							alert('Department ' + department_text + ' is not available for Vendor ' + vendor_text + '. You cannot save this transaction.\n Available Departments: '+departments);
							return false;
						}	
					}
				}

				// mskr project mandate in case of 202 department code
				if (department == departmentCode) {
					var project = rec.getValue({ fieldId: 'custpage_project' });
					if (!project) {
						alert("'Please enter CLIENT PROJECT: SOW#'");
						return false;
					}
				}
				var lines = rec.getLineCount({
					sublistId: 'custpage_item_list'
				});
				if (lines == 0) {
					alert('Please add atleast one item to submit the PR');
					return false;
				}
				var jsObjects = JSON.parse(data);
				for (var i = 0; i < lines; i++) {
					var itemid = scriptContext.currentRecord.getSublistValue({
						sublistId: 'custpage_item_list',
						fieldId: 'custpage_item_id',
						line: i
					});
					var item_name = scriptContext.currentRecord.getSublistText({
						sublistId: 'custpage_item_list',
						fieldId: 'custpage_item_id',
						line: i
					});

					//    	    		    console.log('itemid='+itemid);
					var result = jsObjects.filter(function (obj) {
						return obj.id == itemid;
					})[0];
					var item_dept = result.custrecord_restrict_dep;
					var item_dept_text = result.acc_dept;
					if (item_dept && item_dept != null) {
						item_dept = result.custrecord_restrict_dep.replace(/ /g, '');
						var arr_dept = item_dept.split(',');
						if (arr_dept.length > 0 && arr_dept.indexOf(department) < 0) {
							alert('Item ' + item_name + ' resctricted to Departments \n' + item_dept_text);
							return false;
						}
					}


				}
				if (currencyAmount < 500) {
					//    alert('PR total amount should be greater than 500 USD');
					//alert('Creating Vendor Bill')
					var isFileValue = rec.getValue({ fieldId: 'custpage_file' });
					if (!isFileValue) {
						alert("Please upload the attachment.");
						return false;
					}else if(!vdrInvNo){
						alert("'VENDOR INVOICE NUMBER' Field is mandatory.");
						return false;
					}else{
						return true;
					}
				}else{
					return true
				}

			}
			return true;


		}
		/**
		 * Validation function to be executed when sublist line is committed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @returns {boolean} Return true if sublist line is valid
		 *
		 * @since 2015.2
		 */
		function validateLine(scriptContext) {
			var data = scriptContext.currentRecord.getValue({ fieldId: 'custpage_itemdata' });
			var subsidiary = scriptContext.currentRecord.getValue({ fieldId: 'custpage_subsidiary' });
			var department = scriptContext.currentRecord.getValue({ fieldId: 'custpage_department' });
			var project_id = scriptContext.currentRecord.getValue({ fieldId: 'custpage_project' });

			if (department > 0) {
				var itemid = scriptContext.currentRecord.getCurrentSublistValue({
					sublistId: 'custpage_item_list',
					fieldId: 'custpage_item_id',
				});

				if(itemid){
					var jsObjects = JSON.parse(data);
					var item_subs, item_dept;
					var result = jsObjects.filter(function (obj) {
						return obj.id == itemid;
					})[0];
					var item_subs = result.subsidiary;
					var item_dept = result.custrecord_restrict_dep;
					var item_dept_text = result.acc_dept;
					if (item_subs && item_subs != null) {
						item_subs = result.subsidiary.replace(/ /g, '');
						var arr_subs = item_subs.split(',');
						if (arr_subs.indexOf(subsidiary) < 0) {
							alert('Item not available for selected Vendor');
							return false;
						}
					}
					if (item_dept && item_dept != null) {
						item_dept = result.custrecord_restrict_dep.replace(/ /g, '');
						var arr_dept = item_dept.split(',');
						if (arr_dept.length > 0 && arr_dept.indexOf(department) < 0) {
							alert('Item resctricted to Departments \n' + item_dept_text);
							return false;
						}
					}
					if (result.custitem_sow_required_for_po == 'T' && project_id == '') {
						alert('Please select a Client Project to add this item.')
						return false;
					}
				}else{
					alert('Please add atleast one item to submit the PR');
					return false;
				}
			} else {
				alert('Please select Deparment first');
				return false;
			}


			return true;

		}
		function sublistChanged(scriptContext) {
			var rec = scriptContext.currentRecord;
			var currency = rec.getValue({ fieldId: 'custpage_currency' });
			var lines = rec.getLineCount({
				sublistId: 'custpage_item_list'
			});
			var op = scriptContext.operation;
			//           console.log('op:'+op);

			if (lines == 0) {
				rec.setValue({ fieldId: 'custpage_total', value: '0' });
			}
			var amount = 0;
			//    	   console.log('line='+lines);
			for (var i = 0; i < lines; i++) {
				var line_amount = scriptContext.currentRecord.getSublistValue({
					sublistId: 'custpage_item_list',
					fieldId: 'custpage_amount',
					line: i
				});
				//    		    console.log('line_amount='+line_amount);
				if (line_amount > 0) amount = amount + line_amount;
				//    		    console.log('amount='+amount);

			}
          if(amount>0){
				amount=amount.toFixed(4);
			}
			rec.setValue({ fieldId: 'custpage_total', value: amount });

			if(currency != 1){
				var redirectSL = url.resolveScript({
					scriptId: 'customscript_purchase_req_loader',
					deploymentId: 'customdeploy_purchase_req_loader',
					params: { 'val_total': 'T', 'currency': currency, 'amount': amount },
					returnExternalUrl: true
				});
				var response = https.post({
					url: redirectSL
				});
				console.log('response - ' + response.body);
				amount = parseFloat(JSON.parse(response.body)).toFixed(2);

				rec.setValue({ fieldId: 'custpage_curr_total', value: amount });

			}else{
				rec.setValue({ fieldId: 'custpage_curr_total', value: amount });
			}

		}
		function isNullOrEmpty(val) {
			if (val == null || val == '' || val == "" || val == 'undefined' || val == [] || val == {} || val == 'NaN' || val == '- None -') {
				return true;
			} else {
				return false;
			}
		}
		function generate_access_code() {
			var record_ = currentRecord.get();
			var employee_id = record_.getValue({ fieldId: 'custpage_user_id' });
			var employee_email = record_.getValue({ fieldId: 'custpage_user_email' });
			if (isNullOrEmpty(employee_email)) {
				alert('Please enter email');
				return false;
			}


			var redirectSL = url.resolveScript({
				scriptId: 'customscript_purchase_req_loader',
				deploymentId: 'customdeploy_purchase_req_loader',
				params: { 'create_code': 'T', 'emp_email': employee_email, 'emp_id': employee_id },
				returnExternalUrl: true
			});

			var response = https.post({
				url: redirectSL
			});
			alert('Access code sent to : ' + employee_email);
		}

		return {
			validateLine: validateLine,
			saveRecord: saveRecord,
			fieldChanged: fieldChanged,
			generate_access_code: generate_access_code,
			sublistChanged: sublistChanged
		};

	});