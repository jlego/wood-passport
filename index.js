/**
 * Wood Plugin Module.
 * 登录验证
 * by jlego on 2018-11-30
 */
const { Token } = require('wood-token')();

module.exports = (app = {}, config = {idName: 'account_id'}) => {
  let { catchErr, error } = app;
  let RedisPlugin = app.Plugin('redis');
  if(RedisPlugin){
    let Redis = new RedisPlugin.Redis(config.tableName || 'session', config.redis || 'master', app);
    app.Passport = async function(req, res, next){
      let theToken = req.headers.token;
      if(theToken){
        let userData = new Token().checkToken(theToken);
        if(userData){
          let key = userData.product_id ? `${userData.account_id}:${userData.product_id}` : userData.account_id;
          let cacheToken = await Redis.getHaseValue(key);
          if(theToken === cacheToken){
            req.User = userData;
            next();
          }else{
            res.print(error('你还没有登录'));
          }
        }else{
          res.print(error('token过期或不正确'));
        }
      }else{
        res.print(error('token参数不能为空'));
      }
    };
    if(app.addAppProp) app.addAppProp('Passport', app.Passport);
  }else{
    console.warn('Not find redis in passport plugin');
  }
  return app;
}
