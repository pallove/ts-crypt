type padding_add = (buf : Uint8Array, offset : number) => void;
type padding_remove = (buf : Uint8Array, offset : number) => number;

const PADDING_MODE_ISO7816_4  = 0
const PADDING_MODE_PKCS7  = 1
const PADDING_MODE_COUNT  = 2

const SMALL_CHUNK  = 256

const SB1 : Uint32Array = Uint32Array.from([
	0x01010400, 0x00000000, 0x00010000, 0x01010404,
	0x01010004, 0x00010404, 0x00000004, 0x00010000,
	0x00000400, 0x01010400, 0x01010404, 0x00000400,
	0x01000404, 0x01010004, 0x01000000, 0x00000004,
	0x00000404, 0x01000400, 0x01000400, 0x00010400,
	0x00010400, 0x01010000, 0x01010000, 0x01000404,
	0x00010004, 0x01000004, 0x01000004, 0x00010004,
	0x00000000, 0x00000404, 0x00010404, 0x01000000,
	0x00010000, 0x01010404, 0x00000004, 0x01010000,
	0x01010400, 0x01000000, 0x01000000, 0x00000400,
	0x01010004, 0x00010000, 0x00010400, 0x01000004,
	0x00000400, 0x00000004, 0x01000404, 0x00010404,
	0x01010404, 0x00010004, 0x01010000, 0x01000404,
	0x01000004, 0x00000404, 0x00010404, 0x01010400,
	0x00000404, 0x01000400, 0x01000400, 0x00000000,
	0x00010004, 0x00010400, 0x00000000, 0x01010004
]);

const SB2 : Uint32Array = Uint32Array.from([

	0x80108020, 0x80008000, 0x00008000, 0x00108020,
	0x00100000, 0x00000020, 0x80100020, 0x80008020,
	0x80000020, 0x80108020, 0x80108000, 0x80000000,
	0x80008000, 0x00100000, 0x00000020, 0x80100020,
	0x00108000, 0x00100020, 0x80008020, 0x00000000,
	0x80000000, 0x00008000, 0x00108020, 0x80100000,
	0x00100020, 0x80000020, 0x00000000, 0x00108000,
	0x00008020, 0x80108000, 0x80100000, 0x00008020,
	0x00000000, 0x00108020, 0x80100020, 0x00100000,
	0x80008020, 0x80100000, 0x80108000, 0x00008000,
	0x80100000, 0x80008000, 0x00000020, 0x80108020,
	0x00108020, 0x00000020, 0x00008000, 0x80000000,
	0x00008020, 0x80108000, 0x00100000, 0x80000020,
	0x00100020, 0x80008020, 0x80000020, 0x00100020,
	0x00108000, 0x00000000, 0x80008000, 0x00008020,
	0x80000000, 0x80100020, 0x80108020, 0x00108000
]);

const SB3 : Uint32Array = Uint32Array.from([

	0x00000208, 0x08020200, 0x00000000, 0x08020008,
	0x08000200, 0x00000000, 0x00020208, 0x08000200,
	0x00020008, 0x08000008, 0x08000008, 0x00020000,
	0x08020208, 0x00020008, 0x08020000, 0x00000208,
	0x08000000, 0x00000008, 0x08020200, 0x00000200,
	0x00020200, 0x08020000, 0x08020008, 0x00020208,
	0x08000208, 0x00020200, 0x00020000, 0x08000208,
	0x00000008, 0x08020208, 0x00000200, 0x08000000,
	0x08020200, 0x08000000, 0x00020008, 0x00000208,
	0x00020000, 0x08020200, 0x08000200, 0x00000000,
	0x00000200, 0x00020008, 0x08020208, 0x08000200,
	0x08000008, 0x00000200, 0x00000000, 0x08020008,
	0x08000208, 0x00020000, 0x08000000, 0x08020208,
	0x00000008, 0x00020208, 0x00020200, 0x08000008,
	0x08020000, 0x08000208, 0x00000208, 0x08020000,
	0x00020208, 0x00000008, 0x08020008, 0x00020200
]);

const SB4 : Uint32Array = Uint32Array.from([

	0x00802001, 0x00002081, 0x00002081, 0x00000080,
	0x00802080, 0x00800081, 0x00800001, 0x00002001,
	0x00000000, 0x00802000, 0x00802000, 0x00802081,
	0x00000081, 0x00000000, 0x00800080, 0x00800001,
	0x00000001, 0x00002000, 0x00800000, 0x00802001,
	0x00000080, 0x00800000, 0x00002001, 0x00002080,
	0x00800081, 0x00000001, 0x00002080, 0x00800080,
	0x00002000, 0x00802080, 0x00802081, 0x00000081,
	0x00800080, 0x00800001, 0x00802000, 0x00802081,
	0x00000081, 0x00000000, 0x00000000, 0x00802000,
	0x00002080, 0x00800080, 0x00800081, 0x00000001,
	0x00802001, 0x00002081, 0x00002081, 0x00000080,
	0x00802081, 0x00000081, 0x00000001, 0x00002000,
	0x00800001, 0x00002001, 0x00802080, 0x00800081,
	0x00002001, 0x00002080, 0x00800000, 0x00802001,
	0x00000080, 0x00800000, 0x00002000, 0x00802080
]);

