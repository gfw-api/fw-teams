const logger = require('logger');
const JWT = require('jsonwebtoken');
const config = require('config');
const MailService = require('services/MailService');
const UserService = require('services/user.service');
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

  static sendNotifications(users = [], team, locale) {
    users.forEach( async (email) => {
      const generatedToken = this.generateToken(email, team.id);
      const link = `${config.get('application.url')}?callbackUrl=${config.get('application.url')}?confirmToken=${generatedToken}&confirmToken=${generatedToken}`;
      if (!team.sentInvitations.includes(email)) {
        const invitationMailId = `team-invitation-${locale || 'en'}`;
        MailService.sendMail(invitationMailId, { link }, [{ address: { email } }]);
        team.sentInvitations = team.sentInvitations.concat(email);
        await team.save;
      }
    });
  }

  static sendManagerConfirmation(confirmedUserEmail, managers = [], locale) {
    managers.forEach( async (managerId) => {
      const joinedMailId = `team-joined-${locale || 'en'}`;
      const managerEmail = UserService.getEmailById(managerId);
      MailService.sendMail(joinedMailId, { email: confirmedUserEmail }, [{ address: { managerEmail } }]);
    });
  }

  static async deleteConfirmedUsers(teamId, userId) {
    const team = await TeamModel.findById(teamId);
    team.confirmedUsers = team.confirmedUsers.filter((user) => user !== userId);
    await team.save;
    logger.info(`Team ${team} is saved`);
  }

  static async deleteConfirmedUserFromPreviousTeams(userId, teamId) {
    const userTeams = await TeamModel.find({ confirmedUsers: userId });
    logger.info(`User was in ${userTeams}`);
    userTeams.forEach(team => this.deleteConfirmedUsers(team.id, userId));
    logger.info(`User is in ${userTeams}`);
  }
}
module.exports = TeamService;
