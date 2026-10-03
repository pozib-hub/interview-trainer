# // 1-я задача

// 1-я задача
    function foo() {
        const x = 10;
        return {
            x: 20,
            bar: () => {
                console.log(this.x);
            },
            baz: function () {
                console.log(this.x);
            }
        };
    }

    const obj1 = foo();
    obj1.bar();
    obj1.baz();

    const obj2 = foo.call({ x: 30 });
    
    let y = obj2.bar; 
    let z = obj2.baz; 
    y();
    z();
    
    obj2.bar();
    obj2.baz();



    // 2-я задача
    const a = {x: 1};

    //[[Prototype]]
    a.__proto__ = {}
    console.log(a.hasOwnProperty('__proto__')) //
    console.log(a.__proto__.hasOwnProperty('__proto__')) // 

    // Прототипное наследование (внутренне устройство)
    // https://habr.com/ru/articles/518360/



    // 3-я
    "use strict";

    const obj = {
        child: {
            i: 10,
            b: () => console.log(this.i, this),
            c() {
                console.log(this.i, this);
            },
        }
    };

    obj.child.b(); // 
    obj.child.c(); // 

    // 4-я
    console.log(1)

    setTimeout(() => {
        console.log(2)
    })

    Promise.resolve().then(() => console.log('micro'))
    Promise.resolve().then(() => console.log('micro1'))
    Promise.resolve().then(() => console.log('micro2'))

    const p = new Promise((res) => {
        console.log(3)
        setTimeout(() => {
            console.log(4)
            res()
        })
    })

    setTimeout(() => {
        console.log(5)
    })

    p.then(() => {
        console.log(6)
    }).then(() => {
        console.log(7)
    })

    console.log(8)

    // 5-я
    Promise.reject('a') // 
        .then(p=>p+'1',p=>p+'2') // 
        .catch(p=>p+'b') // 
        .catch(p=>p+'с') //
        .then(p=>p+'d1') // 
        .then('d2') //
        .then(p=>p+'d3') // 
        .finally(p=>p+'e') // 
        .then(p=>console.log(p)) // ?


    // 6-я
    // Fiber
    // requestAnimationFrame
    // каррирование

    // 7-я
    Типы и интерфейсы - разница.

    // 8-я
    infer // что такое в TS
