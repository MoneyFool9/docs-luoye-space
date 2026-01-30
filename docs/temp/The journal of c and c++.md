# c/c++的学习

## 字符串

>  c风格字符串

char s2[] = 'hello world' ;

相关的操作符

> strlen  strcmp   strcat  strcpy  

c++  string类型

> +/+=    string.substr   string.find   string.replace   string.size

-------

## 算法  --汉诺塔

**规则**

有三根柱子，其中一个柱子穿好了由大到小的n块盘，每次只能移动一个盘子且小盘必须在大盘上面，我们要把盘子移到另一个柱子上并且依旧由大到小排序。

------

**解法**

以一个n=5的汉诺塔问题为例，前三步可以是这样的：

+ 借助中转柱C，将n-1=4个盘从A移到B。
+ 将A柱上的大盘取下，移至C
+ 借助中转柱A，将B柱上的n-1=4个盘移到C柱

> 问题到这里，我们可以看出，第三步的任务与我们的总任务(借助中转柱B，将A柱上的n=5个盘移到C柱) 是相同的。就这样我们将n个盘的问题通过分解成一个一个子问题，从n个盘到n-1个盘再到n-2个直到最后成了1个盘的汉诺塔问题，这个时候问题就不攻自破了。

![image-20240904224216998](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240904224216998.png)

![image-20240904224233091](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240904224233091.png)

------

**算法实现**

从问题分析我们可以意识到，这是一个递归的过程。由此，我们可以写出汉诺塔问题的递归算法。

``` c++
#Include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> steps;  //用于存放移盘序列的向量  存储字符串

void hanoi(int n, const char* a, const char* b, const char* c){
    if(n==1){
        steps.push_back(string(a) + " --> " + c);
    }else{
        hanoi(n-1, a, c, b);  //借助中转柱C，将n-1=4个盘从A移到B。
        steps.push_back(string(a) + " --> " + c);  //将A柱上的大盘取下，移至C
        hanoi(n-1, b, a, c);  //借助中转柱A，将B柱上的n-1=4个盘移到C柱
    }
}

// 其中，steps存放了每一次的操作。steps.size就是这个问题的操作次数。
```

------

### 默认值参数

````c
int add(int a, int b, int c = 0, int d = 0){
    return a + b + c + d;
}

int main() {
    cout << "1+2 = " << add(1,2) << endl;
    cout << "1+2+3 = " << add(1,2,3) << endl;
    cout << "1+2+3+4 = " << add(1,2,3,4) << endl;
    return 0;
}
````

### 内联函数

inline static function

编译器会在函数调用点直接将函数展开，节省了函数调用的跳转时间。

**将一个函数定义为内联函数并不能保证编译器将函数内联**。至少在下述两种情况下，编译器会选择忽视inline关键字，不内联函数：

- 函数过于冗长和复杂。这也通常意味着相对于函数体本身的执行代价，与函数调用有关的额外开销无足轻重，将函数内联的价值很小。
- 递归函数。递归函数调用是无法展开的，其中一个理由是递归函数的递归次数在编译时无法确定。

------

### 函数名重载

> 在C语言里，同一个程序中的函数名必须互不相同。**【C++】**中的函数名重载（function overloading）允许多个函数使用相同的函数名，前提是每个函数的形参类型或顺序不同。

当函数调用时，如果存在多于一个的同名函数，C++编译器会试图通过实参的类型去匹配并选择正确的函数。

------

### 模板函数

```c++
//Project - TemplateSwap
#include <iostream>
using namespace std;

template <typename T>
void swapObject(T& a, T& b){
    auto t = a;
    a = b;
    b = t;
}

int main() {
    char c1 {'a'}, c2 {'z'};
    swapObject(c1,c2);
    cout << "c1 = " << c1 << ", c2 = " << c2 << endl;

    double d1{1.1}, d2{9.9};
    swapObject(d1,d2);
    cout << "d1 = " << d1 << ", d2 = " << d2 << endl;

    short s1{-22}, s2{22};
    swapObject<short>(s1,s2);
    cout << "s1 = " << s1 << ", s2 = " << s2 << endl;

    return 0;
}
```

​	当提供两个char类型的实参给swapObject( )函数，聪明的编译器会用char类型替换模板参数T，“内部生成”swapObject(char&, char&)函数并使用之。

### 堆对象

> 我们已经使用过C语言的malloc( )、calloc( )函数从操作系统申请内存，使用完后再通free( )函数释放。事实上，malloc( )、calloc( )函数所申请的内存就源自于堆。

在C++语言中，我们通过new， delete操作符来申请和释放堆内存。请阅读下述C++语言示例：

```c++
//Project - NewDelete1
#include <iostream>
#include <stdio.h>
using namespace std;

int main() {
    int i = 3;
    int* p = new int;
    *p = 5;

    printf("i = %d, &i = %p\n", i, &i);
    printf("p = %p, &p = %p, *p = %d\n", p, &p, *p);

    delete p;
    printf("p = %p", p);

    return 0;
}
```

​	new int通过操作系统API从堆里申请一个int，即4个字节的存储空间，并返回int*。通过指针赋值，指针p指向这块申请而得的堆内存。通过new操作符从堆里申请一个对象的存储空间的一般语法为：

```
对象类型 *指针名 = new 对象类型;
```

使用delete释放内容块有如下注意事项：

- delete只能用于释放通过new操作符申请的内存块，如果试图用delete释放指向栈对象的地址，会发生错误。
- new操作符申请的内存块必须通过delete操作符进行释放，如果忘记释放，则在该应用程序退出前，操作系统会一直认为该块内存处于占用状态，无法将其用作其他用途。这种情况称之为**内存泄漏（memory leakage）**。
- 不能对同一块内存进行两次delete操作，其结果是不确定的。
- delete一个空指针是安全而又无用的，什么都不会发生

> [!CAUTION]
>
> **要点🎯** 当一个非空指针所指向的对象已经事实上被销毁时，该指针也称为**悬空指针（dangling pointer）**

```c++
int* a = new int[100];
delete []a;
```

本行代码中的new int[100]可按下述方式理解：

- 通过100 x sizeof(int)得到100个int对象占据400个字节的空间；
- new操作符通过操作系统API从堆申请400个字节的空间，然后将该空间地址作为int*类型返回。

-----------

### 静态对象(static object)

> 自动变量/对象的内存被分配在栈里，其生存周期从定义开始直到作用域结束，由编译器生成代码自动管理。动态对象的内存从堆中申请，其生存周期从new/malloc/calloc开始直至delete/delete[ ]/free操作被执行，由程序员手动管理。

不同于自动对象和动态对象，静态对象的生存周期从程序开始运行起，一直到程序运行结束，且被存储到一块称为“全局静态数据区”的内存空间内。

- **所有类型的静态对象，如果在定义时不提供初始值，编译器会主动将其初始化为0**。
- **静态对象的初始化赋值只会执行一次，即便该初始化赋值的代码位于函数体内。**
- **外部连接属性和内部连接属性**：`int iGlobal` 全局变量，可以在整个程序的所有源代码文件中被使用。`static int iThisFileOnly` 静态对象，只能在包含它的源代码文件中被使用。

------

## 位操作

#### 二进制及十六进制

![image-20240906182609113](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906182609113.png)

![image-20240906183346973](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906183346973.png)

![image-20240906183404042](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906183404042.png)

**二进制如何表示负数？？**  ---补码 【待补充】

------

#### 按位取反(bitwise reverse)

