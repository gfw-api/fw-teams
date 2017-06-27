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
      logger.info('Obtaining all areas of the user ');
      const teams = await TeamModel.find({});
      ctx.body = TeamSerializer.serialize(teams);
  }

  static async save(ctx) {
      logger.info('Saving team');
      const area = await new TeamModel({
          name: ctx.request.body.name,
          managers: ctx.request.body.managers,
          users: ctx.request.body.users,
          areas: ctx.request.body.areas
      }).save();
      ctx.body = TeamSerializer.serialize(area);
  }
}

async function loggedTeamToState(ctx, next) {
    if (ctx.query && ctx.query.loggedUser){
        ctx.state.loggedUser = JSON.parse(ctx.query.loggedUser);
        delete ctx.query.loggedUser;
    } else if (ctx.request.body && ctx.request.body.loggedUser) {
        ctx.state.loggedUser = ctx.request.body.loggedUser;
        delete ctx.request.body.loggedUser;
    } else if (ctx.request.body.fields && ctx.request.body.fields.loggedUser) {
        ctx.state.loggedUser = JSON.parse(ctx.request.body.fields.loggedUser);
        delete ctx.request.body.loggedUser;
    } else {
        ctx.throw(401, 'Not logged');
        return;
    }
    await next();
}



// router.get('/', loggedTeamToState, TeamRouter.getAll);
router.get('/', TeamRouter.getAll);
router.post('/', TeamRouter.save);


module.exports = router;
