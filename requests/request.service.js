const db = require('../_helpers/db');
const { Op } = require('sequelize');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    addItems,
    updateStatus
};

async function getAll() {
    try {
        const requests = await db.Request.findAll({
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                    include: [
                        {
                            model: db.Account,
                            as: 'account',
                            attributes: ['email']
                        }
                    ]
                },
                {
                    model: db.RequestItem,
                    as: 'items'
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return requests;
    } catch (error) {
        console.error('Error in getAll:', error);
        throw error;
    }
}

async function getById(id) {
    try {
        const request = await db.Request.findByPk(id, {
            include: [
                {
                    model: db.Employee,
                    as: 'employee',
                    include: [
                        {
                            model: db.Account,
                            as: 'account',
                            attributes: ['email']
                        }
                    ]
                },
                {
                    model: db.RequestItem,
                    as: 'items'
                }
            ]
        });
        if (!request) throw 'Request not found';
        return request;
    } catch (error) {
        console.error('Error in getById:', error);
        throw error;
    }
}

async function create(params) {
    try {
        // Create request
        const request = await db.Request.create({
            employeeId: params.employeeId,
            type: params.type,
            status: params.status,
            description: params.description
        });

        // Create request items
        if (params.items && params.items.length > 0) {
            const items = params.items.map(item => ({
                requestId: request.id,
                name: item.name,
                quantity: item.quantity || 1
            }));
            await db.RequestItem.bulkCreate(items);
        }

        // Return the created request with its items
        return getById(request.id);
    } catch (error) {
        console.error('Error in create:', error);
        throw error;
    }
}

async function update(id, params) {
    try {
        const request = await getById(id);

        // Update request
        Object.assign(request, {
            type: params.type,
            status: params.status,
            description: params.description
        });
        await request.save();

        // Update items
        if (params.items) {
            // Delete existing items
            await db.RequestItem.destroy({
                where: { requestId: id }
            });

            // Create new items
            if (params.items.length > 0) {
                const items = params.items.map(item => ({
                    requestId: id,
                    name: item.name,
                    quantity: item.quantity || 1
                }));
                await db.RequestItem.bulkCreate(items);
            }
        }

        return getById(id);
    } catch (error) {
        console.error('Error in update:', error);
        throw error;
    }
}

async function _delete(id) {
    try {
        const request = await getById(id);
        await request.destroy();
    } catch (error) {
        console.error('Error in delete:', error);
        throw error;
    }
}

async function addItems(requestId, items) {
    try {
        const request = await getById(requestId);
        if (!request) throw 'Request not found';
        
        const requestItems = items.map(item => ({
            requestId,
            itemName: item.name,
            quantity: item.quantity
        }));
        
        await db.RequestItem.bulkCreate(requestItems);
        return await getById(requestId);
    } catch (error) {
        console.error('Error in addItems:', error);
        throw error;
    }
}

async function updateStatus(id, status) {
    try {
        const request = await getById(id);
        if (!request) throw 'Request not found';
        
        await request.update({ status });
        return await getById(id);
    } catch (error) {
        console.error('Error in updateStatus:', error);
        throw error;
    }
}