const SB5 : Uint32Array = Uint32Array.from([

	0x00000100, 0x02080100, 0x02080000, 0x42000100,
	0x00080000, 0x00000100, 0x40000000, 0x02080000,
	0x40080100, 0x00080000, 0x02000100, 0x40080100,
	0x42000100, 0x42080000, 0x00080100, 0x40000000,
	0x02000000, 0x40080000, 0x40080000, 0x00000000,
	0x40000100, 0x42080100, 0x42080100, 0x02000100,
	0x42080000, 0x40000100, 0x00000000, 0x42000000,
	0x02080100, 0x02000000, 0x42000000, 0x00080100,
	0x00080000, 0x42000100, 0x00000100, 0x02000000,
	0x40000000, 0x02080000, 0x42000100, 0x40080100,
	0x02000100, 0x40000000, 0x42080000, 0x02080100,
	0x40080100, 0x00000100, 0x02000000, 0x42080000,
	0x42080100, 0x00080100, 0x42000000, 0x42080100,
	0x02080000, 0x00000000, 0x40080000, 0x42000000,
	0x00080100, 0x02000100, 0x40000100, 0x00080000,
	0x00000000, 0x40080000, 0x02080100, 0x40000100
]);

const SB6 : Uint32Array = Uint32Array.from([
	0x20000010, 0x20400000, 0x00004000, 0x20404010,
	0x20400000, 0x00000010, 0x20404010, 0x00400000,
	0x20004000, 0x00404010, 0x00400000, 0x20000010,
	0x00400010, 0x20004000, 0x20000000, 0x00004010,
	0x00000000, 0x00400010, 0x20004010, 0x00004000,
	0x00404000, 0x20004010, 0x00000010, 0x20400010,
	0x20400010, 0x00000000, 0x00404010, 0x20404000,
	0x00004010, 0x00404000, 0x20404000, 0x20000000,
	0x20004000, 0x00000010, 0x20400010, 0x00404000,
	0x20404010, 0x00400000, 0x00004010, 0x20000010,
	0x00400000, 0x20004000, 0x20000000, 0x00004010,
	0x20000010, 0x20404010, 0x00404000, 0x20400000,
	0x00404010, 0x20404000, 0x00000000, 0x20400010,
	0x00000010, 0x00004000, 0x20400000, 0x00404010,
	0x00004000, 0x00400010, 0x20004010, 0x00000000,
	0x20404000, 0x20000000, 0x00400010, 0x20004010
]);

const SB7 : Uint32Array = Uint32Array.from([

	0x00200000, 0x04200002, 0x04000802, 0x00000000,
	0x00000800, 0x04000802, 0x00200802, 0x04200800,
	0x04200802, 0x00200000, 0x00000000, 0x04000002,
	0x00000002, 0x04000000, 0x04200002, 0x00000802,
	0x04000800, 0x00200802, 0x00200002, 0x04000800,
	0x04000002, 0x04200000, 0x04200800, 0x00200002,
	0x04200000, 0x00000800, 0x00000802, 0x04200802,
	0x00200800, 0x00000002, 0x04000000, 0x00200800,
	0x04000000, 0x00200800, 0x00200000, 0x04000802,
	0x04000802, 0x04200002, 0x04200002, 0x00000002,
	0x00200002, 0x04000000, 0x04000800, 0x00200000,
	0x04200800, 0x00000802, 0x00200802, 0x04200800,
	0x00000802, 0x04000002, 0x04200802, 0x04200000,
	0x00200800, 0x00000000, 0x00000002, 0x04200802,
	0x00000000, 0x00200802, 0x04200000, 0x00000800,
	0x04000002, 0x04000800, 0x00000800, 0x00200002
]);

