const Router = require('koa-router');
const logger = require('logger');
const TeamModel = require('models/team.model');
const TeamSerializer = require('serializers/team.serializer');
const TeamValidator = require('validators/team.validator');
const TeamService = require('services/team.service');

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
      let team = await TeamModel.findOne({ managers: ctx.params.userId });
      if (!team){
        team = await TeamModel.findOne({ confirmedUsers: ctx.params.userId });
      }
      ctx.body = TeamSerializer.serialize(team);
  }

  static async confirmUser(ctx) {
      const includes = (container, value) => container.indexOf(value) >= 0;
      const token = ctx.params.token;
      logger.info('Confirming user with token', token);
      
      const data = TeamService.verifyToken(token);
      if (data) {
        const { email, teamId } = data;
        const team = await TeamModel.findById(teamId);

        if (team && !includes(team.confirmedUsers, email)){
          team.users = team.users.filter(user => user !== email);
          team.confirmedUsers = team.confirmedUsers.concat(email);  
          await team.save();
          ctx.body = {status: 200, detail: 'User confirmed'};
        } else {
          ctx.body = {status: 304, detail: 'Not modified'};
        }
      }
  }

  static async create(ctx) {
      logger.info('Saving team', ctx.request.body);
      const includes = (container, value) => container.indexOf(value) >= 0;
      const body = ctx.request.body;
      const userId = ctx.request.body.loggedUser.id;

      if (typeof body.managers === 'undefined') body.managers = [];
      if (!includes(body.managers, userId)) body.managers.push(userId);
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
      TeamService.sendNotifications(body.users, team);
      ctx.body = TeamSerializer.serialize(team);
  }


    static async update(ctx) {
        logger.info(`Updating team with id ${ctx.params.id}`);
        const includes = (container, value) => container.indexOf(value) >= 0;
        const body = ctx.request.body;
        const userId = body.loggedUser.id;
        const team = await TeamModel.findById(ctx.params.id);
        
        if (body.name) {
          team.name = body.name;
        }
        if (body.managers) {
          if (!includes(body.managers, userId)) body.managers.push(userId);
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
        TeamService.sendNotifications(body.users, team);
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