```c++
//Project - NotOp
#include <iostream>
#include <bitset>
using namespace std;

int main(){
    unsigned char c = 0b01011101;
    //二进制字面量是C++14引入的，早期版本中请用0x5d代替
    unsigned char d = ~c;
    cout << "c  = " << bitset<8>(c) << endl; 
    //尖括号中的8是模板参数，意即要把c转为8位二进制字符串
    cout << "~c = " << bitset<8>(d) << endl;

    return 0;
}
```

结果为：

```
c  = 01011101
~c = 10100010
```

-----

#### 按位与

![image-20240906184952649](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906184952649.png)

---

#### 按位或

![image-20240906185054146](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906185054146.png)

-----

#### 按位异或

![image-20240906185119293](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906185119293.png)

#### 左移位

` << `左移位操作符 (left shift operator)， 它将对象a的二进制位逐次左移n位，超出左端的二进制位丢弃，并用0填充右端空出的位置。

```c++
//Project - LeftShift
#include <iostream>
#include <bitset>
using namespace std;

int main() {
    unsigned short a = 5;
    cout << "a      = " << bitset<16>(a) << ", value = " << a <<endl;
    a = a << 3;    //等价于 a <<= 3;
    cout << "a << 3 = " << bitset<16>(a) << ", value = " << a << endl;
    return 0;
}
```

#### 右移位

它将对象a的二进制位逐次右移n位，超出右端的二进制位丢弃。如果a是无符号整数，用0填充左端空位，如果a为有符号整数，填充值取决于具体的机器，可以是0，也可以是符号位。

#### 置位与复位

将整数的指定位“置为1”称为**置位（set bit）**；将整数的指定位“置为0”称为**复位（reset bit）**。

```c++
//Project - SetResetBit
#include <iostream>
#include <bitset>
using namespace std;

template <typename T>
inline void setBit(T& v,  int bit){
    v |= (0x01 << bit);
}

template <typename T>
inline void resetBit(T&v, int bit){
    v &= (~(0x01 << bit));
}

int main() {
    unsigned short v = 0xff00;
    cout << "before v = " << bitset<16>(v) << endl;

    setBit(v,6);
    setBit(v,0);
    setBit(v,11);    //置0，6，11位为1
    resetBit(v,15);
    resetBit(v,10);  //置10，15位为0

    cout << "after  v = " << bitset<16>(v) << endl;
    return 0;
}
```

相关可视化：![image-20240906235257337](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906235257337.png)

unsigned or signed

![image-20240906235354622](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240906235354622.png)

----

## 枚举与联合

#### 枚举型

> 对事物进行分类是人类的技能之一。人分男女，大学的学生则又分为专科生、本科生、硕士研究生和博士研究生。与现实世界相对应，在程序当中，我们也常常需要表达对象所属的类别。而枚举类型，则是完成该任务的主要工具

对于编译器而言，枚举类型的实质就是整数。所以可以利用switch关键字放入检查，将对应的类别作操作。

```c++
//Project - ColorType
enum ColorType {
    red, orange, yellow=100, green, blue, violet
}; //注意末尾的分号不能少
//   0     1      100         101    102   103
```

使用枚举型数据，可以大大的提高程序的可读性。

-------

#### typedef 语句

#### 枚举类

```c++
//Project - EnumClass
enum class GenderType:unsigned char{
    male,female
};  //注意末尾分号不能少
```

> 域解析符：”::”称为域解析符。Rocket::Engine可以理解为火箭（Rocket）里的发动机（Engine），以区别于Car::Engine（轿车里的发动机），和Engine（发动机）。

------

#### 联合

C语言中的联合（union）类型为我们提供了操纵和解读“数据”的独特方式，它允许对**同一块内存**以**不同的方式**进行解读和操纵。

```c++
union UINT {
    unsigned int intValue;   //占4个字节
    unsigned char bytes[4];  //占4个字节
};  //注意末尾分号不能少
```

上述代码定义了一个名为UINT的联合类型。该类型提供了两个成员，分别是unsigned int类型的intValue，以及元素类型unsigned char的长度为4的字符数组bytes。这两个成员的**内存空间是共享的**，即，一个union UNIT类型的对象只占4个字节的空间。**当以成员intValue进行操作时，这4个字节的内存被当成一个unsigned int进行操纵和解读；当以成员bytes进行操作时，这4个字节的内存被当成一个4字节的字符数组进行操纵和解读。**

--------

## 类与抽象

#### 面向对象 --万物皆对象

> 在程序设计中，我们通过设计新的类型来刻画某类对象的共性，例如，定义一个新类（Person）。然后将这个类型实例化成一个对象，例如定义一个Person类型的变量a。 a既然属于Person类型，那么a自然就有了姓名、性别这些属性，有了eat、speak、think这些方法。

![image-20240907192958580](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240907192958580.png)

![image-20240907193122640](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240907193122640.png)

创建一个类：

```c++
//Project - SimplePerson
enum class GenderType{
    male = 0, female = 1
};

class Person{
public:
    string sName;           //姓名
    string sID;             //身份证号
    GenderType gender = GenderType::male; //性别
    int iWeight {50000};    //体重，以克为单位

    Person(const string& id = "N/A", const string& name = "N/A" ){
        sID = id;
        sName = name;
        cout << "Person::Person(), sName = " << sName << endl;
    }   // 构造函数实例化对象

    void speak(){
        cout << "Person::speak()" << endl;
        cout << "I am " << sName <<", Nice to meet you here." << endl;
    }

    void eat(int weight){
        iWeight += weight;
        cout << "I just ate " << weight << " gram's food." << endl;
    }

    string description(){
        char buffer[1024];  //注意缓冲区尺寸，当心溢出
        sprintf(buffer,"ID:     %s\nName:   %s\nGender: %s\nWeight: %d",
                sID.c_str(),sName.c_str(),
                gender==GenderType::male?"Male":"Female",iWeight);
        return buffer;
    }
};  //注意末尾的分号不能少
```

**实例化对象**

```c++
int main(){
    Person peter("3604020001", "Peter Lee");
    peter.eat(100);
    peter.speak();
    cout << peter.description() << endl;

    cout << "-----------------------------------------" << endl;

    Person dora;
    dora.sID = "3604020002";
    dora.sName = "Dora Henry";
    dora.speak();
    cout << dora.description() << endl;

    return 0;
}
```

**析构函数**

```c++
class Fish {
public:
    string sName;
    Fish(const string& name){
        sName = name;
        cout << "Fish Constructor called: " << sName << endl;
    }

    Fish(){
        sName = "N/A";
        cout << "Fish Constructor called: " << sName << endl;
    }

    ~Fish(){
        cout << "Fish Destructor called: "  << sName << endl;
        //同样存在this指针，sName事实上通过this指针访问
    }
};
```

**new关键字**

```c++
 Fish* dora = new Fish("dora");
```

该行语句执行程序如下：

- 在栈内为作为自动对象的指针dora分配空间；
- new操作符通过操作系统API申请sizeof(Fish)大小的堆空间并取得地址；
- 以上述对象地址为this指针，调用执行构造函数Fish::Fish(const string& name)，初始化该对象；
- 将对象地址赋值给指针dora。

最后执行：

```c++
delete dora;
```

该语句执行过程如下：

- 如果dora指针为空，直接返回；
- 由于dora的类型为Fish*，程序调用执行Fish类型的析构函数Fish::~Fish( )，以dora为this指针，以完成dora鱼对象的清理（cleanup）工作；
- 通过操作系统API释放dora指向的动态内存。

> [!WARNING]
>
> 如果该指针类型对象不及时delete将会造成其他实例无法调用析构函数，并且会造成内存泄漏。

