
///二进制处理器


export enum KFEndian
{
    KF_UNKNOW,
    KF_BIG_ENDIAN,
    KF_LITTLE_ENDIAN
};


export class KFByteArray {

    _buff:Uint8Array;
    _buffsize:number;
    _writePos:number;
    _readPos:number;
    _endian:KFEndian = KFEndian.KF_BIG_ENDIAN;

    constructor(size:number, buff:Uint8Array)
    {

    }
};



