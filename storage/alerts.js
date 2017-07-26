const azure = require('azure-storage');

var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

/**
 * Checking if there are items inside a queue
 * @param {string} queueName Name of the queue to query
 * @param {string} accountName Name of the storage account
 * @param {string} accountKey Key of the storage account
 * @param {function} callback(error, message)
 */
function checkQueueMessages(queueName, accountName, accountKey, callback) {

  try {

    let queueService = azure.createQueueService(accountName, accountKey);
    queueService.createQueueIfNotExists(
      queueName, 
      (error, result, response) => {

        if(error) { return callback(error); }
    
        queueService.getMessage(queueName, null, (error, message) => {

          // Removing message from queue
          if (message) {
            queueService.deleteMessage(queueName, message.messageId, message.popReceipt, () => {});

            // Decoding a base64 message
            if (message.messageText && base64regex.test(message.messageText)) {
              let decoder = new azure.QueueMessageEncoder.TextBase64QueueMessageEncoder();
              message.messageText = decoder.decode(message.messageText);
            }
          }

          return callback(error, message);
        });
    });

  } catch (e) {
    return callback(e);
  }
}

/**
 * Polling a queue and activating a method on new messages
 * @param {string} queueName Name of the queue to query
 * @param {string} accountName Name of the storage account
 * @param {string} accountKey Key of the storage account
 * @param {number} pollInternal Polling internal in milliseconds (default = 1000)
 * @param {function} actionCallback(message)
 */
function pollQueue(queueName, accountName, accountKey, pollInternal, actionCallback) {
  setInterval(() => {
    checkQueueMessages(queueName, accountName, accountKey, (error, message) => {
      if (error) {
        return console.error(error);
      }

      if (message) {
        actionCallback(message);
      }
    });
  }, pollInternal || 1000);
}

module.exports = {
  pollQueue,
  checkQueueMessages
};