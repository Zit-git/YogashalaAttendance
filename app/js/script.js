ZOHO.embeddedApp.on("PageLoad",function(data){
var asynFun = async () =>{
if(data && data.Entity){
    var productRec = await ZOHO.CRM.API.getRecord({Entity:data.Entity,RecordID:data.EntityId});
    var productData = productRec.data;
    // Load UI
    if(productData.length > 0){
        var attData = [];
        var prevAttData = JSON.parse(productData[0].API_Data || "[]");
        let noOfDays = productData[0].No_of_days || 0;
        let tHeadTxt = "<th scope='col' class='text-center'>Participants</th>";
        let checkBoxHtml = "";
        let daysMap = {};
        for(let i=1;i<=noOfDays;i++){
            daysMap["Day"+i] = false;
            tHeadTxt+= "<th scope='col' class='text-center'>Day "+i+"</th>";
            checkBoxHtml+="<td style='text-align: center;'><input type='checkbox' name='attCheck' partId='#$#' day='Day"+i+"' id='atCheck_C"+i+"R###'></td>";
        }
        document.getElementById("tHeadRow").innerHTML = tHeadTxt;
        let programParticipants = await ZOHO.CRM.API.getRelatedRecords({Entity:data.Entity,RecordID:data.EntityId,RelatedList:"Participants3"});
        let tBodyTxt = "";
        programParticipants.data.forEach((relatedRec,index) => {
            index = index+1;
            let participantName = relatedRec.Participants.name || "Empty";
            let participantId = relatedRec.Participants.id || 0;
            attData.push({Participants:relatedRec.Participants,Attendance:daysMap});
            let newcheckBoxHtml = checkBoxHtml.replaceAll("###",index);
            newcheckBoxHtml = newcheckBoxHtml.replaceAll("#$#",participantId);
            tBodyTxt+= "<tr><td id='"+participantId+"'>"+participantName+"</td>"+newcheckBoxHtml+"</tr>";
        });
        document.getElementById("TabBodyID").innerHTML = tBodyTxt;
    }
    // Load Existing Data
    let attCheck = document.getElementsByName("attCheck");
    attCheck.forEach(checkField => {
        let checkId = checkField.id;
        let dayValue = $("#"+checkId).attr("day");
        let partId = $("#"+checkId).attr("partId");
        prevAttData.forEach(val => {
            if(val.Participants.id == partId && val.Attendance[dayValue]){
                $("#"+checkId).prop('checked', true);
            }
        });
    });
    // Save the data in record
    document.getElementById("attendanceForm").onsubmit = event => {
        let attCheck = document.getElementsByName("attCheck");
        attCheck.forEach(checkField => {
            let checkId = checkField.id;
            let checkValue = $('#'+checkId)[0].checked;
            let dayValue = $("#"+checkId).attr("day");
            let partId = $("#"+checkId).attr("partId");
            attData.forEach(val => {
                if(val.Participants.id == partId){
                    val.Attendance = {...val.Attendance,...{[dayValue]:checkValue}};
                }
            });
        });
        var config={Entity:data.Entity,APIData:{id:data.EntityId,API_Data:attData}};
          ZOHO.CRM.API.updateRecord(config).then(function(data){
             if(data.data[0].code == "SUCCESS"){
                alert("Success");
             }
             else{
                alert("error - "+JSON.stringify(data.data));
             }
          });
        return false;
    }
}  
}
asynFun();
});
ZOHO.embeddedApp.init();