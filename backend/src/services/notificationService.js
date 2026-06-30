const Notification = require('../models/Notification');

// Helper: create notification + emit via Socket.IO 
const createNotification = async (io, { recipient, type, title, message, taskId, updateId, announcementId, inquiryId, requiredDayId }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      taskId:         taskId         || null,
      updateId:       updateId       || null,
      announcementId: announcementId || null,
      inquiryId:      inquiryId      || null,
      requiredDayId:  requiredDayId  || null,
    });

    // emit to the recipient's personal room (joined in server.js on socket connect)
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('new_notification', {
        _id:            notification._id,
        type:           notification.type,
        title:          notification.title,
        message:        notification.message,
        isRead:         false,
        taskId:         notification.taskId,
        updateId:       notification.updateId,
        announcementId: notification.announcementId,
        inquiryId:      notification.inquiryId,
        requiredDayId:  notification.requiredDayId,
        createdAt:      notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    console.error('createNotification error:', err);
  }
};

module.exports = { createNotification };