const SB8 : Uint32Array = Uint32Array.from([

	0x10001040, 0x00001000, 0x00040000, 0x10041040,
	0x10000000, 0x10001040, 0x00000040, 0x10000000,
	0x00040040, 0x10040000, 0x10041040, 0x00041000,
	0x10041000, 0x00041040, 0x00001000, 0x00000040,
	0x10040000, 0x10000040, 0x10001000, 0x00001040,
	0x00041000, 0x00040040, 0x10040040, 0x10041000,
	0x00001040, 0x00000000, 0x00000000, 0x10040040,
	0x10000040, 0x10001000, 0x00041040, 0x00040000,
	0x00041040, 0x00040000, 0x10041000, 0x00001000,
	0x00000040, 0x10040040, 0x00001000, 0x00041040,
	0x10001000, 0x00000040, 0x10000040, 0x10040000,
	0x10040040, 0x10000000, 0x00040000, 0x10001040,
	0x00000000, 0x10041040, 0x00040040, 0x10000040,
	0x10040000, 0x10001000, 0x10001040, 0x00000000,
	0x10041040, 0x00041000, 0x00041000, 0x00001040,
	0x00001040, 0x00040040, 0x10000000, 0x10041000
]);

/* PC1: left and right halves bit-swap */

const LHs : Uint32Array = Uint32Array.from([
	0x00000000, 0x00000001, 0x00000100, 0x00000101,
	0x00010000, 0x00010001, 0x00010100, 0x00010101,
	0x01000000, 0x01000001, 0x01000100, 0x01000101,
	0x01010000, 0x01010001, 0x01010100, 0x01010101
]);

const RHs : Uint32Array = Uint32Array.from([
	0x00000000, 0x01000000, 0x00010000, 0x01010000,
	0x00000100, 0x01000100, 0x00010100, 0x01010100,
	0x00000001, 0x01000001, 0x00010001, 0x01010001,
	0x00000101, 0x01000101, 0x00010101, 0x01010101,
]);

const k : Uint32Array = Uint32Array.from([
	0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee ,
	0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501 ,
	0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be ,
	0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821 ,
	0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa ,
	0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8 ,
	0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed ,
	0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a ,
	0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c ,
	0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70 ,
	0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05 ,
	0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665 ,
	0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039 ,
	0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1 ,
	0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1 ,
	0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391 
]);

// r specifies the per-round shift amounts
const r : Uint32Array = Uint32Array.from([
	7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
	5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
	4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
	6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
]);

const hex : Uint8Array = Uint8Array.from([
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102
]);

const encoding : Uint8Array = Uint8Array.from([
	65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
	81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101,
	102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
	115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53,
	54, 55, 56, 57, 43, 47
]);

const decoding  = [
	62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-2,-1,-1,
	-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
	23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,
	38,39,40,41,42,43,44,45,46,47,48,49,50,51
];

/* platform-independant 32-bit integer manipulation macros */

const GET_UINT32 = (b : Uint8Array, i : number) : number =>
{											   
    return (b[i] & 0xffffffff)  << 24
        | (b[i + 1] & 0xffffffff)  << 16
        | (b[i + 2] & 0xffffffff) << 8
        | (b[i + 3] & 0xffffffff) ;
}

const PUT_UINT32 = (n : number, b : Uint8Array, i : number) : void =>
{											   
    b[i] = (n >>> 24);
    b[i + 1] = (n >>> 16);
    b[i + 2] = (n >>> 8);
    b[i + 3] = (n);
}

const DES_IP = (T : number, X : number, Y : number) : [number, number, number] =>
{
	T = ((X >>>  4) ^ Y) & 0x0F0F0F0F; Y ^= T; X ^= (T <<  4);
	T = ((X >>> 16) ^ Y) & 0x0000FFFF; Y ^= T; X ^= (T << 16);
	T = ((Y >>>  2) ^ X) & 0x33333333; X ^= T; Y ^= (T <<  2);
	T = ((Y >>>  8) ^ X) & 0x00FF00FF; X ^= T; Y ^= (T <<  8);
	Y = ((Y << 1) | (Y >>> 31)) & 0xFFFFFFFF;
	T = (X ^ Y) & 0xAAAAAAAA; Y ^= T; X ^= T;
	X = ((X << 1) | (X >>> 31)) & 0xFFFFFFFF;

	return [T, X, Y];
}

const DES_FP = (T : number, X : number, Y : number) : [number, number, number] =>
{															   
	X = ((X << 31) | (X >>> 1)) & 0xFFFFFFFF;
	T = (X ^ Y) & 0xAAAAAAAA; X ^= T; Y ^= T;
	Y = ((Y << 31) | (Y >>> 1)) & 0xFFFFFFFF;
	T = ((Y >>>  8) ^ X) & 0x00FF00FF; X ^= T; Y ^= (T <<  8);
	T = ((Y >>>  2) ^ X) & 0x33333333; X ^= T; Y ^= (T <<  2);
	T = ((X >>> 16) ^ Y) & 0x0000FFFF; Y ^= T; X ^= (T << 16);
	T = ((X >>>  4) ^ Y) & 0x0F0F0F0F; Y ^= T; X ^= (T <<  4);

	return [T, X, Y];
}

/* DES round macro */

