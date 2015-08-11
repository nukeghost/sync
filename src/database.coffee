knex = require 'knex'
bookshelf = require 'bookshelf'
Promise = require 'bluebird'

module.exports = class Database
  constructor: (@config) ->
    @knex = knex(@config)
    @bookshelf = bookshelf(@knex)
    @bookshelf.plugin('registry')
    @ready = false

    modelList = [
      require('./database/models/user')(@bookshelf, @config.tablePrefix)
      require('./database/models/channel')(@bookshelf, @config.tablePrefix)
      require('./database/models/globalipban')(@bookshelf, @config.tablePrefix)
      require('./database/models/userplaylist')(@bookshelf, @config.tablePrefix)
      require('./database/models/channelplaylist')(@bookshelf, @config.tablePrefix)
      require('./database/models/channellibraryitem')(@bookshelf, @config.tablePrefix)
    ]

    @models = {}
    @collections = {}

    for modelCollection in modelList
      { model, collection } = modelCollection
      @models[model.prototype.modelName] = model
      if collection?
        @collections[collection.prototype.collectionName] = collection

    driver = @knex.client.config.client
    Promise.reduce((modelCollection.model for modelCollection in modelList), (_, modelClass) =>
      table = modelClass.prototype.tableName
      return @knex.schema.hasTable(table).then((hasTable) =>
        if not hasTable
          createTableSpecific = modelClass["createTable_#{driver}"]
          createTable =
            if typeof createTableSpecific == 'function' then createTableSpecific
            else modelClass.createTable
          return @knex.schema.createTable(table, createTable.bind(modelClass)).then(->
            console.log('Created table ' + table)
          ).catch((err) ->
            console.error("Failed to create table #{table}: #{err.stack}")
          )
      )
    , null).then(=>
      @ready = true
      console.log('Database initialized')
    ).catch((err) ->
      console.error('Database initialization failed: ' + err.stack)
    )
