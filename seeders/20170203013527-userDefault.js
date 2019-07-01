'use strict';
var bcrypt = require('bcrypt-nodejs');
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('role', [{
                    role_name: 'admin',
                    role_description: 'Admin'
                }, {
                    role_name: 'guest',
                    role_description: 'Guest'
                }, {
                    role_name: 'farmers',
                    role_description: 'Nông dân'
                }, {
                    role_name: 'manager',
                    role_description: 'Quản lý'
                },
                {
                    role_name: 'expert',
                    role_description: 'Chuyên gia'
                },
                {
                    role_name: 'supadmin',
                    role_description: 'SUPER ADMIN'
                }
            ], {})
            .then(() => queryInterface.bulkInsert('user', [{
                    user_fullName: 'Tran Tuan Khai',
                    user_userName: 'tuankhai',
                    user_birthday: '1995-08-02',
                    user_phone: '01222511145',
                    user_email: 'khaib1304693@gmail.com',
                    user_password: bcrypt.hashSync('khai123456'),
                    user_address: 'Vĩnh Long',
                    user_onlineStatus: 1,
                    role_id: 1
                },
                {
                    user_fullName: 'Admin',
                    user_userName: 'userAdmin',
                    user_birthday: '1995-08-02',
                    user_phone: '01222511145',
                    user_email: 'khaib1304693@gmail.com',
                    user_password: bcrypt.hashSync('userAdmin'),
                    user_address: 'Vĩnh Long',
                    user_onlineStatus: 1,
                    role_id: 1
                },
                {
                    user_fullName: 'Manager',
                    user_userName: 'userManager',
                    user_birthday: '1995-08-02',
                    user_phone: '01222511145',
                    user_email: 'khaib1304693@gmail.com',
                    user_password: bcrypt.hashSync('userManager'),
                    user_address: 'Vĩnh Long',
                    user_onlineStatus: 1,
                    role_id: 4
                },
                {
                    user_fullName: 'Famer',
                    user_userName: 'userFamer',
                    user_birthday: '1995-08-02',
                    user_phone: '01222511145',
                    user_email: 'khaib1304693@gmail.com',
                    user_password: bcrypt.hashSync('userFamer'),
                    user_address: 'Vĩnh Long',
                    user_onlineStatus: 1,
                    role_id: 3
                },
                {
                    user_fullName: 'Expert',
                    user_userName: 'userExpert',
                    user_birthday: '1995-08-02',
                    user_phone: '01222511145',
                    user_email: 'khaib1304693@gmail.com',
                    user_password: bcrypt.hashSync('userExpert'),
                    user_address: 'Vĩnh Long',
                    user_onlineStatus: 1,
                    role_id: 5
                }
            ], {}))
            .then(() => queryInterface.bulkInsert('data_type', [{
                    datatype_id: '001',
                    datatype_name: 'PH',
                    datatype_description: 'Đo nồng độ pH',
                    datatype_unit: ''
                },
                {
                    datatype_id: '002',
                    datatype_name: 'DO',
                    datatype_description: 'Đo nồng độ Oxy',
                    datatype_unit: ''
                },
                {
                    datatype_id: '003',
                    datatype_name: 'Temp',
                    datatype_description: 'Đo nhiệt độ',
                    datatype_unit: ''
                },
                {
                    datatype_id: '004',
                    datatype_name: 'NH4',
                    datatype_description: 'Đo nồng độ NH4',
                    datatype_unit: ''
                },
                {
                    datatype_id: '005',
                    datatype_name: 'NO3',
                    datatype_description: 'Đo nồng độ NO3',
                    datatype_unit: ''
                }
            ], {}));
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('user', null, {}).then(() => queryInterface.bulkDelete('role', null, {}));
    }
};