const DES_ROUND = (SK : Uint32Array, ii : number, T : number, X : number, Y : number) : [number, number, number, number] =>
{

	T = SK[ii++] ^ X;
	Y ^= SB8[ (T	  ) & 0x3F ] ^
		 SB6[ (T >>>  8) & 0x3F ] ^
		 SB4[ (T >>> 16) & 0x3F ] ^
		 SB2[ (T >>> 24) & 0x3F ];

	T = SK[ii++] ^ (((X << 28) >>> 0) | (X >>> 4));
	Y ^= SB7[ (T	  ) & 0x3F ] ^
		 SB5[ (T >>>  8) & 0x3F ] ^
		 SB3[ (T >>> 16) & 0x3F ] ^
		 SB1[ (T >>> 24) & 0x3F ];

	return [ii, T, X, Y];
}

class _crypt {

	private _encoder : TextEncoder;
	private _decoder : TextDecoder;

	constructor() {
		this._encoder = new TextEncoder();
		this._decoder = new TextDecoder();
	}

    des_main_ks(SK : Uint32Array, key : Uint8Array) {
		let X : number, Y : number, T : number;
		X = GET_UINT32(key, 0);
		Y = GET_UINT32(key, 4);

		/* Permuted Choice 1 */

		T =  ((Y >>>  4) ^ X) & 0x0F0F0F0F;  X ^= T; Y ^= (T <<  4);
		T =  ((Y	  ) ^ X) & 0x10101010;  X ^= T; Y ^= (T	  );

		X =   (LHs[ (X	  ) & 0xF] << 3) | (LHs[ (X >>>  8) & 0xF ] << 2)
			| (LHs[ (X >>> 16) & 0xF] << 1) | (LHs[ (X >>> 24) & 0xF ]	 )
			| (LHs[ (X >>>  5) & 0xF] << 7) | (LHs[ (X >>> 13) & 0xF ] << 6)
			| (LHs[ (X >>> 21) & 0xF] << 5) | (LHs[ (X >>> 29) & 0xF ] << 4);

		Y =   (RHs[ (Y >>>  1) & 0xF] << 3) | (RHs[ (Y >>>  9) & 0xF ] << 2)
			| (RHs[ (Y >>> 17) & 0xF] << 1) | (RHs[ (Y >>> 25) & 0xF ]	 )
			| (RHs[ (Y >>>  4) & 0xF] << 7) | (RHs[ (Y >>> 12) & 0xF ] << 6)
			| (RHs[ (Y >>> 20) & 0xF] << 5) | (RHs[ (Y >>> 28) & 0xF ] << 4);

		X &= 0x0FFFFFFF;
		Y &= 0x0FFFFFFF;


		/* calculate subkeys */

		let ii = 0;
		for(let i = 0; i < 16; i++ )
		{
			if( i < 2 || i == 8 || i == 15 )
			{
				X = ((X <<  1) | (X >>> 27)) & 0x0FFFFFFF;
				Y = ((Y <<  1) | (Y >>> 27)) & 0x0FFFFFFF;
			}
			else
			{
				X = ((X <<  2) | (X >>> 26)) & 0x0FFFFFFF;
				Y = ((Y <<  2) | (Y >>> 26)) & 0x0FFFFFFF;
			}

			SK[ii++] =   ((X <<  4) & 0x24000000) | ((X << 28) & 0x10000000)
					| ((X << 14) & 0x08000000) | ((X << 18) & 0x02080000)
					| ((X <<  6) & 0x01000000) | ((X <<  9) & 0x00200000)
					| ((X >>>  1) & 0x00100000) | ((X << 10) & 0x00040000)
					| ((X <<  2) & 0x00020000) | ((X >>> 10) & 0x00010000)
					| ((Y >>> 13) & 0x00002000) | ((Y >>>  4) & 0x00001000)
					| ((Y <<  6) & 0x00000800) | ((Y >>>  1) & 0x00000400)
					| ((Y >>> 14) & 0x00000200) | ((Y	  ) & 0x00000100)
					| ((Y >>>  5) & 0x00000020) | ((Y >>> 10) & 0x00000010)
					| ((Y >>>  3) & 0x00000008) | ((Y >>> 18) & 0x00000004)
					| ((Y >>> 26) & 0x00000002) | ((Y >>> 24) & 0x00000001);

			SK[ii++] =   ((X << 15) & 0x20000000) | ((X << 17) & 0x10000000)
					| ((X << 10) & 0x08000000) | ((X << 22) & 0x04000000)
					| ((X >>>  2) & 0x02000000) | ((X <<  1) & 0x01000000)
					| ((X << 16) & 0x00200000) | ((X << 11) & 0x00100000)
					| ((X <<  3) & 0x00080000) | ((X >>>  6) & 0x00040000)
					| ((X << 15) & 0x00020000) | ((X >>>  4) & 0x00010000)
					| ((Y >>>  2) & 0x00002000) | ((Y <<  8) & 0x00001000)
					| ((Y >>> 14) & 0x00000808) | ((Y >>>  9) & 0x00000400)
					| ((Y	  ) & 0x00000200) | ((Y <<  7) & 0x00000100)
					| ((Y >>>  7) & 0x00000020) | ((Y >>>  3) & 0x00000011)
					| ((Y <<  2) & 0x00000004) | ((Y >>> 21) & 0x00000002);
		}

    }

