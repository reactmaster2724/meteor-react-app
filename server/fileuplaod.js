var fs = Npm.require('fs'),
  path = Npm.require('path'),
  basePath = path.resolve('.').split('.meteor')[0];
var Promise = require('bluebird'),
  GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage')),
  storage = GoogleCloudStorage({
    projectId: 'beaming-courage-166808',
    keyFilename: basePath + 'private/my-gcs-key-public.json'
  }),
  BUCKET_NAME = 'react-meteor-bucket',
  myBucket = storage.bucket(BUCKET_NAME)
Meteor.methods({
  deleteFile: function (path) {
    path = getFileName();
    var file = myBucket.file(path);
    file.existsAsync(function (err, exists) {
      if (exists) {
        file.delete(function (err) {
          if (err) {
            console.log(err);
          } else {
            return true;
          }
        });
      } else {
        console.log("No exists")
        return false;
      }
    });

    function getFileName() {
      var filename = path.split("/");
      return (filename[filename.length - 1])
    }
  },
  uploadtogcs: function (fileInfo, fileData, encoding) {

    var filename = rename(cleanName(fileInfo.name)) || 'file',
      encoding = encoding || 'binary';

    var file = myBucket.file(filename);

    file.existsAsync(function (err, exists) {
      if (exists) {
        filename = rename(filename);
      }

      fs.writeFile(filename, fileData, encoding, function (err) {
        if (err) {
          return err;
        }
        myBucket.uploadAsync(filename, { public: true }).then(file => {
          fs.unlinkSync(filename);
          console.log("uploaded file")
        });
      });
    });

    return { "publicurl": publicUrl(filename), "filename": fileInfo.name, "size": fileInfo.size, "type": fileInfo.type };

    function publicUrl(filename) {
      return "https://storage.googleapis.com/react-meteor-bucket/" + filename;
    }

    function rename(filename) {
      var filename = filename.split(".");
      return filename[0] + "(" + Date.now() + ")" + "." + filename[filename.length - 1]
    }

    function cleanPath(str) {
      if (str) {
        return str.replace(/\.\./g, '').replace(/\/+/g, '').replace(/^\/+/, '').replace(/\/+$/, '');
      }
    };

    function cleanName(str) {
      return str.replace(/\.\./g, '').replace(/\//g, '');
    };
  }
});



Slingshot.createDirective("myFileUploads", Slingshot.GoogleCloud, {

  GoogleAccessId: "my-sevice@beaming-courage-166808.iam.gserviceaccount.com",

  GoogleSecretKey: Assets.getText('google-cloud-service-key-react.pem'),

  bucket: "react-meteor-bucket",

  maxSize: 20 * 1024 * 1024,

  allowedFileTypes: ['image/png', "image/gif", "image/jpeg", "text/plain"],
  // Uploaded files are publicly readable:
  acl: "public-read",

  // Deny uploads if user is not logged in:
  authorize: function () {

    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  // Store files into a directory by the current users username:

  key: function (file) {
    //Store file into a directory by the user's username.
    var user = Meteor.users.findOne(this.userId);
    return user.username + "/" + file.name;
  }
});