### 面向对象核心

#### 接口与封装

> 点完菜后坐下就好，菜一会儿就上来。至于菜是从哪个市场买的，在锅里炒多久，油温多少，我们来操心就好。
>
> — “面向对象”餐厅服务员

像这样，将餐厅后厨等复杂的**实现**等细节隐藏起来，只向使用者提供一个类比与菜单的**接口**的工作模式，我们称之为**封装**。

另外，将某些自定义类型的对象作为对象的属性/构成部分的方法，也是一种代码复用的手段，称为**组合(composition)**。

> **类设计者的任务**
>
> - 尽量复用或者重用前人的代码，不要重新发明轮子。
> - 使用你认为好的算法以及代码实现类的功能，尽管这些实现部分可能是相当复杂的。
> - 用尽可能简单的函数及属性向使用者提供使用这个类型的**简洁的易于理解的接口**，并尽可能兼容人们已经习惯的通用接口；也就是说，你设计出来的汽车，还应该是油门在右边，刹车在左边。
> - 把实现的细节隐藏起来。这样，将来，你就有机会在接口不变的情况下，通过修改内部实现而提高类型的性能，比如执行速度。
>
> 作为类的使用者的你，应该朝下述目标努力，既使这个类就是半小时前的你设计的：
>
> **类使用者的任务**
>
> - 尽量使用别人设计好的类，仅在必要时设计新类。
> - 只管用，不管别人如何实现的。除非你对类的性能不够满意，期望修改它以提升性能。

#### 隐藏 --访问控制

> 要实现简洁的接口，就需要把复杂的实现隐藏起来。这些复杂的实现，包括：
>
> - 不希望被类的使用者访问的数据成员；
> - 不希望被类的使用者访问的成员函数。

c ++提供了三个访问控制符来隐藏实现：

![image-20240909090827070](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240909090827070.png)

在定义类成员时，如果没有指定访问控制符，默认为private。

#### 标准类实现

面对对象程序设计。

#### 友元和友元类

> 使用private访问控制符可以把对象成员私有。这种私有是对所有外部对象而言的，并不能达成我们对访问控制的所有需要。例如，多数家庭的银行账户密码对家庭以外成员是保密的，但对妻子/丈夫却是公开的。C++通过友元（friend）语法实现这种存在例外的访问控制。

定义一个复数类，代码如下：

```c++
//Project - FriendFunction
#include <iostream>
using namespace std;

class Complex{          //复数类
private:
    float fReal;        //私有的实部和虚部
    float fImage;
public:
    Complex(float real, float img){
        fReal = real;
        fImage = img;
    }
    friend Complex add(const Complex&, const Complex&);
    friend int main();  //声明友元函数
};

Complex add(const Complex& a, const Complex& b){
    float fReal = a.fReal + b.fReal;    //友元函数访问对象的私有成员
    float fImage = a.fImage + b.fImage;
    return Complex(fReal,fImage);
}

int main() {
    Complex a(3,2);
    Complex c = add(a,Complex(2,3));

    cout << "(3+2i)+(2+3i)= " << c.fReal << "+" << c.fImage << "i";
    return 0;
}
```

相关语法逻辑见下图：

![image-20240909093441886](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240909093441886.png)

#### 静态声明(static)

静态数据成员

```c++
class Tomato {
private:
    static int objectCount;   //静态数据成员
    float fSize {10};         //番茄的尺寸
public:
    Tomato(){
        objectCount++;        //每构造一个对象，数量加1
    }

    ~Tomato(){
        objectCount--;        //每析构一个对象，数量减1
    }
    friend int main();
};

int Tomato::objectCount = 0;  //给静态数据成员赋初始值
```

静态成员函数

> 类的成员函数也可以是静态的，下述C++程序演示了静态成员函数的基本用法。相对于普通成员函数，静态成员函数有如下特点：
>
> - 没有秘密的this指针参数，其执行不依赖于任何具体的对象。
> - 在静态成员函数的函数体内，只能访问类的静态数据成员及其他静态成员函数，不能访问类的非静态成员。这是因为：非静态成员的访问依赖于具体的对象，需要通过this指针进行，但静态成员函数没有this指针。

#### 常量声明(const)

> 可以将类的成员函数设定为常量型。执行一个对象的常量型成员函数**不可以**导致对对象的任何修改，这意味着：
>
> - 常量型成员函数不可以修改对象的任何数据成员，mutable类型的数据成员除外。
> - 常量型成员函数不可以调用执行对象的任何非常量型成员函数，因为这些函数的执行，可能会导致对象状态的改变。
>
> mutable在英文中意为“易变的”，用mutable修饰的数据成员不受对象及其成员函数常量性的约束。

------

### 代码复用

面向对象程序设计五大特征：

- 万物皆对象（Everything is an object）
- 对象皆有类型（Every object has a type）
- 程序就是由一堆对象构成，对象间通过发送消息协同工作（A program is a bunch of objects telling each other what to do by sending messages）
- 每个对象都有自己的存储空间，并由其他对象来构成（Each object has its own memory made up of other objects）
- 相同类型的对象可以接受相同类型的消息（All objects of a particular type can receive the same messages）

#### 组合和继承

我们把使用多个不同类型的成员对象来构成新类型对象的代码复用方法，称之为**组合**。

```c++
class Wheel {
public:
    short iWheelSize;  //轮胎尺寸
    Wheel(){
        cout << "Wheel Constructed." << endl;
    }
    ~Wheel(){
        cout << "Wheel Destructed." << endl;
    }
};

class Engine {
private:
    int iCapacity;   //发动机排量
public:
    Engine(int capacity){
        iCapacity = capacity;
        cout << "Engine Constructed." << endl;
    }
    ~Engine(){
        cout << "Engine Destructed." << endl;
    }
};

class Car {
public:
    Engine e;
    Wheel wheels[4];
    int iWeight;    //整车重量
    //...

    Car(int weight):e(1800), iWeight(weight){
        //e.start() ...
        cout << "Car Constructed." << endl;
    }

    ~Car(){
        cout << "Car Destructed." << endl;
        //e.stop() ...
    }
};
```

当成员对象的构造函数要求提供参数时，我们需要在**构造函数初始化列表**中提供这些参数，如下：

```c++
Car(int weight):e(1800), iWeight(weight){ ...
```

-------

> **继承（inheritence）**是另一种代码重用的方法。当我们试图定义一个雇员类型时，并不需要从身份证号和姓名定义起。在已经有了Person（人）类型之后，我们借助于继承来定义Employee（雇员）类型：
>
> - 雇员是人， 雇员具备人的全部属性和方法；
> - 雇员跟不是雇员的其他人有区别，比如雇员有岗位，有工资，有工号。

![image-20240909095954562](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240909095954562.png)

我们来实现一个标准类来说明继承的语法逻辑：

person.h用于存放类声明，内容如下：

```c++
#ifndef PERSON_H
#define PERSON_H

#include <string>
using namespace std;

enum class GenderType{
    male = 0, female = 1
};

class Person{
private:
    int iWeight {50000};    //体重，以克为单位

protected:
    string sName;           //姓名
    string sID;             //身份证号
    GenderType gender = GenderType::female; //性别
    void speak();

public:
    Person(const string& id, const string& name);
    void eat(int weight);
    string description();
    ~Person();
};  //注意末尾的分号不能少

#endif // PERSON_H
```

person.cpp 用于存放类方法定义，内容如下：

