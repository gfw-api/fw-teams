const logger = require('logger');
const JWT = require('jsonwebtoken');
const config = require('config');
const MailService = require('services/MailService');
const UserService = require('services/user.service');

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
      const link = `${config.get('apiGateway.externalUrl')}/v1/teams/confirm/${generatedToken}`;
      if (!includes(team.sentInvitations, email)) {
        let recipients = [{ address: { email } }];
        MailService.sendMail('team-invitation-en', { link }, recipients);
        team.sentInvitations = team.sentInvitations.concat(email);
        await team.save;
      }
    });
  }

  static sendManagerConfirmation(confirmedUserEmail, managers, locale) {
    managers.forEach( async (managerId) => {
      const joinedMailId = `team-joined-${locale || 'en'}`;
      const managerEmail = UserService.getEmailById(managerId);
      let recipients = [{ address: { managerEmail } }];
      MailService.sendMail(joinedMailId, { email: confirmedUserEmail }, recipients);
    });
  }
}
module.exports = TeamService;
