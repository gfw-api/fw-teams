const logger = require('logger');
const ErrorSerializer = require('serializers/error.serializer');

class TeamValidator {

    static async create(ctx, next) {
        const isArrayToErrors = (field) => {
            const value = ctx.request.body[field];
            if (typeof value !== 'undefined' && !Array.isArray(value)) {
                const newError = { [field]: `${field} should be an Array.` };
                ctx.errors = ctx.errors ? [...ctx.errors, newError] : [newError];
            }
        };
        logger.info('Validating body for create team');
        ctx.checkBody('name').notEmpty().len(1, 100);
        ctx.checkBody('managers').optional();
        ctx.checkBody('users').optional();
        ctx.checkBody('areas').optional();
        ctx.checkBody('layers').optional();
        isArrayToErrors('managers');
        isArrayToErrors('users');
        isArrayToErrors('areas');
        isArrayToErrors('layers');

        if (ctx.errors) {
            ctx.body = ErrorSerializer.serializeValidationBodyErrors(ctx.errors);
            ctx.status = 400;
            return;
        }
        await next();
    }

    static async update(ctx, next) {
        const isArrayToErrors = (field) => {
            const value = ctx.request.body[field];
            if (typeof value !== 'undefined' && !Array.isArray(value)) {
                const newError = { [field]: `${field} should be an Array.` };
                ctx.errors = ctx.errors ? [...ctx.errors, newError] : [newError];
            }
        };
        logger.info('Validating body for update team');
        ctx.checkBody('name').optional().notEmpty().len(1, 100);
        ctx.checkBody('managers').optional();
        ctx.checkBody('confirmedUsers').optional();
        ctx.checkBody('users').optional();
        ctx.checkBody('areas').optional();
        ctx.checkBody('layers').optional();

        isArrayToErrors('managers');
        isArrayToErrors('users');
        isArrayToErrors('areas');
        isArrayToErrors('layers');

        if (ctx.errors) {
            ctx.body = ErrorSerializer.serializeValidationBodyErrors(ctx.errors);
            ctx.status = 400;
            return;
        }
        await next();
    }

}

module.exports = TeamValidator;