	/* DES 64-bit block encryption/decryption */
	des_crypt(SK : Uint32Array, input : Uint8Array, ip : number, output : Uint8Array, io : number) {
		let X : number, Y : number, T : number;

		X = GET_UINT32(input, ip + 0);
		Y = GET_UINT32(input, ip + 4);

		[T, X, Y] = DES_IP(T, X, Y);

		let ii = 0;
		for(let i = 0; i < 8; i++) {
			[ii, T, Y, X] = DES_ROUND(SK, ii, T , Y , X);
			[ii, T, X, Y] = DES_ROUND(SK, ii, T , X , Y);
		}

		[T, Y, X] = DES_FP(T, Y, X);

		PUT_UINT32(Y, output, io + 0);
		PUT_UINT32(X, output, io + 4);
	}

	randomkey() : Uint8Array {

		let tmp : Uint8Array = new Uint8Array(8);
		let x = 0;
		for(let i = 0; i < 8; i++) {
			tmp[i] = Math.floor(Math.random() * 0xffffff) & 0xff;
			x ^= tmp[i];
		}
		if (x == 0) {
			tmp[0] |= 1;	// avoid 0
		}
		return tmp;
	}

	padding_add_iso7816_4(buf : Uint8Array, offset : number) {
		buf[offset] = 0x80;
		//memset(buf+offset+1, 0, 7-offset);
		let start = offset + 1;
		let end = start + 7 - offset;
		for(let i = start; i <= end; i++) {
			buf[i] = 0;
		}
	}

	padding_remove_iso7816_4(last : Uint8Array, ii : number) : number {
		let padding = 1;
		for(let i = 0; i < 8; i++, ii--) {
			if (last[ii] == 0) {
				padding++;
			} else if (last[ii] == 0x80) {
				return padding;
			} else {
				break;
			}
		}
		// invalid
		return 0;
	}

	padding_add_pkcs7(buf : Uint8Array, offset : number) {
		const x = 8 - offset;
		let start = offset;
		let end = offset + 8 - offset;
		for(let i = start; i <= end; i++) {
			buf[i] = x;
		}
	}

	padding_remove_pkcs7(last : Uint8Array, ii : number) : number {
		let padding = last[ii];
		for(let i = 1; i < padding; i++) {
			--ii;
			if (last[ii] != padding) 
				return 0;		// invalid
		}
		return padding;
	}

	padding_add_func : padding_add[] = [this.padding_add_iso7816_4, this.padding_add_pkcs7];
	padding_remove_func : padding_remove[] = [this.padding_remove_iso7816_4, this.padding_remove_pkcs7]

	check_padding_mode(mode : number) {
		console.assert(mode >= 0 && mode < PADDING_MODE_COUNT, `Invalid padding mode ${mode}`);
	}

	add_padding(buf : Uint8Array, src : Uint8Array, ii : number, offset : number, mode : number) {
		this.check_padding_mode(mode);

		let [start, end] = [ii, ii + offset];
		for(let i = start, p = 0; i <= end; i++, p++) {
			buf[p] = src[i];
		}

		this.padding_add_func[mode](buf, offset);
	}

	remove_padding(last : Uint8Array, ii : number, mode : number) : number {
		this.check_padding_mode(mode);
		return this.padding_remove_func[mode](last, ii);
	}

	des_key(key : Uint8Array, SK : Uint32Array) {
		let keysz = key.length;
		if (keysz != 8) {
			throw new Error("Invalid key size %d, need 8 bytes " + keysz);
		} 
		this.des_main_ks(SK, key);
	}

	desencode_u8(key : Uint8Array, text : Uint8Array, padding_mode : number = PADDING_MODE_ISO7816_4) : Uint8Array {
		let SK : Uint32Array = new Uint32Array(32);
		this.des_key(key, SK);

		let textsz = text.length;
		let chunksz = ((textsz + 8) & ~7) >>> 0;
		let buffersz = chunksz > SMALL_CHUNK ? chunksz : SMALL_CHUNK;
		let buffer = new Uint8Array(buffersz);

		let i : number;
		for(i = 0; i < textsz - 7; i += 8) {
			this.des_crypt(SK, text, i, buffer, i);
		}

		let tail : Uint8Array = new Uint8Array(8);
		this.add_padding(tail, text, i, textsz - i, padding_mode);
		this.des_crypt(SK, tail, 0, buffer, i);

		return buffer.subarray(0, chunksz);
	}

