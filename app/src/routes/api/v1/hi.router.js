const Router = require('koa-router');


const router = new Router({
    prefix: '/node-skeleton',
});

class HiRouter {

    static hi(ctx) {
        ctx.body = {
            hi: 'Ra'
        };
    }

}

router.get('/hi', HiRouter.hi);


module.exports = router;
