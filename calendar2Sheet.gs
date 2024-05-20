var CalendarId = "XXXXXXXXX";
var Line_Notify_TOKEN = "XXXXXXXXX";

function getEventMessage(date) {
  var calendar = CalendarApp.getCalendarById(CalendarId);
  var eventList = calendar.getEventsForDay(date);
  var formattedDate = date.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  
  if (eventList.length === 0) {
    return `📣แจ้งเตือนภารกิจของวันที่ ${formattedDate} ไม่มีกิจกรรม`;
  }

  var message = `📣แจ้งเตือนภารกิจของวันที่ ${formattedDate} มีทั้งหมด ${eventList.length} กิจกรรม`;
  eventList.forEach((event, index) => {
    var eventTitle = `🔶 เรื่อง : ${event.getTitle()}`;
    var eventTime = `⏰ เวลา : ${event.getStartTime().toTimeString().slice(0, 5)}-${event.getEndTime().toTimeString().slice(0, 5)}`;
    var eventDescription = `📍รายละเอียด : ${event.getDescription()}`;
    message += `\n${index + 1}. ${eventTitle}\n    ${eventTime}\n    ${eventDescription}\n`;
  });
  return message;
}

function dailyEventMessage() {
  var today = new Date();
  var message = getEventMessage(today);
  Logger.log(message);
  sendMessage(message);
}

function tomorrowEventMessage() {
  var today = new Date();
  var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  var message = getEventMessage(tomorrow);
  Logger.log(message);
  sendMessage(message);
}

function sendMessage(message) {
  var response = UrlFetchApp.fetch("https://notify-api.line.me/api/notify", {
    "method": 'post',
    "headers": { "Authorization": "Bearer " + Line_Notify_TOKEN },
    "payload": { "message": message }
  }); Logger.log(response);
}
