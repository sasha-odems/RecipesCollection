# Recipe Management Application

## Introduction
This Recipe Management Application is a full-stack web application where users can manage their favorite recipes. The application allows users to create, read, update, and delete (CRUD) recipes. It also supports user authentication, allowing users to have their own personalized list of recipes, rate them, and comment on them.

## Features
- User Authentication: Register, login, and manage user sessions.
- CRUD Operations: Users can create, read, update, and delete recipes.
- Ratings and Comments: Users can rate recipes and leave comments.
- Favorite Recipes: Users can mark recipes as favorites and view them separately.

## Technology Stack
- Frontend: HTML, CSS, Bootstrap, JavaScript, EJS (templating)
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: Express sessions and bcrypt for password hashing

## Getting Started
### Prerequisites
Before you begin, ensure you have met the following requirements:
- You have a Linux/Mac/Windows machine.
- You have installed Node.js version 10 or above.
- You have installed MongoDB and it is running on the default port (27017).

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/recipe-management-app.git
cd recipe-management-app
```
2. Install dependencies
```bash
npm install
```
3. Run MongoDB local or in docker container using command change *your_password* to password:
```bash
docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=your_password mongo
```
4. Set up environment variables Create a .env file in the root directory of the project and add the following environment variables:
```bash
MONGO_URI=mongodb://root:your_password@localhost:27017/recipeCollection
```
5. Running the Application Start the application. App starts and fill DB with seed data.
```bash
node app.js
```
