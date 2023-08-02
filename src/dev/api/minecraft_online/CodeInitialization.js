function CodeInitialization(){
	let scope = {"Initization": this};
	
	this.add = function(name, value){
		scope[name] = value;
	}
	
	this.getNames = function(){
		return Object.keys(scope);
	}
	
	this.get = function(name){
		return scope[name];
	}
	
	this.can = function(name){
		return !!this.get(name);
	}
	
	this.load = function(code){
		with(scope){
			try{
				eval(code);
			}catch(e){
				alert(e)
			}
		}
	}
	
	this.clone = function(){
		let result = new CodeInitialization();
		for(let key in scope)
			result.add(key, scope[key]);
		result.add("Initization", result);
		return result;
	}
}