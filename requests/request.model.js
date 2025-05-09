module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define('Request', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Employees',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    const RequestItem = sequelize.define('RequestItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Requests',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });

    // Define associations
    Request.hasMany(RequestItem, {
        foreignKey: 'requestId',
        as: 'items',
        onDelete: 'CASCADE'
    });
    RequestItem.belongsTo(Request, { 
        foreignKey: 'requestId',
        as: 'request'
    });

    // Attach sub-model to allow importing from a single file
    Request.RequestItem = RequestItem;

    return Request;
};
