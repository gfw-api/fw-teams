const Router = require('koa-router');
const logger = require('logger');
const TeamModel = require('models/team.model');
const TeamSerializer = require('serializers/team.serializer');
const TeamValidator = require('validators/team.validator');
const TeamService = require('services/team.service');
const UserService = require('services/user.service');

const router = new Router({
    prefix: '/teams',
});

class TeamRouter {
  static async getById(ctx) {
      logger.info(`Getting team with id ${ctx.params.id}`);
      const team = await TeamModel.findById(ctx.params.id);
      ctx.body = TeamSerializer.serialize(team);
  }

  static async getByUserId(ctx) {
      logger.info(`Getting team for user with id ${ctx.params.userId}`);
      let team = await TeamModel.findOne({ "managers.id": ctx.params.userId });
      if (!team) {
        team = await TeamModel.findOne({ "confirmedUsers.id": ctx.params.userId });
      }
      ctx.body = TeamSerializer.serialize(team);
  }

  static async confirmUser(ctx) {
      const token = ctx.params.token;
      logger.info('Confirming user with token', token);
      const loggedUser = JSON.parse(ctx.request.query.loggedUser);
      const userId = loggedUser.id;
      const data = TeamService.verifyToken(token);
      if (!userId) ctx.throw(400, 'User missing');
      if (data) {
        const { email, teamId } = data;
        const team = await TeamModel.findById(teamId);
        const confirmedUserEmails = team.confirmedUsers.map(u => (typeof u === 'string' ? u : u.email));
        if (team && !team.confirmedUsers.includes(email)) {
          TeamService.deleteConfirmedUserFromPreviousTeams(userId, teamId);
          team.users = team.users.filter(user => user !== email);
          team.confirmedUsers = team.confirmedUsers.concat({ id: userId, email });
          TeamService.sendManagerConfirmation(email, team.managers, ctx.request.body.locale);
          await team.save();
        }
        logger.info('saved team', team);
        ctx.body = { status: 200, detail: 'User confirmed' };
      } else {
        ctx.throw(400, 'Token not found');
      }
  }

  static async create(ctx) {
      logger.info('Saving team', ctx.request.body);
      const includes = (container, value) => container.indexOf(value) >= 0;
      const body = ctx.request.body;
      const userId = ctx.request.body.loggedUser.id;
      const locale = body.locale;
      const managerEmail = await UserService.getEmailById(userId);

      if (typeof body.managers === 'undefined') body.managers = [];
      if (!includes(body.managers.map(m => m.id), userId)) {
        body.managers.push({ id: userId, email: managerEmail });
      }
      if (body.users) {
        body.users = body.users.filter(user => user !== userId);
      }
      const team = await new TeamModel({
          name: body.name,
          managers: body.managers,
          users: body.users,
          areas: body.areas,
          layers: body.layers,
          createdAt: Date.now() 
      }).save();
      TeamService.sendNotifications(body.users, team, locale);
      ctx.body = TeamSerializer.serialize(team);
  }


    static async update(ctx) {
        logger.info(`Updating team with id ${ctx.params.id}`);
        const includes = (container, value) => container.indexOf(value) >= 0;
        const body = ctx.request.body;
        const userId = body.loggedUser.id;
        const team = await TeamModel.findById(ctx.params.id);
        const locale = body.locale;
        
        if (body.name) {
          team.name = body.name;
        }
        if (body.managers) {
          if (!includes(body.managers.map(m => m.id), userId)) {
            const managerEmail = await UserService.getEmailById(userId);
            body.managers.push({ id: userId, email: managerEmail });
          }
          team.managers = body.managers;
        }
        if (body.users) {
          logger.info(`Users ${body.users}`);
          team.users = body.users.filter(user => user !== userId);
        }
        if (body.confirmedUsers) {
        logger.info(`Users ${body.confirmedUsers}`);
          team.confirmedUsers = body.confirmedUsers;
        }
        if (body.areas) {
        logger.info(`Area ${body.areas}`);
          team.areas = body.areas;
        }
        if (body.layers) {
        logger.info(`Layer ${body.layers}`);
          team.layers = body.layers;
        }

        await team.save();
        TeamService.sendNotifications(body.users, team, locale);
        ctx.body = TeamSerializer.serialize(team);
    }

    static async delete(ctx){
        logger.info(`Deleting team with id ${ctx.params.id}`);
        const result = await TeamModel.remove({ _id: ctx.params.id });
        if (!result || !result.result || result.result.ok === 0) {
            ctx.throw(404, 'Team not found');
            return;
        }
        ctx.body = '';
        ctx.statusCode = 204;
    }
}

router.get('/:id', TeamRouter.getById);
router.get('/user/:userId', TeamRouter.getByUserId);
router.post('/', TeamValidator.create, TeamRouter.create);
router.patch('/:id', TeamValidator.update, TeamRouter.update);
router.delete('/:id', TeamRouter.delete);
router.get('/confirm/:token', TeamRouter.confirmUser);

module.exports = router;