	desencode(key : Uint8Array, text : string, padding_mode : number = PADDING_MODE_ISO7816_4) : Uint8Array {
		return this.desencode_u8(key, this.str2ba(text), padding_mode);
	}

	desdecode_u8(key : Uint8Array, text : Uint8Array, padding_mode : number = 0) : Uint8Array {
		let ESK : Uint32Array = new Uint32Array(32);
		this.des_key(key, ESK);
		let SK : Uint32Array = new Uint32Array(32);

		for(let i = 0; i < 32; i += 2) {
			SK[i] = ESK[30 - i];
			SK[i + 1] = ESK[31 - i];
		}
		let textsz = text.length;
		if ((textsz & 7) || textsz == 0) {
			console.assert(`Invalid des crypt text length ${textsz}`);
		}

		let buffersz = textsz > SMALL_CHUNK ? textsz : SMALL_CHUNK;
		let buffer = new Uint8Array(buffersz);

		let i : number;
		for(i = 0; i < textsz; i += 8) {
			this.des_crypt(SK, text, i, buffer, i);
		}
		let padding : number = this.remove_padding(buffer, textsz - 1, padding_mode);
		if (padding <= 0 || padding > 8) {
			console.assert(`Invalid des crypt text, padding = ${padding}`);
		}
		return buffer.subarray(0, textsz - padding);
	}

	desdecode(key : Uint8Array, text : Uint8Array, padding_mode : number = PADDING_MODE_ISO7816_4) : string {
		return this.ba2str(this.desdecode_u8(key, text, padding_mode));
	}

	tohex(text : Uint8Array) : string {
		let sz = text.length;
		let buffer = new Uint8Array(sz * 2);
		for(let i = 0; i < sz; i++) {
			buffer[i * 2] = hex[text[i] >> 4];
			buffer[i * 2 + 1] = hex[text[i] & 0xf];
		}
		return this.ba2str(buffer);
	}

	hexencode(text : string) : string {
		return this.tohex(this.str2ba(text));
	}

	HEX(v : number) : number {
		if (v > 47 && v < 58) return v - 48;
		if (v > 64 && v < 71) return v - 55;
		if (v > 96 && v < 103) return v - 87;
		console.error(`Invalid char value ${v}`);
		return 0;
	}

	fromhex(hex : string) : Uint8Array {
		hex = hex.length % 2 ? '0' + hex : hex;
		let ba = this.str2ba(hex);
		let buffer = new Uint8Array(Math.round(ba.length / 2));
		for(let i = 0, j = 0; i < ba.length; i += 2, j++) {
			buffer[j] = this.HEX(ba[i]) * 0x10 + this.HEX(ba[i + 1]);
		}
		return buffer;
	}

	hexdecode(hex : string) : string {
		return this.ba2str(this.fromhex(hex));
	}

	str2ba(s : string) : Uint8Array {
		return this._encoder.encode(s);
	}

	ba2str(ab : Uint8Array) : string {
		return this._decoder.decode(ab);
	}

	hash(str : Uint8Array, ii : number, sz : number, key : Uint8Array) : void {

		let djb_hash : number = 5381;
		let js_hash : number = 1315423911;

		for (let i = 0; i < sz; i++) {
			let c : number = str[i + ii];
			djb_hash += (djb_hash << 5) + c;
			js_hash ^= ((js_hash << 5) + c + (js_hash >>> 2));
		}

		key[0] = djb_hash & 0xff;
		key[1] = (djb_hash >>> 8) & 0xff;
		key[2] = (djb_hash >>> 16) & 0xff;
		key[3] = (djb_hash >>> 24) & 0xff;

		key[4] = js_hash & 0xff;
		key[5] = (js_hash >>> 8) & 0xff;
		key[6] = (js_hash >>> 16) & 0xff;
		key[7] = (js_hash >>> 24) & 0xff;
	}

	hashkey(key : string) : Uint8Array {
		let ba = this._encoder.encode(key);
		let sz = ba.length;
		let realkey = new Uint8Array(8);
		this.hash(ba, 0, sz, realkey);
		return realkey;
	}

	// leftrotate function definition
	LEFTROTATE(x : number, c : number) : number {
		return ((x << c) >>> 0 | x >>> (32 - c)) >>> 0;
	}

