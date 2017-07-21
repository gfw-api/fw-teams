const logger = require('logger');
const JWT = require('jsonwebtoken');
const config = require('config');

class TeamService {
  
  static verifyToken(token) {
    try { 
     return JWT.verify(token, config.get('jwt.token'));
    } catch (e){
    logger.info(`Generated token ${e}`);
    }
  }
  static generateToken(email, teamId) {
    const token = JWT.sign({ email, teamId }, config.get('jwt.token'), {});
    logger.info(`Generated token ${token}`);
    return token;
  }

  static sendNotifications(users, team) {
    logger.info(`Sending notifications for ${users} from team id ${team.id}`);
    const tokens = users.map((email) => {
      const generatedToken = this.generateToken(email, team.id);
      this.verifyToken(generatedToken);
      const url = `teams/confirm/${generatedToken}`
      // Send email with token
    });
    
    return tokens;
  }
}
module.exports = TeamService;
