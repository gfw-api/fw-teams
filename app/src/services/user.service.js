const logger = require('logger');
const ctRegisterMicroservice = require('ct-register-microservice-node');

class UserService {
  static async getEmailById(userId) {
    logger.info('Get user by user id', userId);
    const user = await ctRegisterMicroservice.requestToMicroservice({
      uri: '/user/' + userId,
      method: 'GET',
      json: true
    });
    if (!user || !user.data) return null;
    logger.info('Get user by user id', user);
    return user.data.attributes.email;
  }
}

module.exports = UserService;
