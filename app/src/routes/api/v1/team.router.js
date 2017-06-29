const Router = require('koa-router');
const logger = require('logger');
const ctRegisterMicroservice = require('ct-register-microservice-node');
const TeamModel = require('models/team.model');
const Promise = require('bluebird');
const ErrorSerializer = require('serializers/error.serializer');
const TeamSerializer = require('serializers/team.serializer');

const router = new Router({
    prefix: '/teams',
});

class TeamRouter {
  static async getAll(ctx){
      // logger.info('Obtaining all areas of the user ', ctx.state.loggedUser.id);
      // const teams = await TeamModel.find({ userId: ctx.state.loggedUser.id });
      logger.info('Obtaining all teams of the user ');
      const teams = await TeamModel.find({});
      ctx.body = TeamSerializer.serialize(teams);
  }

  static async save(ctx) {
      logger.info('Saving team', ctx.request.body);
      logger.info('managers', JSON.parse(ctx.request.body).managers);
      const parsedBody = JSON.parse(ctx.request.body);
      const area = await new TeamModel({
          name: parsedBody.name,
          managers: parsedBody.managers,
          users: parsedBody.users,
          areas: parsedBody.areas,
          createdAt: Date.now()      
      }).save();
      ctx.body = TeamSerializer.serialize(area);
  }


    static async update(ctx) {
        logger.info(`Updating team with id ${ctx.params.id}`);
        const parsedBody = JSON.parse(ctx.request.body);
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
        if (parsedBody.areas) {
        logger.info(`Area ${parsedBody.areas}`);
          team.areas = parsedBody.areas;
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

async function checkPermission(ctx, next) {
    ctx.assert(ctx.params.id, 400, 'Id required');
    let team = await TeamModel.findById(ctx.params.id);
    if (!team) {
        ctx.throw(404, 'Team not found');
        return;
    }
    if (!team.managers.includes(ctx.state.loggedUser.id)) {
        ctx.throw(403, 'Not authorized');
        return;
    }
    await next();
}

async function loggedUserToState(ctx, next) {
    logger.info('ctx.query', ctx);
    if (ctx.query && ctx.query.loggedUser){
        ctx.state.loggedUser = JSON.parse(ctx.query.loggedUser);
        delete ctx.query.loggedUser;
    } else if (ctx.request.body && ctx.request.body.loggedUser) {
        ctx.state.loggedUser = ctx.request.body.loggedUser;
        delete ctx.request.body.loggedUser;
    } else if (ctx.request.body.fields && ctx.request.body.loggedUser) {
        ctx.state.loggedUser = JSON.parse(ctx.request.body.loggedUser);
        delete ctx.request.body.loggedUser;
    } else {
        ctx.throw(401, 'Not logged');
        return;
    }
    await next();
}

router.get('/', TeamRouter.getAll);
router.post('/', TeamRouter.save);
router.patch('/:id', TeamRouter.update);
router.delete('/:id', TeamRouter.delete);

module.exports = router;