	digest_md5(w : Uint32Array, result : Uint32Array) : void {

		let f, g, temp;
	
		let a = 0x67452301
		let b = 0xefcdab89;
		let c = 0x98badcfe;
		let d = 0x10325476;

		for(let i = 0; i<64; i++) {
			if (i < 16) {
				f = ((b & c) >>> 0) | ((~b)  & d);
				g = i;
			} else if (i < 32) {
				f = (d & b) | ((~d) & c);
				g = (5*i + 1) % 16;
			} else if (i < 48) {
				f = b ^ c ^ d;
				g = (3*i + 5) % 16; 
			} else {
				f = c ^ (b | (~d));
				g = (7*i) % 16;
			}

			temp = d;
			d = c;
			c = b;
			b = b + this.LEFTROTATE(a + f + k[i] + w[g], r[i]);
			a = temp;
		}

		result[0] = a;
		result[1] = b;
		result[2] = c;
		result[3] = d;
	}

	hmac(x : Uint32Array, y : Uint32Array, result : Uint32Array) : void {

		let w = new Uint32Array(16);
		let r = new Uint32Array(4);

		for (let i=0;i<16;i+=4) {
			w[i] = x[1];
			w[i+1] = x[0];
			w[i+2] = y[1];
			w[i+3] = y[0];
		}

		this.digest_md5(w,r);

		result[0] = r[2]^r[3];
		result[1] = r[0]^r[1];
	}

	hmac_md5(x : Uint32Array, y : Uint32Array, result : Uint32Array) : void {
		let w : Uint32Array = new Uint32Array(16);
		let r : Uint32Array = new Uint32Array(4);
		for (let i=0;i<12;i+=4) {
			w[i] = x[0];
			w[i+1] = x[1];
			w[i+2] = y[0];
			w[i+3] = y[1];
		}

		w[12] = 0x80;
		w[13] = 0;
		w[14] = 384;
		w[15] = 0;

		this.digest_md5(w,r);

		result[0] = (r[0] + 0x67452301) ^ (r[2] + 0x98badcfe);
		result[1] = (r[1] + 0xefcdab89) ^ (r[3] + 0x10325476);

	}

	read64(x : Uint8Array, y : Uint8Array, xx : Uint32Array, yy : Uint32Array) {
		let sz = x.length;
		if (sz != 8) {
			console.error('Invalid uint64 x');
		}
		sz = y.length;
		if (sz != 8) {
			console.error('Invalid uint64 y');
		}
		xx[0] = x[0] | x[1]<<8 | x[2]<<16 | x[3]<<24;
		xx[1] = x[4] | x[5]<<8 | x[6]<<16 | x[7]<<24;
		yy[0] = y[0] | y[1]<<8 | y[2]<<16 | y[3]<<24;
		yy[1] = y[4] | y[5]<<8 | y[6]<<16 | y[7]<<24;
	}

	pushqword(result : Uint32Array) : Uint8Array {
		let tmp : Uint8Array = new Uint8Array(8);
		tmp[0] = result[0] & 0xff;
		tmp[1] = (result[0] >>> 8 )& 0xff;
		tmp[2] = (result[0] >>> 16 )& 0xff;
		tmp[3] = (result[0] >>> 24 )& 0xff;
		tmp[4] = result[1] & 0xff;
		tmp[5] = (result[1] >>> 8 )& 0xff;
		tmp[6] = (result[1] >>> 16 )& 0xff;
		tmp[7] = (result[1] >>> 24 )& 0xff;
		return tmp;
	}

	hmac64(xx : string, yy : string) : Uint8Array {
		return this.hmac64_u8(this.str2ba(xx), this.str2ba(yy));
	}

	hmac64_u8(xx : Uint8Array, yy : Uint8Array) : Uint8Array {
		let x : Uint32Array = new Uint32Array(2);
		let y : Uint32Array = new Uint32Array(2);
		this.read64(xx, yy, x, y);
		let result = new Uint32Array(2);
		this.hmac(x, y, result);
		return this.pushqword(result);
	}

	hmac64_md5(xx : string, yy : string) : Uint8Array {
		return this.hmac64_md5_u8(this.str2ba(xx), this.str2ba(yy));
	}

	hmac64_md5_u8(xx : Uint8Array, yy : Uint8Array) : Uint8Array {
		let x : Uint32Array = new Uint32Array(2);
		let y : Uint32Array = new Uint32Array(2);
		this.read64(xx, yy, x, y);
		let result = new Uint32Array(2);
		this.hmac_md5(x, y, result);
		return this.pushqword(result);
	}

	hmac_hash(key : Uint8Array, text : string) : Uint8Array {
		let akey : Uint32Array = new Uint32Array(2);
		let sz = key.length;
		if (sz != 8) {
			console.error('nvalid uint64 key');
		}
		akey[0] = key[0] | key[1]<<8 | key[2]<<16 | key[3]<<24;
		akey[1] = key[4] | key[5]<<8 | key[6]<<16 | key[7]<<24;

		let atext = this.str2ba(text);
		sz = atext.length;
		let h = new Uint8Array(8);
		this.hash(atext, 0, sz, h);
		let htext = new Uint32Array(2);
		htext[0] = h[0] | h[1]<<8 | h[2]<<16 | h[3]<<24;
		htext[1] = h[4] | h[5]<<8 | h[6]<<16 | h[7]<<24;
		let result = new Uint32Array(2);
		this.hmac(htext, akey, result);
		return this.pushqword(result);
	}