```c++
#include "person.h"
#include <iostream>

Person::Person(const string& id, const string& name ){
    sID = id;
    sName = name;
    cout << "Person::Person()" << endl;
}

Person::~Person(){
    cout << "Person::~Person()" << endl;
}

void Person::speak(){
    cout << "Person::speak()" << endl;
    cout << "I am " << sName <<", Nice to meet you here." << endl;
}

void Person::eat(int weight){
    iWeight += weight;
    cout << "I just ate " << weight << " gram's food." << endl;
}

string Person::description(){
    char buffer[1024];  //注意缓冲区尺寸，当心溢出
    sprintf(buffer,"ID:     %s\nName:   %s\nGender: %s\nWeight: %d",
            sID.c_str(),sName.c_str(),
            gender==GenderType::male?"Male":"Female",iWeight);
    return buffer;
}
```

在项目中新建一个C++类，名为Employee。该类是Person类的子类，由employee.h及employee.cpp两个文件构成。

employee.h

```c++
#ifndef EMPLOYEE_H
#define EMPLOYEE_H
#include "person.h"

class Employee:public Person
{
public:
    string sEmployeeNo;
    string sJobTitle;
    string sDepartment;

    Employee(const string& emplNo, const string& id, const string& name);
    ~Employee();

    void work();
    void speak();
    string description();
};

#endif // EMPLOYEE_H
```

employee.cpp

```c++
#include "employee.h"
#include <iostream>
using namespace std;

Employee::Employee(const string& emplNo, const string& id,
                   const string& name):Person(id,name) {
    sEmployeeNo = emplNo;
    cout << "Employee::Employee()" << endl;
    //iWeight = 60000; //错误：不可以访问父类的私有成员
}

Employee::~Employee(){
    cout << "Employee::~Employee()" << endl;
}

void Employee::work(){
    cout << "I am a " << sJobTitle << ", working in department:"
         << sDepartment << endl;
}

void Employee::speak(){
    cout << "Employee::speak()" << endl;
    Person::speak();   //可以访问父类的保护成员函数
    cout << "I am happy to work for you." << endl;
}

string Employee::description(){
    char buffer[1024];  //注意缓冲区尺寸，当心溢出
    sprintf(buffer,"ID:     %s\nName:   %s\nGender: %s\nEmployee No: %s\n"
                   "Job Title: %s\nDepartment: %s",
            sID.c_str(),sName.c_str(),
            gender==GenderType::male?"Male":"Female",sEmployeeNo.c_str(),
            sJobTitle.c_str(),sDepartment.c_str());
    //可以访问gender, sID, sName等父类的保护数据成员
    return buffer;
}
```

main.cpp

```c++
//Project - EmployeeClass
#include <iostream>
#include <employee.h>
using namespace std;

int main() {
    cout << "---------------------construct----------------" << endl;
    Employee dora("10001","36040200001","Dora Henry");
    dora.sDepartment = "Marketing";
    dora.sJobTitle = "Sales";

    cout << "---------------------memory map---------------" << endl;
    printf("sizeof(Employee) = sizeof(Person) + 3 x sizeof(string)"
           "\n=%lld + 3 x %lld\n=%lld\n",
           sizeof(Person),sizeof(string),sizeof(Employee));

    Person* pDora = &dora; //通过向上类型转换获得dora对象内的父对象地址
    printf("&dora = %p\n&(Parent Object) = %p\n&dora.sEmployeeNo = %p"
           "\n&dora.sJobTitle = %p\n&dora.sDepartment = %p\n",
           &dora, pDora, &dora.sEmployeeNo,&dora.sJobTitle,&dora.sDepartment);

    cout << "---------------------work---------------------" << endl;
    dora.work();
    cout << "---------------------speak--------------------" << endl;
    dora.speak();
    cout << "---------------------eat----------------------" << endl;
    dora.eat(220);
    cout << "---------------------description--------------" << endl;
    cout << dora.description() << endl;

    cout << "---------------------destruct-----------------" << endl;
    return 0;
}
```

其中，我们来看这行代码：

```c++
Person* pDora = &dora; //通过向上类型转换获得dora对象内的父对象地址
```

&dora的类型为`Employee*`，pDora的类型为`Person*`，由于Employee就是Person，所以把类型为`Employee*`的地址赋值给`Person*`类型的指针是合法的。这种从子类型转换为上层父类型的类型转换，称为**向上类型转换（upcasting）**。

-----

#### 公有私有及保护继承

在继承方式上，我们可以声明不同的类型有不同的继承方式：

![image-20240909170907423](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240909170907423.png)

为了更好的理解不同的继承方式，我们来看以下代码：

```c++
class Base{
private:
    int iPrivate = 0;
protected:
    void protectedMethod(){}
public:
    float fPublic = 2.2;
};

class DerivedA:public Base {
};

class DerivedB:protected Base{
};

class DerivedC:private Base{
};
```

在上述代码中，基类Base有：私有成员iPrivate、保护成员protectedMethod( )以及公有成员fPublic。DerivedA、DerivedB以及DerivedC类分别以不同的方式继承了基类Base。下图解释了三种不同继承方式所带来的不同结果。

![image-20240909171211911](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240909171211911.png)

> 源自基类Base的私有成员iPrivate被画上了删除线，意思是：该成员存在于派生类对象的内存中，但即便在派生类内部，也无法直接访问该成员。

public 和 protected    它们的继承规则由继承方式界定。

#### 多重继承

直接看代码：

```c++
//Project - MultiInheritence
#include <iostream>
using namespace std;

class Person{
public:
    string sName;
    string sID;
    void eat(int weight){
        cout << "Person::eat(): " << weight << " grams of food.\n";
    }

    Person(const string& id, const string& name){
        sID = id;
        sName = name;
        cout << "Person::Person()" << endl;
    }
};

class TaxPayer{
public:
    string sTaxNo;
    bool payTax(float fAmount){
        cout << "TaxPayer::payTax(): " << fAmount << endl;
        return true;
    }
    TaxPayer(){
        cout << "TaxPayer::TaxPayer()" << endl;
    }
};

class Employee: public Person, public TaxPayer {
public:
    string sEmployeeNo;
    int iWeekSalary = 0;
    void work(){
        cout << "Employee::work()" << endl;
    }
    Employee(const string& id, const string& name, const string& emplNo)
        :Person(id,name), sEmployeeNo(emplNo){ //构造函数初始化列表
        cout << "Employee::Employee()" << endl;
    }
};

int main(){
    cout << "------------------construct----------------------\n";
    Employee dora("3604020001","Dora Henry", "10000");

    cout << "------------------memory map---------------------\n";
    printf("sizeof(Employee) = sizeof(Person) + sizeof(TaxPayer)\n"
           "+ sizeof(string) + sizeof(int)\n"
           "= %lld + %lld + %lld + %lld\n= %lld\n",
           sizeof(Person),sizeof(TaxPayer),sizeof(string),
           sizeof(int),sizeof(Employee));
    Person* p = &dora;
    TaxPayer* t = &dora;
    printf("&dora = %p, &(Person Object) = %p\n"
           "&(TaxPayer Object) = %p, &dora.sEmployeeNo = %p\n"
           "&dora.iWeekSalary = %p\n",
           &dora,p,t,&dora.sEmployeeNo,&dora.iWeekSalary);

    cout << "------------------eat----------------------------\n";
    dora.eat(320);
    cout << "------------------work---------------------------\n";
    dora.work();
    cout << "------------------payTax-------------------------\n";
    dora.payTax(1000.00);

    return 0;
}
```

上述程序对Employee 类型实例化为dora，它在程序运行中内存空间如图：

![image-20240910091334533](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240910091334533.png)

### 对象复制

#### 赋值与传值

