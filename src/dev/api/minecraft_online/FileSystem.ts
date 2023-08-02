interface IFileSystem {
    getFile(path: string): Nullable<string>;
    getJsonToFile<T>(path: string): Nullable<T>;
    getFullAddres(path: string): string;
    isExists(path: string): boolean;
}

class AndroidFileSystem implements IFileSystem {
    private directory: string;

    constructor(directory: string){
        this.directory = directory;
    }

    protected parseJson<T>(json: string): T {
        let RE_BLOCKS = new RegExp([
            /\/(\*)[^*]*\*+(?:[^*\/][^*]*\*+)*\//.source,
            /\/(\/)[^\n]*$/.source,
             /"(?:[^"\\]*|\\[\S\s])*"|'(?:[^'\\]*|\\[\S\s])*'|`(?:[^`\\]*|\\[\S\s])*`/.source,
             /(?:[$\w\)\]]|\+\+|--)\s*\/(?![*\/])/.source,
             /\/(?=[^*\/])[^[/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[/\\]*)*?\/[gim]*/.source
        ].join('|'), 'gm');
        return JSON.parse(json.replace(RE_BLOCKS, function(match, mlc, slc){
            return mlc ? ' ' : slc ? '' : match;
        }));
    }

    public getFullAddres(path: string): string {
        return this.directory+"/"+path;
    }

    public isExists(path: string): boolean {
        return FileTools.isExists(this.getFullAddres(path));
    }

    public getFile(path: string):  Nullable<string> {
        if(!this.isExists(path))
            return null;
        return FileTools.ReadText(this.getFullAddres(path));
    }

    public getJsonToFile<T>(path: string): Nullable<T> {
        let json = this.getFile(path);
        if(json == null)
            return null;
        return this.parseJson<T>(json);
    }
    
}

let DefaultHttpClient = WRAP_JAVA("org.apache.http.impl.client.DefaultHttpClient");
let HttpGet = 
WRAP_JAVA("org.apache.http.client.methods.HttpGet");
let ByteArrayOutputStream = WRAP_JAVA("java.io.ByteArrayOutputStream");
let HttpStatus = WRAP_JAVA("org.apache.http.HttpStatus");
let Base64 = WRAP_JAVA("android.util.Base64");
let Jstring = WRAP_JAVA("java.lang.String");

function isConnection(): boolean {
	let cm = UI.getContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
	let netInfo = cm.getActiveNetworkInfo();
	return netInfo != null && netInfo.isConnectedOrConnecting()
}

function sendHttp(http: string): Nullable<string> {
	if(!isConnection()) return null;
	try{
		let httpclient = new DefaultHttpClient();
		let response = httpclient.execute(new HttpGet(http));
		let statusLine = response.getStatusLine();
		if(statusLine.getStatusCode() == HttpStatus.SC_OK){
			let out = new ByteArrayOutputStream(); 
			response.getEntity().writeTo(out);
			let result = String(out.toString());
			out.close(); 
			return result
		}
		response.getEntity().getContent().close();
	}catch(e){return null;}
	return null;
}

interface IGithubHttp {
    message: string;
    content: Nullable<string>;
}

class GitHubFileSystem extends AndroidFileSystem {
    private user: string
    private repository: string;

    constructor(user: string, repository: string){
        super(null);
        this.user = user;
        this.repository = repository;
    }

    protected getGithubInfo(path: string): Nullable<IGithubHttp> {
        let request = sendHttp(this.getFullAddres(path));
        if(request == null)
            return null;
        return this.parseJson(request);
    }

    public getFullAddres(path: string): string {
        return "https://api.github.com/repos/"+this.user+"/"+this.repository+"/contents/"+path+"?ref=main";
    }
    

    public isExists(path: string): boolean {
        let request = this.getGithubInfo(path);
        if(request == null)
            return null;
        return !!request.content;
    }

    public parseBase64String(text: string): string {
		let result = "";
		try{
			let array = text.split("\\n");
			for(let i in array)
				result += new Jstring(Base64.decode(new Jstring(array[i]).getBytes(), Base64.DEFAULT));
		}catch(e){return null;}
		return result;
	}

    public getFile(path: string): Nullable<string> {
        let request = this.getGithubInfo(path);
        if(request == null)
            return null;
        let file = this.parseBase64String(request.content);
        if(file == null)
            return null;
        return this.parseJson(file);
    }
}