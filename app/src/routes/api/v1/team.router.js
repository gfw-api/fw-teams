const Router = require('koa-router');
const logger = require('logger');
const TeamModel = require('models/team.model');
const TeamSerializer = require('serializers/team.serializer');
const TeamValidator = require('validators/team.validator');

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
      if (!team){                                                     // REMOVE THIS
        team = await TeamModel.findOne({ users: ctx.params.userId }); // REMOVE THIS
      }                                                               // REMOVE THIS
      ctx.body = TeamSerializer.serialize(team);
  }

  static async create(ctx) {
      logger.info('Saving team', ctx.request.body);
      const body = ctx.request.body;
      const userId = ctx.request.body.loggedUser.id;
      if (typeof body.managers !== 'undefined') body.managers.push(userId);
      const team = await new TeamModel({
          name: body.name,
          managers: body.managers,
          users: body.users,
          areas: body.areas,
          layers: body.layers,
          createdAt: Date.now() 
      }).save();
      ctx.body = TeamSerializer.serialize(team);
  }


    static async update(ctx) {
        logger.info(`Updating team with id ${ctx.params.id}`);
        const parsedBody = ctx.request.body;
        const team = await TeamModel.findById(ctx.params.id);
        if (parsedBody.name) {
          team.name = parsedBody.name;
        }
        if (parsedBody.managers) {
          team.managers = parsedBody.managers;
        }
        if (parsedBody.users) {
        logger.info(`Users ${parsedBody.users}`);
          team.users = parsedBody.users;
        }
        if (parsedBody.confirmedUsers) {
        logger.info(`Users ${parsedBody.confirmedUsers}`);
          team.confirmedUsers = parsedBody.confirmedUsers;
        }
        if (parsedBody.areas) {
        logger.info(`Area ${parsedBody.areas}`);
          team.areas = parsedBody.areas;
        }
        if (parsedBody.layers) {
        logger.info(`Layer ${parsedBody.layers}`);
          team.layers = parsedBody.layers;
        }

        await team.save();
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

module.exports = router;
