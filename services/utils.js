module.setCookie = function(res, name, data, signed){
	res.cookie(name, data, { signed: signed , maxAge: 3888000000});
};