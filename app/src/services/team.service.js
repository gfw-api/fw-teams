const logger = require('logger');
const JWT = require('jsonwebtoken');
const config = require('config');

class TeamService {
  
  static verifyToken(email) {
    return JWT.verify(email, config.get('jwt.token'), function(err, decoded) {
      logger.info(`Decoded token ${decoded}`);
      return decoded;
    });
  }
  static generateToken(email) {
    const token = JWT.sign(email, config.get('jwt.token'), {});
    logger.info(`Generated token ${token}`);
    return token;
  }

  static sendNotifications(users) {
    logger.info(`Sending notifications for ${users}`);
    const tokens = users.map((email) => {
      return this.generateToken(email)
    });
    tokens.forEach((token) => {
      this.verifyToken(token)
    });
    return tokens;
  }
}
module.exports = TeamService;
