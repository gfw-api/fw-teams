const logger = require('logger');
const JWT = require('jsonwebtoken');
const config = require('config');
const TeamModel = require('models/team.model');

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
    const includes = (container, value) => container.indexOf(value) >= 0;
    users.forEach( async (email) => {
      const generatedToken = this.generateToken(email, team.id);
      const url = `teams/confirm/${generatedToken}`
      if (!includes(team.sentInvitations, email)) {
        // Send email with token
        team.sentInvitations = team.sentInvitations.concat(email);
        await team.save;
      }
    });
  }
}
module.exports = TeamService;
