/*

2020.02.24:

KFDTable.find_extend_kfddata 增加可以提定KFDTABLE实例

2020.03.01:

支持KFDName的直接读写吧

2020.03.04:

所有对象读入的json对象都设置了__cls__名称

2020.03.05:

对写入对象规则修改，在已经KFD情况下并不是用__cls__来判定是否为mixobject [为了修正之前对所有object对象加__cls__]
修正之前对空对象写支持但对空对象写不支持的BUG
将读取特性调整只有mixobject加__cls__

*/


const KFDVersion:string = "2020.02.24";
