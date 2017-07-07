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
      const includes = (container, value) => container.indexOf(value) >= 0;
      const remove = (array, value) => { if (array.indexOf(value) > -1) { array.splice(array.indexOf(value), 1);}};
      const body = ctx.request.body;
      const userId = ctx.request.body.loggedUser.id;

      if (body.managers === undefined) body.managers = [];
      if (!includes(body.managers, userId)) body.managers.push(userId);
      remove(body.users, userId);

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
        const includes = (container, value) => container.indexOf(value) >= 0;
        const remove = (array, value) => { if (array.indexOf(value) > -1) { array.splice(array.indexOf(value), 1);}};
        const body = ctx.request.body;
        const userId = body.loggedUser.id;
        const team = await TeamModel.findById(ctx.params.id);
        
        if (!includes(body.managers, userId)) body.managers.push(userId);
        remove(body.users, userId);
        if (body.name) {
          team.name = body.name;
        }
        if (body.managers) {
          team.managers = body.managers;
        }
        if (body.users) {
        logger.info(`Users ${body.users}`);
          team.users = body.users;
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
