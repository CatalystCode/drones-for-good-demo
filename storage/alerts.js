const azure = require('azure-storage');

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
          if (message) {
            queueService.deleteMessage(queueName, message.messageId, message.popReceipt, () => {});
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

// checkQueueMessages('alerts', 'drones4goodstore', '8aK9lKtBoyV++Af371a56aQPzh4gPGMT+8c5NQ/n9AfOAEFLPIb4BrOENxRo+MgOeHpTQLyP73mGzmBbyo9x9A==', (error, message) => {
  
//   if (error) {
//     return console.error(error);
//   }

//   if (!message) {
//     return console.log('no messages in queue');
//   }

//   console.log(message);
// });

module.exports = {
  pollQueue,
  checkQueueMessages
};