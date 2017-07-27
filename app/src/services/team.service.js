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

  static async deleteConfirmedUserFromPreviousTeams(userId, teamId) {
    const userTeams = await TeamModel.find({ confirmedUsers: userId });
    logger.info(`User was in ${userTeams}`);
    userTeams.forEach( async (team) => {
      const teamToChange = await TeamModel.findById(team.id);
      logger.info(`Team id ${teamToChange.id}`);
      teamToChange.confirmedUsers = teamToChange.confirmedUsers.filter((user) => user !== userId);
      await teamToChange.save;  
      logger.info(`Team ${teamToChange} is saved`);
    });
    logger.info(`User is in ${userTeams}`);
  }
}
module.exports = TeamService;
