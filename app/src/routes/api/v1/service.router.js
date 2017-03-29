const Router = require('koa-router');


const router = new Router({
    prefix: '/service',
});

class Service {

    static sayHi(ctx) {
        ctx.body = {
            greeting: 'hi'
        };
    }

}

router.get('/hi', Service.sayHi);

module.exports = router;
