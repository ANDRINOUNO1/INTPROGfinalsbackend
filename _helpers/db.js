const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    try {
        // create db if it doesn't already exist
        const { host, port, user, password, database } = config.database;
        const connection = await mysql.createConnection({ 
            host: process.env.DB_HOST || host,
            port: process.env.DB_PORT || port,
            user: process.env.DB_USER || user,
            password: process.env.DB_PASSWORD || password
        });
        
        const dbName = process.env.DB_NAME || database;
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);

        // connect to db
        const sequelize = new Sequelize(dbName, 
            process.env.DB_USER || user, 
            process.env.DB_PASSWORD || password, 
            { 
                host: process.env.DB_HOST || host,
                port: process.env.DB_PORT || port,
                dialect: 'mysql',
                logging: false, // Disable logging for cleaner output
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false // You might need this for some MySQL providers
                    }
                }
            }
        );

        // init models and add them to the exported db object
        db.Account = require('../accounts/account.model')(sequelize);
        db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
        db.Department = require('../departments/department.model')(sequelize, DataTypes);
        db.Employee = require('../employees/employee.model')(sequelize, DataTypes);
        db.Workflow = require('../workflows/workflow.model')(sequelize, DataTypes);
        db.Request = require('../requests/request.model')(sequelize, DataTypes);
        db.RequestItem = db.Request.RequestItem;

        // define relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        db.Account.hasOne(db.Employee, { foreignKey: 'accountId', as: 'employee' });
        db.Employee.belongsTo(db.Account, { foreignKey: 'accountId' });

        db.Department.hasMany(db.Employee, { foreignKey: 'departmentId', as: 'employees' });
        db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });

        db.Employee.hasMany(db.Workflow, { foreignKey: 'employeeId' });
        db.Workflow.belongsTo(db.Employee, { foreignKey: 'employeeId' });

        // Request relationships
        db.Employee.hasMany(db.Request, { 
            foreignKey: 'employeeId',
            as: 'requests'
        });
        db.Request.belongsTo(db.Employee, { 
            foreignKey: 'employeeId',
            as: 'employee'
        });

        // sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');

        // expose sequelize instance to be used throughout the app
        db.sequelize = sequelize;
        db.Sequelize = Sequelize;

        // Verify models are properly initialized
        if (!db.Request || !db.RequestItem) {
            throw new Error('Request models not properly initialized');
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
