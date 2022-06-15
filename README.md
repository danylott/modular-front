# Modular OCR `front-end`

The admin page of modular recognition system, that allows monitoring, creating and updating models, datasets
applications, text markups, and maintain all recognition process features

# Installation:
- git checkout client/server (choose here what you currently need - if not sure - choose the server)
- npm install
- nano .env (create .env file from the .env.sample)
- npm start
 
requires `back-end` and `image-server` to be running

# Features:

The main technologies used are described here:

- React (antd-design, apollo-server, graphql).
- Webcam.js for working with camera snapshots and streaming.
- Cookies for transferring jwt
- React-image-annotate - library for image annotation (for datasets)

# Architectures:

In the system we have 2 types of front-end: `server` and `client`

#### Server:
- Supports full functionality (creating, updating and deleting instances)
- Gives direct access to the database and to each class for changing them
- Allow populating datasets and creating applications (starting training)

#### Client:
- Limited functionality
- Supports Demo/Evaluations/Model Pages
- No direct access to change dataset (only model selecting for the machine)
- Requires a server to be up and running