```c++
Circle c2(c1);
```

该语句定义并构建Circle类型的对象c2，要求c2对象的内容从c1对象复制，聪明的编译器通过以下步骤达成目标：

- 为c2对象分配sizeof(Circle)的内存空间
- 执行Circle的拷贝构造函数(copy constructor)，以c2的地址为this指针，以c1的引用作为参数

**拷贝构造函数是一种特殊的构造函数，它通过从其它对象复制数据的方法来初始化对象**。

```c++
void drawCircle(Circle x){
	printf("drawCircle: (%d,%d)，r = %f\n", x.x, x.y, x.fRadius);
}

drawCircle(c1);
```

如代码所示，实参c1到形参x需要**传值（pass by value）**，在分配好形参x的栈内存后，x的拷贝构造函数将被执行，以c1的引用作为参数。

-------

#### 拷贝构造

```c++
//Project - CircleCopy
#include <iostream>
using namespace std;

class Circle{
public:
    int x = 0;
    int y = 0;
    float fRadius = 3.2F;
    Circle() {
        cout << "Circle::Circle()" << endl;
    }

    Circle(const Circle& r):x(r.x),y(r.y){
        fRadius = r.fRadius;
        cout << "Circle::Circle(const Circle&)" << endl;
    }

    ~Circle() {
        cout << "Circle::~Circle()" << endl;
    }
};

void drawCircle(Circle x){
    printf("drawCircle: (%d,%d), r = %f\n", x.x,x.y,x.fRadius);
}

int main() {
    Circle c1;
    Circle c2 = c1;

    cout << "--------------------------------------------------\n";
    c1.fRadius = 999.01F;
    drawCircle(c1);
    cout << "--------------------------------------------------\n";

    return 0;
}
```

下面我们来分析代码中的拷贝构造函数的定义：

```c++
Circle(const Circle& r):x(r.x),y(r.y){
    fRadius = r.fRadius;
    cout << "Circle::Circle(const Circle&)" << endl;
}
```

同构造函数**一样**，拷贝构造函数的函数名与类名相同，且没有返回值。同构造函数**不一样**，拷贝构造函数有一个形参，其类型为该类的常量型引用。一般地，拷贝构造函数的任务是：从形参r复制其全部数据成员至本对象的对应成员。

拷贝构造函数也有构造函数初始化列表，对象的父对象如果有形参，可以在构造函数初始化列表中提供实参。

**对于非原始数据类型，在传参时应尽量传递常量型引用，而不是传值**。

------

#### 默认拷贝构造函数

当自定义类型没有定义拷贝构造函数时，编译器会为其生成一个默认的拷贝构造函数，该拷贝构造函数会：**逐一通过拷贝构造来复制对象的全部成员对象及父对象；当成员对象是原生数据类型时，则按比特复制**。

------

#### 深拷贝

> 编译器为类型生成的默认拷贝构造函数大多数时候符合我们的需要。但是，当对象内部存在动态成员对象时，默认的拷贝构造函数则十分危险。

我们知道，C++的标准模板库中的string对象仅有32个字节大小（其它编译器下可能是其它值），其包含的字符串事实上存储在动态申请的堆空间内，string对象内部包含一个指针指向申请的堆空间。这种结构使得string类型的对象可以“容纳”几乎无限大的字符串。

下面我们自定义一个UserString类型来存储字符串，其结构模仿string类型。

```c++
//Project - UserString
#include <iostream>
#include <string.h>
using namespace std;

class UserString {
private:
    char* buffer = nullptr;       //缓冲区指针
    unsigned long long size = 0;  //缓冲区大小

public:
    void assign(const char* s){
        unsigned long long sizeNeeded = strlen(s) + 1;
        if (size >= sizeNeeded)   //缓冲区够用，直接复制
            strcpy(buffer,s);
        else {
            if (buffer!=nullptr)  //缓冲区不够用，重新申请后再复制
                free(buffer);
            size = sizeNeeded;
            buffer = (char*)calloc(size,1);
            strcpy(buffer,s);
        }
    }

    const char* content(){
        return buffer;           //返回字符数组的地址
    }

    ~UserString(){
        if (buffer!=nullptr)
            free(buffer);       //释放缓冲区,危险！
    }
};

int main() {
    UserString s1;
    s1.assign("New coronavirus believed to be derived from bats.");

    UserString s2 = s1;      //默认拷贝构造
    s2.assign("Human beings will win!");

    cout << "s1 = " << s1.content() << endl;
    cout << "s2 = " << s2.content() << endl;
    return 0;
}
```

1. 私有指针buffer指向申请的堆空间，该空间称为缓冲区，用于存储实际的字符串。该指针为空时，表示对象尚未申请堆空间。**在物理上，存储实际字符串的缓冲区不在对象内部，但逻辑上，我们应认为缓冲区是对象的构成部分**。
2. assign( )成员函数负责把参数字符串赋值给对象。
3. 通过求参数字符串的长度再加1得到需要的存储空间字节数sizeNeeded。
4. 如果当前对象拥有的缓冲区尺寸大于等于sizeNeeded，直接复制参数字符串至缓冲区。否则，释放已有的缓冲区，重新申请后再行复制。
5. content( )成员函数用于获取私有的缓冲区地址。
6. 析构函数进行对象清理，如果发现存在缓冲区，进行释放。

在main函数中，我们将对象实例化，并期望程序按如下拷贝构造![image-20240910095308508](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240910095308508.png)

但是事实上，默认的拷贝构造函数的行为是逐一就对象的每个成员对象（包括父对象）进行拷贝构造。

![image-20240910095447861](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240910095447861.png)

这种由默认拷贝构造函数所主导的对象复制称之为**浅拷贝（shallow copy）**，对于那些包含动态成员对象的对象，**深拷贝（deep copy）**是必要的。深拷贝的基本方法，就是自定义拷贝构造函数，将对象的动态部分也进行复制。

-------

#### 私有拷贝构造函数



### 操作符重载

#### operator+重载

例如复数类进行复数的加法运算

```c++
#include <iostream>
using namespace std;

class Complex {
public:
	...
    Complex operator+(const Complex& r) const{
        cout << "Complex::operator+()" << endl;
        return Complex(dReal+r.dReal,dImage+r.dImage);
    }
};

int main() {
    Complex a(1,3);
    Complex b(2,4);

    Complex c = a + b;
    printf("a + b = %.2f + %.2fi\n", c.dReal, c.dImage);
    return 0;
}
```

> [!IMPORTANT]
>
> **要点🎯** 重载的操作符函数既可以设计为类的成员函数，也可以设计为全局函数。

下面是全局的重载操作符函数示例：

```c++
class Complex {	... };

Complex operator+(const Complex& op1, const Complex& op2){
    cout << "operator+(const Complex&, const Complex&)" << endl;
    return Complex(op1.dReal+op2.dReal,op1.dImage+op2.dImage);
}
```

a + b被编译器解释为operator+(a,b)，该函数的执行结果被拷贝构造给c。

#### operator<< 重载

> 我们希望可以用cout关键字直接输出Complex类型复数。但是cout对象的类型为ostream，它是由iostream头文件引入的，而iostream是C++标准模板库的组成部分。显然，我们不太可能也不应该去修改标准模板库，为ostream类型增加一个接受Complex对象的operator<<成员函数。所以，我们选择添加一个**全局函数operator<<(ostream& o, const Complex& c)。**

代码如下：

