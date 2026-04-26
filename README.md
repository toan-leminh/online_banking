# Online Banking Project
Online Banking Website that allows users to register, log in, create and manage multiple bank accounts, perform simulated transactions, view transaction history, and search transaction records. <br>
Sample project using Nodejs Express for learning purpose, inlude function below:
- Basic usage of Model, View, Template (Pug)
- Use @hapi/joi for validation
- Use passport.js for authentication  (Local Strategy)
- Use express-session keep session
- Use bcrypt to hash password
- Create middleware to distinguish between user role and admin role

# Tech Stacks
- Framework: Nodejs Express (~5.2)
- Database: MongoDB
- CSS: Bootstrap (5.0)

# Project Structures
```
online_banking/
│
├── config/   # Configuration (settings, urls, wsgi, asgi)
├  ├── csrf.config.js
├  ├── passport.config.js
├── controllers/      # Controllers
├  ├── AccountController.js
├  ├── AdminController.js
├  ├── AuthController.js
├  ├── MainController.js
├── middileware/      # Middleware
├  ├── admin.middleware.js
├  ├── user.middleware.js
├── models/      # Models
├  ├── AccountModel.js
├  ├── TransactionModel.js
├  ├── UserModel.js
├── routes/      # Routes
├  ├── admin.routes.js
├  ├── main.routes.js
├  ├── user.routes.js
├── views/      # Routes
├  ├── admin/
├  ├   ├── account_edit.pug
├  ├   ├── account_list.pug
├  ├   ├── user_edit.pug
├  ├   ├── user_list.pug
├  ├   ├── transaction_list.pug
├  ├── layouts/
├  ├   ├── admin.pug
├  ├   ├── user.pug
├  ├   ├── main.pug
├  ├── user/
├  ├   ├── account_edit.pug
├  ├   ├── account_list.pug
├  ├   ├── account_detail.pug
├  ├   ├── account_create.pug
├  ├   ├── transaction_create.pug
├  ├   ├── transaction_list.pug
├  ├── landing.pug
├  ├── login.pug
├  ├── register_success.pug
├  ├── register.pug
├── index.js  # Server file
└── package.json 
└── README.md
```

## Setup 
Install Nodejs.<br>
Once nodejs is installed, you can install the required dependencies.

```
$ npm install

```
Create .env file from env_sample
Run dev-server: 

```
$ npm run dev
```