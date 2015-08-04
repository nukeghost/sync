knex = require 'knex'
bookshelf = require 'bookshelf'
Promise = require 'bluebird'

module.exports = class Database
  constructor: (@config) ->
    @knex = knex(@config)
    @bookshelf = bookshelf(@knex)
    @bookshelf.plugin('registry')
    @ready = false

    dataTypes =
      User: require('./database/models/user')(@bookshelf, @config.tablePrefix)
      Channel: require('./database/models/channel')(@bookshelf, @config.tablePrefix)
      GlobalIPBan: require('./database/models/globalipban')(@bookshelf, @config.tablePrefix)

    @models = {}
    @collections = {}

    for modelName, dataType of dataTypes
      { model, collection } = dataType
      @models[modelName] = model
      if collection?
        @collections[modelName + 's'] = collection

    Promise.map((modelClass for _, modelClass of @models), (modelClass) =>
      table = modelClass.prototype.tableName
      @knex.schema.hasTable(table).then((hasTable) =>
        if not hasTable
          driver = @knex.client.config.client
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
    ).then(=>
      @ready = true
      console.log('Database initialized')
    ).catch((err) ->
      console.error('Database initialization failed: ' + err.stack)
    )