	xor_str(s1 : Uint8Array, s2 : Uint8Array) : Uint8Array {
		let len1 = s1.length;
		let len2 = s2.length;
		if (len2 == 0) {
			console.error("Can't xor empty string");
		}
		let buffer = new Uint8Array(len1);
		for(let i = 0; i < len1; i++) {
			buffer[i] = s1[i] ^ s2[i % len2];
		}
		return buffer;
	}

	b64encode(text : Uint8Array) : string {
		let sz = text.length;
		let encode_sz = Math.floor((sz + 2) / 3) * 4;
		let buffer = new Uint8Array(encode_sz);
		let i = 0, j = 0;
		for(; i < sz - 2; i += 3) {
			let v = text[i] << 16 | text[i+1] << 8 | text[i+2];
			buffer[j] = encoding[v >> 18];
			buffer[j+1] = encoding[(v >> 12) & 0x3f];
			buffer[j+2] = encoding[(v >> 6) & 0x3f];
			buffer[j+3] = encoding[(v) & 0x3f];
			j+=4;
		}
		let padding = sz - i;
		let v;
		switch(padding) {
			case 1 :
				v = text[i];
				buffer[j] = encoding[v >> 2];
				buffer[j+1] = encoding[(v & 3) << 4];
				buffer[j+2] = 61;  //'='
				buffer[j+3] = 61;
				break;
			case 2 :
				v = text[i] << 8 | text[i+1];
				buffer[j] = encoding[v >> 10];
				buffer[j+1] = encoding[(v >> 4) & 0x3f];
				buffer[j+2] = encoding[(v & 0xf) << 2];
				buffer[j+3] = 61;
				break;
		}
		return this.ba2str(buffer);
	}

	b64index(c : number) : number {
		if (c < 43) return -1;
		c -= 43;
		if (c >= decoding.length) return -1;
		return decoding[c];
	}

	b64decode(str : string) : Uint8Array {
		let text = this.str2ba(str);
		let sz = text.length;
		let decode_sz = Math.floor((sz + 3) / 4) * 3;
		let buffer = new Uint8Array(decode_sz);

		let i,j;
		let output = 0;
		for (i=0;i<sz;) {
			let padding = 0;
			let c = [];
			for (j=0;j<4;) {
				if (i>=sz) {
					console.error('Invalid base64 text');
					return;
				}
				c[j] = this.b64index(text[i]);
				if (c[j] == -1) {
					++i;
					continue;
				}
				if (c[j] == -2) {
					++padding;
				}
				++i;
				++j;
			}
			let v;
			switch (padding) {
			case 0:
				v = (c[0] & 0xffffffff) << 18 | c[1] << 12 | c[2] << 6 | c[3];
				buffer[output] = v >> 16;
				buffer[output+1] = (v >> 8) & 0xff;
				buffer[output+2] = v & 0xff;
				output += 3;
				break;
			case 1:
				if (c[3] != -2 || (c[2] & 3)!=0) {
					console.error('Invalid base64 text');
					return;
				}
				v = (c[0] & 0xffffffff)  << 10 | c[1] << 4 | c[2] >> 2 ;
				buffer[output] = v >> 8;
				buffer[output+1] = v & 0xff;
				output += 2;
				break;
			case 2:
				if (c[3] != -2 || c[2] != -2 || (c[1] & 0xf) !=0)  {
					console.error('Invalid base64 text');
					return;
				}
				v = (c[0] & 0xffffffff)  << 2 | c[1] >> 4;
				buffer[output] = v;
				++output;
				break;
			default:
				console.error('Invalid base64 text');
				return;
			}
		}
		return buffer.subarray(0, output);
	}
}

export const Crypt = new _crypt();

/**
 * 
letterr '*' means ok, 'x' not
 
*		{ "hashkey", lhashkey },
*		{ "randomkey", lrandomkey },
*		{ "desencode", ldesencode },
*		{ "desdecode", ldesdecode },
*		{ "hexencode", ltohex },
*		{ "hexdecode", lfromhex },
*		{ "hmac64", lhmac64 },
*		{ "hmac64_md5", lhmac64_md5 },
x		{ "dhexchange", ldhexchange },
x		{ "dhsecret", ldhsecret },
*		{ "base64encode", lb64encode },
*		{ "base64decode", lb64decode },
x		{ "sha1", lsha1 },
x		{ "hmac_sha1", lhmac_sha1 },
x		{ "hmac_hash", lhmac_hash },
*		{ "xor_str", lxor_str },
x		{ "padding", NULL },

 */
