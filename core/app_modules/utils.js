module.exports= {
  gen_url: function(host, port, path, no_proxy){
    if(!no_proxy){
      var url = (port === 443 ? 'https' : 'http') + '://' + host + ':' + port + path;
      return url
    }
    else{
      return 'https://' + host + path;
    }
  }
}
