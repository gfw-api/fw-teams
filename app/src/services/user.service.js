const logger = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');

class UserService {

    static async getEmailById(userId) {
        logger.info('Get user by user id', userId);
        try {
            const user = await RWAPIMicroservice.requestToMicroservice({
                uri: `/user/${userId}`,
                method: 'GET',
                json: true
            });
            if (!user || !user.data) return null;
            logger.info('Get user by user id', user);
            return user.data ? user.data.attributes.email : null;
        } catch (e) {
            logger.info('Error finding user', e);
            return null;
        }
    }

}

module.exports = UserService;
