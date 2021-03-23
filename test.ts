import { Crypt } from "./crypt";

let obj = {
	"key" : "what the hell， 中文",
	"age" : 300,
	"test" : [0, 1, 2, 3, 4]
}
let text = JSON.stringify(obj);
let key = Crypt.str2ba("egfw3223");

console.log(Crypt.ba2str(Crypt.str2ba(text)));
let en_text = Crypt.desencode_u8(key, Crypt.str2ba(text));
let de_text = Crypt.desdecode_u8(key, en_text);
console.log(JSON.parse(Crypt.ba2str(de_text)));

console.log(Crypt.str2ba(text));
let en_text_s = Crypt.desencode(key, text);
let de_text_s = Crypt.desdecode(key, en_text_s);
console.log(Crypt.str2ba(de_text_s));
console.log(JSON.parse(de_text_s));

console.log(Crypt.hexencode("affg"));
console.assert(Crypt.tohex(Crypt.hmac_hash(Crypt.str2ba("12345678"), "hello, 中文world"))=="9f2cf20dd56ba293", 'hamc_hash fail');

console.log(Crypt.b64encode(Crypt.randomkey()));

let tststr = "中文ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
console.log(Crypt.ba2str(Crypt.b64decode(Crypt.b64encode(Crypt.str2ba(tststr)))));

console.log(Crypt.tohex(Crypt.hmac64("12345678", "76543210")));
console.log(Crypt.tohex(Crypt.hmac64_md5("12345678", "76543210")));