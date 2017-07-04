const logger = require('logger');
const ErrorSerializer = require('serializers/error.serializer');

class TeamValidator {
    static async create(ctx, next) {
        function isArray(value){
          if (Object.prototype.toString.call( value ) !== '[object Array]') {
            ctx.detail = 'notArray';
            ctx.status = 400;
            return;
          }
        }

        logger.debug('Validating body for create team');
        ctx.checkBody('name').notEmpty().len(1, 100);
        ctx.checkBody('managers').optional();
        ctx.checkBody('users').optional();
        ctx.checkBody('areas').optional();
        ctx.checkBody('layers').optional();

        if (ctx.errors) {
            ctx.body = ErrorSerializer.serializeValidationBodyErrors(ctx.errors);
            ctx.status = 400;
            return;
        }
        await next();
    }

    static async update(ctx, next) {
        logger.debug('Validating body for update team');
        ctx.checkBody('name').notEmpty().len(1, 100);
        ctx.checkBody('managers').optional();
        ctx.checkBody('users').optional();
        ctx.checkBody('areas').optional();
        ctx.checkBody('layers').optional();

        if (ctx.errors) {
            ctx.body = ErrorSerializer.serializeValidationBodyErrors(ctx.errors);
            ctx.status = 400;
            return;
        }
        await next();
    }

}

module.exports = TeamValidator;
