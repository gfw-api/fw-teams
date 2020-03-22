# FW teams Microservice


This repository is the node skeleton microservice to create node microservice for WRI API

## Dependencies

You will need [Control Tower](https://github.com/control-tower/control-tower) up and running - either natively or with Docker. Refer to the project's README for information on how to set it up.

The FW teams microservice is built using [Node.js](https://nodejs.org/en/), and can be executed either natively or using Docker, each of which has its own set of requirements.

Native execution requires:
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)

Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Dependencies on other Microservices:
- [GFW User](https://github.com/gfw-api/gfw-user-api/)

## Getting started

Start by cloning the repository from github to your execution environment

```
git clone https://github.com/gfw-api/fw-teams.git && cd fw-team
```

After that, follow one of the instructions below:

### Using native execution

1 - Set up your environment variables. See `dev.env.sample` for a list of variables you should set, which are described in detail in [this section](#environment-variables) of the documentation. Native execution will NOT load the `dev.env` file content, so you need to use another way to define those values

2 - Install node dependencies using yarn:
```
yarn
```

3 - Start the application server:
```
yarn start
```

The endpoints provided by this microservice should now be available through Control Tower's URL.

### Using Docker

1 - Create and complete your `dev.env` file with your configuration. The meaning of the variables is available in this [section](#configuration-environment-variables). You can find an example `dev.env.sample` file in the project root.

2 - Execute the following command to run Control tower:

```
./team.sh develop
```

The endpoints provided by this microservice should now be available through Control Tower's URL.

## Testing

There are two ways to run the included tests:

### Using native execution

Follow the instruction above for setting up the runtime environment for native execution, then run:
```
yarn test
```

### Using Docker

Follow the instruction above for setting up the runtime environment for Docker execution, then run:
```
./team.sh test
```

## Configuration

It is necessary to define these environment variables:

* CT_URL => Control Tower URL
* NODE_ENV => Environment (prod, staging, dev)
* JWT_SECRET => The secret used to generate JWT tokens.
* API_GATEWAY_URI => Gateway Service API URL
* API_GATEWAY_EXTERNAL_URI
* API_GATEWAY_QUEUE_URL => Url of async queue
* API_GATEWAY_QUEUE_NAME => mail

You can optionally set other variables, see [this file](config/custom-environment-variables.json) for an extended list.

## Quick Overview

### Teams Entity

```

name: <String>
managers: <String>, // array
users: <String>, // array
confirmedUsers: <Object>, // array
areas: <Object> // array
createdAt: <Date>

```

### CRUD Team

```

GET: /team/user/:userId -> Return the teams from the user if it exists
GET: /teams/:id -> Return team with the id
POST: /teams -> Create an team and associate to the user. With body:

    #form data
    name: "my-team"
    managers: [{ id: "userId", email: user@email.com }]
    users: ["userId", "userId2", "userId3", ...]
    confirmedUsers: [{ id: "userId", email: "user@email.com" } , ...]
    areas: ["areaId", "areaId2", "areaId3", ...]

PATCH: /teams/:id -> Update the team with the id
DELETE: /teams/:id -> Delete the team with the id

```