```c++
//Project - ComplexOutput
#include <iostream>
using namespace std;

class Complex { ... };

ostream& operator<<(ostream& o, const Complex& c){
    o << c.dReal << " + " << c.dImage << "i";
    return o;
}

int main() {
    Complex a(1,3);
    cout << a << endl;
    operator<<(cout,a).operator<<(endl);
    return 0;
}
```

cout并不存在一个接受Complex对象为参数的operator<<成员函数。编译器将cout << a解释为operator<<(cout, a)。该函数返回cout自身的引用作为返回值，以该返回值为基础，ostream的operator<<成员函数被执行，以endl为参数。与`operator<<(cout,a).operator<<(endl)` 完全等价。

#### operator=重载

我们直接来看下面的代码：

```c++
Complex a(1,3);		//构造函数被执行
Complex b(a);		//拷贝构造函数被执行
Complex c = a;		//拷贝构造函数被执行
c = a;				//operator=操作符函数被执行
```

上述代码的第4行与第2 ~ 3行有一个重大区别：在赋值操作执行前，被赋值对象已经存在了。显然，对一个已经存在的对象再次应用拷贝构造函数进行复制初始化是不恰当的，编译器会执行c对象的operator=操作符函数，以a为参数。![image-20240912115729494](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240912115729494.png)

```c++
class Complex {
public:
    ...
    const Complex& operator=(const Complex& r){
        cout << "Complex::operator=()" << endl;
        dReal = r.dReal;  dImage = r.dImage;
        return *this;
    }
};
```

上述代码实现了一个复数类的=操作符重载，下面我们来看具体实例化

````c++
int main() {
    Complex a(1,3), b(2,3), c(1,5);
    c = b = a;
    c.operator=(b.operator=(a));
    return 0;
}
````

c = b = a的执行过程分为两步。

- b = a部分先被执行，其对应代码为b.operator=(a)。按照operator=操作符函数的代码，该次执行返回b自身的引用。
- 上一步返回的引用作为右值赋值给c对象，其对应代码为c.operator=(上一步返回值)。

由此，我们一定要写好重载函数的返回类型和返回值，不同方式的操作方式可以对返回类型返回值做更改以达到我们的期望。

#### 构造函数类型转换

> 前文我们可以知道，将一个double类型对象赋值给一个Complex类型对象，我们可以对operator=操作符进行函数名重载。另一种方法是为Complex类型定义一个参数为double的构造函数。

```c++
class Complex {
public:
	...    
    Complex(double real, double image){ ... }
    Complex(const double r){
        cout << "Complex::Complex(const double)" << endl;
        dReal = r;  dImage = 0;
    }

    const Complex& operator=(const Complex& r){ ... }
};
```

分析上述代码：Complex类有一个接受double对象的构造函数和一个接受Complex对象的operator=成员函数。于是编译器

- 先执行Complex(const double), 依据所给参数，构造一个临时的Complex对象
- 将临时Complex对象作为参数，执行c.operator = (const Complex&)成员函数，完成赋值
- 临时对象析构

-----

#### UserString的深拷贝

```c++
//Project - UserStringDeepCopy
#include <iostream>
#include <string.h>
using namespace std;

class UserString {
private:
    char* buffer = nullptr;       //缓冲区指针
    unsigned long long size = 0;  //缓冲区大小

public:
    const UserString& operator=(const char* s){
        unsigned long long sizeNeeded = strlen(s) + 1;
        if (size >= sizeNeeded)   //缓冲区够用，直接复制
            strcpy(buffer,s);
        else {
            if (buffer!=nullptr)  //缓冲区不够用，重新申请后再复制
                free(buffer);
            size = sizeNeeded;
            buffer = (char*)calloc(size,1);
            strcpy(buffer,s);
        }
        return *this;
    }

    const UserString& operator=(const UserString& r){
        if (buffer!=nullptr)
            free(buffer);
        size = r.size;
        if (size>0 && r.buffer!=nullptr){
            buffer = (char*)calloc(size,1);
            strcpy(buffer,r.buffer);
        }
        return *this;
    }

    ~UserString(){
        if (buffer!=nullptr)
            free(buffer);       //释放缓冲区,现在安全了
    }

    UserString(const UserString& r){
        size = r.size;
        if (size>0 && r.buffer!=nullptr){
            buffer = (char*)calloc(size,1);
            strcpy(buffer,r.buffer);
        }
    }

    UserString(){}             //不可或缺
    friend ostream& operator<<(ostream&, const UserString&);
};

ostream& operator<<(ostream& o, const UserString& r){
    o << r.buffer;
    return o;
}

int main() {
    UserString s1,s2;
    s1 = "New coronavirus believed to be derived from bats.";
    s2 = s1;                  //operator=操作符函数
    s2 = "Human beings will win!";
    cout << "s1 = " << s1 << endl;
    cout << "s2 = " << s2 << endl;
    return 0;
}
```

#### ++操作符重载

> 递增操作符完成两件工作：
>
> - 将操作数，例如v，增加1；
> - 返回递增之前的v（v++）或递增之后的v（++v）作为表达式的值。

> [!IMPORTANT]
>
> C++以非常特别的方式来区分v++和++v：
>
> - operator++( )对应++v，先++，后取值；
> - operator++(int)对应v++，先取值，后++。

```c++
//Project - ComplexDoublePlus
#include <iostream>
using namespace std;

class Complex {
public:
    ...
    const Complex& operator++(){    //对应++c，先++，后取值
        dReal += 1.0;
        return *this;
    }

    const Complex operator++(int){  //对应c++，先取值，后++
        Complex t = *this;
        dReal += 1.0;
        return t;
    }
};

ostream& operator<<(ostream& o, const Complex& c){ ... }

int main() {
    Complex c(1,3);
    cout << c << " --> " << ++c << endl;   //先++,后取值
    cout << c++ << " --> " << c << endl;   //先取值，后++
    return 0;
}
```

#### 智能指针

> 在c++里，动态对象的创建是通过new操作符进行的，在恰当的时候通过delete操作符释放动态对象的空间并执行其析构函数，这是至关重要的，如若有所疏忽，将造成巨大的缺陷：
>
> - 未能释放动态对象，内存泄漏
> - 为将指针置空，并在内存释放后再访问该指针
> - 指针杂乱，导致多次释放同一个动态对象

智能指针可以部分解决此问题，见如下代码：

```c++
//Project - SharedPointer
#include <iostream>
#include <memory>
using namespace std;

class Fish {
public:
    string sName;
    Fish(const string& name){
        sName = name;
        cout << "Fish Constructor called: " << sName << endl;
    }

    void sayHello(){
        cout << "Aloha: " << sName << endl;
    }

    ~Fish(){
        cout << "Fish Destructor called:  "  << sName << endl;
    }
};

void sayHello(shared_ptr<Fish> f){
    f->sayHello();      //对智能指针使用指向操作符->
}

void sayHello(Fish& f){
    f.sayHello();
}

int main(){
    shared_ptr<Fish> dora1(new Fish("Dora"));
    shared_ptr<Fish> tom1 = make_shared<Fish>("Tom");
    cout << "-----------------------------------------" << endl;

    sayHello(tom1);
    auto tom2 = tom1;   //智能指针对象的复制
    sayHello(*tom2);    //对智能指针使用解引用操作符*
    cout << "-----------------------------------------" << endl;

    dora1->sayHello();
    Fish* dora2 = dora1.get();   //获取智能指针内的原始指针
    dora2->sayHello();
    cout << "-----------------------------------------" << endl;
    return 0;
}
```

> [!IMPORTANT]
>
> `shared_ptr<T>` 表明一个指向T类型对象的智能指针对象。智能指针对象不是一个平凡的指针，而是一个包含平凡指针的对象，它通过引用计数来记录指针所指向的对象的被引用次数，当被指向对象的引用计数降到0时（意味着动态对象不再被需要），智能指针对象会通过delete操作符或者指定deleter函数释放动态对象。

