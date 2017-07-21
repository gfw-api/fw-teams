# Node Skeleton Microservice


This repository is the node skeleton microservice to create node microservice for WRI API

1. [Getting Started](#getting-started)

## Getting Started

### OS X

**First, make sure that you have the [API gateway running
locally](https://github.com/control-tower/control-tower).**

We're using Docker which, luckily for you, means that getting the
application running locally should be fairly painless. First, make sure
that you have [Docker Compose](https://docs.docker.com/compose/install/)
installed on your machine.

```
git clone https://github.com/gfw-api/fw-teams
cd fw-teams
./team.sh develop
./team.sh test
```text

You can now access the microservice through the CT gateway.

```

### Configuration

It is necessary to define these environment variables:

* CT_URL => Control Tower URL
* NODE_ENV => Environment (prod, staging, dev)
* JWT_SECRET => The secret used to generate JWT tokens.
* API_GATEWAY_URI => Gateway Service API URL
* API_GATEWAY_EXTERNAL_URI
* API_GATEWAY_QUEUE_URL => Url of async queue
* API_GATEWAY_QUEUE_PROVIDER => redis (only support redis)
* API_GATEWAY_QUEUE_NAME => mail

## Quick Overview

### Teams Entity

```

name: <String>
managers: <String>, // array
users: <String>, // array
confirmedUsers: <String>, // array
areas: <String> // array
createdAt: <Date>

```

### CRUD Team

```

GET: /team/user/:userId -> Return the teams from the user if it exists
GET: /teams/:id -> Return team with the id
POST: /teams -> Create an team and associate to the user. With body:

    #form data
    name: "my-team"
    managers: [user-id]
    users: [userId, userId2, userId3, ...]
    confirmedUsers: [userId, userId2, userId3, ...]
    areas: [areaId, areaId2, areaId3, ...]

PATCH: /teams/:id -> Update the team with the id
DELETE: /teams/:id -> Delete the team with the id

```
