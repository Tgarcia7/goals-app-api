module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  DB_URI: process.env.DB_URI || `mongodb+srv://goals-admin:wuUVMZ8KprDFRWIc@goals.knuyh.mongodb.net/goals-${process.env.NODE_ENV || 'dev'}?retryWrites=true&w=majority`,
  SECRET_TOKEN: process.env.SECRET_TOKEN || '123'
}