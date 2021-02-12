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
        let team = await TeamModel.findOne({ 'managers.id': ctx.params.userId });
        if (!team) {
            team = await TeamModel.findOne({ 'confirmedUsers.id': ctx.params.userId });
        }
        ctx.body = TeamSerializer.serialize(team);
    }

    static async confirmUser(ctx) {
        const { token } = ctx.params;
        logger.info('Confirming user with token', token);
        const loggedUser = JSON.parse(ctx.request.query.loggedUser);
        const userId = loggedUser.id;
        const data = TeamService.verifyToken(token);
        if (!userId) ctx.throw(400, 'User missing');
        if (data) {
            const { email, teamId } = data;
            const team = await TeamModel.findById(teamId);
            if (team && !team.confirmedUsers.includes(email)) {
                TeamService.deleteConfirmedUserFromPreviousTeams(userId);
                team.users = team.users.filter((user) => user !== email);
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
        const { body } = ctx.request;
        const userId = ctx.request.body.loggedUser.id;
        const { locale } = body;
        const managerEmail = await UserService.getEmailById(userId);

        if (typeof body.managers === 'undefined') body.managers = [];
        if (!includes(body.managers.map((m) => m.id), userId)) {
            body.managers.push({ id: userId, email: managerEmail });
        }
        if (body.users) {
            body.users = body.users.filter((user) => user !== userId);
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
        const { body } = ctx.request;
        const userId = body.loggedUser.id;
        const team = await TeamModel.findById(ctx.params.id);
        const { locale } = body;

        if (body.name) {
            team.name = body.name;
        }
        if (body.managers) {
            if (!includes(body.managers.map((m) => m.id), userId)) {
                const managerEmail = await UserService.getEmailById(userId);
                body.managers.push({ id: userId, email: managerEmail });
            }
            team.managers = body.managers;
        }
        if (body.users) {
            logger.info(`Users ${body.users}`);
            team.users = body.users.filter((user) => user !== userId);
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

    static async delete(ctx) {
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


const isAuthenticated = async (ctx, next) => {
    logger.info(`Verifying if user is authenticated`);
    const { query, body } = ctx.request;

    const user = { ...(query.loggedUser ? JSON.parse(query.loggedUser) : {}), ...body.loggedUser };

    if (!user || !user.id) {
        ctx.throw(401, 'Unauthorized');
        return;
    }
    await next();
};

router.get('/:id', isAuthenticated, TeamRouter.getById);
router.get('/user/:userId', isAuthenticated, TeamRouter.getByUserId);
router.post('/', isAuthenticated, TeamValidator.create, TeamRouter.create);
router.patch('/:id', isAuthenticated, TeamValidator.update, TeamRouter.update);
router.delete('/:id', isAuthenticated, TeamRouter.delete);
router.get('/confirm/:token', isAuthenticated, TeamRouter.confirmUser);

module.exports = router;
