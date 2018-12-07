var userSchema = require('./userSchema');
var awsUtils = require('../../helper/aws');
var userUtil = {};

userUtil.createUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.userpicture) {
      uploadImage(userData.userpicture, userData.userEmail).then((res) => {
        userData.userpicture = res;
        userSchema.create(userData).then((res) => resolve(res)).catch((err) => reject(err));
      }).catch(() => {
        reject("error in upload image");
      })
    } else {
      userSchema.create(userData).then((res) => resolve(res)).catch((err) => reject(err));
    }
  })
}

uploadImage = (image, userEmail) => {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const ext = image.split(';')[0].split('/')[1] || 'jpg';
    // const key = `${uuid.v1()}.${ext}`;
    const key = userEmail + Date.now();
    awsUtils.s3Putimage({ body, mime: `image/${ext}` }, key, 'base64').then((result) => { resolve(result); }).catch((err) => { reject(err); });
  })
}

userUtil.getUser = (userId) => {
  return new Promise((resolve, reject) => {
    userSchema.findById(userId).then((res) => {
      if (res.userpicture) {
        awsUtils.s3Getimage(res.userpicture).then((response) => {
          res.userpicture = response;
          resolve(res);
        }).catch((err) => {
          reject(err);
        })
      }
      else {
        resolve(res);
      }
    }).catch((err) => {
      reject(err);
    })
  })
}

userUtil.getUserfromDB = (userId) => {
  return new Promise((resolve, reject) => {
    userSchema.findById(userId).then((res) => { resolve(res); }).catch((err) => { reject(err); })
  })
}

userUtil.varifyUser = (data) => {
  return new Promise((resolve, reject) => {
    userSchema.findOne({ userEmail: data.userEmail }).then((res) => {
      (res) ? resolve(res) : reject("No data matched");
    }).catch((err) => {
      reject(err);
    })
  })
}

userUtil.editUser = (id, data) => {
  return new Promise((resolve, reject) => {
    if (data.userpicture) {
      userUtil.getUserfromDB(id).then((user) => {
        const body = Buffer.from((data.userpicture).replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const ext = (data.userpicture).split(';')[0].split('/')[1] || 'jpg';
        // const key = `${uuid.v1()}.${ext}`;
        const key = user.userpicture;
        awsUtils.s3Putimage({ body, mime: `image/${ext}` }, key, 'base64').then((result) => {
          resolve(result);
          delete data.userpicture;
          userSchema.findOneAndUpdate({ _id: id }, { $set: data }, { new: true }).then((resp) => { resolve(resp) }).catch((err) => { reject(err) })
        }).catch((err) => {
          reject(err);
        });
      })
    }
    else {
      userSchema.findOneAndUpdate({ _id: id }, { $set: data }, { new: true }).then((resp) => { resolve(resp) }).catch((err) => { reject(err) })
    }
  })
}

module.exports = userUtil;