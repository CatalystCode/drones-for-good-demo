var ffmpeg = require('ffmpeg');
var azure = require('azure-storage');
var fs = require('fs');

processFile = (videoName, accountName, accountKey) => {
  var process = new ffmpeg(videoName);
  process.then(function (video) {
    // Callback mode
    video.fnExtractFrameToJPG('frames\\', {
      start_time: `0:00:01`,
      //frame_rate : 1, // a frame per second
      every_n_seconds: 1,
      file_name : `frm_%t_%s`
    }, function (error, files) {
      if (error) {
        console.log('failed extracting frames:' + error);
        return;
      }
      console.log('Frames: ' + files);
      
      // creating perstistent storage elements (blob and queue):
      var blobService = azure.createBlobService(accountName, accountKey);
      var queueService = azure.createQueueService(accountName, accountKey);
      blobService.createContainerIfNotExists(
        'image-processing-jobs', 
        { 
          publicAccessLevel: 'blob'
        }, 
        function(error, result, response) {
          if (error) {
            console.log('failed creating blob container');
            return;
          }
        
          console.log('have blob container');
          queueService.createQueueIfNotExists(
            'image-processing-jobs', 
            function(error, result, response) {
              if(error) {
                console.log('failed creating queue');
                return;
              }
          
              console.log('have queue');
              handleFiles(files, queueService, blobService);
          });
      });
  });
}, function (err) {
    console.log('Error: ' + err);
});
}

deleteFile = (element) => {
    fs.unlink(element, function (error, files) {
    if (!error) {
        console.log('deleted file');
    }
    if (error) {
        console.log('error deleting file: ' + error);
    }
});
};

handleFiles = (files, queueService, blobService) => {
  var counter = 0;
  var timeStamp = Math.floor(Date.now());
  files.forEach(function(element) {
    var fName = element.substr(element.indexOf('/') + 1);
    blobService.createBlockBlobFromLocalFile(
      'image-processing-jobs', 
      fName, 
      element, 
      function(error, result, response) {
        if (error) {
            console.log('error creating blob item:' + error);
        }
        
        // file uploaded. now lets save the message into the queue and delete the file
        console.log('file saved into blob');
        //fName
        var obj = { url : 'https://drones4goodstore.blob.core.windows.net/image-processing-jobs/' + fName, timestamp: timeStamp, frame: counter};
        var jsonMsg = JSON.stringify(obj);

        // azure functions require base 64
        jsonMsg = new Buffer(jsonMsg).toString("base64");
        counter += 1;
        console.log(jsonMsg);
        queueService.createMessage(
          'image-processing-jobs', 
          jsonMsg, 
          function(error) {
            // Queue created or exists
            if (error) {
              console.log('error creating queue message:' + error);
            }
            
            console.log('sent msg');
            
            deleteFile(element);
          });
      });
  });
};

var exports = module.exports = { processFile };