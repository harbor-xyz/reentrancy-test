
FROM 988772184836.dkr.ecr.ap-south-1.amazonaws.com/base:latest

WORKDIR /app


COPY hardhat.config.* /app

COPY health-check.js health-check.js
COPY deployment-package/ /app/

ENV TS_NODE_TRANSPILE_ONLY=1
COPY imports imports
COPY afterDeploy/ afterDeploy/
COPY hardhat-harbor.js hardhat-harbor.js

EXPOSE 8545
EXPOSE 4000

CMD ["npx", "hardhat", "custom"]
