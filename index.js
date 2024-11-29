
if(process.env.DEV_ENV === 'true') {
  require('@babel/register')({
    extensions: ['.js', '.ts']
  });
  require('reflect-metadata');
  require('./src/service');
} else {
  require('./service');
}