关于上述代码的分析：



> [!WARNING]
>
> - 智能指针仅适用于动态（堆）对象，不要对栈对象或者静态对象创建智能指针，因为栈对象和静态对象的生命周期是由编译器自动管理的。
> - 不要通过动态对象的原始指针创建多个互不相关的智能指针。
> - 智能指针的get( )方法所返回的原始指针只可使用，不可应用delete进行释放。如果这样做了，当智能指针析构时，会对同一个动态对象进行第2次释放。
> - 当使用shared_ptr管理动态对象数组时，要么指定类型为对象数组，要么提供一个删除者（deleter）函数通过delete [ ]释放数组，该函数将在智能指针释放对象时被调用。

```c++
//Project - SharedPtrArray
#include <iostream>
#include <memory>
using namespace std;

template <typename T>
void delete_array(T* p){
    cout << "delete_array" << endl;
    delete[] p;
}

class Fish{
public:
    ~Fish(){ cout << "Fish::Fish~()" << endl; }
};

int main(){
    shared_ptr<Fish[]> a(new Fish[4]);
    a = nullptr;   //a指针指向的数组被释放

    shared_ptr<Fish> b(new Fish[2],delete_array<Fish>);
    b.reset();     //b指针指向的数组被释放

    shared_ptr<float> c(new float[512],
        [](float*p){cout << "lambda function\n"; delete[] p;});
    *c = 4.4F;
    //c++;           //错误：智能指针不支持指针运算
    //c[1] = 99.2F;  //错误：智能指针不支持[]操作符
    cout << *c << endl;
    return 0;
}
```

#### 智能指针的实现

```c++
//Project - SmartPointer
#include <iostream>
using namespace std;

class Fish { ... };     //与前节Fish类实现完全相同

template <typename T>
class SmartPointer {
private:
    T* ptr;             //原始指针
    int* refCount;      //指向引用计数的指针
    void releaseReference(){   //释放引用
        if (!ptr)
            return;
        (*refCount)--;
        if (*refCount==0){
            delete ptr; ptr = nullptr;
            delete refCount; refCount = nullptr;
        }
    }

public:
    SmartPointer(T* p=nullptr){
        ptr = p;
        refCount = new int;
        *refCount = ptr?1:0;
    }

    ~SmartPointer(){
        releaseReference();
    }

    //拷贝构造函数
    SmartPointer(const SmartPointer& r) {
        cout << "Copy constructor of SmartPointer." << endl;
        ptr = r.ptr;
        refCount = r.refCount;
        (*refCount)++;
    }

    //重载=操作符
    SmartPointer& operator=(const SmartPointer& r){
        cout << "operator=(const SmartPointer&)." << endl;
        if (&r == this)
            return *this;
        releaseReference();
        ptr = r.ptr;
        refCount = r.refCount;
        (*refCount)++;
        return *this;
    }

    //重载*操作符
    T& operator*(){
        cout << "operator*() of SmartPointer." << endl;
        if (ptr)
            return *ptr;
        throw exception();
    }

    //重载->操作符
    T* operator->(){
        cout << "operator->() of SmartPointer." << endl;
        if (ptr)
            return ptr;
        throw exception();
    }

    //查询引用计数
    int referenceCount(){
        return *refCount;
    }
};

int main() {
    SmartPointer<Fish> f1(new Fish("Dora"));
    SmartPointer<Fish> f2(new Fish("Tom"));
    auto f3 = f1;      //调用f3的拷贝构造函数，以f1为实参
    f2 = f1;           //调用f2的operator=()函数，以f1为实参，间接导致Tom鱼被释放
    (*f2).sayHello();  //调用f2的operator*()函数
    f2->sayHello();    //调用f2的operator->()函数
    cout << "Refernce count of Dora fish: " << f2.referenceCount() << endl;
    return 0;
}
```

#### []操作符重载

> 上文我们构造了一个UserString类，它是一个字符串，那么我们希望通过下标按位置访问字符串中的字符，这可以重载[]操作符来实现。

```c++
//Project - Subscript
...
class UserString {
private:
    char* buffer = nullptr;       //缓冲区指针
    unsigned long long size = 0;  //缓冲区大小
public:
    const UserString& operator=(const char* s){ ...  }
    ~UserString(){ ... }

    char& operator[](size_t idx){
        return buffer[idx];
    }

    size_t getSize(){
        return buffer?strlen(buffer):0;
    }
    ...
};

ostream& operator<<(ostream& o, const UserString& r){
    o << r.buffer;
    return o;
}

int main() {
    UserString s;
    s = "Aloha";
    cout << "before: " << s << endl;
    for (size_t i=0;i<s.getSize();i++){
        char& c = s[i];           //s[i] 等价于 s.operator[](i)
        if (c <= 'z' && c >= 'a')
            c += 'A' - 'a';
    }
    cout << "after: " << s <<endl;
    return 0;
}
```

要注意的是：

- 操作符重载并不能给我们带来新的能力，所有通过操作符重载能够完成的工作，都可以通过普通函数来完成。操作符重载能够带给我们的是：更好的代码可读性；更直接的类接口。
- 操作符重载并不能改变操作符使用的优先级及其基本语法。比如，无论如何重载，+操作符都需要两个操作数，其优先级总是低于乘法操作符。

#### 类型转换操作符函数



### 多态

> 工厂里，生产计划员审核并公布了次月的生产计划（消息）。工厂不同类型的部门和雇员（对象）作出了不同的响应（执行方法）：
>
> - **采购部门**的同事会**将生产计划展开**成具体的物料清单，并根据物料库存制定并执行物料采购计划；
> - **生产部门**的管理者**以生产计划为依据**，调配设备及人员，作生产做出具体安排；
> - **财务部门**的同事会**评估完成生产计划**所需要耗用的资金，作相应的资金规划；
> - **仓库及物流部门**的同事则需要对**相应的**物料/成品的存储及运输作出规划。

不同类型的对象在接收到相同的消息后，产生不同行为（执行不同方法）的过程，就是**多态**（polymorphism）

#### 早绑定

![image-20240912170455759](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240912170455759.png)

```c++
//Project - EarlyBinding
#include <iostream>
#include <string>
using namespace std;

class Pet {
public:
    string sName;
    void sayHello() {
        cout << "Pet " << sName << " : hello" << endl;
    }

    Pet(const string& name):sName(name){}
    ~Pet(){
        cout << "Pet destructor: " << sName << endl;
    }
};

class Rabbit:public Pet {
public:
    void sayHello(){
        cout << "Rabbit " << sName << " : carrot" << endl;
    }

    Rabbit(const string& name):Pet(name){}
    ~Rabbit(){
        cout << "Rabbit destructor: " << sName << endl;
    }
};

class Cat:public Pet {
public:
    void sayHello(){
        cout << "Cat " << sName << " : meow " << endl;
    }

    Cat(const string& name):Pet(name){}
    ~Cat(){
        cout << "Cat destructor: " << sName << endl;
    }
};

int main(){
   Rabbit r("Charlie");       //查理兔
   Pet&  r2 = r;
   r2.sayHello();

   Pet* c = new Cat("Lucy");  //露西猫
   c->sayHello();
   delete c;
   return 0;
}
```

调用对象的成员函数时，编译器默认执行**早绑定（early binding）**：在编译时刻，根据变量/常量、指针或者引用的类型直接确定被执行的函数。

