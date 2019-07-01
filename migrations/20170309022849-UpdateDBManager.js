'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable("activity_type", {
            actitype_id:{
                type: Sequelize.INTEGER,            
                primaryKey: true,
                autoIncrement: true        
            },
            actitype_name:{
                type: Sequelize.STRING(255),
                allowNull: false
            }
      })
  .then(()=>queryInterface.createTable("stocking_type", {
    stockingtype_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    stockingtype_name:{
        type: Sequelize.STRING(50),
        allowNull: false
    },
    stockingtype_description:{
        type: Sequelize.STRING(1024),
        allowNull: true
    }
  }))
  .then(()=>queryInterface.createTable("bill", {
    bill_id:{
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
    stocking_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking',
            key: 'stocking_id'
        }
    },
    bill_createDate:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    },
    bill_total:{
        type: Sequelize.DECIMAL,
        allowNull: true,
        defaultValues: 0
    },
    bill_dateInBill:{
         type: Sequelize.DATEONLY,
        allowNull: false
    }
  }))
  .then(()=>queryInterface.createTable("seed_quality", {
    seedquality_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    seedquality_name:{
        type: Sequelize.STRING(100),
        allowNull: false
    }
  }))
  .then(()=>queryInterface.createTable("seed", {
    seed_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    bill_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'bill',
            key: 'bill_id'
        }
    },
    seedquality_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'seed_quality',
            key: 'seedquality_id'
        }
    },
    seed_numberOfLot:{
        type:  Sequelize.STRING(50),
        allowNull: false
    },
    seed_quantity:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    seed_existence:{
        type:  Sequelize.INTEGER
    },
    seed_price:{
        type:  Sequelize.INTEGER,
        allowNull: false
    },
    seed_source:{
        type:  Sequelize.STRING(1024),
        allowNull: false
    },
    seed_size:{
        type:  Sequelize.FLOAT,
        allowNull: false
    }
  }))
  .then(()=>queryInterface.createTable("stocking_pond", {
    stocking_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        references:{
            model: 'stocking',
            key: 'stocking_id'
        }     
    },
    pond_id:{
        type: Sequelize.INTEGER,
        allowNull: false,        
        primaryKey: true,
        references:{
            model: 'pond',
            key: 'pond_id'
        }
    },
    seed_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'seed',
            key: 'seed_id'
        }
    },
    stockpond_date:{
        type:  Sequelize.DATE,
        allowNull: false
    },
    stockpond_PCR:{
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    stockpond_PCRresult:{
        type:  Sequelize.STRING(100)
    },
    stockpond_density:{
        type:  Sequelize.INTEGER,
        allowNull: false
    },
    stockpond_quantityStock:{
        type:  Sequelize.INTEGER,
        allowNull: false
    },
    stockpond_statusOfSeed:{
        type:  Sequelize.BOOLEAN,
        allowNull: false
    },
    stockpond_method:{
        type:  Sequelize.STRING(1024)
    },
    stockpond_depth:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_clarity:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_salinity:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_DO:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_PHwater:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_tempAir:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_tempWater:{
        type:  Sequelize.FLOAT,
        allowNull: false
    },
    stockpond_state:{
        type:  Sequelize.BOOLEAN,
        allowNull: false
    }
  }))
  .then(()=>queryInterface.createTable("activity", 
    {
        activity_id:{
            type: Sequelize.INTEGER,            
            autoIncrement: true,
            primaryKey: true     
        },
        pond_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'stocking_pond',
              key: 'pond_id'
          }
        },
        stocking_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'stocking_pond',
              key: 'stocking_id'
          }
        },
        actitype_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'activity_type',
              key: 'actitype_id'
          }
        },
        activity_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        activity_note: Sequelize.STRING(1024)
  }))
  .then(()=>queryInterface.createTable("material_type", {
    materialtype_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    materialtype_name:{
        type: Sequelize.STRING(255),
        allowNull: false
    }
  }))
  .then(()=>queryInterface.createTable("unit", {
    unit_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    unit_name:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    unit_description:{
        type: Sequelize.STRING(1024),
        allowNull: true
    }
  }))
  .then(()=>queryInterface.createTable("other", {
    other_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    bill_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'bill',
            key: 'bill_id'
        }
    },
    other_name:{
        type: Sequelize.STRING(255),
        allowNull: false
    },
    other_price:{
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValues: 0
    },
    other_quantity:{
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValues: 0
    },
    other_note:{
         type: Sequelize.STRING(1024),
        allowNull: true
    }
  }))
  .then(()=>queryInterface.createTable("material", {
    material_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    materialtype_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'material_type',
            key: 'materialtype_id'
        }
    },
    unit_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'unit',
            key: 'unit_id'
        }
    },
    bill_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'bill',
            key: 'bill_id'
        }
    },
    material_name:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    material_numberOfLot: Sequelize.STRING(50),
    material_source:{
        type: Sequelize.STRING(255),
        allowNull: false
    },
    material_quantity:{
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValues: 0
    },
    material_existence:{
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValues: 0
    },
    material_price:{
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValues: 0
    },
    material_description:{
        type: Sequelize.STRING(1024),
        allowNull: true
    },
    material_state:{
         type: Sequelize.BOOLEAN,
        allowNull: false
    }
  }))
  .then(()=>queryInterface.createTable("activity_material", {
    material_id:{
        type: Sequelize.INTEGER,            
        references:{
            model: 'material',
            key: 'material_id'
        },
        primaryKey: true,
        allowNull: false
    },
    activity_id:{
        type: Sequelize.INTEGER,
        references:{
            model: 'activity',
            key: 'activity_id'
        },
        primaryKey: true,
        allowNull: false
    },
    actimaterial_amount:{
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValues: 0
    }
  }))
  .then(()=>queryInterface.createTable("harvest", 
    {
        harvest_id:{
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
        stocking_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'stocking',
              key: 'stocking_id'
          }
        },
        harvest_harvestDate: {
            type: Sequelize.DATE,
            allowNull: false
        }
  }))
  .then(()=>queryInterface.createTable("product_category", {
    prodcate_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    prodcate_name:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    prodcate_image:{
        type: Sequelize.STRING(500)
    },
    prodcate_description: Sequelize.STRING(500),
    prodcate_createBy:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    prodcate_createDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    },
    prodcate_updateBy: Sequelize.STRING(100),
    prodcate_updateDate: Sequelize.DATE,
    prodcate_isDelete:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValues: false
    }
  }))
  .then(()=>queryInterface.createTable("product_type", {
    prodtype_id:{
        type: Sequelize.INTEGER,        
        primaryKey: true,
        autoIncrement: true  
    },
    prodtype_typeName:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    prodcate_id:{
        type: Sequelize.INTEGER,   
        allowNull: false,
        references:{
            model: 'product_category',
            key: 'prodcate_id'
        }       
    }
  }))
  .then(()=>queryInterface.createTable("harvest_detail", {
    harvedeta_number:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        allowNull: false      
    },
    harvest_id:{
        type: Sequelize.INTEGER,           
        primaryKey: true,
        allowNull: false,
        references:{
            model: 'harvest',
            key: 'harvest_id'
        }
    },
    prodtype_id:{
        type: Sequelize.INTEGER,           
        primaryKey: true,
        allowNull: false,
        references:{
            model: 'product_type',
            key: 'prodtype_id'
        }
    },
    pond_id: {
        type: Sequelize.INTEGER,        
        allowNull: false,
        references:{
            model: 'pond',
            key: 'pond_id'
        }
    },
    unit_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'unit',
            key: 'unit_id'
        }
    },
    harvedeta_price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValues: 0
    },
    harvedeta_weight:{
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValues: 0
    },
    harvedeta_note: Sequelize.STRING(500)
  }))
  .then(()=>queryInterface.createTable("land_background", {
    landbg_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    landbg_name:{
        type:  Sequelize.STRING(100),
        allowNull: false
    },
    landbg_description: Sequelize.STRING(255)
  }))
  .then(()=>queryInterface.createTable("pond_preparation", {
    pondpreparation_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    pond_id:{
        type:  Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'pond',
            key: 'pond_id'
        }
    },
    stocking_id: {
        type:  Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking',
            key: 'stocking_id'
        }
    },
    landbg_id: {
        type:  Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'land_background',
            key: 'landbg_id'
        }
    },
    pondpreparation_dateStart:{
        type: Sequelize.DATE,
        allowNull: false,    
    },
    pondpreparation_soilPH:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    pondpreparation_capacityOfFan:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    pondpreparation_quantityOfFan:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValues: 0
    }
  }))
  .then(()=>queryInterface.createTable("material_preparation_detail", {
    pondpreparation_id:{
        type: Sequelize.INTEGER,            
        references:{
            model: 'pond_preparation',
            key: 'pondpreparation_id'
        },
        primaryKey: true,
        allowNull: false
    },
    material_id:{
        type: Sequelize.INTEGER,
        references:{
            model: 'material',
            key: 'material_id'
        },
        primaryKey: true,
        allowNull: false
    },
    matepredetail_quantity:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    matepredetail_date:{
        type: Sequelize.DATE,
        allowNull: false
    },
    matepredetail_note: Sequelize.STRING(1024)
  }))
  .then(()=>queryInterface.createTable("tracker_augmented", {
    trackeraugmented_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    pond_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking_pond',
            key: 'pond_id'
        }
    },
    stocking_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking_pond',
            key: 'stocking_id'
        }
    },
    trackeraugmented_number:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    trackeraugmented_date:{
        type: Sequelize.DATE,
        allowNull: false
    },
    trackeraugmented_age:{
        type:  Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    trackeraugmented_densityAvg:{
        type:  Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    trackeraugmented_weightAvg:{
        type:  Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    trackeraugmented_speedOfGrowth:{
        type:  Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    tracker_augmented_survival:{
        type:  Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    trackeraugmented_biomass:{
        type:  Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    trackeraugmented_note: Sequelize.STRING(1024)
  }))
  .then(()=>queryInterface.createTable("post_category", {
    postcate_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    postcate_name:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    postcate_description: Sequelize.STRING(500),
    postcate_createBy:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    postcate_createDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    },
    postcate_updateBy: Sequelize.STRING(100),
    postcate_updateDate: Sequelize.DATE,
    postcate_picture:{
        type: Sequelize.STRING(255)
    },
    postcate_isDelete:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValues: false
    }
  }))
  .then(()=>queryInterface.createTable("post", {
    post_id:{
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
    postcate_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'post_category',
            key: 'postcate_id'
        }
    },
    post_title:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    post_smallPicture:{
        type: Sequelize.STRING(500)
    },
    post_description: Sequelize.STRING(500),
    post_createBy:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    post_createDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    },
    post_updateBy: Sequelize.STRING(100),
    post_updateDate: Sequelize.DATE,
    post_picture:{
        type: Sequelize.STRING(1024)
    },
    post_isDelete:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValues: false
    },
    post_isPublic:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValues: false
    },
    post_content:{
        type: Sequelize.TEXT
    }
  }))
  .then(()=>queryInterface.createTable("feedback", {
    feedback_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        references:{
            model: 'user',
            key: 'user_id'
        }
    },
    feedback_name:{
        type: Sequelize.STRING(100),
        allowNull: false
    },
    feedback_email:{
        type: Sequelize.STRING(200),
        allowNull: false
    },
    feedback_message:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    feedback_status:{
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    feedback_createDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    },
    feedback_answerContent: Sequelize.STRING(500),
    feedback_answerDate: Sequelize.DATE
  }))
  .then(()=>queryInterface.createTable("comment", {
    comment_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    comment_content:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    comment_commentByName:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    comment_commentByEmail:{
        type: Sequelize.STRING(200),
        allowNull: false
    },
    comment_commentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    },
    post_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'post',
            key: 'post_id'
        }
    }
  }))
  .then(()=>queryInterface.createTable("answer_comment", {
    anscom_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    comment_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'comment',
            key: 'comment_id'
        }
    },
    anscom_content:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    anscom_answreByName:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    anscom_answerByEmail:{
        type: Sequelize.STRING(200),
        allowNull: false
    },
    anscom_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
    }
  }))
  .then(()=>queryInterface.createTable("media", {
    media_id:{
        type: Sequelize.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    post_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'post',
            key: 'post_id'
        }
    },
    media_tittle:{
        type: Sequelize.STRING(500),
        allowNull: true
    },
    media_link:{
        type: Sequelize.STRING(500),
        allowNull: false
    },
    media_type:{
        type: Sequelize.BOOLEAN,
        allowNull: true
    }
  }));
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('media')
      .then(()=>queryInterface.dropTable('answer_comment'))
      .then(()=>queryInterface.dropTable('comment'))
      .then(()=>queryInterface.dropTable('feedback'))
      .then(()=>queryInterface.dropTable('post'))
      .then(()=>queryInterface.dropTable('post_category'))
      .then(()=>queryInterface.dropTable('tracker_augmented'))
      .then(()=>queryInterface.dropTable('stocking_pond'))
      .then(()=>queryInterface.dropTable('seed'))
      .then(()=>queryInterface.dropTable('seed_quality'))
      .then(()=>queryInterface.dropTable('material_preparation_detail'))
      .then(()=>queryInterface.dropTable('pond_preparation'))
      .then(()=>queryInterface.dropTable('land_background'))
      .then(()=>queryInterface.dropTable('harvest_detail'))
      .then(()=>queryInterface.dropTable('product_type'))
      .then(()=>queryInterface.dropTable('product_category'))
      .then(()=>queryInterface.dropTable('harvest'))
      .then(()=>queryInterface.dropTable('activity_material'))
      .then(()=>queryInterface.dropTable('material'))
      .then(()=>queryInterface.dropTable('other '))
      .then(()=>queryInterface.dropTable('bill'))
      
      .then(()=>queryInterface.dropTable('stocking_type'))
      .then(()=>queryInterface.dropTable('unit'))
      .then(()=>queryInterface.dropTable('material_type'))
      .then(()=>queryInterface.dropTable('activity'))
      .then(()=>queryInterface.dropTable('activity_type'));
  }
};
