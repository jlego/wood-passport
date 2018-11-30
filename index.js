/**
 * Wood Plugin Module.
 * 登录验证
 * by jlego on 2018-11-30
 */
const { Token } = require('wood-token')();

module.exports = (app = {}, config = {}) => {
  let { catchErr, error } = app;
  let RedisPlugin = app.Plugin('redis');
  if(RedisPlugin){
    let Redis = new RedisPlugin.Redis('tokens', config.redis || 'master', app);
    app.Passport = async function(req, res, next){
      let theToken = req.headers.token;
      if(theToken){
        let userData = Token.checkToken(theToken);
        if(userData){
          let cacheToken = await Redis.getValue(userData.uid);
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
  }else{
    console.warn('Not find redis in passport plugin');
  }
  return app;
}
