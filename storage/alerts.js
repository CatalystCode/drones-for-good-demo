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
    
        queueService.getMessage(queueName, null, callback);
    });

  } catch (e) {
    return callback(e);
  }
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
  checkQueueMessages
};