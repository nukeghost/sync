createError = require 'create-error'
Promise = require 'bluebird'
bcrypt = Promise.promisifyAll(require 'bcrypt')

{ canonicalizeName } = require '../util'

module.exports = (bookshelf, tablePrefix = '') ->
  User = bookshelf.Model.extend({
    modelName: 'User'
    tableName: tablePrefix + 'users'
    hasTimestamps: true
  }, {
    STATUS_INACTIVE: -1
    STATUS_REGISTERED: 1
    STATUS_ADMIN: 2

    PasswordFailure: createError('PasswordFailure')

    createTable_mysql: (t) ->
      t.increments('id').primary()
      t.string('name', 20)
          .index()
          .notNullable()
      t.string('canonical_name', 20)
          .unique()
          .notNullable()
      t.string('password', 60)
          .notNullable()
      t.tinyint('status')
          .notNullable()
          .defaultTo(@STATUS_REGISTERED)
      t.string('session_salt', 30)
      t.specificType('email', 'varchar(254) character set utf8mb4')
          .index()
          .notNullable()
          .defaultTo('')
      t.specificType('profile_image', 'varchar(255) character set utf8mb4')
          .notNullable()
          .defaultTo('')
      t.specificType('profile_text', 'varchar(255) character set utf8mb4')
          .notNullable()
          .defaultTo('')
      t.binary('register_ip', 16)
          .index()
          .notNullable()
      t.timestamps()

    createTable: (t) ->
      t.increments('id').primary()
      t.string('name', 20)
          .index()
          .notNullable()
      t.string('canonical_name', 20)
          .unique()
          .notNullable()
      t.string('password', 60)
          .notNullable()
      t.tinyint('status')
          .notNullable()
          .defaultTo(@STATUS_REGISTERED)
      t.string('session_salt', 30)
          .notNullable()
      t.string('email', 254)
          .index()
          .notNullable()
          .defaultTo('')
      t.string('profile_image', 255)
          .notNullable()
          .defaultTo('')
      t.string('profile_text', 255)
          .notNullable()
          .defaultTo('')
      t.binary('register_ip', 16)
          .index()
          .notNullable()
      t.timestamps()

    login: (name, password) ->
      return @forge(canonical_name: canonicalizeName(name)).query(
        'whereIn', 'type', [@STATUS_REGISTERED, @STATUS_ADMIN]
      ).fetch().tap((user) ->
        return bcrypt.compareAsync(user.get('password'), password).then((valid) ->
          if not valid
            throw new PasswordFailure("Invalid password for user #{name}")
        )
      )
  })

  bookshelf.model('User', User)

  return {
    model: User
  }
