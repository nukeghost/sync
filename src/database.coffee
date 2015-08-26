knex = require 'knex'
bookshelf = require 'bookshelf'
Promise = require 'bluebird'
{ EventEmitter } = require 'events'

module.exports = class Database extends EventEmitter
  constructor: (@config) ->
    @knex = knex(@config)
    @knex.tablePrefix = @config.tablePrefix
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
      require('./database/models/channelrank')(@bookshelf, @config.tablePrefix)
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
      if @knex.client.config.client == 'mysql'
        return @_hackMySQLIndex()
    ).then(=>
      @ready = true
      @emit('ready')
      console.log('Database initialized')
    ).catch((err) ->
      console.error('Database initialization failed: ' + err.stack)
    )

  ###
  # MySQL requires you to specify a key length when indexing TEXT columns.
  # However, knex does not provide a convenient way to do this.  Hence,
  # it has to be done manually.
  ###
  _hackMySQLIndex: ->
    prefix = @config.tablePrefix
    return @knex.raw("alter table `#{prefix}channel_library_items` add index
                      migrated_channel_library_items_channel_id_title_index(
                      `channel_id`, `title`(191))")
