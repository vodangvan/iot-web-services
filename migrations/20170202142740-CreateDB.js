'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
     return queryInterface.createTable('role', 
        {
          role_id:{
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
          role_name:{
              type: Sequelize.STRING(20),
              allowNull: false,
            },
          role_description: Sequelize.STRING
        }
     )
    .then(() => queryInterface.createTable('user', 
        {
          user_id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          user_fullName:{
            type: Sequelize.STRING(50),
            allowNull: false
          },
          user_userName:{
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
          },
          user_birthday: Sequelize.DATEONLY,          
          user_phone: {
            type: Sequelize.STRING(15),
            allowNull: false
          },          
          user_email: Sequelize.STRING(100),          
          user_password: {
            type: Sequelize.STRING,
            allowNull: true
          },          
          user_address: Sequelize.STRING(500),          
          user_onlineStatus:{
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          user_sendSms: {
            type: Sequelize.BOOLEAN,
            default: false
          },
          role_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
              model: 'role',
              key: 'role_id'
            }
          }
        }
    ))
    .then(() => queryInterface.createTable('province', 
      {
        province_id:{
          type: Sequelize.STRING(5),            
          primaryKey: true,
          unique: true    
        },
        province_name:{
          type: Sequelize.STRING(50),
          allowNull: false
        },
        province_type: Sequelize.STRING(50),
        province_location: Sequelize.STRING(30)
        /*
        ,
        province_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        province_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('district', 
      {
        district_id:{
            type: Sequelize.STRING(5),            
            primaryKey: true,
            unique: true       
        },
        district_name:{
            type: Sequelize.STRING(50),
            allowNull: false
        },
        district_type: Sequelize.STRING(50),
        district_location: Sequelize.STRING(30),
        province_id: {
            type: Sequelize.STRING(5),
            references: {
              model: 'province',
              key: 'province_id'
            }
        }
        /*
        ,
        district_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        district_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('ward', 
      {
        ward_id:{
            type: Sequelize.STRING(5),            
            primaryKey: true,
            unique: true   
        },
        ward_name:{
            type: Sequelize.STRING(50),
            allowNull: false
        },
        ward_type: Sequelize.STRING(50),
        ward_location: Sequelize.STRING(30),
        district_id: {
            type: Sequelize.STRING(5),
            references: {
              model: 'district',
              key: 'district_id'
            }
        }
        /*
        ,
        ward_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        ward_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('region',
      {
        region_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        region_name:{
            type: Sequelize.STRING(255),
            allowNull: false
        },    
        region_description: Sequelize.STRING(1024),
        ward_id: {
            type: Sequelize.STRING(5),
            references: {
              model: 'ward',
              key: 'ward_id'
            }
        }
      }
    ))
    .then(() => queryInterface.createTable('region_manager', 
      {
        user_id:{
            type: Sequelize.INTEGER ,            
            references:{
                model: 'user',
                key: 'user_id'
            },
            primaryKey: true,
            allowNull: false
        },
        region_id:{
            type: Sequelize.INTEGER,
            references:{
                model: 'region',
                key: 'region_id'
            },
            primaryKey: true,
            allowNull: false
        }
      }
    ))
    .then(() => queryInterface.createTable('pond', 
      {
        pond_id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        region_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'region',
              key: 'region_id'
          }
        },
        user_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'user',
              key: 'user_id'
          }
        },
        pond_width: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },        
        pond_height: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },        
        pond_depth: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        pond_description: Sequelize.STRING(1024),        
        pond_status:{
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        pond_location: Sequelize.STRING(30),
        pond_address: Sequelize.STRING(255)
        /*
        ,
        pond_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        pond_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('river', 
      {
        river_id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        river_name:{
            type: Sequelize.STRING(255),
            allowNull: false
        },
        region_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'region',
              key: 'region_id'
          }
        },
        river_description: Sequelize.STRING(1024),        
        river_location: Sequelize.STRING(30)
        /*
        ,
        river_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        river_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('sink', 
      {
        sink_id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        region_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'region',
              key: 'region_id'
          }
        },
        sink_name: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        sink_code: {
          type: Sequelize.STRING(16),
          unique: true
        },
        sink_secret: Sequelize.STRING(16),
        sink_location: {
            type: Sequelize.STRING(30)
        },        
        sink_status: {
            type: Sequelize.BOOLEAN
        },
        sink_address: Sequelize.STRING(255)
        /*
        ,
        sink_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        sink_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('station', 
      {
        station_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        sink_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references:{
                model: 'sink',
                key: 'sink_id'
            }
        },
        region_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'region',
                key: 'region_id'
            }
        },
        river_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references:{
                model: 'river',
                key: 'river_id'
            }
        },
        pond_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references:{
                model: 'pond',
                key: 'pond_id'
            }
        },
        station_name:{
            type: Sequelize.STRING(100),
            allowNull: false
        },
        station_code: Sequelize.STRING(10),        
        station_location:  Sequelize.STRING(30),
        station_node: Sequelize.STRING(250),
        station_status:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        station_secret: Sequelize.STRING(10),
        station_address: Sequelize.STRING(255)
        /*
        ,
        station_latitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        },
        station_longitude: {
            type: Sequelize.FLOAT,
            validate:{
                min: 0
            }
        }
        */

      }
    ))
    .then(() => queryInterface.createTable('data_type', 
      {
        datatype_id:{
            type: Sequelize.CHAR(3),            
            primaryKey: true,                  
        },
        datatype_name:{
            type: Sequelize.STRING(255),
            allowNull: false
        },    
        datatype_description: Sequelize.STRING(1024),
        datatype_unit:{
          type: Sequelize.STRING(20),
          allowNull: false
        } 
      }
    ))
    .then(() => queryInterface.createTable('data', 
      {
        data_id:{
            type: Sequelize.BIGINT.UNSIGNED,            
            primaryKey: true,
            autoIncrement: true        
        },
        station_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'station',
                key: 'station_id'
            }
        },
        datatype_id:{
            type: Sequelize.CHAR(3),
            allowNull: false,
            references:{
                model: 'data_type',
                key: 'datatype_id'
            }
        },
        sink_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references:{
                model: 'sink',
                key: 'sink_id'
            }
        },
        pond_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references:{
                model: 'pond',
                key: 'pond_id'
            }
        },
        river_id:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references:{
                model: 'river',
                key: 'river_id'
            }
        },
        data_value:{
            type:  Sequelize.FLOAT,
            allowNull: false
        },
        data_createdDate:{
            type: Sequelize.DATE
        },
        data_stationType:  Sequelize.BOOLEAN
      }
    ))
    .then(() => queryInterface.createTable('sensor', 
      {
        sensor_id:{
            type: Sequelize.BIGINT,            
            primaryKey: true,
            autoIncrement: true        
        },
        station_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'station',
                key: 'station_id'
            }
        },
        datatype_id:{
            type: Sequelize.CHAR(3),
            allowNull: false,
            references:{
                model: 'data_type',
                key: 'datatype_id'
            }
        },
        sensor_name:{
            type:  Sequelize.STRING(100),
            allowNull: false
        },
        sensor_serialNumber:{
            type: Sequelize.STRING(50),
            unique: true
        }
      }
    ))
    .then(() => queryInterface.createTable('age', 
      {
        age_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        age_valueMax:{
            type:  Sequelize.INTEGER,
            allowNull: false
        },
        age_valueMin:{
            type:  Sequelize.INTEGER,
            allowNull: false
        },
        age_description:{
            type: Sequelize.STRING(255),
            allowNull: false
        }
      }
    ))
    .then(() => queryInterface.createTable('species', 
      {
        species_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        species_name:{
            type: Sequelize.STRING(50),
            allowNull: false
        }
      }
    ))
    .then(() => queryInterface.createTable('stocking', 
      {
        stocking_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        pond_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'pond',
                key: 'pond_id'
            }
        },
        species_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'species',
                key: 'species_id'
            }
        },
        age_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'age',
                key: 'age_id'
            }
        },
        stocking_quantity:{
            type:  Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        stocking_note: Sequelize.TEXT,
        stocking_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        stocking_status:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        }
      }
    ))
    .then(() => queryInterface.createTable('threshold', 
      {
        threshold_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        datatype_id:{
            type: Sequelize.CHAR(3),
            allowNull: false,
            references:{
                model: 'data_type',
                key: 'datatype_id'
            }
        },
        region_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'region',
                key: 'region_id'
            }
        },
        age_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'age',
                key: 'age_id'
            }
        },
        species_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'species',
                key: 'species_id'
            }
        },
        threshold_name:{
            type:  Sequelize.STRING(255),
            allowNull: false
        },
        threshold_start:{
            type: Sequelize.FLOAT,
            allowNull: false
        },
        threshold_end:{
            type: Sequelize.FLOAT,
            allowNull: false
        },
        threshold_level: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        threshold_message:{
            type: Sequelize.TEXT,
            allowNull: false
        },
        threshold_createdDate:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },

        threshold_timeWarning:{
            type: Sequelize.INTEGER,
            allowNull: true
        }
      }
    ))
    .then(() => queryInterface.createTable('advice', 
      {
        advice_id:{
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true        
        },
        user_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'user',
                key: 'user_id'
            }
        },
        threshold_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'threshold',
                key: 'threshold_id'
            }
        },
        advice_message:{
            type:  Sequelize.TEXT,
            allowNull: false
        },
        advice_createdDate:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
      }
    ))
    .then(() => queryInterface.createTable('notification', 
      {
        notif_id:{
            type: Sequelize.BIGINT.UNSIGNED,            
            primaryKey: true,
            autoIncrement: true        
        },
        threshold_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            references:{
                model: 'threshold',
                key: 'threshold_id'
            }
        },
        data_id:{
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references:{
                model: 'data',
                key: 'data_id'
            }
        },
        user_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'user',
                key: 'user_id'
            }
        },
        notif_title:{
            type:  Sequelize.STRING(255),
            allowNull: false
        },
        notif_readState:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        notif_createdDate:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
      }
    ))
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropAllTables();
  }
};