具体到本例中的c->sayHello( )，c的类型为Pet*，其所指向的对象可能是Pet，也可能是Rabbit或者Cat。但编译器仅知道c的类型为Pet*，早绑定的结果就是：选择执行Pet::sayHello( )函数，以c值为this指针。

显然，早绑定没能实现我们期望的多态，虽然c指向的是露西猫，但Cat::sayHello( )没有被执行，我们也没有”听”到喵喵（meow）叫。

#### 虚函数与晚绑定

在成员函数声明中增加virtual关键字，可以将其声明为**虚函数**。编译器会对虚函数执行**晚绑定（late binding）**，以实现多态。

```c++
//Project - VirtualFunction
...
class Pet {
public:
    string sName;
    virtual void sayHello() { ... }
    Pet(const string& name):sName(name){}
    virtual ~Pet(){ ... }
};

class Rabbit:public Pet {
public:
    virtual void sayHello(){ ... }   //virtual可省略
    Rabbit(const string& name):Pet(name){}
    virtual ~Rabbit(){ ... }         //virtual可省略
};

class Cat:public Pet {
public:
    virtual void sayHello(){ ... }  //virtual可省略
    Cat(const string& name):Pet(name){}
    virtual ~Cat(){ ... }           //virtual可省略
};

int main(){
   Rabbit r("Charlie");       //查理兔
   Pet&  r2 = r;
   r2.sayHello();

   Pet* c = new Cat("Lucy");  //露西猫
   c->sayHello();
   delete c;
   return 0;
}
```

调用对象的成员函数时，如果该成员函数是虚函数，编译器执行**晚绑定（late binding）**：生成额外的机器指令，在运行时刻确定对象的真正类型，并执行对应类型的对应函数。依赖于晚绑定，不同类型的对象在接受到相同的消息（形式上执行的是同一个方法）后，会表现出不同的行为（执行不同的方法），这就是C++里的多态。

当父类（Pet）的某个成员函数是虚函数时，其子类（Rabbit、Cat）的对应函数自动成为虚函数。



#### 类型转换

##### static_cast

```c++
static_cast<目标类型>(对象)
```

##### const_cast

```c++
const_cast<非常量目标类型>(对象)
```

> [!CAUTION]
>
> 没有十分特别的站得住脚的理由时，不要使用const_cast！ 将对象声明为常量型，相当于给程序的阅读者、编译器以及与你一起工作的同事许下了一个诺言：我不会修改这个对象。而通过const_cast去除其常量性，相当于偷偷地违背了自己许下的诺言。这很可能成为bug（软件缺陷）之源。
>
> 在重用他人代码的前提下，如果不得不使用，一定要给以特别的注释，并在注释及软件文档中说明理由。

##### reinterpret_cast

```c++
reinterpret_cast<目标类型>(对象)
```

##### dynamic_cast

```c++
dynamic_cast<目标类型>(对象指针/引用)
```

### 容器与模板

> 用数组，即便是动态数组，来保存对象有一个很大的局限：难以准确估计需要的数组空间。如果将数组定义得过大，可能浪费内存，如果定义得过小，又存在容量不足的可能。

 容器（container）类对象可以像数组那样容纳其它对象。数组的容量是固定的，而容器类对象（模板数组▲除外）的容量可以需要自动伸缩。![image-20240912174442749](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240912174442749.png)

#### 向量

向量（vector）类型来自于标准模板库（standard template library），由vector头文件引入。其工作方式与数组类似，主要区别有二：**元素类型由模板参数指定**；**容量根据使用需要自动伸缩**。

断言 assertion 

> 如果程序逻辑完全正确，向量words及counts的元素个数应当相等。本例中，**assert宏将会在运行时对“参数”表达式进行检查，如果为假，程序将会报错**。通常，断言（assertion）失败的报错信息包含具体的源代码文件名及断言失败的行号，这对程序员查找程序缺陷非常有用。当断言成功时，它什么都不会做。

#### 向量的生长

>  当往向量内加入元素时，向量会”酌情“申请新空间，并将旧空间的原有元素及拟加入元素以拷贝构造的形式复制到新空间内。同时，旧空间的原有元素会被释放。如果期望降低这种因内存不足而导致的“搬家开销”，可以通过reserve( n )函数预分配向量的元素存储空间。

push_back( )函数做了如下工作。

① 在堆中申请并分配新的足够的存储空间；

② 将2号鱼，即f2对象拷贝构造至新空间内的2号位置（从下标0开始数）。相关拷贝构造函数的输出见执行结果的第6行。请注意，向量内的2号鱼的序号已变为2[Copy]。

③ 将向量内原有的0，1号鱼由旧空间拷贝至新空间的对应位置。相关拷贝构造函数的输出见执行结果的第7 ~ 8行。请注意，向量内的0，1号鱼的序号变为0[Copy]及1[Copy]。

④ 释放旧空间，旧空间内的原0，1号鱼的析构函数被执行。相关析构函数的输出见执行结果的第9 ~ 10行。

可以相象，push_back( )函数的这种”复制“行为要求元素类型具有公开的拷贝构造函数（可以是默认的），否则，编译器会报错。

#### 模板数组

相较于原生的数组类型，向量可以很好地适应元素数量的不确定性：以一定的执行效率损失为代价。**【C++ 11】**提供的array模板类可以提供固定尺寸的数组容器，相较于向量，它执行效率更高，相较于原生数组，它更安全、更便利。本书中，我们称由array模板类提供的数组容器为**模板数组**，以区别于原生数组。示例代码如下：

```c++
//Project - StringArray
#include <iostream>
#include <array>
using namespace std;

int main(){
    array<string,3> a1 {"Tom","Dora","Eddie"};
    auto a2 = a1;
    a1[1] = "Charlie";   //a1.at(1) = "Charlie";

    cout << "a1: ";
    for (auto x:a1)
        cout << x << ", ";

    cout << "\na2: ";
    for (auto x:a2)
        cout << x << ", ";

    cout << "\na1 == a2: " << (a1==a2?"True":"False") << endl;
    cout <<   "a1 != a2: " << (a1!=a2?"True":"False") << endl;
    cout <<   "a1 >  a2: " << (a1> a2?"True":"False") << endl;
    cout <<   "a1 <  a2: " << (a1< a2?"True":"False") << endl;
    return 0;
}
```

#### 数组与链表

![image-20240912174840783](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240912174840783.png)

![image-20240912174855195](https://ly57-pics-bed.oss-cn-guangzhou.aliyuncs.com/img/image-20240912174855195.png)

上面两张图体现了数组和链表在插入一个新数据的时候，不同的情况

```c++
//Project - StringList
#include <iostream>
#include <list>
using namespace std;

int main() {
    list<string> girls {"Dora", "Emily", "Cinderella"};
    girls.pop_back();
    girls.push_back("Angela");
    girls.emplace_front("Iris");
    girls.sort();

    for (auto& x:girls)
        cout << x << endl;
    return 0;
}
```

向量（vector）内的全部元素是存储在一块连续内存之内的，这使得元素的随机访问速度很快。双端队列（deque）的元素则存储在多块连续内存上，其每一个内存块通常存储相同数量的元素。这使得双端队列也可以支持快速的元素随机访问（比向量稍慢）。同时，当向双端队列队首或队尾添加元素时，双端队列可以通过申请新的内存块来实现快速的队首/队尾元素添加。

#### 迭代器（iterator）

##### 获取迭代器

##### 迭代器算术

##### 拆半查找示例

##### 容器元素的更改

##### 容器元素的增加

##### 容器元素的删除

##### 迭代器失效
