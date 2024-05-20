const CHANNEL_TOKEN = "XXXXXXXXXXX";
const GDRIVE_FOLDER_ID = "XXXXXXXXXXX";

function replyMsg(replyToken, messages) {
  const options = {
    'headers': { 'Content-Type': 'application/json; charset=UTF-8', 'Authorization': 'Bearer ' + CHANNEL_TOKEN },
    'method': 'post',
    'payload': JSON.stringify({ 'replyToken': replyToken, 'messages': messages })
  };
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', options);
}

function toDrive(messageId, meType, mType) {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const headers = { "headers": { "Authorization": "Bearer " + CHANNEL_TOKEN } };

  try {
    const blob = UrlFetchApp.fetch(url, headers).getBlob();
    const fileId = DriveApp.getFolderById(GDRIVE_FOLDER_ID).createFile(Utilities.newBlob(blob.getBytes(), meType, messageId + mType)).getId();
    return 'https://drive.google.com/uc?id=' + fileId;
  } catch (error) {
    Logger.log("Error uploading to Google Drive: " + error);
    return null;
  }
}

function handleFileMessage(event) {
  const fileName = event.message.fileName;
  const fileType = fileName.split('.').pop();
  const mimetype = getMimeType(fileType);

  if (mimetype !== "undefined") {
    const messageId = event.message.id;
    const replyMessage = [];
    const driveLink = toDrive(messageId, mimetype, `.${fileType}`);
    if (driveLink) {
      replyMessage.push({ 'type': 'text', 'text': `📂 ชื่อไฟล์: ${fileName}\n\nลิงก์ Google Drive:\n${driveLink}` });
    } else {
      replyMessage.push({ 'type': 'text', 'text': 'Error uploading the file.' });
    }
    return replyMessage;
  } else {
    return [{ 'type': 'text', 'text': 'ไม่รองรับไฟล์ประเภทนี้' }];
  }
}

function getMimeType(fileType) {
  var mimeTypes = {
    "pdf": "application/pdf",
    "zip": "application/zip",
    "rar": "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    "doc": "application/msword",
    "xls": "application/vnd.ms-excel",
    "ppt": "application/vnd.ms-powerpoint",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "mp4": "video/mp4",
    "mp3": "audio/mpeg",
    "png": "image/png",
    "gif": "image/gif",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
  };

  return mimeTypes[fileType] || "undefined";
}

function doPost(e) {
  const { replyToken, message: { type, id } } = JSON.parse(e.postData.contents).events[0];
  let replyMessage;
  switch (type) {
    case 'file': replyMessage = handleFileMessage({ message: { id, fileName: e.parameter.filename } }); break;
    case 'image': replyMessage = [{ 'type': 'text', 'text': '🖼️ ไฟล์รูปภาพ ' + '\n\nลิงก์ Google Drive:\n' + toDrive(id, "image/jpeg", ".jpg") }]; break;
    case 'video': replyMessage = [{ 'type': 'text', 'text': '🎞️ ไฟล์วิดีโอ ' + '\n\nลิงก์ Google Drive:\n' + toDrive(id, "video/mp4", ".mp4") }]; break;
    case 'audio': replyMessage = [{ 'type': 'text', 'text': '🔊 ไฟล์เสียง ' + '\n\nลิงก์ Google Drive:\n' + toDrive(id, "audio/mpeg", ".mp3") }]; break;
    default: break;
  }
  if (replyMessage) replyMsg(replyToken, replyMessage);
}
